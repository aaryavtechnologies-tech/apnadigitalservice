import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ExternalLink,
  Lock,
  Layers,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HERO_SLIDES = [
  {
    url: '/hero-slide-1.jpg',
    tag: 'Encrypted Digital Identity Infrastructure'
  },
  {
    url: '/hero-slide-2.jpg',
    tag: 'Holographic Citizen Identity Network'
  },
  {
    url: '/hero-slide-3.jpg',
    tag: 'Cloud Verified Digital Certificates'
  },
  {
    url: '/hero-slide-4.jpg',
    tag: 'Fast Track Official e-Governance Delivery'
  }
];

export default function Hero({ onOpenRequestModal }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 3-second automatic slide rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
      {/* 
        3-SECOND SLIDING BACKGROUND LAYERS (Ken-Burns Smooth Crossfade)
        4 Professional, non-human, corporate e-governance wallpapers
      */}
      <div className="hero-slider-backdrop">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide-layer ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.url})`
            }}
          />
        ))}
        {/* Soft Modern Glass Gradient Overlay for High-Contrast Text Legibility */}
        <div className="hero-slider-overlay" />
      </div>

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

        {/* Right Column: Professional Aesthetic Curved Verification Hub (No Humans, No Cartoons) */}
        <div className="hero-visual">
          <div className="hero-curved-frame">
            {/* Main Aesthetic Curved Glass Card */}
            <div 
              className="hero-hub-card"
              style={{
                borderRadius: '32px 64px 32px 64px',
                background: 'rgba(255, 255, 255, 0.78)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.90)',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(249, 115, 22, 0.15)',
                padding: '28px 24px',
                maxWidth: '480px',
                width: '100%',
                position: 'relative'
              }}
            >
              {/* Card Header Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(226, 232, 240, 0.9)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F97316 0%, #16A34A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                      Citizen Identity Desk
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      256-Bit SSL Encrypted & Verified
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 700, color: '#15803D' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
                  <span>ONLINE</span>
                </div>
              </div>

              {/* 4 Interactive Service Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quickServices.map((srv, idx) => {
                  const IconComp = srv.icon;
                  return (
                    <Link
                      to={`/service/${srv.slug}`}
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                      }}
                      className="hero-hub-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div 
                          style={{ 
                            width: '38px', 
                            height: '38px', 
                            borderRadius: '10px', 
                            background: srv.bg, 
                            color: srv.color, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <IconComp size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                            {srv.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {srv.badge}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px', color: '#334155', fontWeight: 600 }}>
                          Get PDF
                        </span>
                        <ChevronRight size={15} style={{ color: '#94A3B8' }} />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Card Footer Micro Strip */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(226, 232, 240, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} style={{ color: '#F97316' }} /> WhatsApp Delivery in Mins
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 600 }}>
                  <Check size={14} /> 100% Genuine
                </span>
              </div>
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

      {/* 3-Second Slide Pagination Indicator Dots with Tag Display */}
      <div className="hero-slide-indicators">
        <span className="hero-indicators-label">
          <Sparkles size={13} style={{ color: '#F97316' }} />
          <span>{HERO_SLIDES[currentSlide].tag}</span>
        </span>
        <div className="hero-indicators-divider" />
        <div className="hero-indicators-dots-group">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={index}
              type="button"
              className={`hero-indicator-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              title={`Slide ${index + 1}: ${slide.tag}`}
            >
              <span className="dot-progress-fill" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
