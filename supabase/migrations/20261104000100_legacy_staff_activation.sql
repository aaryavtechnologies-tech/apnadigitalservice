BEGIN;

-- Only the create-admin Edge Function calls this after verifying a super admin.
CREATE OR REPLACE FUNCTION public.find_legacy_staff_account(invitation_id uuid, staff_email text)
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE existing_user auth.users%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_invitations i
    WHERE i.id = invitation_id AND lower(i.email) = staff_email AND i.status = 'pending'
  ) THEN
    RAISE EXCEPTION 'This legacy authorization is no longer pending.';
  END IF;

  BEGIN
    SELECT u.* INTO STRICT existing_user FROM auth.users u
    WHERE lower(u.email) = staff_email;
  EXCEPTION
    WHEN no_data_found THEN RETURN NULL;
    WHEN too_many_rows THEN RAISE EXCEPTION 'Multiple accounts match this address.';
  END;

  IF existing_user.email_confirmed_at IS NOT NULL
    OR existing_user.raw_user_meta_data->>'invited_role' IS DISTINCT FROM 'admin'
    OR existing_user.raw_app_meta_data->>'provider' IS DISTINCT FROM 'email'
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = existing_user.id)
  THEN
    RAISE EXCEPTION 'This address belongs to an existing account that cannot be activated from a legacy authorization.';
  END IF;

  RETURN existing_user.id;
END;
$$;

REVOKE ALL ON FUNCTION public.find_legacy_staff_account(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_legacy_staff_account(uuid, text) TO service_role;

COMMIT;
