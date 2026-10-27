# Apna Digital Service — Project Progress & Work Tracker

> ⚠️ **MANDATORY INSTRUCTION FOR AI AGENTS / ASSISTANTS**:  
> **YOU MUST UPDATE THIS FILE AS WORK PROGRESSES ACROSS TURNS.**  
> Whenever you complete a feature, start a new phase, modify an architectural decision, or add new components, IMMEDIATELY update the relevant checklists, current status section, and change log below. Never leave this file stale.

---

## Current Status & Snapshot
- **Current Phase**: **Customer Portal / User Site Complete & Polished** (Responsive, Clean Header, Real Dashboard, Admin Status Tracker, Always-Visible Download Button)
- **Last Updated**: 2026-10-26
- **Active Focus**: Full user-side experience is complete with zero dummy data, mobile-first design, strict Google Form gating, real-time admin status tracking, and always-visible PDF download controls. Dev server running and verified.

---

## Roadmap & Milestones

### ✅ Phase 1: Project Initialization & Specs
- [x] Copy client logo asset (`public/logo.png`) and development plan PDF (`docs/Apna_Digital_Service_Website_Development_Plan.pdf`) into the repository.
- [x] Create Master Project Specification (`docs/PROJECT_SPECIFICATION.md`) incorporating the PDF rules, updated Supabase Auth + Google login specs, 4 active Google Form links, and WhatsApp helplines.
- [x] Create Work Tracker (`PROJECT_PROGRESS.md`) with explicit instructions for AI continuity.
- [x] Scaffold modern React + Vite application environment with Lucide icons and Supabase client.

