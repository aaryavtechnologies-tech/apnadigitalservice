# Apna Digital Service — Unified Admin & Super Admin Portal Specification

> **Portal Version**: 1.0.0 (Unified Role-Based Architecture)  
> **Target Path**: `/admin` (Single Portal for both Roles)  
> **Access Rule**:  
> - **Super Admin (`super_admin`)**: Full Access (View, Edit Status, Operator Notes, Cloudinary PDF Upload/Delete, Add/Edit Services, Delete Requests).  
> - **Admin (`admin`)**: **STRICTLY VIEW-ONLY**. Can view all applications, search, filter, and inspect details, but all mutations, status updates, note edits, and document uploads are disabled with a clear "View-Only Mode" banner.  
> - **Customer / Public**: Access denied; redirected to login.

---

## 1. Architecture & Security Overview

### 1.1 Single Portal Principle
Instead of maintaining two disjointed websites or panels, Apna Digital Service uses a **single unified `/admin` portal**. The UI and backend services adapt dynamically based on the authenticated user's `role` stored in `public.profiles`:

| Capability | Super Admin (`super_admin`) | Admin (`admin`) | Customer / Guest |
|---|:---:|:---:|:---:|
| Access `/admin` | ✅ Yes | ✅ Yes | ❌ Blocked |
| View Verification Queue & Applications | ✅ Full Access | ✅ Full Access | ❌ Blocked |
| Search, Filter & Inspect Details | ✅ Yes | ✅ Yes | ❌ Blocked |
| Open Linked Google Sheets Responses | ✅ Yes | ✅ Yes | ❌ Blocked |
| Change Request Status | ✅ Allowed | ❌ **Disabled (View-Only)** | ❌ Blocked |
| Update Operator Notes | ✅ Allowed | ❌ **Disabled (View-Only)** | ❌ Blocked |
| Upload PDF to Cloudinary & Attach | ✅ Allowed | ❌ **Disabled (View-Only)** | ❌ Blocked |
| Add / Edit Live Services | ✅ Allowed | ❌ **Disabled (View-Only)** | ❌ Blocked |
| Delete Request Records | ✅ Allowed | ❌ **Disabled (View-Only)** | ❌ Blocked |

---

## 2. Supabase SQL — Copy & Paste Script

Run the following complete script in your **Supabase Dashboard -> SQL Editor -> New Query -> Run**:

```sql
-- ==============================================================================
-- APNA DIGITAL SERVICE — UNIFIED ADMIN & RBAC DATABASE SCHEMA
-- ==============================================================================

-- 1. Create or Update public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins can update any profile" ON public.profiles;

-- Profile Policies:
-- A user can always view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- A user can update their own profile name & phone
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins and Super Admins can view ALL profiles
CREATE POLICY "Admins and Super Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ONLY Super Admins can change user roles in profiles
CREATE POLICY "Super Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 2. Trigger Function to Automatically Store New User in profiles table
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

-- Re-bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Create or Update service_requests table
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

-- Enable RLS on service_requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Customers can insert their own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view and manage all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Super Admins can manage all requests" ON public.service_requests;

-- Policy A: Customers can view only their own requests
CREATE POLICY "Customers can view own requests"
  ON public.service_requests FOR SELECT
  USING (
    auth.uid() = user_id 
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy B: Customers can insert their own requests
CREATE POLICY "Customers can insert their own requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid() IS NOT NULL
  );

-- Policy C: BOTH 'admin' and 'super_admin' can SELECT all requests (View Access)
CREATE POLICY "Admins can view all requests"
  ON public.service_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Policy D: ONLY 'super_admin' can UPDATE service requests (Strict Mutation Lock)
CREATE POLICY "Super Admins can update all requests"
  ON public.service_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy E: ONLY 'super_admin' can DELETE service requests
CREATE POLICY "Super Admins can delete all requests"
  ON public.service_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 4. Convenient SQL helper snippets for granting Admin & Super Admin roles:
-- Example: To set an existing user as Super Admin:
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'help.apnadigitalservice@gmail.com';

-- Example: To set an existing user as View-Only Admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'operator@apnadigitalservice.com';
```

---

## 3. Cloudinary Configuration & What to Create

