import { createRegistration } from '../lib/registration';
import React, { useEffect, useState } from 'react';
import { registrationSupabase as supabase } from '../lib/supabaseClient';

export default function RegistrationOtp({ email, onVerified, onBack }) {
  const [token, setToken] = useState('');
  const [deadline, setDeadline] = useState(() => Date.now() + 60000);
  const [remaining, setRemaining] = useState(60);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Enter the code sent to your email. Codes expire after 10 minutes.');
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  async function verify(event) {
    event.preventDefault(); setBusy(true);
    try {
      await createRegistration(supabase).verify(email, token);
      onVerified();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (busy || Date.now() < deadline) return;
    setBusy(true); setDeadline(Date.now() + 60000);
    try {
      await createRegistration(supabase).resend(email);
      setToken(''); setMessage('A new code has been sent. Use the latest email.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <div className="modal-body" style={{ padding: 24 }}>
    <h3>Verify your email</h3><p>{email}</p><p role="status">{message}</p>
    <form onSubmit={verify}>
      <label className="form-label" htmlFor="registration-otp">Email verification code</label>
      <input id="registration-otp" className="form-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" required value={token} onChange={e => setToken(e.target.value)} />
      <button className="btn-primary" disabled={busy} type="submit">{busy ? 'Processing…' : 'Verify Email'}</button>
    </form>
    <button className="btn-secondary" type="button" disabled={busy || remaining > 0} onClick={resend}>{remaining ? `Resend OTP in ${remaining}s` : 'Resend OTP'}</button>
    <button className="btn-secondary" type="button" disabled={busy} onClick={onBack}>Back to Sign In</button>
  </div>;
}
