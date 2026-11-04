-- Apply after 20261031_staff_access.sql.
-- Auth Admin can set app metadata. Public signup can only set user metadata.
BEGIN;

CREATE OR REPLACE FUNCTION public.handle_direct_staff_creation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'admin'
  );

  UPDATE public.admin_invitations
  SET status = 'verified', verified_at = now()
  WHERE lower(email) = lower(NEW.email) AND status = 'pending';

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_direct_staff_creation() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  WHEN ((NEW.raw_app_meta_data->'apna_direct_staff') IS DISTINCT FROM 'true'::jsonb)
  EXECUTE FUNCTION public.handle_user_auth_sync();

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL
    AND (NEW.raw_app_meta_data->'apna_direct_staff') IS DISTINCT FROM 'true'::jsonb)
  EXECUTE FUNCTION public.handle_user_auth_sync();

DROP TRIGGER IF EXISTS on_direct_staff_created ON auth.users;
CREATE TRIGGER on_direct_staff_created
  AFTER INSERT ON auth.users FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND NEW.raw_app_meta_data->'apna_direct_staff' = 'true'::jsonb)
  EXECUTE FUNCTION public.handle_direct_staff_creation();

DROP TRIGGER IF EXISTS on_direct_staff_confirmed ON auth.users;
CREATE TRIGGER on_direct_staff_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL
    AND NEW.raw_app_meta_data->'apna_direct_staff' = 'true'::jsonb)
  EXECUTE FUNCTION public.handle_direct_staff_creation();

COMMIT;
