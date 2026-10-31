// This client has no shared/persisted session: verifying a recovery OTP must not
// sign the user into either the customer dashboard or the staff portal.
export function createPasswordRecovery(client) {
  let verifiedUserId = null;
  let verifiedEmail = '';
  const requireClient = () => {
    if (!client) throw new Error('Password reset is temporarily unavailable. Please contact support.');
  };
  return {
    async send(email) {
      requireClient();
      verifiedUserId = null;
      verifiedEmail = '';
      const { error } = await client.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
    },
    async verify(email, token) {
      requireClient();
      verifiedUserId = null;
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await client.auth.verifyOtp({ email: normalizedEmail, token: token.trim(), type: 'recovery' });
      if (error) throw error;
      if (!data?.session || !data?.user || data.user.email?.toLowerCase() !== normalizedEmail) {
        throw new Error('Verification failed. Please request a new code.');
      }
      verifiedUserId = data.user.id;
      verifiedEmail = normalizedEmail;
    },
    async update(password, confirmation) {
      requireClient();
      if (!verifiedUserId) throw new Error('Verify your reset code first.');
      if (password.length < 8) throw new Error('Use at least 8 characters for your new password.');
      if (password !== confirmation) throw new Error('The passwords do not match.');
      const { data, error } = await client.auth.getUser();
      if (error || data?.user?.id !== verifiedUserId || data.user.email?.toLowerCase() !== verifiedEmail) {
        verifiedUserId = null;
        throw new Error('Your reset session expired. Please request a new code.');
      }
      const result = await client.auth.updateUser({ password });
      if (result.error) throw result.error;
      verifiedUserId = null;
      verifiedEmail = '';
      // A cleanup failure must not report a successfully changed password as failed.
      await client.auth.signOut({ scope: 'local' }).catch(() => {});
    },
    dispose() {
      verifiedUserId = null;
      verifiedEmail = '';
      if (client) void client.auth.signOut({ scope: 'local' }).catch(() => {});
    }
  };
}
