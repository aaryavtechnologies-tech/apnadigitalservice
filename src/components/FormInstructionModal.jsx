import React from 'react';
import { X, ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import ServiceIcon from './ServiceIcon';

export default function FormInstructionModal({ isOpen, onClose, service, currentUser, onProceedToForm }) {
  if (!isOpen || !service) return null;

  const handleProceed = () => {
    // 1. Open Google Form in a new tab if URL exists
    if (service.formUrl) {
      window.open(service.formUrl, '_blank', 'noopener,noreferrer');
    }
    // 2. Trigger opening the on-site request modal so it is waiting when the user returns
    onProceedToForm(service);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--saffron-50)',
              color: 'var(--saffron-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ServiceIcon name={service.iconName} size={20} color="var(--saffron-600)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Important Submission Instructions</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{service.title}</div>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* User Account Verification Badge */}
          <div style={{
            background: 'var(--slate-100)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ minWidth: 0, flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '700' }}>
                LOGGED IN CUSTOMER ACCOUNT
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--navy-900)', wordBreak: 'break-all' }}>
                {currentUser?.email || 'customer@gmail.com'}
              </div>
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'var(--green-100)',
              color: 'var(--green-700)',
              whiteSpace: 'nowrap'
            }}>
              Verified Account
            </span>
          </div>

          {/* 2-Step Process Visual Guide */}
          <div style={{
            background: '#fff7ed',
            border: '1.5px solid #fed7aa',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            marginBottom: '22px'
          }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#9a3412', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={18} style={{ color: '#ea580c' }} />
              <span>Please follow this exact 2-step process:</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--saffron-500)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  1
                </div>
                <div style={{ fontSize: '0.88rem', color: '#7c2d12', lineHeight: '1.5' }}>
                  <strong>Fill the Google Form in the new tab:</strong> When you click the button below, the official Google Form will open in a separate window. Submit your document details using <strong>{currentUser?.email}</strong>.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--green-600)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  2
                </div>
                <div style={{ fontSize: '0.88rem', color: '#7c2d12', lineHeight: '1.5' }}>
                  <strong>Return to this website tab & confirm:</strong> When you return to this page, the website request dialog will already be open. Submit it to create your unique <strong>Tracking ID</strong> so we can verify your submission entry and update your status in your Customer Dashboard!
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="button" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.98rem' }}
            onClick={handleProceed}
          >
            <span>Proceed & Open Google Form</span>
            <ExternalLink size={17} />
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '10px' }}>
            The form opens in a new tab. When you return here, your request details will be ready to submit.
          </p>
        </div>
      </div>
    </div>
  );
}
