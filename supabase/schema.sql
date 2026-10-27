-- ==============================================================================
-- APNA DIGITAL SERVICE (APNA PAN AGENCY) — MASTER DATABASE SCHEMA
-- RUN ALL PHASES IN ONE GO IN SUPABASE SQL EDITOR
-- Dashboard -> SQL Editor -> New Query -> Paste Everything -> Run
-- ==============================================================================

-- ==============================================================================
-- PHASE 1: USER PROFILES, ROLES & AUTOMATIC AUTH REGISTRATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and Super Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent unauthorized users from elevating their own role via intercepted requests
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed:
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if the modifier is an existing super_admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
      RAISE EXCEPTION 'Access Denied: You cannot modify or elevate user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

CREATE POLICY "Admins and Super Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE 
      WHEN NEW.email = 'help.apnadigitalservice@gmail.com' THEN 'super_admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- PHASE 2: DYNAMIC SERVICES CATALOG TABLE & SEED DATA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  hindi_title TEXT,
  short_name TEXT,
  badge TEXT,
  badge_color TEXT DEFAULT 'saffron',
  icon_name TEXT DEFAULT 'FileText',
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'phase2', 'inactive')),
  form_url TEXT,
  spreadsheet_url TEXT,
  support_phone TEXT DEFAULT '9124494239',
  support_whatsapp TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  workflow JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  disclaimer TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active services" ON public.services;
DROP POLICY IF EXISTS "Admins can view all services" ON public.services;
DROP POLICY IF EXISTS "Super Admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Super Admins can update services" ON public.services;
DROP POLICY IF EXISTS "Super Admins can delete services" ON public.services;

CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  USING (status IN ('active', 'phase2'));

CREATE POLICY "Admins can view all services"
  ON public.services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super Admins can insert services"
  ON public.services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super Admins can update services"
  ON public.services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super Admins can delete services"
  ON public.services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

