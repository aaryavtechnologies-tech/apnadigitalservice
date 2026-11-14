import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

const source = stripTypeScriptTypes((await readFile(new URL('../supabase/functions/migrate-legacy-pdfs/index.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;\n/, ''));
const pdf = new TextEncoder().encode('%PDF-1.4\ncontrolled migration test\n%%EOF');

function harness({ allowed = true, url = 'https://res.cloudinary.com/m1gqubzu/raw/upload/example.pdf', status = 200, bytes = pdf, corrupt = false, conflict = false, credentials = false, inspectFetch } = {}) {
  let handler;
  const calls = { fetch: 0, backup: 0, upload: 0, update: 0 };
  const query = {
    select() { return this; }, not() { return this; }, order() { return this; }, limit() { return this; }, eq() { return this; },
    then(resolve) { resolve({ data: [{ application_id: 'test-app', document_url: url }] }); },
    update(payload) { calls.update++; assert.ok(payload.document_url.startsWith('storage://final-documents/test-app/legacy-')); return this; },
    maybeSingle() { return Promise.resolve({ data: conflict ? null : { application_id: 'test-app' } }); },
  };
  const client = {
    rpc: async () => ({ data: allowed }),
    from: table => table === 'final_pdf_migration_backups' ? { upsert: async row => { calls.backup++; assert.equal(row.source_url, url); return {}; } } : query,
    storage: { from: () => ({
      upload: async (_path, contents) => { calls.upload++; assert.deepEqual(Array.from(contents), Array.from(pdf)); return {}; },
      download: async () => ({ data: new Blob([corrupt ? '%PDF-wrong' : pdf]) }),
    }) },
  };
  vm.runInNewContext(source, {
    createClient: () => client,
    Deno: { env: { get: key => key.startsWith('LEGACY_') ? (credentials ? 'test-only-key' : undefined) : key === 'SUPABASE_URL' ? 'https://example.supabase.co' : 'runtime-key' }, serve: fn => { handler = fn; } },
    URL, URLSearchParams, Response, TextDecoder, TextEncoder, Uint8Array, crypto, AbortSignal,
    fetch: async (_url, options) => { calls.fetch++; assert.equal(options.redirect, 'error'); inspectFetch?.(_url); return new Response(bytes, { status }); },
  });
  return { calls, run: async (commit = false, auth = 'Bearer operator-token', authenticatedSource = false) => handler(new Request('https://example.test', {
    method: 'POST', headers: { Authorization: auth }, body: JSON.stringify({ commit, authenticatedSource }),
  })) };
}

test('legacy recovery denies non-operators before reading or fetching documents', async () => {
  const h = harness({ allowed: false });
  assert.equal((await h.run()).status, 403);
  assert.equal(h.calls.fetch, 0);
});

test('owner recovery signs only versioned original PDFs and never returns credentials', async () => {
  const url = 'https://res.cloudinary.com/m1gqubzu/image/upload/v123/folder/example.pdf';
  const h = harness({ url, credentials: true, inspectFetch: target => {
    assert.equal(target.origin, 'https://api.cloudinary.com');
    assert.equal(target.pathname, '/v1_1/m1gqubzu/image/download');
    const p = target.searchParams;
    assert.equal(p.get('public_id'), 'folder/example');
    assert.equal(p.get('type'), 'upload');
    assert.equal(Number(p.get('expires_at')) - Number(p.get('timestamp')), 300);
    const signed = ['expires_at', 'format', 'public_id', 'timestamp', 'type'].map(k => `${k}=${p.get(k)}`).join('&');
    assert.equal(p.get('signature'), createHash('sha1').update(signed + 'test-only-key').digest('hex'));
  } });
  const result = await (await h.run(false, 'Bearer operator-token', true)).text();
  assert.match(result, /ready/);
  assert.ok(!result.includes('test-only-key'));
  for (const options of [{ url }, { url: url.replace('.pdf', '.jpg'), credentials: true }, { url: url + '?x=1', credentials: true }]) {
    const blocked = harness(options);
    assert.equal((await (await blocked.run(true, 'Bearer operator-token', true)).json()).results[0].status, 'blocked');
    assert.equal(blocked.calls.fetch, 0);
  }
});

test('legacy recovery dry-run validates PDFs without writes', async () => {
  const h = harness();
  assert.equal((await (await h.run()).json()).results[0].status, 'ready');
  assert.deepEqual(h.calls, { fetch: 1, backup: 0, upload: 0, update: 0 });
});

test('legacy recovery rejects foreign hosts, provider errors and non-PDF responses', async () => {
  for (const options of [{ url: 'https://example.com/file.pdf' }, { status: 401 }, { bytes: new TextEncoder().encode('<html>error</html>') }]) {
    const h = harness(options);
    assert.equal((await (await h.run(true)).json()).results[0].status, 'blocked');
    assert.equal(h.calls.update, 0);
    assert.equal(h.calls.upload, 0);
  }
});

test('legacy recovery verifies stored bytes and preserves concurrent record changes', async () => {
  const h = harness();
  assert.equal((await (await h.run(true)).json()).results[0].status, 'migrated');
  assert.deepEqual(h.calls, { fetch: 1, backup: 1, upload: 1, update: 1 });
  const corrupt = harness({ corrupt: true });
  assert.equal((await (await corrupt.run(true)).json()).results[0].status, 'blocked');
  assert.equal(corrupt.calls.update, 0);
  const conflict = harness({ conflict: true });
  assert.equal((await (await conflict.run(true)).json()).results[0].status, 'blocked');
});

test('recovery ledger and authorization RPC are inaccessible to customer and anonymous roles', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;');
    await db.exec(await readFile(new URL('../supabase/migrations/20261114_legacy_pdf_backups.sql', import.meta.url), 'utf8'));
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      await assert.rejects(db.query('SELECT apna_legacy_migration_operator()'), /permission denied/);
      await assert.rejects(db.query('SELECT * FROM final_pdf_migration_backups'), /permission denied/);
      await db.exec('RESET ROLE');
    }
    await db.exec('SET ROLE service_role');
    assert.equal((await db.query('SELECT apna_legacy_migration_operator() AS allowed')).rows[0].allowed, true);
  } finally { await db.close(); }
});
