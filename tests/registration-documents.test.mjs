import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistration } from '../src/lib/registration.js';
import { uploadFinalPdf, downloadFinalPdf, validatePdf, STORAGE_PREFIX } from '../src/lib/finalDocuments.js';

const pdf = () => new File(['%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'], 'final.pdf', { type: 'application/pdf' });
test('final PDF bytes survive upload, record attachment and authenticated download', async () => {
  const objects = new Map(); let record;
  const client = { storage: { from: bucket => {
    assert.equal(bucket, 'final-documents');
    return {
      upload: async (path, file) => { objects.set(path, file); return {}; },
      download: async path => ({ data: objects.get(path) }),
      remove: async paths => { paths.forEach(path => objects.delete(path)); return {}; }
    };
  } } };
  const file = pdf();
  const result = await uploadFinalPdf(client, 'application-1', file, async (id, url, name) => {
    record = { id, url, name }; return { success: true };
  });
  assert.equal(record.id, 'application-1'); assert.equal(record.name, 'final.pdf');
  assert.ok(record.url.startsWith(STORAGE_PREFIX + 'application-1/'));
  const downloaded = await downloadFinalPdf(client, result.secureUrl);
  assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()), new Uint8Array(await file.arrayBuffer()));
  await assert.rejects(downloadFinalPdf(client, 'https://public.example/file.pdf'), /re-uploaded/);
});
test('invalid PDFs, empty and oversized files are rejected before upload', async () => {
  for (const file of [new File(['abc'], 'fake.pdf', { type: 'application/pdf' }), new File([], 'empty.pdf', { type: 'application/pdf' }), new File(['%PDF-'], 'wrong.png', { type: 'image/png' }), new File([new Uint8Array(5242881)], 'large.pdf', { type: 'application/pdf' })]) {
    await assert.rejects(validatePdf(file));
  }
});
test('database failure cleans up uploaded PDF and never announces delivery', async () => {
  let removed = false;
  const client = { storage: { from: () => ({ upload: async () => ({}), remove: async () => { removed = true; return {}; } }) } };
  await assert.rejects(uploadFinalPdf(client, 'application-1', pdf(), async () => ({ success: false, error: 'DB denied' })), /DB denied/);
  assert.equal(removed, true);
  await assert.rejects(downloadFinalPdf({ storage: { from: () => ({ download: async () => ({ error: new Error('Access denied') }) }) } }, STORAGE_PREFIX + 'other/file.pdf'), /Access denied/);
});
test('registration uses signup OTP, propagates invalid/expired/rate-limit errors and fails closed on auto-confirm', async () => {
  const calls = []; let failure = null; let autoConfirm = false;
  const auth = {
    signUp: async input => { calls.push(input); return { data: { session: autoConfirm ? {} : null } }; },
    verifyOtp: async input => { calls.push(input); return failure ? { error: failure } : { data: { user: { email_confirmed_at: 'now' }, session: {} } }; },
    resend: async input => { calls.push(input); return { error: failure }; },
    signOut: async () => { calls.push('logout'); return {}; }
  };
  const service = createRegistration({ auth });
  await service.start(' USER@Example.com ', 'password', 'Name', '1234567890');
  assert.equal(calls[0].email, 'user@example.com');
  await service.verify('user@example.com', '123456');
  assert.deepEqual(calls[1], { email: 'user@example.com', token: '123456', type: 'signup' });
  assert.equal(calls[2], 'logout');
  await assert.rejects(service.verify('user@example.com', 'abc'), /numeric/);
  for (const error of ['Invalid OTP', 'Expired OTP', 'Rate limit exceeded']) {
    failure = new Error(error);
    await assert.rejects(service.verify('user@example.com', '123456'), failure);
    await assert.rejects(service.resend('user@example.com'), failure);
  }
  failure = null; await service.resend('user@example.com');
  assert.deepEqual(calls.at(-1), { email: 'user@example.com', type: 'signup' });
  autoConfirm = true; await assert.rejects(service.start('user@example.com', 'password', 'Name', ''), /enable email confirmation/);
});
