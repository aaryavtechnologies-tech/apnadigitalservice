export function createRegistration(client) {
  const requireClient = () => { if (!client) throw new Error('Registration is unavailable. Please contact support.'); };
  return {
    async start(email, password, fullName, phone) {
      requireClient();
      const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password,
        options: { data: { full_name: fullName, phone } } });
      if (error) throw error;
      if (data?.session) {
        await client.auth.signOut({ scope: 'local' });
        throw new Error('Support must enable email confirmation before registration.');
      }
    },
    async verify(email, token) {
      requireClient();
      if (!/^\d{6,10}$/.test(token.trim())) throw new Error('Enter the numeric code from your email.');
      const { data, error } = await client.auth.verifyOtp({ email, token: token.trim(), type: 'signup' });
      if (error) throw error;
      if (!data?.user?.email_confirmed_at || !data?.session) throw new Error('Email verification was not confirmed.');
      const logout = await client.auth.signOut({ scope: 'local' });
      if (logout.error) throw logout.error;
    },
    async resend(email) {
      requireClient();
      const { error } = await client.auth.resend({ type: 'signup', email });
      if (error) throw error;
    }
  };
}
