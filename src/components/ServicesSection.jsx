import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileCheck, 
  Lock, 
  MessageCircle, 
  Clock 
} from 'lucide-react';
import ServiceIcon from './ServiceIcon';
import { useWebsiteContent } from '../services/websiteContentService';

// Authentic Indian Tri-colour Royal Themes with Radiant Specular Lighting
const THEME_CONFIG = {
  saffron: {
    bg: 'linear-gradient(135deg, #FF6F00 0%, #EA580C 45%, #C2410C 100%)',
    ambientGlow: 'radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 58%)',
    btnBg: 'linear-gradient(135deg, #FF7A00 0%, #D9480F 100%)',
    btnBorder: 'rgba(255, 255, 255, 0.35)',
    btnGlow: '0 4px 16px rgba(217, 72, 15, 0.55)',
    cardShadow: '0 16px 36px -6px rgba(234, 88, 12, 0.28), 0 6px 14px -2px rgba(0, 0, 0, 0.10)',
    badgeBg: 'rgba(255, 255, 255, 0.22)'
  },
  navy: {
    bg: 'linear-gradient(135deg, #1E3A8A 0%, #172554 45%, #0F172A 100%)',
    ambientGlow: 'radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.32) 0%, rgba(56, 189, 248, 0) 58%)',
    btnBg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    btnBorder: 'rgba(255, 255, 255, 0.35)',
    btnGlow: '0 4px 16px rgba(2, 132, 199, 0.55)',
    cardShadow: '0 16px 36px -6px rgba(2, 132, 199, 0.28), 0 6px 14px -2px rgba(0, 0, 0, 0.10)',
    badgeBg: 'rgba(255, 255, 255, 0.22)'
  },
  green: {
    bg: 'linear-gradient(135deg, #10B981 0%, #059669 45%, #047857 100%)',
    ambientGlow: 'radial-gradient(circle at 85% 15%, rgba(167, 243, 208, 0.30) 0%, rgba(167, 243, 208, 0) 58%)',
    btnBg: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    btnBorder: 'rgba(255, 255, 255, 0.35)',
    btnGlow: '0 4px 16px rgba(4, 120, 87, 0.55)',
    cardShadow: '0 16px 36px -6px rgba(16, 185, 129, 0.28), 0 6px 14px -2px rgba(0, 0, 0, 0.10)',
    badgeBg: 'rgba(255, 255, 255, 0.22)'
  }
};

// Cycle Tri-colour across the 7 services: Saffron -> Navy -> Green
const resolveCardTheme = (rawTheme, index) => {
  if (rawTheme === 'saffron' || rawTheme === 'orange') return 'saffron';
  if (rawTheme === 'navy' || rawTheme === 'blue') return 'navy';
  if (rawTheme === 'green') return 'green';
  const triCycle = ['saffron', 'navy', 'green'];
  return triCycle[index % 3];
};

// Smart highlight micro-tags for the 7 official services
const SERVICE_HIGHLIGHTS = {
  'pan-card': '⚡ Without OTP Option',
  'voter-id': '⚡ No Mobile OTP Needed',
  'driving-licence': '✓ Sarathi Verified Record',
  'vehicle-rc': '✓ Vahan Database Record',
  'ayushman-new-member': '🛡️ PM-JAY Family Addition',
  'ayushman-correction': '🛡️ Name / DOB / Edit',
  'ayushman-ekyc': '⚡ Biometric & Aadhaar e-KYC'
};

