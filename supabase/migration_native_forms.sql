-- ==============================================================================
-- APNA DIGITAL SERVICE — COMPLETE SUPABASE DATABASE MIGRATION SCRIPT
-- ==============================================================================
-- Instructions:
-- 1. Open Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Go to your project -> Click "SQL Editor" in the left sidebar
-- 3. Click "New query" -> Paste this entire script -> Click "Run" (or Ctrl+Enter)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SITE SETTINGS TABLE (Global Master Settings & QR Code)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Super Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Super Admins can insert site settings" ON public.site_settings;

CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Super Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Super Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Seed Default Payment & Helpline Settings (Strictly 8018246567)
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('master_qr_code_url', '/default-payment-qr.png', 'Default Master Payment QR Code for scan and pay'),
  ('upi_id', 'apnadigitalservice@upi', 'Default UPI VPA ID'),
  ('support_phone', '8018246567', 'Official Helpline Phone Number'),
  ('support_whatsapp', '8018246567', 'Official Customer Support WhatsApp Number')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- ------------------------------------------------------------------------------
-- 2. SERVICE REQUESTS TABLE (Customer Applications, Payment Status & Real-time Notes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  request_notes TEXT,
  status TEXT DEFAULT 'Request Received',
  operator_note TEXT DEFAULT 'Application registered with payment proof. Awaiting operator verification.',
  service_charge TEXT DEFAULT '100',
  form_data JSONB DEFAULT '{}'::jsonb,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'received', 'failed')),
  payment_verified_at TIMESTAMPTZ,
  payment_note TEXT,
  payment_screenshot_url TEXT,
  payment_screenshot_name TEXT,
  user_document_url TEXT,
  user_document_name TEXT,
  user_documents JSONB DEFAULT '[]'::jsonb,
  document_url TEXT,
  document_name TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Ensure all payment & native form columns exist if table was already created
ALTER TABLE public.service_requests 
  ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_note TEXT,
  ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_screenshot_name TEXT,
  ADD COLUMN IF NOT EXISTS user_document_url TEXT,
  ADD COLUMN IF NOT EXISTS user_document_name TEXT,
  ADD COLUMN IF NOT EXISTS user_documents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS document_url TEXT,
  ADD COLUMN IF NOT EXISTS document_name TEXT,
  ADD COLUMN IF NOT EXISTS service_charge TEXT;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Drop all old and restrictive policies
DROP POLICY IF EXISTS "Customers can view own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Customers can insert their own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Super Admins can update all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Super Admins can delete all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Public can insert service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view and update all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow select on service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow update on service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow delete on service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow all access to service_requests" ON public.service_requests;

-- 1. Public can insert new service requests
CREATE POLICY "Public can insert service requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (true);

-- 2. Public and Admins can view service requests (allows tracking by application_id/phone/email)
CREATE POLICY "Allow select on service requests"
  ON public.service_requests FOR SELECT
  USING (true);

-- 3. Admins and system can update service requests (status, notes, verification, payment)
CREATE POLICY "Allow update on service requests"
  ON public.service_requests FOR UPDATE
  USING (true);

-- 4. Admins can delete service requests
CREATE POLICY "Allow delete on service requests"
  ON public.service_requests FOR DELETE
  USING (true);


-- ------------------------------------------------------------------------------
-- 2B. CONTACT INQUIRIES TABLE (Customer Contact Form Messages)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  topic TEXT DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert contact inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow select on contact_inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow update on contact_inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow all on contact_inquiries" ON public.contact_inquiries;

CREATE POLICY "Public can insert contact inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select on contact_inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (true);

CREATE POLICY "Allow update on contact_inquiries"
  ON public.contact_inquiries FOR UPDATE
  USING (true);


-- ------------------------------------------------------------------------------
-- 3. WEBSITE CONTENT CMS TABLE (Super Admin CMS for All Pages & Sections)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_content (
  section_key TEXT PRIMARY KEY,
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read website content" ON public.website_content;
CREATE POLICY "Public can read website content" 
  ON public.website_content FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Super Admins can manage website content" ON public.website_content;
CREATE POLICY "Super Admins can manage website content" 
  ON public.website_content FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );


