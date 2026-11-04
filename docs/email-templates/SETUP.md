# Authentication email setup

Enable custom SMTP in the Supabase dashboard under **Authentication → Email → SMTP Settings**. Enter your email provider's SMTP host, port, username, and password. Set the sender email to an address authorized by your provider and the sender name to **Apna Digital Service**. Keep **Confirm email** enabled for public signup. Supabase's built-in mailer only sends to project team addresses. [Supabase custom SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp)

If signup still returns “Error sending confirmation email,” open **Logs Explorer → Auth** and expand the error for the failed signup. Use the detailed error to check the SMTP credentials, port, verified sender, or confirmation template. The edge log's HTTP 500 alone cannot identify which check failed. [Supabase Auth troubleshooting](https://supabase.com/kb/troubleshooting/resolving-500-status-authentication-errors-7bU5U8)

In Supabase Authentication → Email Templates, paste the complete contents of:

| Template | File | Subject |
| --- | --- | --- |
| Confirm signup | confirm-signup.html | Confirm your email — Apna Digital Service |
| Reset password | reset-password.html | Your password reset OTP — Apna Digital Service |

Signup keeps `{{ .ConfirmationURL }}`. Password recovery uses `{{ .Token }}`. Do not replace the Magic Link template for this change. Existing email/password and Google login remain normal login methods. The staff Forgot Password flow now resets a password rather than using OTP as an alternate staff login.

Save the Reset password template before enabling this website version: the code-entry screen requires the email to contain the OTP. Set Authentication → URL Configuration → Site URL to the production website URL so signup confirmation returns to the website.

# Direct staff creation

Before releasing the website, apply [the direct staff migration](../../supabase/migrations/20261104_direct_staff_creation.sql) and [the legacy staff activation migration](../../supabase/migrations/20261104000100_legacy_staff_activation.sql) in that order in the target project's SQL Editor after the staff access migration below. Then deploy the Edge Function from the repository root.

```powershell
supabase functions deploy create-admin --project-ref jeetzosmzrdamuxqpsfy
```

The function verifies the caller's current super admin role before creating a confirmed staff account. In the **Staff** tab, choose **Activate** beside a legacy authorization and set a fresh password. An eligible unconfirmed legacy account is activated without sending email. Test both new staff creation and legacy activation with password sign-in before releasing the website.

# Required database access controls

On a project that has not applied the staff access migration, apply `supabase/migrations/20261031_staff_access.sql` using the Supabase SQL Editor against the existing schema. It replaces permissive policies and enables row security while preserving existing `profiles.role` values. Confirm that the intended staff accounts already have the correct `admin` or `super_admin` role. Apply the direct staff migration after this one so the direct staff triggers take effect.

- Customers read their own requests and submit requests tied to their authenticated user ID.
- Admins retain view-only access.
- Super admins retain write access.
- Customers cannot modify their profile role, other customers' requests, website settings, services or audit logs.
- Anonymous request lookup is disabled; customers must sign in before tracking. Historical requests without a user ID require an authorized operator to link them to the correct account before the customer can view them.

Do not rerun legacy reset/schema scripts after this migration: some explicitly disable RLS or recreate unrestricted policies. A GitHub push alone does not apply SQL or configure Supabase email templates.

Verify in the live project with separate customer, admin and super admin accounts: customer direct `/admin` navigation is denied, the customer cannot read another account's records or update `profiles.role`, an admin can view but cannot change requests, and a super admin can update request status. Test expired/wrong reset OTPs and a complete password reset for each role. Recovery must not change the account's role or open an authenticated dashboard automatically.
