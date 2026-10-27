import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ExternalLink, Copy, Check, Send, AlertCircle, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActiveServices } from '../data/servicesData';
import { saveServiceRequest } from '../lib/supabaseClient';

export default function RequestModal({ isOpen, onClose, initialService, currentUser, onNavigateDashboard }) {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const allServices = getActiveServices();
  const [selectedServiceId, setSelectedServiceId] = useState(initialService?.id || allServices[0]?.id || 'voter-id');
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
    if (currentUser?.fullName && !fullName) {
      setFullName(currentUser.fullName);
    }
    if (currentUser?.phone && !phone) {
      setPhone(currentUser.phone);
    }
    if (initialService?.id) {
      setSelectedServiceId(initialService.id);
    }
  }, [currentUser, initialService]);

  const selectedService = allServices.find(s => s.id === selectedServiceId) || allServices[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptedDisclaimer) {
      alert('Please accept the declaration to continue.');
      return;
    }

    // Generate unique Application ID
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const appId = `APNA-2026-${randomDigits}`;

    const newApplication = {
      appId,
      userId: currentUser?.id || 'guest',
      serviceId: selectedService.id,
      serviceSlug: selectedService.slug,
      serviceName: selectedService.title,
      formUrl: selectedService.formUrl,
      supportPhone: selectedService.supportPhone,
      fullName: fullName.trim() || (currentUser?.fullName || 'Valued Customer'),
      email: (currentUser?.email || email).trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      status: 'Request Received',
      operatorNote: 'Website request record created. We will verify your Google Form response.',
      documentName: null
    };

    // Save application to Supabase & localStorage
    saveServiceRequest(newApplication);

    setSubmittedApp(newApplication);
  };

  const handleCopy = () => {
    if (submittedApp) {
      navigator.clipboard.writeText(submittedApp.appId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setSubmittedApp(null);
    onClose();
  };

  const handleGoToDashboard = () => {
    handleClose();
    if (onNavigateDashboard) {
      onNavigateDashboard();
    } else {
      navigate('/dashboard');
    }
  };

  const activeEmail = currentUser?.email || email || 'customer@gmail.com';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-dialog request-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--navy-900)' }}>
              {submittedApp ? 'Request Registered' : 'Confirm Service Request'}
            </span>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {submittedApp ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ 
                width: '52px', 
                height: '52px', 
                borderRadius: '50%', 
                background: 'var(--green-100)', 
                color: 'var(--green-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <CheckCircle size={30} />
              </div>

              <h4 style={{ fontSize: '1.18rem', fontWeight: '800', marginBottom: '6px', color: 'var(--navy-900)' }}>
                Application Registered!
              </h4>

              <p style={{ fontSize: '0.86rem', color: 'var(--slate-600)', marginBottom: '16px', lineHeight: '1.5' }}>
                Your request is saved to your Customer Dashboard. We will verify your Google Form and upload your verified PDF.
              </p>

              <div style={{
                background: 'var(--slate-100)',
                border: '1.5px dashed var(--saffron-500)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                marginBottom: '18px'
              }}>
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '700' }}>YOUR APPLICATION ID</div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.03em', color: 'var(--navy-900)', wordBreak: 'break-all' }}>
                    {submittedApp.appId}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={handleCopy}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: copied ? 'var(--green-600)' : 'var(--navy-800)',
                    flexShrink: 0
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ justifyContent: 'center', padding: '11px', fontSize: '0.86rem' }}
                  onClick={handleGoToDashboard}
                >
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </button>

                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ justifyContent: 'center', padding: '11px', fontSize: '0.86rem' }}
                  onClick={handleClose}
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="compact-request-form">
              {/* Streamlined Account Match Badge (Wrap-safe & Zero Cutoff) */}
              <div className="modal-account-badge">
                <div className="account-badge-header">
                  <ShieldCheck size={15} style={{ color: 'var(--green-600)', flexShrink: 0 }} />
                  <span className="account-badge-title">Google Form Linked Account:</span>
                </div>
                <div className="account-badge-email" title={activeEmail}>
                  {activeEmail}
                </div>
              </div>

              {/* Service Selection */}
              <div className="form-field form-field-compact">
                <label className="form-label form-label-compact">Service *</label>
                <select 
                  className="form-select form-input-compact"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  required
                >
                  {allServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Applicant Name */}
              <div className="form-field form-field-compact">
                <label className="form-label form-label-compact">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input form-input-compact"
                  placeholder="Full name as on ID"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* WhatsApp Mobile Number */}
              <div className="form-field form-field-compact">
                <label className="form-label form-label-compact">WhatsApp Number (For PDF Delivery) *</label>
                <input 
                  type="tel" 
                  className="form-input form-input-compact"
                  placeholder="10-digit WhatsApp number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Document Reference (Compact 1-line) */}
              <div className="form-field form-field-compact">
                <label className="form-label form-label-compact">Document Reference No. / Note (Optional)</label>
                <input 
                  type="text" 
                  className="form-input form-input-compact"
                  placeholder="e.g. EPIC / PAN / DL / RC number"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Compact Checkbox Declaration */}
              <div className="form-declaration-row">
                <input 
                  type="checkbox" 
                  id="disclaimer-check-modal" 
                  checked={acceptedDisclaimer}
                  onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                  required
                  className="declaration-checkbox"
                />
                <label htmlFor="disclaimer-check-modal" className="declaration-label">
                  I will submit the external Google Form using <strong>{activeEmail}</strong> on this private assistance platform.
                </label>
              </div>

              {/* Submit CTA */}
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '0.92rem', marginTop: '6px' }}
              >
                <Send size={15} />
                <span>Confirm & Generate Application ID</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
