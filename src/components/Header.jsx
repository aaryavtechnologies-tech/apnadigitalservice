import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  User, 
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
  LogOut
} from 'lucide-react';

export default function Header({ onOpenAuth, onOpenTrack, currentUser, onSignOut }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Top Announcement Ribbon — Continuous Infinite Sliding Ticker Marquee */}
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
                  ⚡ PAN, Voter ID, DL & Vehicle RC PDF — Direct on WhatsApp Assistance
                </span>
                <a 
                  href="https://wa.me/919124494239" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ticker-link"
                >
                  <span>WhatsApp Support</span>
                  <ExternalLink size={12} />
                </a>
                <span className="ticker-sep">•</span>
                <span className="ticker-badge ticker-badge-green">
                  <span>⏱️ 10-15 Min Delivery</span>
                </span>
                <span className="ticker-text">
                  Direct PDF to your Dashboard & WhatsApp
                </span>
                <span className="ticker-sep">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="navbar-header">
        <div className="nav-container">
          
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
              <span className="brand-subtitle">Apna Pan Agency • Digital Assistance</span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Strictly Visible on Desktop (> 960px) */}
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
          </nav>

          {/* Header Action Buttons */}
          <div className="nav-actions">
            {/* Track Request (Desktop only in top bar) */}
            <button 
              type="button" 
              className="btn-header-track desktop-only-btn"
              onClick={onOpenTrack}
              title="Track existing application"
            >
              <Search size={15} />
              <span>Track Request</span>
            </button>

            {/* User Account State: As requested, sleek PROFILE ICON instead of text username */}
            {currentUser ? (
              <div className="user-nav-group">
                <Link 
                  to="/dashboard"
                  className="header-profile-icon-btn"
                  title={`Customer Dashboard (${currentUser.fullName || currentUser.email})`}
                  onClick={closeMobile}
                  aria-label="Go to Customer Dashboard"
                >
                  <div className="profile-icon-avatar">
                    {currentUser.fullName ? (
                      currentUser.fullName.charAt(0).toUpperCase()
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <span className="profile-status-dot" title="Active Account"></span>
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
              <button 
                type="button" 
                className="btn-header-login"
                onClick={onOpenAuth}
                title="Login / Register"
              >
                <User size={15} />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Hamburger Button — Visible on <= 960px */}
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-hamburger"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
                </div>
              )}

              {/* Navigation Links */}
              <div className="mobile-links-list">
                <Link to="/" className="mobile-link-item" onClick={closeMobile}>
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Link to="/#services" className="mobile-link-item" onClick={closeMobile}>
                  <Layers size={18} />
                  <span>Services & Assisted Downloads</span>
                </Link>
                <Link to="/how-it-works" className="mobile-link-item" onClick={closeMobile}>
                  <HelpCircle size={18} />
                  <span>How It Works</span>
                </Link>
                <Link to="/about" className="mobile-link-item" onClick={closeMobile}>
                  <Info size={18} />
                  <span>About Apna Digital Service</span>
                </Link>
                <Link to="/faq" className="mobile-link-item" onClick={closeMobile}>
                  <FileText size={18} />
                  <span>Frequently Asked Questions</span>
                </Link>
                <Link to="/contact" className="mobile-link-item" onClick={closeMobile}>
                  <Phone size={18} />
                  <span>Contact & Support</span>
                </Link>
              </div>

              {/* Mobile Drawer Actions */}
              <div className="mobile-drawer-actions">
                <button 
                  type="button" 
                  className="mobile-action-btn mobile-track-btn"
                  onClick={() => { closeMobile(); onOpenTrack(); }}
                >
                  <Search size={16} />
                  <span>Track Application Status</span>
                </button>

                {currentUser ? (
                  <button 
                    type="button" 
                    className="mobile-action-btn mobile-logout-btn"
                    onClick={() => { closeMobile(); onSignOut(); }}
                  >
                    <LogOut size={16} />
                    <span>Logout Account</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="mobile-action-btn mobile-login-btn"
                    onClick={() => { closeMobile(); onOpenAuth(); }}
                  >
                    <User size={16} />
                    <span>Login / Register (Use Google Email)</span>
                  </button>
                )}

                <a 
                  href="https://wa.me/919124494239" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ justifyContent: 'center', width: '100%', padding: '12px' }}
                >
                  <MessageCircle size={18} />
                  <span>Official WhatsApp Helpline (9124494239)</span>
                </a>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
