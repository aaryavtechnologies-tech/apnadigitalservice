import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  KeyRound,
  Send
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

export default function AdminLoginPage() {
  const { adminUser, role, isAdmin, adminSignIn, sendAdminOtp, verifyAdminOtp } = useAdminAuth();
  const navigate = useNavigate();

  // Mode: 'password' | 'forgot_request' | 'forgot_verify'
  const [mode, setMode] = useState('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If user clicks the email magic link or is already signed in as admin, redirect to /admin
  React.useEffect(() => {
    if (isAdmin && adminUser) {
      navigate('/admin');
    }
  }, [isAdmin, adminUser, navigate]);

  // Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await adminSignIn(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  // Request OTP for Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await sendAdminOtp(email);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(`A secure login link and 6-digit OTP code have been dispatched to ${email}. You can click the link in your email to log in directly, or enter the code below.`);
      setMode('forgot_verify');
    } else {
      setErrorMessage(res.error || 'Failed to send OTP. Make sure your email is registered in Supabase.');
    }
  };

  // Verify OTP and Sign In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpToken) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await verifyAdminOtp(email, otpToken);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMessage(res.error || 'Invalid or expired OTP code. Please try again.');
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-box">
        {/* Brand Header */}
        <div className="admin-login-brand">
          <img src="/logo.png" alt="Apna Digital Service Logo" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: '#0F172A' }}>
            APNA DIGITAL SERVICE
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Unified Admin & Super Admin Portal
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div 
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              fontSize: '0.84rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div 
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#DCFCE7',
              border: '1px solid #BBF7D0',
              color: '#15803D',
              fontSize: '0.84rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. PASSWORD SIGN IN MODE */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <div className="admin-input-group">
              <label htmlFor="admin-email">Registered Admin Email</label>
              <input 
                id="admin-email"
                type="email" 
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="admin-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="admin-pass">Password</label>
                <button 
                  type="button" 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--admin-saffron)', 
                    fontSize: '0.78rem', 
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  onClick={() => {
                    setMode('forgot_request');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  Forgot Password / OTP Login?
                </button>
              </div>
              <input 
                id="admin-pass"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '11px', marginTop: '10px', fontSize: '0.92rem' }}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="spinner" /> : <Lock size={16} />}
              <span>Sign In to Admin Portal</span>
            </button>
          </form>
        )}

        {/* 2. FORGOT PASSWORD / REQUEST OTP MODE */}
        {mode === 'forgot_request' && (
          <form onSubmit={handleRequestOtp}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                Sign In with One-Time Password (OTP)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                Enter your registered admin email address. We will dispatch a 6-digit OTP code directly to your email.
              </div>
            </div>

            <div className="admin-input-group">
              <label htmlFor="otp-email">Admin Email Address</label>
              <input 
                id="otp-email"
                type="email" 
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '11px', marginTop: '10px', fontSize: '0.92rem' }}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="spinner" /> : <Send size={16} />}
              <span>Send 6-Digit OTP to Email</span>
            </button>

            <button 
              type="button" 
              className="admin-btn admin-btn-secondary"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={() => {
                setMode('password');
                setErrorMessage('');
              }}
            >
              Back to Password Sign In
            </button>
          </form>
        )}

        {/* 3. VERIFY OTP CODE MODE */}
        {mode === 'forgot_verify' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                Enter OTP or Click Email Link
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                Click the direct login link sent to <strong style={{ color: '#0F172A' }}>{email}</strong>, or enter the 6-digit code below.
              </div>
            </div>

            <div className="admin-input-group">
              <label htmlFor="otp-token">6-Digit OTP Code</label>
              <input 
                id="otp-token"
                type="text" 
                placeholder="123456"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.trim())}
                maxLength={8}
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.25em', fontWeight: 800 }}
                required
              />
            </div>

            <button 
              type="submit" 
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '11px', marginTop: '10px', fontSize: '0.92rem' }}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="spinner" /> : <KeyRound size={16} />}
              <span>Verify OTP & Sign In</span>
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer' }}
                onClick={() => setMode('forgot_request')}
              >
                Change Email
              </button>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--admin-saffron)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                onClick={handleRequestOtp}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Back to site */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              color: '#64748B', 
              fontSize: '0.84rem', 
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Customer Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
