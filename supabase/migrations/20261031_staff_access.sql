-- Apply after the existing application schema. Does not delete tables or records.
-- Preserves existing staff assignments; never promotes an account by email.
BEGIN;

CREATE OR REPLACE FUNCTION public.apna_current_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'customer');
$$;
REVOKE ALL ON FUNCTION public.apna_current_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apna_current_role() TO anon, authenticated;

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles(id, email, full_name, phone, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''), 'customer')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Old permissive policies are ORed with new policies, so replace them all on
-- the application tables. Optional tables are skipped if not installed.
DO $$
DECLARE table_name text; policy_row record;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['profiles','service_requests','services','website_content','site_settings','admin_audit_logs','contact_inquiries'] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      FOR policy_row IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=table_name LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', policy_row.policyname, table_name);
      END LOOP;
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', table_name);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
    END IF;
  END LOOP;
END;
$$;

CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated
USING (id=auth.uid() OR public.apna_current_role() IN ('admin','super_admin'));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
USING (id=auth.uid() OR public.apna_current_role()='super_admin')
WITH CHECK (id=auth.uid() OR public.apna_current_role()='super_admin');
-- No client-side profile INSERT/DELETE. The auth trigger creates customers.

CREATE POLICY requests_read ON public.service_requests FOR SELECT TO authenticated
USING (user_id=auth.uid() OR public.apna_current_role() IN ('admin','super_admin'));
CREATE POLICY requests_insert ON public.service_requests FOR INSERT TO authenticated
WITH CHECK (user_id=auth.uid() AND status='Request Received'
  AND COALESCE(payment_status,'pending')='pending' AND document_url IS NULL);
CREATE POLICY requests_update ON public.service_requests FOR UPDATE TO authenticated
USING (public.apna_current_role()='super_admin') WITH CHECK (public.apna_current_role()='super_admin');
CREATE POLICY requests_delete ON public.service_requests FOR DELETE TO authenticated
USING (public.apna_current_role()='super_admin');

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
    EXECUTE 'CREATE POLICY contact_update ON public.contact_inquiries FOR UPDATE TO authenticated USING (public.apna_current_role() = ''super_admin'') WITH CHECK (public.apna_current_role() = ''super_admin'')';
    EXECUTE 'CREATE POLICY contact_delete ON public.contact_inquiries FOR DELETE TO authenticated USING (public.apna_current_role() = ''super_admin'')';
  END IF;
END;
$$;
COMMIT;