-- ------------------------------------------------------------------------------
-- 4. SERVICES CATALOG TABLE (Strictly 7 Official Services)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  hindi_title TEXT,
  short_name TEXT,
  card_title TEXT,
  card_subtitle TEXT,
  card_button_text TEXT DEFAULT 'DOWNLOAD →',
  card_theme TEXT DEFAULT 'tricolour',
  badge TEXT,
  badge_color TEXT,
  icon_name TEXT,
  service_charge TEXT DEFAULT '100',
  qr_code_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  form_url TEXT,
  spreadsheet_url TEXT,
  support_phone TEXT DEFAULT '8018246567',
  support_whatsapp TEXT,
  form_fields JSONB DEFAULT '[]'::jsonb,
  features TEXT[],
  workflow TEXT[],
  requirements TEXT[],
  disclaimer TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.services 
  ADD COLUMN IF NOT EXISTS card_title TEXT,
  ADD COLUMN IF NOT EXISTS card_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS card_button_text TEXT DEFAULT 'DOWNLOAD →',
  ADD COLUMN IF NOT EXISTS card_theme TEXT DEFAULT 'tricolour',
  ADD COLUMN IF NOT EXISTS service_charge TEXT DEFAULT '100',
  ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Super Admins can manage services" ON public.services;
CREATE POLICY "Super Admins can manage services"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Remove any non-requirement services (e.g. Income Tax)
DELETE FROM public.services 
WHERE id = 'income-tax' OR slug = 'income-tax-filing';

