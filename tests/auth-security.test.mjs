import test from 'node:test';
import assert from 'node:assert/strict';
import { createPasswordRecovery } from '../src/lib/passwordRecovery.js';
import { isStaffRole, resolveAccountRole } from '../src/lib/accountRole.js';

function recoveryHarness() {
  const calls = [];
  const user = { id: 'customer-id', email: 'customer@example.com' };
  let verificationError = null;
  let currentUser = user;
  const client = { auth: {
    resetPasswordForEmail: async email => { calls.push(['send', email]); return {}; },
    verifyOtp: async input => { calls.push(['verify', input]); return verificationError ? { error: verificationError } : { data: { user, session: { user } } }; },
    getUser: async () => ({ data: { user: currentUser } }),
    updateUser: async input => { calls.push(['update', input]); return {}; },
    signOut: async input => { calls.push(['signOut', input]); return {}; }
  }};
  return { service: createPasswordRecovery(client), calls,
    failVerification: () => { verificationError = new Error('Expired or invalid OTP'); },
    expireSession: () => { currentUser = null; }
  };
}

test('password reset uses recovery OTP and never writes account roles', async () => {
  const h = recoveryHarness();
  await h.service.send(' customer@example.com ');
  await h.service.verify('customer@example.com', '12345678');
  await h.service.update('new-password', 'new-password');
  assert.deepEqual(h.calls, [
    ['send', 'customer@example.com'],
    ['verify', { email: 'customer@example.com', token: '12345678', type: 'recovery' }],
    ['update', { password: 'new-password' }],
    ['signOut', { scope: 'local' }]
  ]);
  await assert.rejects(h.service.update('another-pass', 'another-pass'), /Verify/);
});

test('wrong OTP, missing verification, mismatched passwords and expired sessions cannot update a password', async () => {
  const h = recoveryHarness();
  await assert.rejects(h.service.update('new-password', 'new-password'), /Verify/);
  await h.service.verify('customer@example.com', '123456');
  await assert.rejects(h.service.update('new-password', 'different'), /match/);
  h.expireSession();
  await assert.rejects(h.service.update('new-password', 'new-password'), /expired/);
  h.failVerification();
  await assert.rejects(h.service.verify('customer@example.com', 'wrong'), /invalid/);
  assert.equal(h.calls.some(([type]) => type === 'update'), false);
});

test('resending a reset code invalidates the local verified step', async () => {
  const h = recoveryHarness();
  await h.service.verify('customer@example.com', '123456');
  await h.service.send('customer@example.com');
  await assert.rejects(h.service.update('new-password', 'new-password'), /Verify/);
});

test('role resolution denies missing, unknown and failed profiles', async () => {
  const profile = (role, error = null) => ({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role }, error }) }) }) }) });
  for (const role of ['customer', null, 'owner', 'SUPER_ADMIN']) {
    assert.equal(await resolveAccountRole(profile(role), 'user-id'), 'customer');
  }
  assert.equal(await resolveAccountRole(profile('super_admin', new Error('Denied')), 'user-id'), 'customer');
  assert.equal(await resolveAccountRole(null, 'user-id'), 'customer');
  for (const role of ['admin', 'super_admin']) assert.equal(await resolveAccountRole(profile(role), 'user-id'), role);
  assert.equal(isStaffRole('customer'), false);
});
