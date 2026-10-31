-- Apply after the existing application schema. Does not delete tables or records.
-- Preserves existing staff assignments; never promotes an account by email.
BEGIN;

-- 1. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  name text NOT NULL,
  phone text NOT NULL,
  topic text NULL DEFAULT 'General Inquiry'::text,
  message text NOT NULL,
  status text NULL DEFAULT 'New'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone ('utc'::text, now()),
  CONSTRAINT contact_inquiries_pkey PRIMARY KEY (id)
);

-- 2. Admin Invitations Table (Authorized by Super Admin)
CREATE TABLE IF NOT EXISTS public.admin_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  email text NOT NULL,
  full_name text NULL DEFAULT '',
  phone text NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT timezone ('utc'::text, now()),
  verified_at timestamp with time zone NULL,
  CONSTRAINT admin_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT admin_invitations_email_key UNIQUE (email)
);

-- Helper to retrieve current authenticated user role
CREATE OR REPLACE FUNCTION public.apna_current_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'customer');
$$;
REVOKE ALL ON FUNCTION public.apna_current_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apna_current_role() TO anon, authenticated;

-- Protect profile roles from self-promotion
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND public.apna_current_role() <> 'super_admin' THEN
    IF auth.uid() IS NOT NULL OR COALESCE(current_setting('role', true), '') NOT IN ('none', 'postgres', 'service_role') THEN
      RAISE EXCEPTION 'Only a super admin can change account roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_profile_role() FROM PUBLIC;
DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- Handle user auth creation & email verification sync
-- Only when super admin creates admin invitation and the user confirms email,
-- an entry is stored in profiles table with role 'admin'.
CREATE OR REPLACE FUNCTION public.handle_user_auth_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  invitation_row record;
BEGIN
  -- Check if this email has a pending admin authorization created by Super Admin
  SELECT * INTO invitation_row FROM public.admin_invitations
  WHERE lower(email) = lower(NEW.email) AND status = 'pending' LIMIT 1;

  IF invitation_row.id IS NOT NULL THEN
    -- Admin invitation exists. Only write role 'admin' if email is confirmed!
    IF NEW.email_confirmed_at IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, full_name, phone, role)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NULLIF(invitation_row.full_name, ''), ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NULLIF(invitation_row.phone, ''), ''),
        'admin'
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
        phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE public.profiles.phone END,
        role = 'admin';

      UPDATE public.admin_invitations
      SET status = 'verified', verified_at = now()
      WHERE id = invitation_row.id;
    END IF;
    -- If email_confirmed_at IS NULL, we do NOT create an admin profile entry yet.
  ELSE
    -- Standard customer registration
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      'customer'
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_user_auth_sync() FROM PUBLIC;

-- Attach triggers to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_auth_sync();

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_user_auth_sync();

-- Fallback alias for backward compatibility
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN public.handle_user_auth_sync();
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Reset and re-apply clean Row Level Security policies
DO $$
DECLARE table_name text; policy_row record;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['profiles','service_requests','services','website_content','site_settings','admin_audit_logs','contact_inquiries','admin_invitations'] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      FOR policy_row IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=table_name LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_row.policyname, table_name);
      END LOOP;
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', table_name);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
    END IF;
  END LOOP;
END;
$$;

-- Profiles Policies
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated
USING (id=auth.uid() OR public.apna_current_role() IN ('admin','super_admin'));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
USING (id=auth.uid() OR public.apna_current_role()='super_admin')
WITH CHECK (id=auth.uid() OR public.apna_current_role()='super_admin');

-- Service Requests Policies
CREATE POLICY requests_read ON public.service_requests FOR SELECT TO authenticated
USING (user_id=auth.uid() OR public.apna_current_role() IN ('admin','super_admin'));
CREATE POLICY requests_insert ON public.service_requests FOR INSERT TO authenticated
WITH CHECK (user_id=auth.uid() AND status='Request Received'
  AND COALESCE(payment_status,'pending')='pending' AND document_url IS NULL);
CREATE POLICY requests_update ON public.service_requests FOR UPDATE TO authenticated
USING (public.apna_current_role()='super_admin') WITH CHECK (public.apna_current_role()='super_admin');
CREATE POLICY requests_delete ON public.service_requests FOR DELETE TO authenticated
USING (public.apna_current_role()='super_admin');

-- CMS, Settings & Services Policies
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['services','website_content','site_settings'] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon', table_name);
      EXECUTE format('CREATE POLICY public_read ON public.%I FOR SELECT TO anon, authenticated USING (true)', table_name);
      EXECUTE format('CREATE POLICY staff_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.apna_current_role() = ''super_admin'')', table_name);
      EXECUTE format('CREATE POLICY staff_update ON public.%I FOR UPDATE TO authenticated USING (public.apna_current_role() = ''super_admin'') WITH CHECK (public.apna_current_role() = ''super_admin'')', table_name);
      EXECUTE format('CREATE POLICY staff_delete ON public.%I FOR DELETE TO authenticated USING (public.apna_current_role() = ''super_admin'')', table_name);
    END IF;
  END LOOP;
  IF to_regclass('public.admin_audit_logs') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY audit_read ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.apna_current_role() IN (''admin'',''super_admin''))';
    EXECUTE 'CREATE POLICY audit_insert ON public.admin_audit_logs FOR INSERT TO authenticated WITH CHECK (public.apna_current_role() = ''super_admin'' AND admin_id = auth.uid())';
  END IF;
  IF to_regclass('public.contact_inquiries') IS NOT NULL THEN
    EXECUTE 'GRANT INSERT ON public.contact_inquiries TO anon';
    EXECUTE 'CREATE POLICY contact_submit ON public.contact_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY contact_read ON public.contact_inquiries FOR SELECT TO authenticated USING (public.apna_current_role() IN (''admin'',''super_admin''))';
    EXECUTE 'CREATE POLICY contact_update ON public.contact_inquiries FOR UPDATE TO authenticated USING (public.apna_current_role() IN (''admin'',''super_admin'')) WITH CHECK (public.apna_current_role() IN (''admin'',''super_admin''))';
    EXECUTE 'CREATE POLICY contact_delete ON public.contact_inquiries FOR DELETE TO authenticated USING (public.apna_current_role() = ''super_admin'')';
  END IF;
  IF to_regclass('public.admin_invitations') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY admin_invitations_super_admin ON public.admin_invitations FOR ALL TO authenticated USING (public.apna_current_role() = ''super_admin'') WITH CHECK (public.apna_current_role() = ''super_admin'')';
  END IF;
END;
$$;
COMMIT;