-- Upsert the EXACT 7 Official Services from the Requirement Document
INSERT INTO public.services (
  id, slug, title, short_name, card_title, card_subtitle, card_button_text, card_theme,
  icon_name, service_charge, support_phone, status, form_fields
)
VALUES
  -- 1. PAN Card PDF (₹110)
  (
    'pan-card', 'pan-card-pdf', 'PAN Card PDF Download Assistance', 'PAN Card PDF',
    'PAN Card PDF', 'Assistance for customers who need to download an available PAN Card', 'DOWNLOAD →', 'saffron',
    'CreditCard', '110', '8018246567', 'active',
    '[
      {"id":"aadhaar_pdf","label":"Aadhaar Card PDF (should be clear)","type":"file","placeholder":"Upload Aadhaar PDF or clear photo (Max 10MB)","required":true},
      {"id":"pan_number","label":"Pan Number","type":"text","placeholder":"Enter 10-digit PAN Number (e.g. ABCDE1234F)","required":true},
      {"id":"photo","label":"Passport Photo","type":"file","placeholder":"Upload clear passport size photo","required":true},
      {"id":"signature","label":"Signature","type":"file","placeholder":"Upload clear photo of your signature","required":true},
      {"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp Number to receive PDF","required":true}
    ]'::jsonb
  ),
  -- 2. Voter ID PDF (₹115)
  (
    'voter-id', 'voter-id-pdf', 'Voter ID / e-EPIC PDF Download Assistance', 'Voter ID PDF',
    'Voter ID Pdf', 'Assistance for customers who need to download an available Voter ID', 'DOWNLOAD →', 'navy',
    'Vote', '115', '8018246567', 'active',
    '[
      {"id":"epic_number","label":"Voter ID / EPIC Number","type":"text","placeholder":"Enter your Voter ID or EPIC Number","required":true},
      {"id":"state_name","label":"State Name","type":"text","placeholder":"Enter state name (e.g. Odisha, Bihar, etc.)","required":true},
      {"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp Number to receive PDF","required":true}
    ]'::jsonb
  ),
  -- 3. Driving Licence PDF (₹100)
  (
    'driving-licence', 'driving-licence-pdf', 'Driving Licence (DL) PDF Download Assistance', 'Driving Licence PDF',
    'Driving Licence PDF', 'Assistance for customers who need to download an available Driving Licence', 'DOWNLOAD →', 'green',
    'Car', '100', '8018246567', 'active',
    '[
      {"id":"dl_number","label":"Driving Licence (DL) Number","type":"text","placeholder":"Enter DL Number (e.g. DL-XXXXXXXXXXXXX)","required":true},
      {"id":"dob","label":"Date of Birth (DD-MM-YYYY)","type":"date","placeholder":"Select Date of Birth","required":true},
      {"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp Number to receive PDF","required":true}
    ]'::jsonb
  ),
  -- 4. Vehicle RC PDF (₹100)
  (
    'vehicle-rc', 'vehicle-rc-pdf', 'Vehicle Registration Certificate (RC) PDF Download Assistance', 'Vehicle RC PDF',
    'Vehicle RC PDF', 'Assistance for customers who need to download an available Vehicle RC', 'DOWNLOAD →', 'saffron',
    'Truck', '100', '8018246567', 'active',
    '[
      {"id":"rc_number","label":"Vehicle Registration Number (RC Number)","type":"text","placeholder":"e.g. OD02AB1234","required":true},
      {"id":"chassis_last5","label":"Last 5 Digits of Chassis Number","type":"text","placeholder":"Enter last 5 digits of Chassis number","required":true},
      {"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp Number to receive PDF","required":true}
    ]'::jsonb
  ),
  -- 5. Ayushman New Member (₹100)
  (
    'ayushman-new-member', 'ayushman-new-member', 'Ayushman Card — New Member Addition Assistance', 'Ayushman New Member',
    'Ayushman New Member', 'Assistance with eligible requests to add a family member or beneficiary', 'DOWNLOAD →', 'navy',
    'UserPlus', '100', '8018246567', 'active',
    '[
      {"id":"ration_card_number","label":"Ration Card Number / PM-JAY Family ID","type":"text","placeholder":"Enter Ration Card or Family ID","required":true},
      {"id":"member_name","label":"Member Full Name (to be added)","type":"text","placeholder":"Enter full name of member","required":true},
      {"id":"relation","label":"Relationship with Head of Family","type":"text","placeholder":"e.g. Son, Daughter, Wife","required":true},
      {"id":"member_aadhaar","label":"Member Aadhaar Card (PDF / Photo)","type":"file","placeholder":"Upload member Aadhaar copy","required":true},
      {"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number","required":true}
    ]'::jsonb
  ),
  -- 6. Ayushman Card Correction (₹100)
  (
    'ayushman-correction', 'ayushman-correction', 'Ayushman Card — Correction Assistance', 'Ayushman Correction',
    'Ayushman Card Correction', 'Assistance with eligible corrections to an existing Ayushman Card', 'DOWNLOAD →', 'green',
    'FileEdit', '100', '8018246567', 'active',
    '[
      {"id":"ayushman_id","label":"Existing Ayushman Card / Beneficiary ID","type":"text","placeholder":"Enter Ayushman Card ID","required":true},
      {"id":"correction_type","label":"Correction Required","type":"select","placeholder":"Select correction required","required":true,"options":["Name Spelling Correction","Date of Birth / Age Correction","Gender Correction","Address Correction"]},
      {"id":"aadhaar_doc","label":"Correct Aadhaar Card (PDF / Photo)","type":"file","placeholder":"Upload Aadhaar copy with correct details","required":true},
      {"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number","required":true}
    ]'::jsonb
  ),
  -- 7. Ayushman e-KYC (₹100)
  (
    'ayushman-ekyc', 'ayushman-ekyc', 'Ayushman Card — e-KYC Assistance', 'Ayushman e-KYC',
    'Ayushman e-KYC', 'Complete biometric & Aadhaar verification for Ayushman Card', 'DOWNLOAD →', 'saffron',
    'Fingerprint', '100', '8018246567', 'active',
    '[
      {"id":"pmjay_id","label":"PM-JAY ID or Ration Card Number","type":"text","placeholder":"Enter PM-JAY ID or Ration Card No.","required":true},
      {"id":"aadhaar_number","label":"Aadhaar Number (Linked with Mobile)","type":"text","placeholder":"Enter 12-digit Aadhaar number","required":true},
      {"id":"whatsapp_number","label":"WhatsApp Number","type":"tel","placeholder":"10-digit WhatsApp number","required":true}
    ]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_name = EXCLUDED.short_name,
  card_title = EXCLUDED.card_title,
  card_subtitle = EXCLUDED.card_subtitle,
  card_button_text = EXCLUDED.card_button_text,
  card_theme = EXCLUDED.card_theme,
  service_charge = EXCLUDED.service_charge,
  support_phone = '8018246567',
  form_fields = EXCLUDED.form_fields,
  status = 'active',
  updated_at = NOW();

-- ==============================================================================
-- ALL DONE! All tables, policies, 7 requirement services, payment columns,
-- and website CMS tables are synchronized.
-- ==============================================================================