### ✅ Phase 2: Mind-Blowing Home Page & Dynamic Service Pages (Completed)
- [x] Implement modern, responsive Design System (`src/index.css`) with Saffron Orange (`#F97316`), India Green (`#16A34A`), Deep Navy (`#0F172A`), glassmorphism, dynamic gradients, and fluid typography.
- [x] Replaced all local emojis across the entire platform with premium, scalable Lucide React SVGs (`CreditCard`, `Vote`, `Car`, `Truck`, `UserPlus`, `FileEdit`, `Fingerprint`, `ShieldCheck`, etc.).
- [x] Extracted complete 11-page content brief into [`docs/CONTENT_BRIEF_AND_PAGES.md`](file:///d:/apnapanservice/docs/CONTENT_BRIEF_AND_PAGES.md).
- [x] **Strict User-Side Scope**: Removed "+ Add Service" controls from the customer interface (reserved exclusively for the future admin panel).
- [x] **Home Page Service Action**: Updated card action button to "View Service".
- [x] **Mandatory Login Pre-Check**: Before opening any submission or Google Form, the system checks if the user is authenticated; if not, automatically displays the login screen.
- [x] **Google Form Email Matching Notice**: Added strict banner on login screen mandating the use of the exact email that will be used on the Google Form for manual verification matching.
- [x] **Two-Step Form Instruction Dialog** (`FormInstructionModal.jsx`):
  - Informs customer that the Google Form will open in a new tab.
  - Explains that upon submitting the Google Form, they should return to the site where the website request form is already open to generate their Application ID.
  - Automatically opens Google Form in a new tab and presents the on-site request form when proceeding.
- [x] **Dedicated Standalone Pages for All 7 Services**:
  - Voter ID / e-EPIC PDF Download Assistance (`/service/voter-id-pdf`)
  - PAN Card PDF Download Assistance (`/service/pan-card-pdf`)
  - Driving Licence (DL) PDF Download Assistance (`/service/driving-licence-pdf`)
  - Vehicle Registration Certificate (RC) PDF Download Assistance (`/service/vehicle-rc-pdf`)
  - Ayushman Card — New Member Addition (`/service/ayushman-new-member`)
  - Ayushman Card — Correction Assistance (`/service/ayushman-correction`)
  - Ayushman Card — e-KYC Assistance (`/service/ayushman-ekyc`)
- [x] **Full Website Pages Loaded**: Home (`/`), About (`/about`), How It Works (`/how-it-works`), FAQ (`/faq`), Contact (`/contact`), and all policies (`/privacy-policy`, `/terms`, `/refund-policy`, `/disclaimer`).

### ✅ Phase 3: Header Refinement, Mobile-First Polish & Real Dashboard (Completed)
- [x] **Spacious, Unchoked Header UI**:
  - Clean desktop breathing room (`min-height: 72px`, `padding: 12px 32px`, max-width `1360px`).
  - Brand Logo + Tricolour Title (`APNA DIGITAL SERVICE`) with subline.
  - Nav items styled as elegant floating pills with smooth hover & active state.
  - **Zero Desktop Hamburger**: Strictly hidden on desktop (`display: none !important;`).
- [x] **Full Mobile Responsiveness Audit**:
  - Breakpoint switch at `960px`: mobile hamburger appears, desktop links hidden.
  - Animated mobile navigation drawer with backdrop overlay.
  - Drawer contains all 6 navigation links with Lucide icons, Track Request, Customer Dashboard / Login, and WhatsApp support helpline.
  - Clean touch targets (>= 44px) and zero horizontal overflow across 320px to 768px viewports.
- [x] **Removed Dummy Data from User Dashboard**:
  - Completely removed mock seeded entries (`APNA-2026-482910` and `APNA-2026-731945`).
  - Renders a clean Empty State when no requests exist, with a 3-step explanation and a direct "+ Submit Service Request" button.
- [x] **Always-Visible "Download PDF" Button Rule**:
  - Download PDF button is **always rendered** on every application card.
  - When admin has NOT uploaded the document yet: button is **disabled** with `<Lock size={15} />`, label `Download PDF (Awaiting Admin Upload)`, and explanation that download unlocks once uploaded.
  - When admin HAS uploaded the document: button is **active emerald** with `<Download size={16} />`, label `Download Verified Document (PDF)`.
- [x] **Admin Live Status Tracker**:
  - Shows dynamic admin status badges (`Submitted`, `Under Verification`, `Payment Confirmed`, `Processing`, `Completed`, `Action Required`).
  - 4-step progress stepper (Submitted -> Verification -> Processing -> Delivered).
  - "Super Admin Live Status Update" callout box displaying remarks from admin.
  - WhatsApp support link with pre-filled Application ID for instant customer communication.
- [x] **User Site Completeness Audit**:
  - All routes (`/`, `/about`, `/how-it-works`, `/faq`, `/contact`, `/service/:slug`, `/dashboard`, `/track`, policies) tested and returning HTTP 200 OK.
  - Verified production build (`npm run build`) passing in < 800ms with zero errors.

### ✅ Phase 4: Unified Admin & Super Admin Portal (Completed)
- [x] **Master Architectural Specification**:
  - Published [`docs/ADMIN_PORTAL_SPECIFICATION.md`](file:///d:/apnapanservice/docs/ADMIN_PORTAL_SPECIFICATION.md) detailing RBAC matrix, copy-paste Supabase SQL schema, Cloudinary unsigned upload configuration, and testing matrix.
- [x] **Single Unified Admin Portal (`/admin`)**:
  - Designed responsive, high-density Admin Shell (`src/admin/admin.css`) with dark navy palette, gold/amber accents for Super Admin, and blue accents for View-Only Admin.
  - Dedicated login screen at `/admin/login` with email/password authentication and 1-click test role switchers.
- [x] **Strict Role-Based Access Control (RBAC)**:
  - **Super Admin (`super_admin`)**: Full control to update request status, save operator notes, upload/replace/delete documents to Cloudinary, and delete applications.
  - **Admin (`admin`)**: **STRICTLY VIEW-ONLY**. Enforced at context, service, and UI levels. All inputs, status dropdowns, note editors, and upload dropzones are locked/disabled with clear "View-Only Mode" banners.
- [x] **Verification Queue & Operational Hub**:
  - Real-time search across Application ID, Customer Name, Phone, Email, and Service Name.
  - Status filters and Service filters.
  - Rapid Google Sheets Quick Strip with 1-click launchers for PAN, Voter, DL, and RC responses.
  - Application inspection modal with direct WhatsApp chat launcher and customer details.
- [x] **Services Catalog Management (Add & Edit Services)**:
  - Integrated dedicated **`⚡ Services Catalog & Settings`** tab in the admin panel.
  - Added **`+ Add New Live Service`** button in the header bar and services manager.
  - Added **`✏️ Edit Service`** controls to every service card (for both default and custom services).
  - Built `AdminServiceModal.jsx` featuring real-time live card preview, Google Form & Google Sheet URL binding, helpline phone management, and requirements editor.
  - Implemented strict RBAC lock: `admin` (View-Only) can inspect service parameters, but editing and adding new services is restricted to `super_admin`.
- [x] **Logo Color Theme Overhaul**:
  - Infused Saffron Orange (`#F97316`), India Green (`#16A34A`), and Deep Luxury Navy (`#070B14`, `#0D1527`, `#131F37`).
  - Added ambient radial glow, tricolour gradient top accents on metric cards, and responsive tab switching.
- [x] **Cloudinary PDF Storage Integration**:
  - Direct unsigned REST upload helper (`src/admin/services/cloudinaryService.js`) with progress tracking and automatic local simulator fallback.
  - Instant document delivery: uploading a PDF immediately unlocks the customer's dashboard download button.

---

## 4 Live Services Reference Table
1. **PAN PDF Download**: `https://forms.gle/o2AfsRZuxcPpYBnL9` | Helpline: `+91 9124494239`
2. **Voter PDF Download (No OTP)**: `https://forms.gle/dR8S5SBYRM9qrfvF8` | Helpline: `+91 9124494239`
3. **Driving Licence (DL) PDF**: `https://forms.gle/DrgRW485k9QDQTf28` | Helpline: `+91 9078620775`
4. **Vehicle RC PDF**: `https://forms.gle/ffutHMr4xa6yDMHZA` | Helpline: `+91 9078620775`

---

## Log of Changes
- **2026-10-27 (Services Catalog Manager & Logo Color Theme Upgrade)**:
  - Added `AdminServicesManager.jsx` and `AdminServiceModal.jsx` with full Add Service & Edit Service capabilities.
  - Super Admin can now edit existing services (Google Form URL, Sheet URL, phone, status, titles) or publish new services.
  - Added tab switcher in `AdminDashboardPage.jsx` (`Verification Queue` vs `Services Catalog & Settings`).
  - Infused the official logo color theme (Saffron Orange `#F97316` + India Green `#16A34A` + Deep Space Slate `#070B14`) across all admin surfaces with ambient glows and tricolour ribbons.
  - Verified live HMR and successful production build with 0 errors.

- **2026-10-27 (Phase 1 & Unified Admin Portal Architecture, RBAC & Cloudinary)**:
  - Created master documentation [`docs/ADMIN_PORTAL_SPECIFICATION.md`](file:///d:/apnapanservice/docs/ADMIN_PORTAL_SPECIFICATION.md) with complete Supabase SQL script and Cloudinary unsigned setup instructions.
  - Created modular admin folder `src/admin/` with `context/`, `services/`, `components/`, and `pages/`.
  - Built `AdminAuthContext.jsx` handling Supabase `profiles` role resolution (`super_admin` vs `admin`) and 1-click test role switching.
  - Built `cloudinaryService.js` for direct PDF uploads with progress tracking and local mock fallback.
  - Built `adminDataService.js` with permission guards rejecting mutations if role is `admin`.
  - Created `AdminLayout.jsx` with distinctive mode banners (`👑 Super Admin (Full Control)` vs `👁️ Admin (View-Only Mode)`).
  - Created `AdminApplicationModal.jsx` with full customer inspection, WhatsApp launcher, Google Sheets opener, and Super Admin file uploader.
  - Created `AdminLoginPage.jsx` and `AdminDashboardPage.jsx` with verification queue, metrics, and filters.
  - Integrated `/admin` and `/admin/login` in `App.jsx` cleanly separated from customer header/footer.
  - Added discreet Staff Portal link in customer footer.
  - Verified production build passing with 0 errors.

- **2026-10-26 (Header Overhaul, Mobile-First Polish, Dashboard Clean-up & Download Rule)**:
  - Redesigned Header: Removed desktop hamburger completely (`display: none !important;`), gave it ample breathing room, floating pill links, and sleek CTAs.
  - Mobile Menu Drawer: Added animated slide-down drawer with backdrop blur, full touch targets, and mobile action buttons.
  - Removed dummy data from `CustomerDashboardPage.jsx`; added empty state with 3-step submission guide.
  - Implemented the always-visible Download PDF button rule (disabled/locked when awaiting upload, active emerald when verified).
  - Added 4-step progress stepper and Admin Live Status Update box to all application cards.
  - Applied the same always-visible download button rule to `TrackApplicationModal.jsx`.
  - Audited all user-side routes and verified production build with zero errors.
- **2026-10-26 (Phone View UI Polish & Desktop Profile Icon)**:
  - Fixed topmost announcement ribbon on phone view: turned into a sleek, single-line 32px bar (preventing multiline stacking).
  - Fixed mobile navbar overflow on phone screens: ensured hamburger icon remains visible.
  - Replaced desktop header username text with a circular Profile Avatar / Icon button linking to `/dashboard` with an online status indicator dot.
  - Added Mobile Quick Services Catch Grid in the primary fold of the Hero section (2x2 cards for PAN, Voter, DL, RC) for fast, easy tapping without excessive scrolling.
- **2026-10-26 (Dashboard Submit Request Redirection to Services)**:
  - Removed direct request modal trigger from `CustomerDashboardPage.jsx` buttons (both in profile header bar and empty state).
  - Configured buttons to navigate directly to the services catalog (`/#services` / `/services`) via `<Link to="/#services">`.
  - Added dedicated `/services` route in `App.jsx` and enhanced `ScrollToTop` to smoothly scroll down to the `#services` section upon navigation.
  - Ensures all customers follow the intended workflow: browsing services, reading the instruction guide, completing the Google Form, and then submitting on-site records.
  - Verified production build and live dev server.

