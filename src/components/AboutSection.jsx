import React from 'react';
import { ShieldCheck, Target, HeartHandshake, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebsiteContent } from '../services/websiteContentService';

export default function AboutSection() {
  const { content } = useWebsiteContent();
  const about = content.homepage_about || {};

  return (
    <section id="about" className="about-home-section" style={{ padding: '60px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-tag" style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' }}>
            {about.tag || 'Trusted Documentation Platform'}
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 12px' }}>
            {about.title || 'About Apna Digital Service'}
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#64748B', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            {about.subtitle || 'A privately operated online portal dedicated to making digital document retrieval and application assistance fast, transparent, and completely hassle-free across India.'}
          </p>
        </div>

        {/* High-Resolution Brand Trust Banner */}
        <div style={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
          border: '1.5px solid #E2E8F0',
          background: '#FFFFFF',
          marginBottom: '36px'
        }}>
          <img 
            src={about.bannerImageUrl || "/your-documents-our-support.png"} 
            alt="Your Documents, Our Support, Always — Apna Digital Service" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '36px'
        }}>
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '28px 24px',
            transition: 'transform 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#FFF7ED',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              {about.missionTitle || 'Our Mission'}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              {about.missionDesc || 'To simplify official document recovery for citizens by eliminating technical hurdles, long waiting periods, and complex portal navigations.'}
            </p>
          </div>

          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '28px 24px',
            transition: 'transform 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#F0FDF4',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              {about.privacyTitle || 'Privacy & Security'}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              {about.privacyDesc || 'Your personal data and uploaded proofs are handled with 256-bit encryption. We operate strictly with your consent and never share data with unauthorized parties.'}
            </p>
          </div>

          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '28px 24px',
            transition: 'transform 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#EFF6FF',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <HeartHandshake size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              {about.assistanceTitle || 'Human Assistance'}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              {about.assistanceDesc || 'Our dedicated verification executives manually check each entry, verify legitimate public records, and deliver your ready document directly to WhatsApp.'}
            </p>
          </div>
        </div>

        {/* Private Platform Disclaimer Strip */}
        <div style={{
          background: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={20} style={{ color: '#D97706', flexShrink: 0 }} />
            <div style={{ fontSize: '0.86rem', color: '#92400E', lineHeight: '1.5' }}>
              {about.disclaimerNotice || 'Important Notice: Apna Digital Service is a privately operated documentation assistance website and is NOT an official government website or affiliated with any government department.'}
            </div>
          </div>
          <Link 
            to="/about" 
            style={{ 
              fontSize: '0.84rem', 
              fontWeight: 700, 
              color: '#B45309', 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px',
              flexShrink: 0 
            }}
          >
            <span>Learn More About Us</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
