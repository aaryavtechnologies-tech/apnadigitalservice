import React, { useEffect, useId, useState } from 'react';
import { createRecoveryClient } from '../lib/supabaseClient';
import { createPasswordRecovery } from '../lib/passwordRecovery';

export default function PasswordRecoveryForm({ initialEmail = '', onBack }) {
  const [recovery] = useState(() => createPasswordRecovery(createRecoveryClient()));
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const id = useId();

  useEffect(() => () => recovery.dispose(), [recovery]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendCode() {
    await recovery.send(email);
    setToken('');
    setStep('otp');
    setCooldown(60);
    setNotice('If this email is registered, a password reset code has been sent. Check your inbox and spam folder.');
  }

  async function run(action) {
    setBusy(true);
    setError('');
    try { await action(); }
    catch (err) { setError(err.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  async function submit(event) {
    event.preventDefault();
    await run(async () => {
      if (step === 'email') await sendCode();
      else if (step === 'otp') {
        await recovery.verify(email, token);
        setToken('');
        setNotice('Email verified. Choose a new password.');
        setStep('password');
      } else if (step === 'password') {
        await recovery.update(password, confirmation);
        setPassword(''); setConfirmation('');
        setNotice('Your password has been updated. Sign in with your new password.');
        setStep('done');
      }
    });
  }

  return <section className="password-recovery" aria-labelledby={`${id}-title`}>
    <img src="/logo.png" alt="Apna Digital Service" width="56" height="56" />
    <h2 id={`${id}-title`}>Reset your password</h2>
    {notice && <p role="status" className="recovery-notice">{notice}</p>}
    {error && <p role="alert" className="recovery-error">{error}</p>}
    {step !== 'done' && <form onSubmit={submit}>
      {step === 'email' && <label htmlFor={`${id}-email`}>Registered email address
        <input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={busy} />
      </label>}
      {step === 'otp' && <>
        <p>Enter the code sent to <strong>{email}</strong>.</p>
        <label htmlFor={`${id}-otp`}>Password reset OTP
          <input id={`${id}-otp`} type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} value={token} onChange={e => setToken(e.target.value.replace(/\D/g, ''))} required disabled={busy} />
        </label>
      </>}
      {step === 'password' && <>
        <label htmlFor={`${id}-password`}>New password
          <input id={`${id}-password`} type="password" autoComplete="new-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required disabled={busy} />
        </label>
        <label htmlFor={`${id}-confirm`}>Confirm new password
          <input id={`${id}-confirm`} type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} required disabled={busy} />
        </label>
        <p>Use at least 8 characters.</p>
      </>}
      <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Please wait…' : step === 'email' ? 'Send reset OTP' : step === 'otp' ? 'Verify OTP' : 'Update password'}</button>
    </form>}
    {step === 'otp' && <div className="recovery-actions">
      <button type="button" disabled={busy || cooldown > 0} onClick={() => run(sendCode)}>{cooldown ? `Resend in ${cooldown}s` : 'Resend OTP'}</button>
      <button type="button" disabled={busy} onClick={() => { setStep('email'); setError(''); setNotice(''); }}>Change email</button>
    </div>}
    <button type="button" className="recovery-back" disabled={busy} onClick={onBack}>Back to sign in</button>
  </section>;
}