export default function ServicesSection({ services = [] }) {
  const { content } = useWebsiteContent();
  const srvContent = content.homepage_services || {};
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter out any obsolete non-requirement services (e.g. Income Tax) and inactive cards
  // STRICT RULE: Keep ONLY the 7 official services from the requirement doc
  const official7Slugs = [
    'pan-card-pdf',
    'voter-id-pdf',
    'driving-licence-pdf',
    'vehicle-rc-pdf',
    'ayushman-new-member',
    'ayushman-correction',
    'ayushman-ekyc'
  ];

  const activeServices = services
    .filter(s => s.status !== 'inactive' && s.id !== 'income-tax' && s.slug !== 'income-tax-filing')
    .filter(s => official7Slugs.includes(s.slug) || official7Slugs.includes(s.id));

  // Category Filtering
  const filteredServices = activeServices.filter(s => {
    if (activeFilter === 'identity') {
      return ['pan-card-pdf', 'voter-id-pdf', 'driving-licence-pdf', 'vehicle-rc-pdf', 'pan-card', 'voter-id', 'driving-licence', 'vehicle-rc'].includes(s.slug || s.id);
    }
    if (activeFilter === 'healthcare') {
      return (s.slug || s.id).startsWith('ayushman');
    }
    return true;
  });

  return (
    <section 
      id="services" 
      className="services-section-wrapper" 
      style={{ 
        padding: '56px 0 76px', 
        background: '#FAFBFD', 
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: '80px'
      }}
    >
      {/* Decorative Subtle Background Circuit Graphic */}
      <svg 
        aria-hidden="true" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.4
        }}
      >
        <defs>
          <linearGradient id="creativeTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#0284C7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path 
          d="M 60 180 C 140 260, 40 380, 100 520 S 140 700, 80 880" 
          stroke="url(#creativeTrackGrad)" 
          strokeWidth="2.5" 
          fill="none" 
          strokeDasharray="5 4" 
        />
        <path 
          d="M 96% 160 C 90% 320, 98% 460, 92% 620 S 96% 760, 90% 900" 
          stroke="url(#creativeTrackGrad)" 
          strokeWidth="2.5" 
          fill="none" 
          strokeDasharray="5 4" 
        />
      </svg>

      {/* Header with Title and Creative Category Chips */}
      <div 
        style={{ 
          textAlign: 'center', 
          marginBottom: '32px', 
          padding: '0 20px', 
          position: 'relative', 
          zIndex: 2 
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', padding: '5px 16px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px' }}>
          <Sparkles size={14} style={{ color: '#EA580C' }} />
          <span>{srvContent.tag || 'Official Document Downloads & Services'}</span>
        </div>

        <h2 
          style={{ 
            fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', 
            fontWeight: 800, 
            color: '#0F172A', 
            margin: '0 0 10px',
            letterSpacing: '-0.025em'
          }}
        >
          {srvContent.title || 'Explore Our Available Services'}
        </h2>

        <p 
          style={{ 
            fontSize: '0.96rem', 
            color: '#64748B', 
            maxWidth: '640px', 
            margin: '0 auto 24px',
            lineHeight: 1.55
          }}
        >
          {srvContent.subtitle || 'Fast, secure, and fully assisted online document retrieval across India. Select any service below to proceed.'}
        </p>

        {/* Creative Filter Chips Bar */}
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '9999px',
            padding: '4px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
            gap: '4px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            style={{
              background: activeFilter === 'all' ? '#0F172A' : 'transparent',
              color: activeFilter === 'all' ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 18px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🇮🇳 All Services</span>
            <span style={{ fontSize: '0.72rem', background: activeFilter === 'all' ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: activeFilter === 'all' ? '#FFFFFF' : '#64748B', padding: '1px 6px', borderRadius: '10px' }}>
              7
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('identity')}
            style={{
              background: activeFilter === 'identity' ? '#0F172A' : 'transparent',
              color: activeFilter === 'identity' ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 18px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🪪 Identity & Transport</span>
            <span style={{ fontSize: '0.72rem', background: activeFilter === 'identity' ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: activeFilter === 'identity' ? '#FFFFFF' : '#64748B', padding: '1px 6px', borderRadius: '10px' }}>
              4
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('healthcare')}
            style={{
              background: activeFilter === 'healthcare' ? '#0F172A' : 'transparent',
              color: activeFilter === 'healthcare' ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 18px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🏥 Ayushman Healthcare</span>
            <span style={{ fontSize: '0.72rem', background: activeFilter === 'healthcare' ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: activeFilter === 'healthcare' ? '#FFFFFF' : '#64748B', padding: '1px 6px', borderRadius: '10px' }}>
              3
            </span>
          </button>
        </div>
      </div>

      {/* Balanced 7-Service Creative Layout (4 on top row, 3 centered below) */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '22px',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {filteredServices.map((service, index) => {
          const themeKey = resolveCardTheme(service.cardTheme, index);
          const theme = THEME_CONFIG[themeKey] || THEME_CONFIG.saffron;
          const title = service.cardTitle || service.shortName || service.title;
          const subtitle = service.cardSubtitle || service.description?.slice(0, 72) || 'Assistance for customers who need official digital copy';
          const buttonText = service.cardButtonText || 'DOWNLOAD →';
          const fee = service.serviceCharge || '100';
          const highlightTag = SERVICE_HIGHLIGHTS[service.id] || SERVICE_HIGHLIGHTS[service.slug] || '⚡ FAST ASSISTANCE';

          return (
            <Link 
              key={service.id || service.slug} 
              to={`/service/${service.slug}`}
              id={`service-card-${service.slug}`}
              className="creative-service-card"
              style={{
                flex: '1 1 270px',
                maxWidth: '286px',
                minWidth: '260px',
                background: theme.bg,
                borderRadius: '24px',
                padding: '22px 20px 20px',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '230px',
                boxShadow: theme.cardShadow,
                border: '1.2px solid rgba(255, 255, 255, 0.22)',
                transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer'
              }}
            >
              {/* Luminous Radiant Orb Light Reflection */}
              <div 
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: theme.ambientGlow,
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />

              {/* Glass Specular Top Highlight */}
              <div 
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '45%',
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />

              {/* Translucent Watermark Icon in Corner for Depth */}
              <div 
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: '-16px',
                  bottom: '-22px',
                  opacity: 0.11,
                  transform: 'rotate(-12deg) scale(1.6)',
                  pointerEvents: 'none',
                  zIndex: 1,
                  color: '#FFFFFF'
                }}
              >
                <ServiceIcon name={service.iconName} size={110} color="#FFFFFF" />
              </div>

              {/* Top Row: 3D Squircle Icon Badge + Frosted Fee Pill */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 2,
                  marginBottom: '14px'
                }}
              >
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.16)',
                    color: '#FFFFFF',
                    flexShrink: 0
                  }}
                >
                  <ServiceIcon name={service.iconName} size={24} color="#FFFFFF" />
                </div>

                {/* Frosted Dual-Shimmer Price Pill */}
                <div 
                  style={{
                    background: 'rgba(255, 255, 255, 0.20)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.32)',
                    color: '#FFFFFF',
                    fontSize: '0.90rem',
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    letterSpacing: '0.02em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>₹{fee}</span>
                </div>
              </div>

              {/* Card Body: Feature Micro-Tag, Crisp Title, Subtitle */}
              <div 
                style={{
                  position: 'relative',
                  zIndex: 2,
                  flex: 1
                }}
              >
                {/* Micro Highlight Tag */}
                <div style={{ marginBottom: '6px' }}>
                  <span 
                    style={{
                      display: 'inline-block',
                      background: 'rgba(255, 255, 255, 0.16)',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.95)'
                    }}
                  >
                    {highlightTag}
                  </span>
                </div>

                <h3 
                  style={{
                    fontSize: '1.24rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    margin: '0 0 6px',
                    lineHeight: 1.25,
                    letterSpacing: '-0.015em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.18)'
                  }}
                >
                  {title}
                </h3>

                <p 
                  style={{
                    fontSize: '0.82rem',
                    color: 'rgba(255, 255, 255, 0.88)',
                    lineHeight: 1.42,
                    margin: '0 0 16px',
                    fontWeight: 500,
                    minHeight: '38px'
                  }}
                >
                  {subtitle}
                </p>
              </div>

              {/* Bottom Row: Pill Button with Hover Glide Animation */}
              <div 
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px'
                }}
              >
                <span 
                  className="card-action-btn"
                  style={{
                    background: theme.btnBg,
                    boxShadow: theme.btnGlow,
                    border: `1px solid ${theme.btnBorder}`,
                    color: '#FFFFFF',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{buttonText}</span>
                  <ArrowRight size={13} className="btn-arrow" />
                </span>

                <span style={{ fontSize: '0.70rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 600 }}>
                  Assisted PDF ⚡
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Creative Trust & Assurance Ribbon Bar */}
      <div 
        style={{
          maxWidth: '1080px',
          margin: '40px auto 0',
          padding: '0 20px',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(248, 250, 252, 0.90) 100%)',
            border: '1.5px solid #E2E8F0',
            borderRadius: '18px',
            padding: '16px 24px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
            <Lock size={16} style={{ color: '#0284C7' }} />
            <span>100% On-Site Native Form</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
            <Zap size={16} style={{ color: '#EA580C' }} />
            <span>Instant Tracking ID Generated</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
            <MessageCircle size={16} style={{ color: '#16A34A' }} />
            <span>Official PDF via WhatsApp</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
            <ShieldCheck size={16} style={{ color: '#2563EB' }} />
            <span>Authorized Document Retrieval</span>
          </div>
        </div>
      </div>
    </section>
  );
}
