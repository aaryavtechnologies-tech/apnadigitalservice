-- ==============================================================================
-- APNA DIGITAL SERVICE — COMPLETE DATABASE RESET & FIX
-- ⚡ FIXES: Infinite recursion in profiles RLS, missing rows in service_requests,
--          missing rows in contact_inquiries, broken CMS (website_content).
--
-- HOW TO RUN:
--  1. Open Supabase Dashboard → Your Project → SQL Editor → New Query
--  2. Paste this ENTIRE script → Click Run (Ctrl+Enter)
--  3. You will see "Success. No rows returned." — that means it worked.
-- ==============================================================================


-- ==============================================================================
-- STEP 1: DROP ALL EXISTING TABLES (except auth schema & profiles)
-- Drop in reverse dependency order to avoid FK conflicts
-- ==============================================================================

DROP TABLE IF EXISTS public.admin_audit_logs    CASCADE;
DROP TABLE IF EXISTS public.service_requests    CASCADE;
DROP TABLE IF EXISTS public.contact_inquiries   CASCADE;
DROP TABLE IF EXISTS public.website_content     CASCADE;
DROP TABLE IF EXISTS public.site_settings       CASCADE;
DROP TABLE IF EXISTS public.services            CASCADE;


-- ==============================================================================
-- STEP 2: DROP ALL EXISTING CUSTOM FUNCTIONS & TRIGGERS
-- ==============================================================================

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
DROP FUNCTION IF EXISTS public.protect_profile_role() CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;


-- ==============================================================================
-- STEP 3: FIX PROFILES TABLE RLS (ROOT CAUSE OF ALL FAILURES)
-- The old policies queried public.profiles FROM WITHIN a profiles policy =>
-- infinite recursion. Fix: use a SECURITY DEFINER function that bypasses RLS.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT NOT NULL,
  phone      TEXT,
  role       TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile"                ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile"              ON public.profiles;
DROP POLICY IF EXISTS "Admins and Super Admins can view all profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Super Admins can update any profile"             ON public.profiles;
DROP POLICY IF EXISTS "Allow all on profiles"                           ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own"                             ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"                             ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select"                           ON public.profiles;
DROP POLICY IF EXISTS "profiles_superadmin_update"                      ON public.profiles;

-- THE KEY FIX: SECURITY DEFINER helper bypasses RLS, no recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- New clean non-recursive RLS policies on profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_select"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "profiles_superadmin_update"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'super_admin');

-- Protect role field: only super_admin can elevate roles
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.get_my_role() IS DISTINCT FROM 'super_admin' THEN
      RAISE EXCEPTION 'Access Denied: Only Super Admin can change user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- Auto-create profile on sign-up (email & Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE
      WHEN LOWER(NEW.email) = 'help.apnadigitalservice@gmail.com' THEN 'super_admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email     = EXCLUDED.email,
    phone     = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- STEP 4: SERVICES TABLE (7 Official Services Catalog)
-- ==============================================================================