Cloudinary is used for **secure PDF and document storage**. When the Super Admin uploads a verified document (e.g., e-PAN PDF, Voter ID PDF, DL PDF, RC PDF), it uploads directly to Cloudinary and stores the secure URL on the request record.

### 3.1 What to create in Cloudinary Console:
1. **Cloud Name**:
   - Go to [cloudinary.com](https://cloudinary.com) and log in.
   - Your **Cloud Name** is displayed on the main dashboard (e.g., `dxy123456` or your chosen name).
2. **Unsigned Upload Preset** *(Crucial for direct secure client uploads without exposing your API Secret)*:
   - Navigate to: **Settings (Gear icon)** -> **Upload** -> Scroll down to **Upload presets**.
   - Click **Add upload preset**.
   - Configure the following fields:
     - **Upload preset name**: `apna_documents` (or any name you choose).
     - **Signing Mode**: Select **Unsigned** (⚠️ Important).
     - **Folder**: `apna_documents/pdfs`.
     - **Discard original filename**: No (Unchecked).
     - **Use filename or unique ID**: Checked.
     - **Allowed formats**: `pdf, jpg, jpeg, png`.
     - Click **Save**.

### 3.2 Add to `.env`:
In your project `.env` file, add:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=apna_documents
```

> **Note on Fallback**: If Cloudinary credentials are not yet added to `.env`, our application includes an automatic local file simulator so you can test document uploads immediately during development!

---

## 4. What to Provide for Testing

To thoroughly test the portal, you need:

### 4.1 Test Accounts Matrix
1. **Super Admin Account**:
   - Email: `help.apnadigitalservice@gmail.com` (Auto-assigned `super_admin` role by SQL trigger) OR any email you run `UPDATE public.profiles SET role = 'super_admin' WHERE email = 'YOUR_EMAIL';` on.
   - Capability to test: Status dropdown active, operator notes editable, Cloudinary upload active, delete button visible.
2. **Admin (View-Only) Account**:
   - Create any test user (e.g. `admin@test.com`) and run:
     `UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@test.com';`
   - Capability to test: Top banner shows **"👁️ View-Only Mode (Admin Access)"**, all dropdowns/inputs are disabled, upload zone states "Restricted to Super Admin", delete buttons are hidden.
3. **Customer Account**:
   - Any normal user (role: `customer`).
   - If they navigate to `/admin`, the portal blocks them with an **Access Denied (403)** notice and button to return to Customer Dashboard.

### 4.2 Quick Local Testing Helper
In the Admin Login UI, we also provide a **1-Click Demo Role Switcher**:
- Click `[Log in as Super Admin (Full Control)]` to test Super Admin powers immediately.
- Click `[Log in as Admin (View-Only Mode)]` to test View-Only lockdown immediately.
- Click `[Sign Out]` to test unauthenticated redirection.

---

## 5. Step-by-Step Implementation Roadmap

### Phase 1: Core Portal & UI Foundation (Now in Progress)
- [x] Create comprehensive architecture and specification document.
- [ ] Create `src/admin/` folder structure:
  - `src/admin/admin.css`: High-end modern UI styling.
  - `src/admin/context/AdminAuthContext.jsx`: Supabase auth + role detection (`super_admin` vs `admin`).
  - `src/admin/services/cloudinaryService.js`: Cloudinary PDF direct upload handler.
  - `src/admin/services/adminDataService.js`: Data fetching & role-guarded mutations.
  - `src/admin/components/AdminLayout.jsx`: Responsive layout with role status badge.
  - `src/admin/components/AdminApplicationModal.jsx`: Inspection modal with View-Only enforcement.
  - `src/admin/pages/AdminLoginPage.jsx`: High-security login with role preview.
  - `src/admin/pages/AdminDashboardPage.jsx`: Verification queue, metric cards, search, filters, and Google Sheet openers.
- [ ] Integrate routes in `src/App.jsx` (`/admin`, `/admin/login`).
- [ ] Build & verification test.

### Phase 2: Live Verification Queue & Sheets Matching
- Rapid one-click Google Sheets reference lookup by service.
- Status update workflow (Under Review -> Processing -> Delivered).

### Phase 3: Cloudinary PDF Delivery & End-to-End Handshake
- Direct PDF upload in Super Admin modal.
- Verification that uploaded PDF immediately unlocks customer dashboard download button.
