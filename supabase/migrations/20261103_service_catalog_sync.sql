-- Support older catalog schemas without overwriting published service settings.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS card_title text,
  ADD COLUMN IF NOT EXISTS card_subtitle text,
  ADD COLUMN IF NOT EXISTS card_button_text text,
  ADD COLUMN IF NOT EXISTS card_theme text,
  ADD COLUMN IF NOT EXISTS service_charge text DEFAULT '100',
  ADD COLUMN IF NOT EXISTS qr_code_url text,
  ADD COLUMN IF NOT EXISTS form_fields jsonb DEFAULT '[]'::jsonb;

-- Public clients need only the IDs to suppress bundled defaults hidden by RLS.
CREATE OR REPLACE FUNCTION public.inactive_default_service_ids(default_ids text[])
RETURNS SETOF text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.services WHERE status = 'inactive' AND id = ANY(default_ids);
$$;

REVOKE ALL ON FUNCTION public.inactive_default_service_ids(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inactive_default_service_ids(text[]) TO anon, authenticated;