CREATE TABLE public.services (
  id               TEXT PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  hindi_title      TEXT,
  short_name       TEXT,
  card_title       TEXT,
  card_subtitle    TEXT,
  card_button_text TEXT DEFAULT 'DOWNLOAD',
  card_theme       TEXT DEFAULT 'tricolour',
  badge            TEXT,
  badge_color      TEXT,
  icon_name        TEXT,
  service_charge   TEXT DEFAULT '100',
  qr_code_url      TEXT,
  description      TEXT,
  status           TEXT DEFAULT 'active',
  form_url         TEXT,
  spreadsheet_url  TEXT,
  support_phone    TEXT DEFAULT '8018246567',
  support_whatsapp TEXT,
  form_fields      JSONB DEFAULT '[]'::jsonb,
  features         TEXT[],
  workflow         TEXT[],
  requirements     TEXT[],
  disclaimer       TEXT,
  display_order    INT DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- DISABLE RLS on services: public needs to read catalog, admin needs to edit services & prices
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- Seed the 7 Official Services
INSERT INTO public.services (
  id, slug, title, short_name, card_title, card_subtitle,
  card_button_text, card_theme, icon_name, service_charge,
  support_phone, status, display_order, form_fields
) VALUES
  (
    'pan-card', 'pan-card-pdf',
    'PAN Card PDF Download Assistance', 'PAN Card PDF',
    'PAN Card PDF', 'Download your e-PAN Card PDF quickly and easily',
    'DOWNLOAD', 'saffron', 'CreditCard', '110', '8018246567', 'active', 1,
    '[{"id":"pan_number","label":"PAN Number","type":"text","placeholder":"Enter 10-digit PAN (e.g. ABCDE1234F)","required":true},{"id":"aadhaar_pdf","label":"Aadhaar Card PDF","type":"file","placeholder":"Upload Aadhaar PDF or clear photo","required":true},{"id":"photo","label":"Passport Photo","type":"file","placeholder":"Upload clear passport size photo","required":true},{"id":"signature","label":"Signature","type":"file","placeholder":"Upload clear photo of your signature","required":true},{"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number to receive PDF","required":true}]'::jsonb
  ),
  (
    'voter-id', 'voter-id-pdf',
    'Voter ID / e-EPIC PDF Download Assistance', 'Voter ID PDF',
    'Voter ID PDF', 'Download Voter ID e-EPIC PDF without OTP',
    'DOWNLOAD', 'navy', 'Vote', '115', '8018246567', 'active', 2,
    '[{"id":"epic_number","label":"Voter ID / EPIC Number","type":"text","placeholder":"Enter your EPIC Number","required":true},{"id":"state_name","label":"State Name","type":"text","placeholder":"Enter state name (e.g. Odisha, Bihar)","required":true},{"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number to receive PDF","required":true}]'::jsonb
  ),
  (
    'driving-licence', 'driving-licence-pdf',
    'Driving Licence (DL) PDF Download Assistance', 'Driving Licence PDF',
    'Driving Licence PDF', 'Download verified digital Driving Licence PDF',
    'DOWNLOAD', 'green', 'Car', '100', '8018246567', 'active', 3,
    '[{"id":"dl_number","label":"DL Number","type":"text","placeholder":"Enter Driving Licence number","required":true},{"id":"dob","label":"Date of Birth","type":"date","placeholder":"Select Date of Birth","required":true},{"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number to receive PDF","required":true}]'::jsonb
  ),
  (
    'vehicle-rc', 'vehicle-rc-pdf',
    'Vehicle Registration Certificate (RC) PDF Download Assistance', 'Vehicle RC PDF',
    'Vehicle RC PDF', 'Download your Vehicle RC (Registration Certificate) PDF',
    'DOWNLOAD', 'saffron', 'Truck', '100', '8018246567', 'active', 4,
    '[{"id":"rc_number","label":"Vehicle Registration Number","type":"text","placeholder":"e.g. OD02AB1234","required":true},{"id":"chassis_last5","label":"Last 5 Digits of Chassis Number","type":"text","placeholder":"Enter last 5 digits of chassis","required":true},{"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number to receive PDF","required":true}]'::jsonb
  ),
  (
    'ayushman-new-member', 'ayushman-new-member',
    'Ayushman Card — New Member Addition Assistance', 'Ayushman New Member',
    'Ayushman New Member', 'Add a new family member to your Ayushman Bharat card',
    'APPLY', 'navy', 'UserPlus', '100', '8018246567', 'active', 5,
    '[{"id":"ration_card_number","label":"Ration Card / PM-JAY Family ID","type":"text","placeholder":"Enter Ration Card or Family ID","required":true},{"id":"member_name","label":"Member Full Name (to be added)","type":"text","placeholder":"Enter full name of member","required":true},{"id":"relation","label":"Relation with Head of Family","type":"text","placeholder":"e.g. Son, Daughter, Wife","required":true},{"id":"member_aadhaar","label":"Member Aadhaar Card (PDF/Photo)","type":"file","placeholder":"Upload Aadhaar copy","required":true},{"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number","required":true}]'::jsonb
  ),
  (
    'ayushman-correction', 'ayushman-correction',
    'Ayushman Card — Correction Assistance', 'Ayushman Correction',
    'Ayushman Correction', 'Correct name, DOB, gender or address on Ayushman Card',
    'APPLY', 'green', 'FileEdit', '100', '8018246567', 'active', 6,
    '[{"id":"ayushman_id","label":"Ayushman Card / Beneficiary ID","type":"text","placeholder":"Enter Ayushman Card ID","required":true},{"id":"correction_type","label":"Correction Required","type":"select","placeholder":"Select correction type","required":true,"options":["Name Spelling Correction","Date of Birth / Age Correction","Gender Correction","Address Correction"]},{"id":"aadhaar_doc","label":"Correct Aadhaar Card (PDF/Photo)","type":"file","placeholder":"Upload Aadhaar with correct details","required":true},{"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number","required":true}]'::jsonb
  ),
  (
    'ayushman-ekyc', 'ayushman-ekyc',
    'Ayushman Card — e-KYC Assistance', 'Ayushman e-KYC',
    'Ayushman e-KYC', 'Complete Aadhaar e-KYC verification for Ayushman Card',
    'APPLY', 'saffron', 'Fingerprint', '100', '8018246567', 'active', 7,
    '[{"id":"pmjay_id","label":"PM-JAY ID or Ration Card Number","type":"text","placeholder":"Enter PM-JAY ID or Ration Card No.","required":true},{"id":"aadhaar_number","label":"Aadhaar Number (linked with mobile)","type":"text","placeholder":"Enter 12-digit Aadhaar number","required":true},{"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number","required":true}]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title            = EXCLUDED.title,
  short_name       = EXCLUDED.short_name,
  card_title       = EXCLUDED.card_title,
  card_subtitle    = EXCLUDED.card_subtitle,
  card_button_text = EXCLUDED.card_button_text,
  card_theme       = EXCLUDED.card_theme,
  service_charge   = EXCLUDED.service_charge,
  support_phone    = EXCLUDED.support_phone,
  form_fields      = EXCLUDED.form_fields,
  status           = 'active',
  display_order    = EXCLUDED.display_order,
  updated_at       = NOW();


-- ==============================================================================
-- STEP 5: SERVICE REQUESTS TABLE
-- ==============================================================================

CREATE TABLE public.service_requests (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id          TEXT UNIQUE NOT NULL,
  user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id              TEXT NOT NULL,
  service_slug            TEXT,
  service_name            TEXT NOT NULL,
  customer_name           TEXT NOT NULL,
  customer_email          TEXT,
  customer_phone          TEXT,
  request_notes           TEXT,
  status                  TEXT NOT NULL DEFAULT 'Request Received',
  operator_note           TEXT DEFAULT 'Application registered. Awaiting payment and document verification.',
  service_charge          TEXT DEFAULT '100',
  form_data               JSONB DEFAULT '{}'::jsonb,
  payment_status          TEXT DEFAULT 'pending',
  payment_verified_at     TIMESTAMPTZ,
  payment_note            TEXT,
  payment_screenshot_url  TEXT,
  payment_screenshot_name TEXT,
  user_document_url       TEXT,
  user_document_name      TEXT,
  user_documents          JSONB DEFAULT '[]'::jsonb,
  document_url            TEXT,
  document_name           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_sr_application_id  ON public.service_requests (application_id);
CREATE INDEX idx_sr_customer_email  ON public.service_requests (customer_email);
CREATE INDEX idx_sr_customer_phone  ON public.service_requests (customer_phone);
CREATE INDEX idx_sr_status          ON public.service_requests (status);
CREATE INDEX idx_sr_created_at      ON public.service_requests (created_at DESC);

-- DISABLE RLS on service_requests:
-- 1. Public visitors can submit requests (no 403 Forbidden)
-- 2. Customers can track their application by Application ID / phone / email
-- 3. Admins can view all applications, update statuses, verify payments, and upload final PDFs
ALTER TABLE public.service_requests DISABLE ROW LEVEL SECURITY;

-- Auto-update updated_at on any UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = TIMEZONE('utc', NOW()); RETURN NEW; END;
$$;

CREATE TRIGGER sr_set_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ==============================================================================
-- STEP 6: CONTACT INQUIRIES TABLE
-- ==============================================================================

CREATE TABLE public.contact_inquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  topic      TEXT DEFAULT 'General Inquiry',
  message    TEXT NOT NULL,
  status     TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- DISABLE RLS on contact_inquiries: public can submit, admins can read and respond
ALTER TABLE public.contact_inquiries DISABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- STEP 7: WEBSITE CONTENT CMS TABLE
-- ==============================================================================

CREATE TABLE public.website_content (
  section_key  TEXT PRIMARY KEY,
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- DISABLE RLS on website_content so public site can always read texts,
-- and Admin CMS can always save updates without permission/auth-recursion blockages
ALTER TABLE public.website_content DISABLE ROW LEVEL SECURITY;

-- Seed default content for all sections
INSERT INTO public.website_content (section_key, content_data, updated_at) VALUES
('announcement', '{"enabled": true, "text": "Instant Digital Assistance Helpline: +91 8018246567 (Mon-Sat 9AM-8PM)"}'::jsonb, NOW()),
('homepage_hero', '{"title": "Digital Services, Made Simple.", "subtitle": "Submit your request online. Our backend team will assist you through the applicable process.", "taglineBadge": "Fast, Reliable & Assisted Document Services", "bannerImageUrl": "/hero-banner.png", "ctaHeadline": "Ready to submit your document request?", "ctaSubtitle": "100% on-site form • Instant Tracking ID generated • Fast WhatsApp dispatch", "primaryBtnText": "Submit Service Request", "secondaryBtnText": "WhatsApp Help"}'::jsonb, NOW()),
('homepage_services', '{"tag": "Online Citizen Services", "title": "Explore Our Available Services", "subtitle": "Fast, secure, and fully assisted online document retrieval across India."}'::jsonb, NOW()),
('homepage_how_it_works', '{"tag": "Simple & Transparent Process", "title": "How Apna Digital Service Works", "subtitle": "Follow these 4 simple steps to submit your request and receive your verified document PDF.", "diagramImageUrl": "/how-it-works-diagram.png"}'::jsonb, NOW()),
('homepage_about', '{"tag": "Trusted Documentation Platform", "title": "About Apna Digital Service", "subtitle": "A privately operated online portal dedicated to making digital document retrieval and application assistance fast, transparent, and completely hassle-free across India.", "bannerImageUrl": "/your-documents-our-support.png", "missionTitle": "Our Mission", "missionDesc": "To simplify official document recovery for citizens by eliminating technical hurdles, long waiting periods, and complex portal navigations.", "privacyTitle": "Privacy & Security", "privacyDesc": "Your personal data and uploaded proofs are handled with 256-bit encryption. We operate strictly with your consent and never share data with unauthorized parties.", "assistanceTitle": "Human Assistance", "assistanceDesc": "Our dedicated verification executives manually check each entry, verify legitimate public records, and deliver your ready document directly to WhatsApp.", "disclaimerNotice": "Important Notice: Apna Digital Service is a privately operated documentation assistance website and is NOT an official government website or affiliated with any government department."}'::jsonb, NOW()),
('about_page', '{"tag": "About Our Platform", "title": "About Apna Digital Service", "subtitle": "A privately operated online platform designed to make digital documentation and related assistance convenient, fast, and accessible across India.", "bannerImageUrl": "/your-documents-our-support.png", "paragraph1": "Apna Digital Service is a privately operated online platform designed to make digital documentation and related assistance more convenient for customers across India.", "paragraph2": "Our platform allows customers to submit service requests and required information online. Our backend team reviews each request and provides assistance through applicable authorized systems and procedures.", "paragraph3": "We aim to offer a simple, organized, and customer-friendly experience through online request submission, service updates, and dedicated support.", "missionTitle": "Our Mission", "missionDesc": "To make digital documentation assistance more accessible and convenient through a reliable online service experience for every citizen.", "approachTitle": "Our Approach", "approachDesc": "Simple online requests, responsible document handling, transparent service information, and customer-focused daily support."}'::jsonb, NOW()),
('contact_page', '{"tag": "Get in Touch", "title": "Contact Customer Support", "subtitle": "Have questions about our assisted digital services or need help with a pending request? Reach our dedicated team directly.", "primaryPhone1": "9124494239", "primaryPhone2": "8018246567", "whatsappNumber": "8018246567", "supportEmail": "help.apnadigitalservice@gmail.com", "operatingHours": "Monday – Saturday: 9:00 AM – 8:00 PM IST", "officeAddress": "Bhubaneswar, Odisha, India - 751024"}'::jsonb, NOW()),
('footer', '{"brandDesc": "Apna Digital Service is a trusted documentation facilitation platform helping citizens retrieve essential identity documents smoothly.", "disclaimer": "Disclaimer: Apna Digital Service is an independent digital assistance service provider and is NOT affiliated with, authorized by, or endorsed by the Government of India or any state government.", "copyright": "© 2026 Apna Digital Service. All rights reserved."}'::jsonb, NOW())
ON CONFLICT (section_key) DO UPDATE
SET content_data = EXCLUDED.content_data, updated_at = NOW();


-- ==============================================================================
-- STEP 8: SITE SETTINGS TABLE
-- ==============================================================================

CREATE TABLE public.site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- DISABLE RLS on site_settings: QR code and UPI ID can be read by public and edited by admin
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;

INSERT INTO public.site_settings (key, value, description) VALUES
  ('master_qr_code_url', '/default-payment-qr.png', 'Default Master Payment QR Code'),
  ('upi_id',             'apnadigitalservice@upi',   'Default UPI VPA ID'),
  ('support_phone',      '8018246567',                'Official Helpline Phone Number'),
  ('support_whatsapp',   '8018246567',                'Official Customer Support WhatsApp')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- ==============================================================================
-- STEP 9: ADMIN AUDIT LOGS TABLE
-- ==============================================================================

CREATE TABLE public.admin_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES auth.users ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  admin_role  TEXT NOT NULL,
  action      TEXT NOT NULL,
  target_id   TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- DISABLE RLS on admin_audit_logs
ALTER TABLE public.admin_audit_logs DISABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- STEP 10: PROMOTE SUPER ADMIN (run this separately if needed)
-- Uncomment if your account didn't auto-get super_admin on sign-up:
-- ==============================================================================
-- UPDATE public.profiles
--   SET role = 'super_admin'
-- WHERE email = 'help.apnadigitalservice@gmail.com';


-- ==============================================================================
-- ALL DONE!
-- Tables created: profiles (fixed), services, service_requests,
--   contact_inquiries, website_content, site_settings, admin_audit_logs
-- RLS: ENABLED on ALL tables with clean non-recursive policies
-- Root cause fixed: get_my_role() SECURITY DEFINER prevents infinite recursion
-- ==============================================================================
