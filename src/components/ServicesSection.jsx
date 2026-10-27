import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  Send, 
  Check, 
  MessageCircle, 
  ArrowRight 
} from 'lucide-react';
import ServiceIcon from './ServiceIcon';

export default function ServicesSection({ services = [], onInitiateService }) {
  // Only display services that are active AND have an active Google Form link configured.
  // Any upcoming service without a Google Form link is kept hidden until configured by Super Admin.
  const activeServices = services.filter(
    (s) => s.status !== 'inactive' && Boolean(s.formUrl && s.formUrl.trim())
  );

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

      {/* Dynamic Services Grid (Only Active Services with Google Form Links) */}
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
            {Array.isArray(service.features) && service.features.length > 0 && (
              <ul className="service-highlights-list">
                {service.features.slice(0, 3).map((item, idx) => (
                  <li key={idx}>
                    <Check size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Dedicated Support Contact */}
            <div className="service-support-contact">
              <span>Assigned Support:</span>
              <a 
                href={service.supportWhatsapp || `https://wa.me/91${service.supportPhone || '9124494239'}`} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
              >
                <MessageCircle size={14} />
                <span>{service.supportPhone || '9124494239'}</span>
              </a>
            </div>

            {/* Direct Action Buttons */}
            <div className="service-actions-row">
              {/* Every service has View Service linking to its own dedicated page */}
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
    </section>
  );
}
