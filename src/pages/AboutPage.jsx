import React from 'react';
import { ShieldCheck, Target, HeartHandshake, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '50px 24px 80px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-tag">About Our Platform</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '8px', marginBottom: '16px' }}>
            About Apna Digital Service
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
            A privately operated online platform designed to make digital documentation and related assistance convenient, fast, and accessible across India.
          </p>
        </div>

        {/* Core Description Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          padding: '36px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px',
          lineHeight: '1.7',
          color: 'var(--navy-800)',
          fontSize: '1.02rem'
        }}>
          <p style={{ marginBottom: '18px' }}>
            <strong>Apna Digital Service</strong> is a privately operated online platform designed to make digital documentation and related assistance more convenient for customers across India.
          </p>
          <p style={{ marginBottom: '18px' }}>
            Our platform allows customers to submit service requests and required information online. Our backend team reviews each request and provides assistance through applicable authorized systems and procedures.
          </p>
          <p>
            We aim to offer a simple, organized, and customer-friendly experience through online request submission, service updates, and dedicated support.
          </p>
        </div>

        {/* Mission & Approach Cards */}
        <div className="about-cards-grid">
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '30px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--saffron-50)',
              color: 'var(--saffron-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Target size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--navy-900)' }}>
              Our Mission
            </h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--slate-600)', lineHeight: '1.65' }}>
              To make digital documentation assistance more accessible and convenient through a reliable online service experience for every citizen.
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '30px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--green-50)',
              color: 'var(--green-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <HeartHandshake size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--navy-900)' }}>
              Our Approach
            </h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--slate-600)', lineHeight: '1.65' }}>
              Simple online requests, responsible document handling, transparent service information, and customer-focused daily support.
            </p>
          </div>
        </div>

        {/* Important Disclaimer Notice */}
        <div className="compliance-disclaimer-box" style={{ margin: '0 0 36px' }}>
          <div className="disclaimer-icon">
            <HelpCircle size={26} />
          </div>
          <div className="disclaimer-text">
            <h4>Important Platform Disclaimer</h4>
            <p>
              Apna Digital Service is a private business platform and is <strong>NOT a government website, government department, or official government portal</strong>. We do not guarantee approval or issuance of any government document.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#ffffff' }}>
            Explore Our Digital Services
          </h3>
          <p style={{ color: 'var(--slate-400)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Choose from our active assistance modules for PAN Card, Voter ID, Driving Licence, and Vehicle RC.
          </p>
          <Link to="/#services" className="btn-primary" style={{ display: 'inline-flex' }}>
            <span>View All Services</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