INSERT INTO public.services (
  id, slug, title, hindi_title, short_name, badge, badge_color, icon_name, description, status,
  form_url, spreadsheet_url, support_phone, support_whatsapp, display_order, disclaimer
) VALUES
(
  'voter-id',
  'voter-id-pdf',
  'Voter ID / e-EPIC PDF Download Assistance',
  'वोटर कार्ड पीडीएफ डाउनलोड (बिना ओटीपी)',
  'Voter ID PDF',
  'Without OTP • High Demand',
  'green',
  'Vote',
  'Assistance for customers who need to download an available Voter ID / e-EPIC PDF. Specially optimized for cases where mobile number is not linked or OTP does not arrive.',
  'active',
  'https://forms.gle/dR8S5SBYRM9qrfvF8',
  'https://docs.google.com/spreadsheets/d/1KVS7Je_SV5CC_XL7w3AhBCk2X5xXS6GY5AQSVAicngw/edit?resourcekey=&gid=158630102#gid=158630102',
  '9124494239',
  'https://wa.me/919124494239?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Voter%20ID%20PDF%20(No%20OTP)',
  1,
  'Apna Digital Service assists customers in locating and retrieving available official e-EPIC copies. We are privately operated and not the Election Commission of India.'
),
(
  'pan-card',
  'pan-card-pdf',
  'PAN Card PDF Download Assistance',
  'पैन कार्ड पीडीएफ डाउनलोड सहायता',
  'PAN Card PDF',
  'Instant Processing',
  'saffron',
  'CreditCard',
  'Assistance for customers who need to download an available PAN Card PDF (e-PAN). Ideal if physical card is lost, damaged, or urgent digital copy is required.',
  'active',
  'https://forms.gle/o2AfsRZuxcPpYBnL9',
  'https://docs.google.com/spreadsheets/d/163PzjqCl72anqGbuRlJWD8elgcP5s86o_u8rU5aMj24/edit?resourcekey=&gid=1248588140#gid=1248588140',
  '9124494239',
  'https://wa.me/919124494239?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20PAN%20Card%20PDF',
  2,
  'Apna Digital Service provides facilitation assistance for official e-PAN duplicate downloads. We are privately operated and not NSDL/UTIITSL or Income Tax Dept.'
),
(
  'driving-licence',
  'driving-licence-pdf',
  'Driving Licence (DL) PDF Download Assistance',
  'ड्राइविंग लाइसेंस पीडीएफ डाउनलोड सहायता',
  'Driving Licence PDF',
  'Sarathi Verified',
  'blue',
  'Car',
  'Assistance for customers who need to download an available Driving Licence PDF. Get verified digital DL proof for traffic police, insurance, or RTO procedures.',
  'active',
  'https://forms.gle/DrgRW485k9QDQTf28',
  'https://docs.google.com/spreadsheets/d/1SJtUkFBjKuSYlVd-u1PqRBj_lf8h8G5-ufwOwtbsKQc/edit?resourcekey=&gid=24079836#gid=24079836',
  '9078620775',
  'https://wa.me/919078620775?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Driving%20Licence%20PDF',
  3,
  'Apna Digital Service provides facilitation assistance for official digital DL copies. We are privately operated and not the Ministry of Road Transport or any State RTO.'
),
(
  'vehicle-rc',
  'vehicle-rc-pdf',
  'Vehicle Registration Certificate (RC) PDF Download Assistance',
  'गाड़ी की आरसी (RC) पीडीएफ डाउनलोड सहायता',
  'Vehicle RC PDF',
  'Vahan Verified',
  'saffron',
  'Truck',
  'Assistance for vehicle owners who need to download an available Registration Certificate (RC) PDF. Useful for vehicle sale, insurance renewal, fitness renewal, or lost physical smart card.',
  'active',
  'https://forms.gle/ffutHMr4xa6yDMHZA',
  'https://docs.google.com/spreadsheets/d/1l7rKqK5bH4eBvPZ8lQ7uW8uVw9mK5y8lQ7uW8uVw9m/edit',
  '9078620775',
  'https://wa.me/919078620775?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Vehicle%20RC%20PDF',
  4,
  'Apna Digital Service assists in retrieving digital Vehicle Registration records. We are privately operated and not the Ministry of Road Transport or any State RTO.'
),
(
  'ayushman-new-member',
  'ayushman-new-member',
  'Ayushman Card — New Member Addition Assistance',
  'आयुष्मान कार्ड — नए सदस्य का नाम जोड़ना',
  'Ayushman New Member',
  'Phase 2 Service',
  'purple',
  'UserPlus',
  'Assistance to eligible families for adding newborn babies, newly married spouses, or missing family members to an existing Ayushman Bharat (PM-JAY) beneficiary list.',
  'phase2',
  NULL,
  NULL,
  '8018246567',
  'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20New%20Member%20Addition',
  5,
  'Addition of new family members depends on eligibility verification and state health department approval.'
),
(
  'ayushman-correction',
  'ayushman-correction',
  'Ayushman Card — Correction Assistance',
  'आयुष्मान कार्ड — नाम / जन्मतिथि / लिंग सुधार',
  'Ayushman Correction',
  'Phase 2 Service',
  'purple',
  'FileEdit',
  'Assistance for correcting spelling errors in beneficiary name, date of birth, gender, or relative details in an existing Ayushman Bharat record.',
  'phase2',
  NULL,
  NULL,
  '8018246567',
  'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20Card%20Correction',
  6,
  'Correction requests depend on verification against authorized databases and approval by relevant state/national health authorities.'
),
(
  'ayushman-ekyc',
  'ayushman-ekyc',
  'Ayushman Card — e-KYC Assistance',
  'आयुष्मान कार्ड — ई-केवाईसी (e-KYC) सहायता',
  'Ayushman e-KYC',
  'Phase 2 Service',
  'purple',
  'Fingerprint',
  'Assistance to eligible beneficiaries who need to complete Ayushman Card e-KYC through the applicable authorized system.',
  'phase2',
  NULL,
  NULL,
  '8018246567',
  'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20e-KYC',
  7,
  'We do not collect or store OTPs or biometric data on our servers. Verification happens exclusively through the designated authorized government system.'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  hindi_title = EXCLUDED.hindi_title,
  short_name = EXCLUDED.short_name,
  badge = EXCLUDED.badge,
  form_url = COALESCE(public.services.form_url, EXCLUDED.form_url),
  spreadsheet_url = COALESCE(public.services.spreadsheet_url, EXCLUDED.spreadsheet_url),
  support_phone = EXCLUDED.support_phone,
  support_whatsapp = EXCLUDED.support_whatsapp,
  disclaimer = EXCLUDED.disclaimer;


-- ==============================================================================
-- PHASE 3: SERVICE REQUESTS, VERIFICATION QUEUE & AUDIT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  service_id TEXT NOT NULL,
  service_slug TEXT,
  service_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  request_notes TEXT,
  status TEXT DEFAULT 'Request Received' CHECK (status IN (
    'Request Received',
    'Awaiting Form Verification',
    'Under Review',
    'Additional Information Required',
    'Processing',
    'Completed',
    'Unable to Process'
  )),
  operator_note TEXT DEFAULT 'Website request registered. Awaiting Google Form verification.',
  document_url TEXT,
  document_name TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_requests_application_id ON public.service_requests (application_id);
CREATE INDEX IF NOT EXISTS idx_requests_customer_email ON public.service_requests (customer_email);
CREATE INDEX IF NOT EXISTS idx_requests_customer_phone ON public.service_requests (customer_phone);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.service_requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.service_requests (created_at DESC);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Customers can insert their own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Super Admins can update all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Super Admins can delete all requests" ON public.service_requests;

CREATE POLICY "Customers can view own requests"
  ON public.service_requests FOR SELECT
  USING (
    auth.uid() = user_id 
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Customers can insert their own requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can view all requests"
  ON public.service_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super Admins can update all requests"
  ON public.service_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super Admins can delete all requests"
  ON public.service_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  admin_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
