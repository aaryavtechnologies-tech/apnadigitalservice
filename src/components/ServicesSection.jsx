import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  Send, 
  Check, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  ChevronRight 
} from 'lucide-react';
import ServiceIcon from './ServiceIcon';

export default function ServicesSection({ services = [], onInitiateService }) {
  const activeServices = services.filter(s => s.status === 'active');
  const phase2Services = services.filter(s => s.status === 'phase2');

  return (
    <section id="services" className="section-wrapper">
      <div className="section-header">
        <span className="section-tag">Direct Assisted Services</span>
        <h2 className="section-title">
          Essential Document Downloads & Assistance
        </h2>
        <p className="section-subtitle">
          Submit details online and receive official PDF documents directly on WhatsApp. 
          Select any service below to view instructions, complete the Google Form, or track status.
        </p>
      </div>

      {/* Dynamic Active Services Grid */}
      <div className="services-grid">
        {activeServices.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-card-top">
              <div className="service-card-icon">
                <ServiceIcon name={service.iconName} size={28} color="var(--saffron-600)" />
              </div>
              <span className="service-badge">
                {service.badge}
              </span>
            </div>

            <h3 className="service-card-title">
              <Link to={`/service/${service.slug}`} style={{ color: 'inherit' }}>
                {service.title}
              </Link>
            </h3>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--saffron-600)', fontWeight: '600', marginBottom: '8px' }}>
              {service.hindiTitle}
            </div>

            <p className="service-card-desc">{service.description}</p>

            {/* Key Service Highlights */}
            <ul className="service-highlights-list">
              {service.features.slice(0, 3).map((item, idx) => (
                <li key={idx}>
                  <Check size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Dedicated Support Contact */}
            <div className="service-support-contact">
              <span>Assigned Support:</span>
              <a 
                href={service.supportWhatsapp} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
              >
                <MessageCircle size={14} />
                <span>{service.supportPhone}</span>
              </a>
            </div>

            {/* Direct Action Buttons */}
            <div className="service-actions-row">
              {/* Appropriate button label as requested: "View Service" */}
              <Link 
                to={`/service/${service.slug}`}
                className="btn-form-link"
                style={{ background: 'var(--navy-900)' }}
              >
                <span>View Service</span>
                <ArrowRight size={15} />
              </Link>

              <div style={{ display: 'grid', gridTemplateColumns: service.formUrl ? '1fr 1fr' : '1fr', gap: '8px' }}>
                {service.formUrl && (
                  <button 
                    type="button" 
                    className="btn-website-request"
                    style={{ fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => onInitiateService(service, 'google-form')}
                  >
                    <span>Google Form</span>
                    <ExternalLink size={13} />
                  </button>
                )}

                <button 
                  type="button" 
                  className="btn-website-request"
                  style={{ fontSize: '0.8rem', justifyContent: 'center' }}
                  onClick={() => onInitiateService(service, 'request')}
                >
                  <Send size={13} />
                  <span>Submit Request</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phase 2 Services Suite */}
      {phase2Services.length > 0 && (
        <div style={{ marginTop: '54px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Sparkles size={20} style={{ color: 'var(--saffron-600)' }} />
            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--navy-900)' }}>
              Upcoming Modules (View Requirements & Information)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {phase2Services.map((service) => (
              <div key={service.id} style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-fast)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--slate-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--navy-800)'
                    }}>
                      <ServiceIcon name={service.iconName} size={20} color="var(--navy-800)" />
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: 'var(--saffron-100)',
                      color: 'var(--saffron-700)'
                    }}>
                      {service.badge}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '4px' }}>
                    {service.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '10px' }}>
                    {service.hindiTitle}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {service.description}
                  </p>
                </div>

                <Link 
                  to={`/service/${service.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    color: 'var(--saffron-600)',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <span>View Service</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
