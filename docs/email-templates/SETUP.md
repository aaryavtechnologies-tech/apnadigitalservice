# Authentication email setup

Enable custom SMTP in the Supabase dashboard under **Authentication → Email → SMTP Settings**. Enter your email provider's SMTP host, port, username, and password. Set the sender email to an address authorized by your provider and the sender name to **Apna Digital Service**. Keep **Confirm email** enabled for public signup. Supabase's built-in mailer only sends to project team addresses. [Supabase custom SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp)

If signup still returns “Error sending confirmation email,” open **Logs Explorer → Auth** and expand the error for the failed signup. Use the detailed error to check the SMTP credentials, port, verified sender, or confirmation template. The edge log's HTTP 500 alone cannot identify which check failed. [Supabase Auth troubleshooting](https://supabase.com/kb/troubleshooting/resolving-500-status-authentication-errors-7bU5U8)

In Supabase Authentication → Email Templates, paste the complete contents of:

| Template | File | Subject |
| --- | --- | --- |
| Confirm signup | confirm-signup.html | Confirm your email — Apna Digital Service |
| Reset password | reset-password.html | Your password reset OTP — Apna Digital Service |

Signup uses `{{ .Token }}` with the registration OTP entry screen; do not include `{{ .ConfirmationURL }}`. Password recovery uses `{{ .Token }}`. Do not replace the Magic Link template for this change. Existing email/password and Google login remain normal login methods. The staff Forgot Password flow now resets a password rather than using OTP as an alternate staff login.

Save both email templates before enabling this website version: the code-entry screen requires the email to contain the OTP. Set Authentication → URL Configuration → Site URL to the production website URL so signup confirmation returns to the website.

# Direct staff creation

Before releasing the website, apply [the direct staff migration](../../supabase/migrations/20261104_direct_staff_creation.sql) in the target project's SQL Editor after the staff access migration below. Then deploy the Edge Function from the repository root.

```powershell
supabase functions deploy create-admin --project-ref jeetzosmzrdamuxqpsfy
```

The function verifies the caller’s super admin role before creating an account with immediate staff access. The Staff tab lists active accounts. Test creating an admin and signing in with the initial password before releasing the website.

# Required database access controls

On a project that has not applied the staff access migration, apply `supabase/migrations/20261031_staff_access.sql` using the Supabase SQL Editor against the existing schema. It replaces permissive policies and enables row security while preserving existing `profiles.role` values. Confirm that the intended staff accounts already have the correct `admin` or `super_admin` role. Apply the direct staff migration after this one so the direct staff triggers take effect.

- Customers read their own requests and submit requests tied to their authenticated user ID.
- Admins retain view-only access.
- Super admins retain write access.
- Customers cannot modify their profile role, other customers' requests, website settings, services or audit logs.
- Anonymous request lookup is disabled; customers must sign in before tracking. Historical requests without a user ID require an authorized operator to link them to the correct account before the customer can view them.

Do not rerun legacy reset/schema scripts after this migration: some explicitly disable RLS or recreate unrestricted policies. A GitHub push alone does not apply SQL or configure Supabase email templates.

Verify in the live project with separate customer, admin and super admin accounts: customer direct `/admin` navigation is denied, the customer cannot read another account's records or update `profiles.role`, an admin can view but cannot change requests, and a super admin can update request status. Test expired/wrong reset OTPs and a complete password reset for each role. Recovery must not change the account's role or open an authenticated dashboard automatically.


## November 13 registration, staff sessions and final PDF release

Apply `supabase/migrations/20261113_auth_and_final_documents.sql` after all existing migrations. It creates the private `final-documents` bucket, storage policies, verified-email request restrictions, and staff session functions. Redeploy `create-admin` after the migration. Deploy the website only after the backend changes and SMTP/template configuration are verified.

Required Authentication settings: enable email confirmations, use the signup template in this directory containing `.Token`, set email OTP expiry to 600 seconds and minimum resend interval to 60 seconds. Configure email-send and verification endpoint rate limits suitable for production traffic (including IP limits); the UI cooldown is only a convenience and does not provide backend rate limiting. Use custom SMTP with an authorized sender. Verify wrong/expired/reused codes and rate limits against the actual project before release. No custom email provider or new OTP secret is required: Supabase generates, stores, expires, and verifies signup codes.

The frontend needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (exact spelling). The existing `.env.example` currently spells the latter `VITE_SUPABASE_ANON_YKE`; correct that spelling when creating the deployment environment. Service-role keys must never be placed in Vite variables.

Staff sign-in now uses a separate in-memory client. Closing/reloading the page requires password sign-in again; customer persistence remains unchanged. A successful staff password login activates a session-bound server grant for eight hours. Logout removes the grant before local token sign-out. Auth restoration and token refresh cannot create frontend staff access. Staff permissions continue to follow the existing view-only admin/super-admin distinction. Old persisted staff tokens have no staff grant and cannot restore staff access after this migration.

Final PDFs are uploaded to `final-documents/<application_id>/<random-id>.pdf` with a 5 MB server bucket limit and PDF MIME restriction. The application stores a stable `storage://final-documents/...` reference, never an expiring signed URL. Downloads send the authenticated customer's JWT and storage policies check the owning application's user ID. No signed bearer links are shared. New uploads also validate the PDF signature before upload and downloads check it before saving. Failed record attachment attempts storage cleanup.

Historical Cloudinary PDF records require authorized re-upload through the new workflow. Review and retire the old public Cloudinary copies separately; changing a database reference cannot revoke a public Cloudinary URL. Do not delete the Cloudinary configuration because existing customer document and payment-proof uploads still use it.
