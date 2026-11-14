-- Preserve old references while migrating existing final PDFs into private storage.
-- No customer or staff API can access this operator-only recovery ledger.
BEGIN;
CREATE TABLE IF NOT EXISTS public.final_pdf_migration_backups (
  application_id text NOT NULL,
  source_url text NOT NULL,
  sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (application_id, source_url)
);
ALTER TABLE public.final_pdf_migration_backups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.final_pdf_migration_backups FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.final_pdf_migration_backups TO service_role;
CREATE OR REPLACE FUNCTION public.apna_legacy_migration_operator()
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT current_user = 'service_role';
$$;
REVOKE ALL ON FUNCTION public.apna_legacy_migration_operator() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apna_legacy_migration_operator() TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
