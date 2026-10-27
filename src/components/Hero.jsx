import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  FileCheck, 
  Clock, 
  MessageCircle, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  CreditCard,
  Vote,
  Car,
  Truck,
  Check,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero({ onOpenRequestModal }) {
  const quickServices = [
    {
      slug: 'pan-card-pdf',
      name: 'PAN Card PDF',
      badge: 'Instant Delivery',
      icon: CreditCard,
      bg: '#ffedd5',
      color: '#ea580c'
    },
    {
      slug: 'voter-id-pdf',
      name: 'Voter ID (No OTP)',
      badge: '100% Assisted',
      icon: Vote,
      bg: '#dcfce7',
      color: '#16a34a'
    },
    {
      slug: 'driving-licence-pdf',
      name: 'Driving Licence',
      badge: 'Sarathi Verified',
      icon: Car,
      bg: '#e0f2fe',
      color: '#0284c7'
    },
    {
      slug: 'vehicle-rc-pdf',
      name: 'Vehicle RC PDF',
      badge: 'Vahan Database',
      icon: Truck,
      bg: '#f3e8ff',
      color: '#9333ea'
    }
  ];

  return (
    <section className="hero-section">
      {/* Ambient Visual Glow Orbs */}
      <div className="hero-glow-orb-saffron"></div>
      <div className="hero-glow-orb-green"></div>

      <div className="hero-container">
        {/* Main Hero Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="status-dot"></span>
            <ShieldCheck size={14} style={{ color: 'var(--green-600)' }} />
            <span className="hero-badge-desktop-text">Digital Documentation & Application Assistance Platform</span>
            <span className="hero-badge-mobile-text">Assisted Document Retrieval Platform</span>
          </div>

          <h1 className="hero-title">
            Digital Services, <br />
            <span className="gradient-text">Made Simple.</span>
          </h1>

          <p className="hero-description">
            Submit details online. Our specialized backend team assists you with <strong>PAN Card, Voter ID (without OTP), Driving Licence & Vehicle RC PDF</strong> documents — delivered to your <strong>Dashboard & WhatsApp</strong>!
          </p>

          {/* 
            MOBILE-ONLY QUICK SERVICES CATCH GRID
            Visible on mobile screens so user immediately catches the 4 main services on first view!
          */}
          <div className="mobile-quick-services-grid">
            <div className="mobile-quick-header">
              <span className="quick-title">Choose Service to Download PDF</span>
              <span className="quick-sub">WhatsApp Assisted</span>
            </div>
            <div className="mobile-services-cards">
              {quickServices.map((srv, idx) => {
                const IconComp = srv.icon;
                return (
                  <Link 
                    to={`/service/${srv.slug}`} 
                    key={idx}
                    className="mobile-service-chip"
                  >
                    <div className="chip-icon-box" style={{ background: srv.bg, color: srv.color }}>
                      <IconComp size={18} />
                    </div>
                    <div className="chip-info">
                      <span className="chip-name">{srv.name}</span>
                      <span className="chip-badge">{srv.badge}</span>
                    </div>
                    <ChevronRight size={15} className="chip-arrow" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="hero-cta-group">
            <button 
              type="button" 
              className="btn-primary" 
              style={{ padding: '13px 22px', fontSize: '0.98rem' }}
              onClick={() => onOpenRequestModal()}
            >
              <FileCheck size={18} />
              <span>Submit Service Request</span>
            </button>

            <a 
              href="https://wa.me/919124494239?text=Hello%20Apna%20Digital%20Service,%20I%20need%20urgent%20document%20assistance" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ padding: '13px 20px', fontSize: '0.98rem' }}
            >
              <MessageCircle size={18} />
              <span>WhatsApp Help</span>
            </a>

            <a href="#services" className="btn-secondary desktop-only-btn" style={{ padding: '13px 20px', fontSize: '0.96rem' }}>
              <span>View All Services</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="hero-trust-row">
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>No Long Waiting</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>Voter Without OTP</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>Direct WhatsApp</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>Verified Assistance</span>
            </div>
          </div>
        </div>

        {/* Right Column: Modern Aesthetic Curved Hero Showcase */}
        <div className="hero-visual">
          <div className="hero-curved-frame">
            <div className="hero-image-curve-wrapper">
              <img 
                src="/hero-curve.jpg" 
                alt="Apna Digital Service Verified Documentation" 
                className="hero-curved-img"
              />
              <div className="hero-curve-overlay"></div>
            </div>

            {/* Floating Glassmorphic Top Badge */}
            <div className="hero-floating-glass-top">
              <div className="pulse-indicator"></div>
              <Sparkles size={16} style={{ color: '#F97316' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A' }}>
                  Fast Assistance Online
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Direct WhatsApp Delivery
                </div>
              </div>
            </div>

            {/* Floating Glassmorphic Bottom Trust Pill */}
            <div className="floating-status-pill">
              <ShieldCheck size={22} style={{ color: '#16A34A', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                  100% Verified Facilitation
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}>
                  PAN • Voter • Driving Licence • Vehicle RC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
