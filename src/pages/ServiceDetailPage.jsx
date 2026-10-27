import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  PhoneCall, 
  HelpCircle,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { getServiceBySlug } from '../data/servicesData';
import ServiceIcon from '../components/ServiceIcon';

export default function ServiceDetailPage({ onInitiateService }) {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <div className="section-wrapper" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '14px', color: 'var(--navy-900)' }}>
          Service Not Found
        </h2>
        <p style={{ color: 'var(--slate-600)', marginBottom: '24px' }}>
          The requested service page does not exist or may have been renamed.
        </p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="service-detail-view" style={{ background: '#f8fafc', minHeight: '80vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        
        {/* Breadcrumb Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--slate-600)', fontWeight: '600' }}>
            <ArrowLeft size={14} />
            <span>Home</span>
          </Link>
          <ChevronRight size={14} />
          <Link to="/#services" style={{ color: 'var(--slate-600)', fontWeight: '600' }}>
            Services
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--navy-900)', fontWeight: '700' }}>
            {service.shortName}
          </span>
        </nav>

        {/* Hero Card for Service */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          padding: '36px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--saffron-50)',
                border: '1.5px solid var(--saffron-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--saffron-600)',
                boxShadow: '0 6px 14px rgba(249, 115, 22, 0.12)'
              }}>
                <ServiceIcon name={service.iconName} size={32} color="var(--saffron-600)" />
              </div>

              <div>
                <span className="badge-pill" style={{
                  display: 'inline-block',
                  background: 'var(--green-50)',
                  color: 'var(--green-700)',
                  border: '1px solid var(--green-200)',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  marginBottom: '6px'
                }}>
                  {service.badge}
                </span>
                <h1 style={{ fontSize: '1.95rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '4px' }}>
                  {service.title}
                </h1>
                <div style={{ fontSize: '0.9rem', color: 'var(--saffron-600)', fontWeight: '600' }}>
                  {service.hindiTitle}
                </div>
              </div>
            </div>

            {/* Quick Action CTAs with login check & instruction flow */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {service.formUrl && (
                <button 
                  type="button"
                  className="btn-primary"
                  style={{ padding: '12px 20px', fontSize: '0.92rem' }}
                  onClick={() => onInitiateService(service, 'google-form')}
                >
                  <span>Open Google Form</span>
                  <ExternalLink size={16} />
                </button>
              )}

              <button 
                type="button" 
                className="btn-secondary"
                style={{ padding: '12px 20px', fontSize: '0.92rem' }}
                onClick={() => onInitiateService(service, 'request')}
              >
                <Send size={15} style={{ color: 'var(--saffron-600)' }} />
                <span>Submit Website Request</span>
              </button>

              <a 
                href={service.supportWhatsapp} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ padding: '12px 18px', fontSize: '0.92rem' }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp Operator</span>
              </a>
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--slate-600)', lineHeight: '1.65', maxWidth: '850px' }}>
            {service.description}
          </p>
        </div>

        {/* 2-Column Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '32px' }}>
          
          {/* Left Column: Official Workflow & Key Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Step-by-Step Workflow */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '28px'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} style={{ color: 'var(--saffron-600)' }} />
                <span>How This Service Is Processed</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {service.workflow.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--saffron-100)',
                      color: 'var(--saffron-700)',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: '0.94rem', color: 'var(--slate-700)', lineHeight: '1.55' }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features & Benefits */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '28px'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--green-600)' }} />
                <span>Service Benefits & Features</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {service.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--navy-800)' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--green-50)',
                      color: 'var(--green-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      ✓
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Disclaimer Box */}
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start'
            }}>
              <HelpCircle size={22} style={{ color: '#b45309', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '800', color: '#92400e', fontSize: '0.92rem', marginBottom: '4px' }}>
                  Specific Service Notice & Disclaimer
                </div>
                <div style={{ fontSize: '0.86rem', color: '#78350f', lineHeight: '1.5' }}>
                  {service.disclaimer}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Required Documents, Helplines & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Required Identification Information */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '26px'
            }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck2 size={18} style={{ color: 'var(--saffron-600)' }} />
                <span>Required Details / Documents</span>
              </h3>

              <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginBottom: '14px' }}>
                Please keep the following ready before submitting your request:
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {service.requirements.map((req, idx) => (
                  <li key={idx} style={{
                    fontSize: '0.86rem',
                    color: 'var(--navy-800)',
                    background: 'var(--slate-50)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: 'var(--saffron-600)', fontWeight: '800' }}>•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Operator Support Contact Box */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #fff7ed 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green-700)', fontWeight: '700', fontSize: '0.82rem', marginBottom: '8px' }}>
                <ShieldCheck size={16} />
                <span>DEDICATED SERVICE OPERATOR</span>
              </div>

              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--navy-900)' }}>
                Have questions before applying?
              </h4>

              <p style={{ fontSize: '0.86rem', color: 'var(--slate-600)', marginBottom: '16px', lineHeight: '1.5' }}>
                Our assigned operator is available daily from 9:00 AM to 9:00 PM IST to assist you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a 
                  href={`tel:${service.supportPhone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    color: 'var(--navy-900)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhoneCall size={16} style={{ color: 'var(--saffron-600)' }} />
                    <span>Call Operator</span>
                  </span>
                  <span>{service.supportPhone}</span>
                </a>

                <a 
                  href={service.supportWhatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ justifyContent: 'center' }}
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Ready to Apply Action */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--navy-900)' }}>
                Ready to Submit?
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginBottom: '16px' }}>
                Submit details and generate your Application ID for tracking.
              </p>

              <button 
                type="button" 
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={() => onInitiateService(service, 'request')}
              >
                <Send size={15} />
                <span>Submit Website Request</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
