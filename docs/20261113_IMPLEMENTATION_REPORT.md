# Registration, staff session and PDF changes — November 13, 2026

Status: implementation and local checks complete; production acceptance remains pending. Do not treat the live PDF workflow or email delivery as verified.

## Findings and changes

1. Final PDFs were uploaded through an unsigned Cloudinary preset and stored as public URLs. Customer download fetched those URLs directly. There was no private object authorization or durable authenticated download path. The exact Cloudinary HTTP failure could not be reproduced without a live record. Final delivery now uses private Supabase Storage, stable application-scoped object references and authenticated blob downloads. A failed database attachment cleans up the new object. Existing view-only admin and super-admin write privileges are preserved.
2. Staff and customer auth shared the default persistent Supabase client. Staff listeners performed network/profile lookups on repeated sign-in/focus events; transient failures could clear staff state and unmount the guard. The app also recreated auth subscriptions on route changes. Staff credentials now use a separate memory-only client, only explicit password sign-in populates staff state, and token/focus events retain the workspace. Customer auth processing skips admin routes. The focus-triggered service catalog fetch skips admin routes.
3. The persistent shared client restored staff tokens after browser/PC restart. Staff credentials are no longer persisted. A backend session-ID grant expires after eight hours and is removed on logout. Activation requires a recent password authentication and a staff profile. CMS writes, staff data operations and staff creation use/check that staff session. Reloading the admin tab also requires sign-in; tab switching does not.
4. Registration either reported success immediately or instructed the customer to use an email confirmation link. Both registration surfaces now share signup OTP verification and resend, with a 60-second UI cooldown and errors from the Supabase backend. Registration runs in an isolated client so verification cannot accidentally log the user into the customer or staff dashboard. After verification the customer signs in normally. A restrictive database policy denies unverified access to service requests.

## Modified components

- `src/lib/supabaseClient.js`, `src/lib/registration.js`, `src/lib/finalDocuments.js`
- `src/components/RegistrationOtp.jsx`, `src/components/AuthModal.jsx`, `src/pages/AuthPage.jsx`
- `src/App.jsx`, `src/admin/context/AdminAuthContext.jsx`
- `src/admin/services/adminDataService.js`, `src/admin/components/AdminApplicationModal.jsx`, `src/pages/CustomerDashboardPage.jsx`
- `src/data/servicesData.js`, `src/services/websiteContentService.js`, `supabase/functions/create-admin/index.ts`
- `supabase/migrations/20261113_auth_and_final_documents.sql`
- Signup email template/setup guide, regression tests, and this report.

No dependencies or layout styles were added. Existing uncommitted changes to `.env.example`, `package.json` and `package-lock.json` were left outside this change.

## Local evidence

- `npm test`: 14 passing tests. Includes the actual new SQL executed in PGlite with modeled Auth/Storage schemas: customer isolation, unverified-user denial, staff activation/logout/expiry, stale password rejection, and private storage isolation even with a permissive legacy read policy.
- PDF service tests use a storage double: upload → application attachment → authenticated download preserves all bytes; invalid type/signature, empty/oversized files, storage denial and attachment failure are covered. This does not prove managed Supabase Storage or real customer dashboard downloads.
- OTP service tests check signup verification parameters, successful verification, invalid/expired/rate-limited backend errors, resend and auto-confirm misconfiguration. They do not prove live SMTP delivery or configured backend expiry/rate limits.
- `npm run build`: passes; bundle-size warning remains.
- `npm run lint`: exits successfully with existing warnings. No lint errors.
- Local browser: `/admin` redirects to `/admin/login`, reload remains at login, registration page renders, no console errors observed in the smoke check. Authenticated admin pages were not tested.
- No backend deployment/log inspection, real browser-close/reopen with a signed-in staff session, or PC restart performed.

## Required release and acceptance steps

Follow `docs/email-templates/SETUP.md`. Apply existing migrations in order followed by the new migration; redeploy `create-admin`; enable Confirm email, custom SMTP, signup `.Token` template, 600-second OTP expiry, 60-second resend interval and production Auth rate limits. Provide correctly spelled `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the deployment environment. There is no local `.env`; the example uses the correctly spelled key with a placeholder value. Never expose a service-role key in Vite.

Use a controlled inbox, a super admin and two customers to complete the requested nine-step PDF test and verify ownership denial via direct Storage requests. Verify invalid/expired/reused OTPs and backend rate limiting; test focus/suspension on Applications, Services, Inquiries and CMS; close/reopen the browser and restart the PC to verify manual staff sign-in. Inspect Auth, Storage, function and browser logs. These acceptance steps are still pending because live credentials/configuration were unavailable.

Re-upload historical final Cloudinary PDFs through private delivery. Retire public Cloudinary copies separately after review; changing the application record cannot revoke public URLs. Customer payment-proof/document uploads still use Cloudinary.

Git commit/push outcome is reported in the chat after the repository operation.
