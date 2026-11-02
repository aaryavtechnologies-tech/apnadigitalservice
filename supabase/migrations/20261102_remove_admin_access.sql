-- Remove staff privileges while retaining customer records.
CREATE OR REPLACE FUNCTION public.remove_admin_access(target_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_email text;
BEGIN
  IF auth.uid() IS NULL OR public.apna_current_role() <> 'super_admin' THEN
    RAISE EXCEPTION 'Only a super admin can delete admin access';
  END IF;
  IF target_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own admin access';
  END IF;
  SELECT email INTO target_email FROM public.profiles
    WHERE id = target_id AND role = 'admin' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin not found or account is protected';
  END IF;
  DELETE FROM public.admin_invitations WHERE lower(email) = lower(target_email);
  UPDATE public.profiles SET role = 'customer' WHERE id = target_id;
  RETURN target_id;
END;
$$;
REVOKE ALL ON FUNCTION public.remove_admin_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_admin_access(uuid) TO authenticated;
