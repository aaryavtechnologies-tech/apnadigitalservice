import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import PasswordRecoveryForm from '../components/PasswordRecoveryForm';
import { isStaffRole, resolveAccountRole } from '../lib/accountRole';
import { supabase, isSupabaseConfigured, signInWithGoogle } from '../lib/supabaseClient';

export default function AuthPage({ mode: propMode = 'login', onAuthSuccess, currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine mode from path or prop
  const initialMode = location.pathname.includes('register') || location.pathname.includes('signup') 
    ? 'signup' 
    : (propMode || 'login');

  const [mode, setMode] = useState(initialMode); // 'login', 'signup', or 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser && mode !== 'forgot') {
      navigate('/dashboard');
    }
  }, [currentUser, mode, navigate]);

  useEffect(() => {
    if (location.pathname.includes('register') || location.pathname.includes('signup')) {
      setMode('signup');
    } else if (location.pathname.includes('login')) {
      setMode('login');
    }
    setErrorMessage('');
    setInfoMessage('');
  }, [location.pathname]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage('');
    
    if (isSupabaseConfigured) {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    } else {
      setErrorMessage('Sign in is temporarily unavailable. Please contact support.'); setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
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
          setInfoMessage('Account registered successfully! Signing you in...');
          if (data?.session?.user) {
            const userObj = {
              id: data.user.id,
              email: data.user.email,
              fullName: fullName || email.split('@')[0],
              phone: phone,
              role: 'customer'
            };
            localStorage.setItem('apna_user', JSON.stringify(userObj));
            if (onAuthSuccess) onAuthSuccess(userObj);
            navigate('/dashboard');
          } else {
            setInfoMessage('Check your email to confirm your account, then sign in.');
            setMode('login');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setLoading(false);
          setErrorMessage(error.message);
        } else if (data?.user) {
          const userObj = {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            phone: data.user.user_metadata?.phone || '',
            role: await resolveAccountRole(supabase, data.user.id)
          };
          localStorage.setItem('apna_user', JSON.stringify(userObj));
          if (onAuthSuccess) onAuthSuccess(userObj);
          setLoading(false);
          navigate(isStaffRole(userObj.role) ? '/admin' : '/dashboard');
        }
      }
    } else {
      setErrorMessage('Sign in is temporarily unavailable. Please contact support.'); setLoading(false);
    }
  };

  if (mode === 'forgot') return <div className="recovery-page"><PasswordRecoveryForm initialEmail={email} onBack={() => setMode('login')} /></div>;

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
      padding: '40px 16px 60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)',
        border: '1.5px solid rgba(226, 232, 240, 0.9)',
        overflow: 'hidden'
      }}>
        {/* Brand Banner Header */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
          padding: '24px 24px 18px',
          borderBottom: '1px solid #FED7AA',
          textAlign: 'center'
        }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '8px' }}>
            <img src="/logo.png" alt="Apna Digital Service Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                APNA <span style={{ color: '#EA580C' }}>DIGITAL</span> <span style={{ color: '#16A34A' }}>SERVICE</span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Online Documentation Assistance
              </div>
            </div>
          </Link>
          <div style={{ fontSize: '0.90rem', color: '#475569', fontWeight: 600 }}>
            {mode === 'login' ? 'Customer Account Sign In' : mode === 'signup' ? 'New Customer Registration' : 'Password Reset Assistance'}
          </div>
        </div>

        {/* Mode Switch Tabs (Login vs Register) */}
        {mode !== 'forgot' && (
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            margin: '18px 24px 0',
            borderRadius: '12px'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#EA580C' : '#64748B',
                boxShadow: mode === 'login' ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); setInfoMessage(''); }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? '#EA580C' : '#64748B',
                boxShadow: mode === 'signup' ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              New Registration
            </button>
          </div>
        )}

        <div style={{ padding: '20px 24px 28px' }}>
          {/* Alerts */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#B91C1C',
              fontSize: '0.82rem',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#DCFCE7',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              color: '#15803D',
              fontSize: '0.82rem',
              marginBottom: '16px'
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="auth-name" style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Full Legal Name <span style={{ color: '#EA580C' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input id="auth-name"
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-phone" style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Mobile Number (WhatsApp Preferred) <span style={{ color: '#EA580C' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input id="auth-phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                Email Address <span style={{ color: '#EA580C' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input id="auth-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label htmlFor="auth-password" style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>
                    Password <span style={{ color: '#EA580C' }}>*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMessage(''); setInfoMessage(''); }}
                      style={{ background: 'none', border: 'none', color: '#EA580C', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <span>Sign In to Account</span>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus size={16} />
                  <span>Create Account & Continue</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#EA580C', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Social or Divider */}
          <div style={{ margin: '20px 0', position: 'relative', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #E2E8F0' }} />
            </div>
            <span style={{ position: 'relative', background: '#ffffff', padding: '0 10px', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>
              OR QUICK ACCESS
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '10px',
              borderRadius: '8px',
              border: '1.5px solid #E2E8F0',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Trust badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '20px',
            color: '#16A34A',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={14} />
            <span>256-Bit SSL Encryption • Your Data Is Protected</span>
          </div>

          {/* Return link */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#64748B', fontSize: '0.80rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={13} />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
