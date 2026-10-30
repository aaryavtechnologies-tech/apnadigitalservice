import React from 'react';
import { 
  FileCheck, 
  Search, 
  MessageCircle, 
  CreditCard, 
  Vote, 
  Car, 
  Truck, 
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebsiteContent } from '../services/websiteContentService';

export default function Hero({ onOpenRequestModal, onOpenTrack }) {
  const { content } = useWebsiteContent();
  const hero = content.homepage_hero || {};
  const contact = content.contact_page || {};

  const quickServices = [
    {
      slug: 'pan-card-pdf',
      name: 'PAN Card PDF',
      badge: 'Instant Delivery',
      icon: CreditCard,
      color: '#EA580C',
      bg: '#FFF7ED'
    },
    {
      slug: 'voter-id-pdf',
      name: 'Voter ID (No OTP)',
      badge: '100% Assisted',
      icon: Vote,
      color: '#16A34A',
      bg: '#F0FDF4'
    },
    {
      slug: 'driving-licence-pdf',
      name: 'Driving Licence PDF',
      badge: 'Sarathi Verified',
      icon: Car,
      color: '#0284C7',
      bg: '#EFF6FF'
    },
    {
      slug: 'vehicle-rc-pdf',
      name: 'Vehicle RC PDF',
      badge: 'Vahan Database',
      icon: Truck,
      color: '#9333EA',
      bg: '#FAF5FF'
    }
  ];

  const cleanPhone = (contact.whatsappNumber || contact.primaryPhone1 || '8018246567').replace(/\D/g, '').slice(-10);
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=Hello%20Apna%20Digital%20Service,%20I%20need%20help%20with%20your%20services`;

  const scrollToServices = () => {
    const elem = document.getElementById('services');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-banner-section" style={{ width: '100%', padding: '0', background: '#ffffff', overflow: 'hidden' }}>
      {/* 100% Full-Width Banner Image — Zero Empty Spaces on Desktop & Mobile */}
      <div 
        className="hero-banner-image-wrapper"
        style={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          lineHeight: 0
        }}
      >
        <img 
          src={hero.bannerImageUrl || "/hero-banner.png"} 
          alt="Apna Digital Service — Digital Services, Made Simple" 
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Action CTAs Bar Directly Below Full-Width Banner */}
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '16px 20px' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            {hero.taglineBadge && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#EA580C', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '2px 10px', borderRadius: '9999px', marginBottom: '6px' }}>
                <Zap size={12} />
                <span>{hero.taglineBadge}</span>
              </div>
            )}
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
              {hero.title || hero.ctaHeadline || 'Digital Services, Made Simple.'}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '4px', lineHeight: 1.45 }}>
              {hero.subtitle || hero.ctaSubtitle || 'Submit your request online. Our backend team will assist you through the applicable process.'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ padding: '10px 18px', fontSize: '0.90rem', borderRadius: '10px', cursor: 'pointer' }}
              onClick={scrollToServices}
            >
              <FileCheck size={16} />
              <span>{hero.primaryBtnText || 'Submit Service Request'}</span>
            </button>

            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ padding: '10px 18px', fontSize: '0.90rem', borderRadius: '10px' }}
            >
              <MessageCircle size={16} />
              <span>{hero.secondaryBtnText || 'WhatsApp Help'}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
