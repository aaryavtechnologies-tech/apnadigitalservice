import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('database policies enforce customer isolation, view-only admin and super-admin writes', async () => {
  const db = new PGlite();
  const customer = '11111111-1111-4111-8111-111111111111';
  const other = '22222222-2222-4222-8222-222222222222';
  const admin = '33333333-3333-4333-8333-333333333333';
  const superAdmin = '44444444-4444-4444-8444-444444444444';
  try {
    await db.exec(`
      CREATE ROLE anon; CREATE ROLE authenticated;
      CREATE SCHEMA auth;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
      CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb, email_confirmed_at timestamp with time zone);
      CREATE TABLE public.profiles (id uuid PRIMARY KEY, email text, full_name text, phone text, role text);
      CREATE TABLE public.service_requests (application_id text PRIMARY KEY, user_id uuid, status text DEFAULT 'Request Received', payment_status text DEFAULT 'pending', document_url text);
      CREATE TABLE public.services (id text PRIMARY KEY);
      CREATE TABLE public.website_content (id text PRIMARY KEY);
      CREATE TABLE public.site_settings (id text PRIMARY KEY);
      CREATE TABLE public.admin_audit_logs (admin_id uuid);
      INSERT INTO auth.users(id,email) VALUES ('${superAdmin}','owner@example.com');
      INSERT INTO profiles(id,email,role) VALUES
        ('${customer}','customer@example.com','customer'), ('${other}','other@example.com','customer'),
        ('${admin}','admin@example.com','admin'), ('${superAdmin}','owner@example.com','super_admin');
      INSERT INTO service_requests(application_id,user_id) VALUES ('own','${customer}'),('other','${other}');
      CREATE POLICY legacy_allow_all ON service_requests USING (true) WITH CHECK (true);
    `);
    const migration = await readFile(new URL('../supabase/migrations/20261031_staff_access.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    // The migration must be safe to apply more than once.
    await db.exec(migration);
    const asUser = async (id, role = 'authenticated') => {
      await db.exec('RESET ROLE');
      await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id]);
      await db.exec(`SET ROLE ${role}`);
    };

    // Customer Isolation
    await asUser(customer);
    assert.deepEqual((await db.query('SELECT application_id FROM service_requests')).rows, [{ application_id: 'own' }]);
    assert.equal((await db.query('SELECT * FROM profiles')).rows.length, 1);
    await assert.rejects(db.exec("UPDATE profiles SET role='super_admin'"), /Only a super admin/);
    await assert.rejects(db.exec("INSERT INTO profiles(id,role) VALUES ('55555555-5555-4555-8555-555555555555','super_admin')"), /row-level security/);
    assert.equal((await db.query("UPDATE service_requests SET status='Completed' RETURNING *")).rows.length, 0);
    await assert.rejects(db.exec(`INSERT INTO service_requests(application_id,user_id) VALUES ('spoof','${other}')`), /row-level security/);
    await assert.rejects(db.exec(`INSERT INTO service_requests(application_id,user_id,status) VALUES ('approved','${customer}','Completed')`), /row-level security/);
    await db.exec(`INSERT INTO service_requests(application_id,user_id) VALUES ('valid','${customer}')`);
    for (const table of ['services','website_content','site_settings']) await assert.rejects(db.exec(`INSERT INTO ${table} VALUES ('hacked')`), /row-level security/);
    
    // Admin View-Only
    await asUser(admin);
    assert.equal((await db.query('SELECT * FROM service_requests')).rows.length, 3);
    assert.equal((await db.query("UPDATE service_requests SET status='Completed' RETURNING *")).rows.length, 0);
    await assert.rejects(db.exec("UPDATE profiles SET role='super_admin' WHERE id=auth.uid()"), /Only a super admin/);
    
    // Super Admin Full Access
    await asUser(superAdmin);
    assert.equal((await db.query("UPDATE service_requests SET status='Completed' WHERE application_id='own' RETURNING *")).rows.length, 1);
    await db.exec("INSERT INTO site_settings VALUES ('published')");
    
    // Anon Access
    await asUser('', 'anon');
    await assert.rejects(db.query('SELECT * FROM service_requests'), /permission denied/);
    assert.equal((await db.query('SELECT * FROM site_settings')).rows.length, 1);

    // Contact inquiries flow
    await db.exec("INSERT INTO contact_inquiries (name, phone, message) VALUES ('Ramesh', '9876543210', 'Help with voter id')");
    await asUser(admin);
    const inq = (await db.query("SELECT * FROM contact_inquiries")).rows;
    assert.equal(inq.length, 1);
    assert.equal(inq[0].name, 'Ramesh');
    await db.exec(`UPDATE contact_inquiries SET status='Contacted' WHERE id='${inq[0].id}'`);
    await asUser(customer);
    assert.equal((await db.query("SELECT * FROM contact_inquiries")).rows.length, 0);
    assert.equal((await db.query("UPDATE contact_inquiries SET status='Hacked' RETURNING *")).rows.length, 0);

    // Admin invitation & email confirmation flow
    await asUser(superAdmin);
    const newAdminEmail = 'newadmin@example.com';
    await db.exec(`INSERT INTO admin_invitations (email, full_name, created_by) VALUES ('${newAdminEmail}', 'New Admin', '${superAdmin}')`);
    
    // Non-super-admin cannot insert invitations
    await asUser(admin);
    await assert.rejects(db.exec("INSERT INTO admin_invitations (email) VALUES ('hacker@example.com')"), /row-level security/);

    // Create auth user: unconfirmed email -> NO admin profile created
    await db.exec('RESET ROLE');
    const newAdminId = '77777777-7777-4777-8777-777777777777';
    await db.exec(`INSERT INTO auth.users (id, email, email_confirmed_at) VALUES ('${newAdminId}', '${newAdminEmail}', NULL)`);
    assert.equal((await db.query(`SELECT * FROM profiles WHERE id='${newAdminId}'`)).rows.length, 0);

    // Confirm email -> trigger grants role 'admin'
    await db.exec(`UPDATE auth.users SET email_confirmed_at = now() WHERE id='${newAdminId}'`);
    const profile = (await db.query(`SELECT role, full_name FROM profiles WHERE id='${newAdminId}'`)).rows[0];
    assert.equal(profile.role, 'admin');
    assert.equal(profile.full_name, 'New Admin');

    // Normal customer signup -> only gets 'customer'
    const regCustomerId = '88888888-8888-4888-8888-888888888888';
    await db.exec(`INSERT INTO auth.users (id, email, email_confirmed_at) VALUES ('${regCustomerId}', 'random@example.com', now())`);
    assert.equal((await db.query(`SELECT role FROM profiles WHERE id='${regCustomerId}'`)).rows[0].role, 'customer');

  } finally { await db.close(); }
});
