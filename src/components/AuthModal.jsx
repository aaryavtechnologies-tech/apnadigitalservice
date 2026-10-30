import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured, signInWithGoogle } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, pendingActionNotice, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode || 'login'); // 'login', 'signup', or 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Sync mode with initialMode when modal opens or initialMode changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      setErrorMessage('');
      setInfoMessage('');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage('');
    
    if (isSupabaseConfigured) {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message);
      }
    } else {
      // Friendly simulation when Supabase keys are pending in .env
      setTimeout(() => {
        const mockUser = {
          id: 'google-user-' + Date.now(),
          email: email || 'citizen@gmail.com',
          fullName: 'Google User',
          phone: '8018246567',
          provider: 'google'
        };
        localStorage.setItem('apna_user', JSON.stringify(mockUser));
        onAuthSuccess(mockUser);
        setLoading(false);
        onClose();
      }, 600);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      setLoading(false);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setInfoMessage('Password reset link sent! Please check your email inbox.');
      }
    } else {
      setTimeout(() => {
        setLoading(false);
        setInfoMessage('In production, Supabase sends a secure reset link to your email.');
      }, 500);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (mode === 'forgot') {
      return handleResetPassword(e);
    }
    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    if (isSupabaseConfigured) {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });
        setLoading(false);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setInfoMessage('Account created successfully! Please sign in with your credentials.');
          setMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setErrorMessage(error.message);
        } else if (data?.user) {
          const userObj = {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            phone: data.user.user_metadata?.phone || ''
          };
          localStorage.setItem('apna_user', JSON.stringify(userObj));
          onAuthSuccess(userObj);
          onClose();
        }
      }
    } else {
      // Safe local mock flow
      setTimeout(() => {
        const userObj = {
          id: 'user-' + Date.now(),
          email: email || 'customer@gmail.com',
          fullName: fullName || email.split('@')[0] || 'Customer',
          phone: phone || '8018246567'
        };
        localStorage.setItem('apna_user', JSON.stringify(userObj));
        onAuthSuccess(userObj);
        setLoading(false);
        onClose();
      }, 500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Apna Digital Service" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, color: '#0F172A' }}>
                {mode === 'login' ? 'Customer Sign In' : mode === 'signup' ? 'New Customer Registration' : 'Reset Password'}
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Apna Digital Service Portal
              </div>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Subtle Security Badge */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <ShieldCheck size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 600 }}>
              Official 256-Bit Encrypted Platform • Track Requests Anytime
            </div>
          </div>

          {/* Mode Switch Tabs: Clearly visible */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--slate-100)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '18px'
          }}>
            <button 
              type="button" 
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              style={{
                padding: '9px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.86rem',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? 'var(--navy-900)' : 'var(--slate-500)',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button 
              type="button" 
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              style={{
                padding: '9px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.86rem',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? 'var(--navy-900)' : 'var(--slate-500)',
                boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              New Registration
            </button>
          </div>

          {/* Social Sign In (Google OAuth) */}
          <button 
            type="button" 
            onClick={handleGoogleAuth}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '11px',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              fontSize: '0.90rem',
              fontWeight: '600',
              color: 'var(--navy-800)',
              marginBottom: '16px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '14px 0',
            color: 'var(--slate-400)',
            fontSize: '0.76rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>or with email & password</span>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              marginBottom: '14px'
            }}>
              {errorMessage}
            </div>
          )}

          {infoMessage && (
            <div style={{
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              marginBottom: '14px'
            }}>
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleEmailAuth}>
            {mode === 'signup' && (
              <>
                <div className="form-field">
                  <label className="form-label">
                    Full Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter your full legal name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    WhatsApp Mobile Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="10-digit WhatsApp number for updates"
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </>
            )}

            <div className="form-field">
              <label className="form-label">
                Email Address <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <span className="form-helper-text" style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Used to dispatch your Tracking ID and verified document updates
              </span>
            </div>

            {mode !== 'forgot' && (
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: 'var(--saffron-600)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage('');
                        setInfoMessage('');
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Enter password (minimum 6 characters)"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px' }}
              disabled={loading}
            >
              {loading 
                ? 'Processing...' 
                : mode === 'login' 
                  ? 'Sign In & Access Dashboard' 
                  : mode === 'signup' 
                    ? 'Register New Account' 
                    : 'Send Password Reset Link'}
            </button>

            {mode === 'forgot' && (
              <button 
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
              >
                Back to Sign In
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
