# Supabase incident findings and handoff

Date: 2026-10-30

## What the repository shows

1. `src/admin/services/adminDataService.js` used to read `apna_applications` from browser `localStorage` and upsert missing records into `public.service_requests` every time an admin refreshed. Deleting a row in Supabase therefore did not delete the stale browser copy; the next admin refresh could recreate it. The admin list now reads Supabase only.
2. Admin status, notes, payment, document, and delete operations used to update local browser data first, return success even when a Supabase update failed, and sometimes ignore database errors. The operations now write to Supabase first and report success only when Supabase returns the affected row. There is no local persistence for admin mutations.
3. `supabase/RESET_AND_FIX.sql` drops several public tables with `CASCADE` and disables RLS on `service_requests`. `supabase/master_schema.sql` also disables RLS on `service_requests`, services, and several other tables. If RLS is disabled for service requests, the browser uses the public/anon Supabase key and customers can potentially query records belonging to other customers; client-side filters do not provide security. Do not run either reset script against production without a reviewed replacement policy design and a backup.
4. The repository contains multiple schema sources (`schema.sql`, `master_schema.sql`, `RESET_AND_FIX.sql`, and `migration_native_forms.sql`) that disagree on columns, access rules, and table setup. The live Supabase project may not match any one file. Inventory the live project before drafting a migration.
5. `supabase/schema.sql` includes profile policies that query `public.profiles` from a policy on `public.profiles`; that can recurse in PostgreSQL. The reset script attempts to replace this with a `SECURITY DEFINER` role helper. Inspect the live policies and function before deciding which behavior is deployed.
6. Customer dashboards already polled every 15 seconds, which explains a visible delay. A Realtime subscription is now added for rows matching the signed-in `user_id`; the polling remains as recovery. Realtime delivery requires the table to be in the Supabase Realtime publication and RLS to allow the user to read their own row.
7. New request creation now requires an actual successful Supabase insert confirmation. It no longer falls back to a local-only success or uses `upsert`, which could overwrite an existing application when IDs collide.

## Changes made in this repository

- Admin queue is database-only. A failed database read clears the queue and shows a visible error.
- Admin writes/deletes are database-first and require an affected row to be returned.
- Customer view remains database-only and receives committed row changes through Realtime where enabled, plus a 15-second recovery refresh.
- Admin document removal now waits for the database result before changing the modal display.

## Read-only live Supabase inventory SQL

Run this in the Supabase SQL Editor for the correct project. It only reads catalog/data; it does not alter rows, tables, functions, policies, or triggers. Run each statement separately so the SQL Editor returns each result set clearly. The profile query returns application profile contact fields and role; review/share its output only with people who need it.

```sql
-- 1. Public tables, views, and RLS state
select n.nspname as schema_name,
       c.relname as object_name,
       case c.relkind when 'r' then 'table' when 'p' then 'partitioned table'
         when 'v' then 'view' when 'm' then 'materialized view' else c.relkind::text end as object_type,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','p','v','m')
order by object_type, object_name;

-- 2. Columns, types, defaults, nullability, and generated/identity status
select table_schema, table_name, ordinal_position, column_name, data_type,
       udt_name, is_nullable, column_default, is_identity, is_generated
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- 3. Constraints and their definitions (PK, FK, UNIQUE, CHECK)
select n.nspname as schema_name, t.relname as table_name, con.conname as constraint_name,
       case con.contype when 'p' then 'PRIMARY KEY' when 'f' then 'FOREIGN KEY'
         when 'u' then 'UNIQUE' when 'c' then 'CHECK' when 'x' then 'EXCLUSION' end as constraint_type,
       pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class t on t.oid = con.conrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public'
order by table_name, constraint_type, constraint_name;

-- 4. Index definitions
select schemaname, tablename, indexname, indexdef
from pg_indexes where schemaname = 'public'
order by tablename, indexname;

-- 5. RLS policies (including roles, commands, USING and WITH CHECK)
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public'
order by tablename, policyname;

-- 6. Triggers on application and auth tables (includes auth.users profile provisioner)
select event_object_schema as schema_name, event_object_table as table_name,
       trigger_name, event_manipulation, action_timing, action_orientation,
       action_condition, action_statement
from information_schema.triggers
where event_object_schema in ('public', 'auth')
order by table_name, trigger_name, event_manipulation;

-- 7. Non-extension application functions in public schema (definitions and security mode)
select n.nspname as schema_name, p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as result_type,
       p.prosecdef as security_definer,
       p.proconfig as function_settings,
       pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and not exists (select 1 from pg_depend d join pg_extension e on e.oid = d.refobjid
                  where d.objid = p.oid and d.deptype = 'e')
order by function_name, arguments;

-- 8. Current application profiles (application table only; excludes auth.users credentials)
select id, full_name, email, phone, role, created_at, updated_at
from public.profiles
order by created_at nulls last, email;

-- 9. Service request row counts/status/payment counts, plus earliest/latest row timestamps
select count(*) as total_requests,
       count(*) filter (where status is null) as null_status_count,
       count(*) filter (where payment_status is null) as null_payment_status_count,
       min(created_at) as first_created_at,
       max(created_at) as last_created_at
from public.service_requests;

select status, payment_status, count(*) as row_count
from public.service_requests
group by status, payment_status
order by status, payment_status;

-- 10. Realtime publication membership for service_requests
select p.pubname, n.nspname as schema_name, c.relname as table_name
from pg_publication_tables p
join pg_namespace n on n.nspname = p.schemaname
join pg_class c on c.relname = p.tablename and c.relnamespace = n.oid
where p.schemaname = 'public' and p.tablename = 'service_requests'
order by p.pubname;

-- 11. Explicit table grants (RLS policy checks must also be reviewed)
select grantee, table_schema, table_name, privilege_type, is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
order by table_name, grantee, privilege_type;
```

## Next step before any cleanup/rebuild

Save the query results, especially tables/columns, constraints, policies, triggers, function definitions, profile roles, request counts/statuses, publication membership, and grants. Also provide the current intended role rules and confirm the exact Super Admin email if it differs from `help.apnadigitalservice@gmail.com`, which is the hard-coded email found in this repository. Do not include Supabase keys, passwords, auth tokens, or payment/document URL contents in the handoff.

Then prepare a migration against the actual live schema, preserve/export existing profiles and requests, specify the one authorized Super Admin identity, enforce RLS and server-side role checks, and verify signup/profile provisioning plus committed request/payment/status updates. A drop-and-recreate SQL script is intentionally not included before the live schema and data are known: the current reset script is destructive and at least one setup script disables RLS.
