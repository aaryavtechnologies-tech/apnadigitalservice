import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function settingsHarness({ failure = false, remote = null } = {}) {
  const cache = new Map();
  const writes = [];
  const events = [];
  let source = await readFile(new URL('../src/data/servicesData.js', import.meta.url), 'utf8');
  source = source.replace(/^import .*;\r?\n/, '').replaceAll('export ', '');
  const context = vm.createContext({
    console, Date, JSON, isSupabaseConfigured: true,
    localStorage: { getItem: key => cache.get(key) ?? null, setItem: (key, value) => cache.set(key, value) },
    window: { dispatchEvent: event => events.push(event) },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    supabase: { from: () => ({
      upsert: async (payload, options) => { writes.push({ payload, options }); return { error: failure ? new Error('Save failed') : null }; },
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: remote, error: null }) }) })
    }) }
  });
  vm.runInContext(source, context);
  return { context, cache, writes, events };
}

test('failed publishing never updates the browser cache or announces success', async () => {
  const h = await settingsHarness({ failure: true });
  const result = await h.context.saveHomepageSettings({ sections: { hero: false } }, 'super_admin');
  assert.equal(result.success, false);
  assert.equal(h.cache.size, 0);
  assert.equal(h.events.length, 0);
});

test('publishing stores the text schema and preserves added sections for other visitors', async () => {
  const h = await settingsHarness();
  const customSections = [{ id: 'one', title: 'Service notice', body: 'Updated hours' }];
  assert.equal((await h.context.saveHomepageSettings({ sections: { hero: false }, customSections }, 'super_admin')).success, true);
  assert.equal(h.writes[0].payload.key, 'homepage_config');
  assert.equal(h.writes[0].payload.id, undefined);
  const other = await settingsHarness({ remote: { value: h.writes[0].payload.value } });
  const settings = await other.context.fetchHomepageSettings();
  assert.equal(settings.sections.hero, false);
  assert.equal(settings.sections.about, true);
  assert.equal(settings.customSections[0].title, 'Service notice');
});

test('non-admin publishing is rejected before a database write', async () => {
  const h = await settingsHarness();
  assert.equal((await h.context.saveHomepageSettings({}, 'customer')).success, false);
  assert.equal(h.writes.length, 0);
});

test('unconfigured uploads fail instead of returning a temporary local URL', async () => {
  let source = await readFile(new URL('../src/admin/services/cloudinaryService.js', import.meta.url), 'utf8');
  source = source.replaceAll('import.meta.env.', 'env.').replaceAll('export ', '');
  const context = vm.createContext({ env: {}, console });
  vm.runInContext(source, context);
  const result = await context.uploadDocumentToCloudinary({ type: 'application/pdf', name: 'test.pdf', size: 10 });
  assert.equal(result.success, false);
  assert.equal(result.secureUrl, undefined);
});

test('request saving rejects an expired session and another account before writing', async () => {
  let source = await readFile(new URL('../src/lib/supabaseClient.js', import.meta.url), 'utf8');
  source = source.replace(/^import .*;\r?\n/, '').replaceAll('import.meta.env.', 'env.').replaceAll('export ', '');
  for (const user of [null, { id: '11111111-1111-4111-8111-111111111111' }]) {
    let writes = 0;
    const context = vm.createContext({
      env: { VITE_SUPABASE_URL: 'https://test.invalid', VITE_SUPABASE_ANON_KEY: 'test' },
      createClient: () => ({ auth: { getUser: async () => ({ data: { user }, error: null }) }, from: () => { writes++; throw new Error('Unexpected write'); } }),
      console
    });
    vm.runInContext(source, context);
    await assert.rejects(() => context.saveServiceRequest({ userId: '22222222-2222-4222-8222-222222222222' }), /sign in again/);
    assert.equal(writes, 0);
  }
});
