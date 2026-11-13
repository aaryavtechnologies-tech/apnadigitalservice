BEGIN;
CREATE TABLE public.staff_sessions (
 session_id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL DEFAULT now() + interval '8 hours'
);
ALTER TABLE public.staff_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staff_sessions FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.activate_staff_session() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','super_admin'))
 OR NOT EXISTS (SELECT 1 FROM jsonb_array_elements(auth.jwt()->'amr') a
   WHERE a->>'method'='password' AND (a->>'timestamp')::bigint > extract(epoch FROM now())-60)
 THEN RAISE EXCEPTION 'A fresh staff password sign-in is required'; END IF;
 INSERT INTO public.staff_sessions(session_id,user_id) VALUES ((auth.jwt()->>'session_id')::uuid,auth.uid())
 ON CONFLICT DO NOTHING;
END; $$;
CREATE OR REPLACE FUNCTION public.end_staff_session() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
 DELETE FROM public.staff_sessions WHERE user_id=auth.uid() AND session_id=(auth.jwt()->>'session_id')::uuid;
$$;
CREATE OR REPLACE FUNCTION public.apna_current_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT COALESCE((SELECT p.role FROM public.profiles p WHERE p.id=auth.uid()
 AND (p.role='customer' OR EXISTS (SELECT 1 FROM public.staff_sessions s
 WHERE s.user_id=p.id AND s.session_id=(auth.jwt()->>'session_id')::uuid AND s.expires_at>now()))),'customer');
$$;
CREATE OR REPLACE FUNCTION public.apna_email_verified() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS(SELECT 1 FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL);
$$;
REVOKE ALL ON FUNCTION public.activate_staff_session(), public.end_staff_session(), public.apna_email_verified() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_staff_session(), public.end_staff_session(), public.apna_email_verified() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apna_email_verified() TO anon;
-- Restrictive policies remain effective alongside any permissive policies.
CREATE POLICY verified_requests ON public.service_requests AS RESTRICTIVE FOR ALL TO authenticated
 USING (public.apna_email_verified()) WITH CHECK (public.apna_email_verified());
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('final-documents','final-documents',false,5242880,ARRAY['application/pdf'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=5242880,allowed_mime_types=ARRAY['application/pdf'];
CREATE POLICY final_pdf_read ON storage.objects FOR SELECT TO authenticated USING (
 bucket_id='final-documents' AND public.apna_email_verified() AND EXISTS (
 SELECT 1 FROM public.service_requests r WHERE r.document_url='storage://final-documents/'||name
 AND (r.user_id=auth.uid() OR public.apna_current_role() IN ('admin','super_admin'))));
CREATE POLICY final_pdf_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (
 bucket_id='final-documents' AND public.apna_current_role()='super_admin' AND EXISTS (
 SELECT 1 FROM public.service_requests r WHERE r.application_id=(storage.foldername(name))[1]));
CREATE POLICY final_pdf_cleanup ON storage.objects FOR DELETE TO authenticated USING (
 bucket_id='final-documents' AND public.apna_current_role()='super_admin');
-- Prevent unrelated permissive bucket policies from exposing final PDFs.
CREATE POLICY final_pdf_boundary ON storage.objects AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (bucket_id <> 'final-documents' OR (
 public.apna_email_verified() AND EXISTS (SELECT 1 FROM public.service_requests r
 WHERE r.document_url='storage://final-documents/'||name
 AND (r.user_id=auth.uid() OR public.apna_current_role() IN ('admin','super_admin')))
) OR (bucket_id='final-documents' AND public.apna_current_role()='super_admin'))
WITH CHECK (bucket_id <> 'final-documents' OR (public.apna_current_role()='super_admin'
 AND EXISTS (SELECT 1 FROM public.service_requests r WHERE r.application_id=(storage.foldername(name))[1])));
COMMIT;
