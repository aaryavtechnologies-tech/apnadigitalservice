# Live deployment and PDF recovery — 14 November 2026

## Current status

PDF recovery is **not complete**. The existing frontend rejects legacy Cloudinary
references. A live server-side dry-run also proved that the original provider is
not currently returning valid PDFs for any of the six legacy records. No final
document references or original files have been changed or deleted.

## Live findings and applied configuration

- Project: `jeetzosmzrdamuxqpsfy`.
- The November 13 staff-session functions and private Storage policies were already
  present when inspected. They were not rerun. Both session RPCs grant execution
  to authenticated users. The final-documents bucket is private, PDF-only, 5 MB.
- No `supabase_migrations.schema_migrations` table exists. SQL Editor changes are
  not represented as CLI migration history; do not blindly run all migrations.
- The designated super admin was already confirmed and assigned `super_admin`.
  Its role was not modified. Manual password login succeeded in the live website.
- Direct staff-creation function/triggers were missing. Applied the equivalent of
  `20261104_direct_staff_creation.sql` and notified PostgREST to reload its schema.
- No Edge Functions were deployed initially. Deployed repository `create-admin`.
  Actual creation of another admin has not been tested.
- Email confirmation was already enabled. Changed email OTP expiry from 3600 to
  600 seconds. Replaced the signup confirmation-link template with the repository
  numeric `.Token` template. Custom SMTP is enabled using Gmail on port 465;
  delivery and authorized sender verification remain pending. The resend interval
  is 60 seconds; verification and signup/signin limits are 30 per 5 minutes per IP.
- Applications, Inquiries, Services and CMS opened under the real super-admin
  session. Services retained its search filter and CMS retained its selected
  section across tab changes. Browser restart, suspended-tab recovery, expiry and
  logout have not yet been verified live.

## Legacy PDF recovery

Added and deployed `migrate-legacy-pdfs`. It is an operator-only maintenance tool,
not a public/customer endpoint. PostgREST validates the caller's JWT; only
`service_role` may execute its authorization RPC. Customer/admin JWTs must not
receive access to that RPC or to the backup ledger.

Applied `20261114_legacy_pdf_backups.sql` (ledger and authorization function).
No secrets are stored in source, outputs or this report.

Invoke through the Supabase function tester with the existing backend operator
credential. Keep JWT verification enabled. Request body:

```json
{"commit": false}
```

An optional `applicationId` limits the run. The function reads only database-held
source URLs from the existing Cloudinary cloud. It rejects foreign URLs,
redirects, oversized responses and responses without a PDF signature. It returns
statuses and byte counts, never document contents or original URLs.

Live dry-run results:

| Application | Result |
| --- | --- |
| ADS-2026-146193 | Cloudinary HTTP 401 |
| ADS-2026-391501 | Cloudinary HTTP 401 |
| ADS-2026-476800 | Response is not a PDF |
| ADS-2026-659642 | Cloudinary HTTP 401 |
| ADS-2026-844908 | Response is not a PDF |
| ADS-2026-985465 | Cloudinary HTTP 401 |

Owner access to Cloudinary or the original files is needed next. Inspect the two
non-PDF sources before deciding whether they are images requiring conversion or
incorrect attachments. Do not enable public delivery or change original records
merely to silence the error.

Only after a dry-run reports `ready`, invoke with `commit: true`. The function
backs up the original reference in a private operator-only table, uploads to a
deterministic private path, downloads and verifies the SHA-256 hash, and updates
the application only if its original reference still matches. It preserves
original Cloudinary assets. A retry can safely reuse a verified existing object.
Database failure may leave an unreferenced private object; it never announces a
successful migration. Review such objects separately rather than deleting blindly.

After migration, test the real customer dashboard download, opening the PDF,
byte identity and denial for another customer. Changing the record does not revoke
an old public Cloudinary URL; retirement of originals remains a separate decision.

## Automated validation

### Authenticated recovery follow-up

The user signed in to the correct Cloudinary cloud. The media library and API
settings eventually loaded after module timeouts. Database metadata confirms the
two non-PDF legacy references are `.jpg` files, not PDFs.

Added and deployed an opt-in `authenticatedSource: true` recovery mode. It signs
five-minute Cloudinary download requests only for versioned original PDFs in the
existing cloud. It does not change Cloudinary delivery permissions. Credentials
must be supplied using temporary `LEGACY_CLOUDINARY_API_KEY` and
`LEGACY_CLOUDINARY_API_SECRET` server secrets; remove both after recovery.
The user explicitly approved that temporary transfer and cleanup after automatic
approval review initially blocked it.

Cloudinary requires an email verification code before releasing its API secret.
An initial clipboard copy did not supply credentials; the resulting read-only
attempt returned 401 and changed no records. This is not evidence that a valid
authenticated download fails. Verification and a new authenticated dry-run are
still pending. No authenticated migration has been committed.
Both unsuccessful temporary secret entries were deleted while waiting for email
verification. A valid credential must be copied and shape-checked after approval
before configuring and testing again.

An additional automated test verifies the signed endpoint, signature, expiry,
source restrictions, missing-credential handling and non-disclosure in responses.

Four new tests execute the recovery handler with modeled provider/database/storage
clients: unauthorized access, dry-run without writes, invalid sources/provider
failures/non-PDF responses, and byte verification/concurrent-update protection.
They do not replace the blocked real-document migration and browser download test.
An additional PGlite test executes the actual recovery migration and confirms that
anonymous/customer roles cannot invoke the authorization RPC or read the ledger,
while service_role can authenticate. The new test harness uses Node's built-in
TypeScript stripping (Node 22.13+).

The original 14 tests and all six added recovery tests passed (20 total). Production build
passed with the existing bundle-size warning; lint passed with existing warnings.
Git commit status is reported in the task after the repository operation.
The existing workspace's 77 line-ending-only modifications are preserved.
