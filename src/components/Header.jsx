import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  User, 
  UserPlus,
  MessageCircle, 
  Menu, 
  X, 
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Sparkles,
  LayoutDashboard,
  Home,
  Layers,
  HelpCircle,
  Phone,
  Info,
  LogOut,
  Crown
} from 'lucide-react';
import { useWebsiteContent } from '../services/websiteContentService';

export default function Header({ onOpenAuth, onOpenLogin, onOpenRegister, onOpenTrack, currentUser, onSignOut }) {
  const { content } = useWebsiteContent();
  const announcementText = content.announcement?.text;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => setMobileMenuOpen(false);

  const handleLoginClick = () => {
    if (onOpenLogin) onOpenLogin();
    else if (onOpenAuth) onOpenAuth('login');
  };

  const handleRegisterClick = () => {
    if (onOpenRegister) onOpenRegister();
    else if (onOpenAuth) onOpenAuth('signup');
  };

  const isAdminUser = currentUser?.role === 'super_admin' || 
                      currentUser?.role === 'admin';

  const whatsappUrl = "https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20help%20with%20your%20services";

  return (
    <>
      {/* Top Announcement Ribbon */}
      <div className="top-announcement">
        <div className="top-announcement-ticker">
          <div className="ticker-track">
            {[0, 1].map((copyIdx) => (
              <div key={copyIdx} className="ticker-content" aria-hidden={copyIdx === 1}>
                <span className="ticker-badge">
                  <Sparkles size={12} />
                  <span>Assisted Portal</span>
                </span>
                <span className="ticker-text">
                  {announcementText || (
                    <>Welcome to <strong>Apna Digital Service</strong> — Authorized digital assistance for PAN Card, Voter ID (without OTP), Driving Licence, and Vehicle RC PDF documents.</>
                  )}
                </span>
                <span className="ticker-sep">•</span>
                <span className="ticker-text">
                  Instant Tracking ID generated on every request • Dedicated WhatsApp dispatch directly to your phone.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="main-header navbar-header">
        <div className="header-container nav-container">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="brand-wrapper" onClick={closeMobile}>
            <img 
              src="/logo.png" 
              alt="Apna Digital Service Logo" 
              className="brand-logo-img"
            />
            <div className="brand-text-block">
              <span className="brand-title">
                APNA <span className="saffron">DIGITAL</span> <span className="green">SERVICE</span>
              </span>
              <span className="brand-subtitle">Online Documentation Assistance</span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Visible on Desktop (> 1080px) */}
          <nav className="nav-links">
            <Link 
              to="/" 
              className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/#services" 
              className={`nav-link-item ${location.pathname === '/services' || location.hash === '#services' ? 'active' : ''}`}
            >
              Services
            </Link>
            <Link 
              to="/how-it-works" 
              className={`nav-link-item ${location.pathname === '/how-it-works' ? 'active' : ''}`}
            >
              How It Works
            </Link>
            <Link 
              to="/about" 
              className={`nav-link-item ${location.pathname === '/about' ? 'active' : ''}`}
            >
              About
            </Link>
            <Link 
              to="/faq" 
              className={`nav-link-item ${location.pathname === '/faq' ? 'active' : ''}`}
            >
              FAQ
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link-item ${location.pathname === '/contact' ? 'active' : ''}`}
            >
              Contact
            </Link>

            {/* WhatsApp Help Button in Navigation (Near Contact) */}
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-whatsapp-help-btn"
              title="Official Apna Digital Service WhatsApp Support"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Help</span>
            </a>
          </nav>

          <a href={whatsappUrl} className="mobile-header-help" target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp Help</a>
          {/* Header Action Buttons */}
          <div className="nav-actions">
            {/* Track Request Button */}
            <button 
              type="button" 
              className="btn-header-track desktop-only-btn"
              onClick={onOpenTrack}
              title="Track request with Tracking ID"
            >
              <Search size={15} />
              <span>Track Request</span>
            </button>

            {/* Super Admin Quick Badge / Link */}
            {isAdminUser && (
              <Link 
                to="/admin" 
                className="btn-header-admin-badge"
                title="Open Super Admin Operations Portal"
              >
                <Crown size={14} style={{ color: '#D97706' }} />
                <span>Super Admin</span>
              </Link>
            )}

            {/* User Account State: Profile Icon or Separate Login & New Registration buttons */}
            {currentUser ? (
              <div className="user-nav-group">
                <Link 
                  to={isAdminUser ? "/admin" : "/dashboard"}
                  className="header-profile-icon-btn"
                  title={isAdminUser ? `Super Admin Portal (${currentUser.email})` : `Customer Dashboard (${currentUser.fullName || currentUser.email})`}
                  onClick={closeMobile}
                  aria-label={isAdminUser ? "Go to Super Admin Portal" : "Go to Customer Dashboard"}
                >
                  <div className="profile-icon-avatar" style={isAdminUser ? { background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#fff' } : {}}>
                    {isAdminUser ? (
                      <Crown size={16} />
                    ) : currentUser.fullName ? (
                      currentUser.fullName.charAt(0).toUpperCase()
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <span className="profile-status-dot" style={isAdminUser ? { background: '#F59E0B' } : {}} title="Active Account"></span>
                </Link>

                <button 
                  type="button" 
                  onClick={onSignOut}
                  className="logout-header-btn desktop-only-btn"
                  title="Sign out of account"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              /* SEPARATE, CLEARLY VISIBLE LOGIN & NEW REGISTRATION BUTTONS (VISIBLE ON DESKTOP & MOBILE HEADER) */
              <div className="auth-header-btn-group">
                <Link 
                  to="/login" 
                  className="btn-header-login"
                  onClick={closeMobile}
                  title="Sign In to your account"
                >
                  <User size={14} />
                  <span>Login</span>
                </Link>

                <Link 
                  to="/register" 
                  className="btn-header-register"
                  onClick={closeMobile}
                  title="Create New Customer Account"
                >
                  <UserPlus size={14} />
                  <span>New Registration</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-hamburger"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Backdrop & Drawer Navigation */}
        {mobileMenuOpen && (
          <>
            <div 
              className="mobile-backdrop"
              onClick={closeMobile}
              aria-hidden="true"
            />
            <div className="mobile-nav-drawer">
              {/* User profile strip inside mobile menu */}
              {currentUser && (
                <div className="mobile-user-card">
                  <div className="mobile-user-avatar">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="mobile-user-info">
                    <div className="mobile-user-name">{currentUser.fullName || 'Valued Customer'}</div>
                    <div className="mobile-user-email">{currentUser.email}</div>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="mobile-dashboard-link"
                    onClick={closeMobile}
                  >
                    Dashboard
                  </Link>
                  <button 
                    type="button" 
                    onClick={() => { closeMobile(); onSignOut(); }}
                    className="mobile-logout-icon-btn"
                    title="Sign Out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              )}

              {!currentUser && (
                <div className="mobile-auth-actions">
                  <Link to="/login" className="btn-header-login" onClick={closeMobile}>
                    <User size={14} />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="btn-header-register" onClick={closeMobile}>
                    <UserPlus size={14} />
                    <span>New Registration</span>
                  </Link>
                </div>
              )}

              {/* Navigation Links — Compact & perfectly proportioned for mobile view */}
              <div className="mobile-links-list">
                <Link to="/" className={`mobile-link-item ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMobile}>
                  <Home size={16} />
                  <span>Home</span>
                </Link>
                <Link to="/#services" className={`mobile-link-item ${location.pathname === '/services' || location.hash === '#services' ? 'active' : ''}`} onClick={closeMobile}>
                  <Layers size={16} />
                  <span>Services</span>
                </Link>
                <Link to="/how-it-works" className={`mobile-link-item ${location.pathname === '/how-it-works' ? 'active' : ''}`} onClick={closeMobile}>
                  <HelpCircle size={16} />
                  <span>How It Works</span>
                </Link>
                <Link to="/about" className={`mobile-link-item ${location.pathname === '/about' ? 'active' : ''}`} onClick={closeMobile}>
                  <Info size={16} />
                  <span>About Apna Digital Service</span>
                </Link>
                <Link to="/faq" className={`mobile-link-item ${location.pathname === '/faq' ? 'active' : ''}`} onClick={closeMobile}>
                  <FileText size={16} />
                  <span>Frequently Asked Questions</span>
                </Link>
                <Link to="/contact" className={`mobile-link-item ${location.pathname === '/contact' ? 'active' : ''}`} onClick={closeMobile}>
                  <Phone size={16} />
                  <span>Contact & Support</span>
                </Link>
              </div>

              {/* Super Admin Quick Badge inside Mobile Menu */}
              {isAdminUser && (
                <Link 
                  to="/admin" 
                  className="mobile-admin-btn"
                  onClick={closeMobile}
                >
                  <Crown size={15} style={{ color: '#D97706' }} />
                  <span>Open Super Admin Portal</span>
                </Link>
              )}

              {/* Compact 2-Column Action Bar: Track Request & WhatsApp Help */}
              <div className="mobile-quick-actions-grid">
                <button 
                  type="button" 
                  className="mobile-quick-track-btn"
                  onClick={() => { closeMobile(); onOpenTrack(); }}
                >
                  <Search size={15} />
                  <span>Track Request</span>
                </button>

                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mobile-quick-wa-btn"
                  onClick={closeMobile}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Help</span>
                </a>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
