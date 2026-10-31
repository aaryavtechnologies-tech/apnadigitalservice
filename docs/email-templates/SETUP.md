# Authentication email setup

In Supabase Authentication → Email Templates, paste the complete contents of:

| Template | File | Subject |
| --- | --- | --- |
| Confirm signup | confirm-signup.html | Confirm your email — Apna Digital Service |
| Reset password | reset-password.html | Your password reset OTP — Apna Digital Service |

Signup keeps `{{ .ConfirmationURL }}`. Password recovery uses `{{ .Token }}`. Do not replace the Magic Link template for this change. Existing email/password and Google login remain normal login methods. The staff Forgot Password flow now resets a password rather than using OTP as an alternate staff login.

Save the Reset password template before enabling this website version: the code-entry screen requires the email to contain the OTP. Set Authentication → URL Configuration → Site URL to the production website URL so signup confirmation returns to the website.

# Required database access controls

Apply `supabase/migrations/20261031_staff_access.sql` using the Supabase SQL Editor against the existing schema. It does not delete application data, but replaces permissive policies and enables row security. It preserves existing `profiles.role` values. Confirm that the intended staff accounts already have the correct `admin` or `super_admin` role. New accounts are always customers; matching an email address does not grant staff privileges.

- Customers read their own requests and submit requests tied to their authenticated user ID.
- Admins retain view-only access.
- Super admins retain write access.
- Customers cannot modify their profile role, other customers' requests, website settings, services or audit logs.
- Anonymous request lookup is disabled; customers must sign in before tracking. Historical requests without a user ID require an authorized operator to link them to the correct account before the customer can view them.

Do not rerun legacy reset/schema scripts after this migration: some explicitly disable RLS or recreate unrestricted policies. A GitHub push alone does not apply SQL or configure Supabase email templates.

Verify in the live project with separate customer, admin and super admin accounts: customer direct `/admin` navigation is denied, the customer cannot read another account's records or update `profiles.role`, an admin can view but cannot change requests, and a super admin can update request status. Test expired/wrong reset OTPs and a complete password reset for each role. Recovery must not change the account's role or open an authenticated dashboard automatically.
