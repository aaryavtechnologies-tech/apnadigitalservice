import React, { useState } from 'react';
import { X, Search, Clock, CheckCircle2, AlertCircle, FileText, Download, MessageCircle, Mail, Lock, CreditCard, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function TrackApplicationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(true);
    setSearching(true);

    const clean = query.trim();
    const cleanLower = clean.toLowerCase();
    const cleanUpper = clean.toUpperCase();

    // 1. Look up in local storage
    let foundMatches = [];
    try {
      const stored = JSON.parse(localStorage.getItem('apna_applications') || '[]');
      foundMatches = stored.filter(item => {
        const matchId = item.appId && item.appId.toUpperCase() === cleanUpper;
        const matchEmail = item.email && item.email.toLowerCase() === cleanLower;
        const matchPhone = item.phone && item.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '');
        return matchId || matchEmail || matchPhone;
      });
    } catch (err) {
      console.error(err);
    }

    // 2. Look up in Supabase if online
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .or(`application_id.ilike.%${cleanUpper}%,customer_email.ilike.%${cleanLower}%,customer_phone.ilike.%${clean}%`);

        if (!error && data && data.length > 0) {
          const remoteApps = data.map(item => ({
            appId: item.application_id,
            serviceId: item.service_id,
            serviceSlug: item.service_slug,
            serviceName: item.service_name,
            fullName: item.customer_name,
            email: item.customer_email,
            phone: item.customer_phone,
            status: item.status,
            paymentStatus: item.payment_status || 'pending',
            paymentNote: item.payment_note || '',
            operatorNote: item.operator_note,
            documentUrl: item.document_url,
            documentName: item.document_name,
            serviceCharge: item.service_charge,
            createdAt: item.created_at
          }));

          // Merge without duplicates
          const map = new Map();
          foundMatches.forEach(a => map.set(a.appId, a));
          remoteApps.forEach(a => map.set(a.appId, a));
          foundMatches = Array.from(map.values());
        }
      } catch (err) {
        console.warn('Supabase tracking query notice:', err);
      }
    }

    setResults(foundMatches);
    setSearching(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return { bg: 'var(--green-100)', text: 'var(--green-700)', border: 'var(--green-200)' };
      case 'Processing': return { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' };
      case 'Under Review':
      case 'Under Verification': return { bg: 'var(--saffron-100)', text: 'var(--saffron-700)', border: 'var(--saffron-200)' };
      default: return { bg: 'var(--slate-100)', text: 'var(--navy-800)', border: 'var(--border-subtle)' };
    }
  };

  const handleDownloadSample = (app) => {
    const filename = `${app.serviceSlug || 'document'}_${app.appId}.pdf`;
    const element = document.createElement('a');
    const file = new Blob([
      `=======================================================\n` +
      `APNA DIGITAL SERVICE — VERIFIED DOCUMENT RESULT\n` +
      `=======================================================\n\n` +
      `TRACKING ID      : ${app.appId}\n` +
      `SERVICE          : ${app.serviceName}\n` +
      `CUSTOMER EMAIL   : ${app.email}\n` +
      `WHATSAPP PHONE   : ${app.phone}\n` +
      `STATUS           : VERIFIED COMPLETED\n` +
      `DELIVERY DATE    : ${new Date().toLocaleDateString('en-IN')}\n\n` +
      `OPERATOR NOTE    : ${app.operatorNote || 'Verified by our team'}\n` +
      `SUPPORT HELPLINE : +91 ${app.supportPhone || '9124494239'}\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} style={{ color: 'var(--saffron-600)' }} />
            <h3 style={{ fontSize: '1.2rem' }}>Track Request Status</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <form onSubmit={handleSearch} style={{ marginBottom: '22px' }}>
            <div className="form-field">
              <label className="form-label">
                Search by Tracking ID, Email, or Mobile Number
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter Tracking ID (e.g. ADS-2026-XXXXXX), Email, or Mobile"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                  style={{ flex: '1 1 180px', minWidth: 0 }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 18px', flexShrink: 0 }}>
                  <span>Track</span>
                </button>
              </div>
              <span className="form-helper-text">
                Tip: Enter your unique Tracking ID or the email you used when submitting your request.
              </span>
            </div>
          </form>

          {searched && (
            <div>
              {results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--slate-500)', fontWeight: '600' }}>
                    Found {results.length} request record{results.length > 1 ? 's' : ''}:
                  </div>

                  {results.map((result, idx) => {
                    const badge = getStatusColor(result.status);
                    const isCompleted = result.status === 'Completed';
                    return (
                      <div 
                        key={idx}
                        style={{
                          background: isCompleted ? 'rgba(240, 253, 244, 0.5)' : 'var(--slate-50)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '18px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '700' }}>
                              TRACKING ID
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                              {result.appId}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              background: (result.paymentStatus || 'pending') === 'received' ? '#DCFCE7' : (result.paymentStatus || 'pending') === 'failed' ? '#FEE2E2' : '#FEF3C7',
                              color: (result.paymentStatus || 'pending') === 'received' ? '#15803D' : (result.paymentStatus || 'pending') === 'failed' ? '#B91C1C' : '#B45309',
                              border: `1px solid ${(result.paymentStatus || 'pending') === 'received' ? '#86EFAC' : (result.paymentStatus || 'pending') === 'failed' ? '#FCA5A5' : '#FDE68A'}`
                            }}>
                              Payment: {(result.paymentStatus || 'pending') === 'received' ? '✓ Received' : (result.paymentStatus || 'pending') === 'failed' ? '✕ Failed' : '⏳ Pending'}
                            </span>

                            <span style={{
                              ...badge,
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              fontSize: '0.76rem',
                              fontWeight: '700',
                              border: `1px solid ${badge.border}`
                            }}>
                              ● {result.status || 'Under Review'}
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                          <strong>Service:</strong> {result.serviceName}
                        </div>

                        {/* Dynamic Live Verification Status Update Box */}
                        {(() => {
                          const isPayReceived = (result.paymentStatus || '').toLowerCase() === 'received';
                          const isPayFailed = (result.paymentStatus || '').toLowerCase() === 'failed';
                          const isUnableToProcess = result.status === 'Unable to Process' || result.status === 'Rejected';
                          const isActionRequired = result.status === 'Additional Information Required' || result.status === 'Action Required';
                          const isProcessing = result.status === 'Processing';
                          const isUnderReview = result.status === 'Under Review' || result.status === 'Under Verification';
                          const isCompletedStatus = result.status === 'Completed' || !!result.documentUrl;

                          // 1. Payment Failed or Unable to Process (Red Box)
                          if (isPayFailed || isUnableToProcess) {
                            return (
                              <div 
                                style={{
                                  background: '#FEF2F2',
                                  border: '1.5px solid #FCA5A5',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  margin: '12px 0'
                                }}
                              >
                                <div style={{ color: '#991B1B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                  <AlertCircle size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
                                  <span>⚠️ Action Required — Verification Unsuccessful:</span>
                                </div>
                                <p style={{ color: '#7F1D1D', marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                                  {result.paymentNote || result.operatorNote || 'Payment or application details verification could not be completed with the provided screenshot. Please check transaction reference / UTR or contact our helpline via WhatsApp.'}
                                </p>
                              </div>
                            );
                          }

                          // 2. Additional Information Required (Warm Orange Box)
                          if (isActionRequired) {
                            return (
                              <div 
                                style={{
                                  background: '#FFF7ED',
                                  border: '1.5px solid #FDBA74',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  margin: '12px 0'
                                }}
                              >
                                <div style={{ color: '#C2410C', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                  <AlertCircle size={16} style={{ color: '#EA580C', flexShrink: 0 }} />
                                  <span>⚠️ Additional Information Required for Verification:</span>
                                </div>
                                <p style={{ color: '#9A3412', marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                                  {result.operatorNote || 'Additional details or clearer document copies are required to complete verification. Please connect with our support desk on WhatsApp.'}
                                </p>
                              </div>
                            );
                          }

                          // 3. Completed & Verified (Green Box)
                          if (isCompletedStatus) {
                            return (
                              <div 
                                style={{
                                  background: '#F0FDF4',
                                  border: '1.5px solid #86EFAC',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  margin: '12px 0'
                                }}
                              >
                                <div style={{ color: '#166534', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                  <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                                  <span>✓ Application Verified & Official Document Delivered:</span>
                                </div>
                                <p style={{ color: '#14532D', marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                                  {result.operatorNote || 'Application verified and official document delivered. Ready for instant download below.'}
                                </p>
                              </div>
                            );
                          }

                          // 4. Processing Status (Blue Box)
                          if (isProcessing) {
                            return (
                              <div 
                                style={{
                                  background: '#EFF6FF',
                                  border: '1.5px solid #93C5FD',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  margin: '12px 0'
                                }}
                              >
                                <div style={{ color: '#1D4ED8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                  <RefreshCw size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
                                  <span>⚡ Department Processing in Progress:</span>
                                </div>
                                <p style={{ color: '#1E3A8A', marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                                  {result.operatorNote || 'Application details verified. Your request is now actively being processed with the authorized issuing department records.'}
                                </p>
                              </div>
                            );
                          }

                          // 5. Payment Received / Verified (Green Box)
                          if (isPayReceived) {
                            return (
                              <div 
                                style={{
                                  background: '#F0FDF4',
                                  border: '1.5px solid #86EFAC',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  margin: '12px 0'
                                }}
                              >
                                <div style={{ color: '#15803D', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                  <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                                  <span>✓ Payment Received (₹{result.serviceCharge || '100'} Verified & Approved):</span>
                                </div>
                                <p style={{ color: '#14532D', marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                                  {result.operatorNote || result.paymentNote || 'Payment proof verified successfully. Your request is now actively queued for department processing.'}
                                </p>
                              </div>
                            );
                          }

                          // 6. Under Review / Under Verification (Amber Box with Shield)
                          if (isUnderReview) {
                            return (
                              <div 
                                style={{
                                  background: '#FFFBEB',
                                  border: '1.5px solid #FCD34D',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  margin: '12px 0'
                                }}
                              >
                                <div style={{ color: '#92400E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                  <ShieldCheck size={16} style={{ color: '#D97706', flexShrink: 0 }} />
                                  <span>Live Verification Status: Under Review & Verification:</span>
                                </div>
                                <p style={{ color: '#78350F', marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                                  {result.operatorNote || 'Your application documents and details are currently under active review by our verification desk.'}
                                </p>
                              </div>
                            );
                          }

                          // 7. Default: Awaiting operator verification (Amber box)
                          return (
                            <div 
                              style={{
                                background: '#FFFBEB',
                                border: '1.5px solid #FDE68A',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                margin: '12px 0'
                              }}
                            >
                              <div style={{ color: '#92400E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                <ShieldCheck size={16} style={{ color: '#D97706', flexShrink: 0 }} />
                                <span>Live Verification Status Update:</span>
                              </div>
                              <p style={{ color: '#78350F', marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                                {result.operatorNote || 'Application submitted with payment proof. Awaiting operator verification.'}
                              </p>
                            </div>
                          );
                        })()}

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}>
                          {/* 
                            RULE: Download PDF button is always visible.
                            Disabled if awaiting upload, enabled if completed.
                          */}
                          <div>
                            {isCompleted ? (
                              <button 
                                type="button"
                                className="btn-primary"
                                style={{ background: 'var(--green-600)', padding: '7px 14px', fontSize: '0.8rem' }}
                                onClick={() => handleDownloadSample(result)}
                              >
                                <Download size={14} />
                                <span>Download PDF</span>
                              </button>
                            ) : (
                              <button 
                                type="button" 
                                disabled
                                style={{
                                  background: 'var(--slate-200)',
                                  color: 'var(--slate-500)',
                                  padding: '7px 14px',
                                  fontSize: '0.78rem',
                                  borderRadius: 'var(--radius-md)',
                                  cursor: 'not-allowed',
                                  border: '1px solid var(--slate-300)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                title="Awaiting document verification & upload"
                              >
                                <Lock size={13} />
                                <span>Download PDF (Verification in Progress)</span>
                              </button>
                            )}
                          </div>

                          <a 
                            href={`https://wa.me/91${result.supportPhone || '9124494239'}?text=Status%20inquiry%20for%20Application%20ID%20${result.appId}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'var(--green-700)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <MessageCircle size={14} />
                            <span>Inquire on WhatsApp ↗</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '28px 12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <AlertCircle size={32} style={{ color: '#ef4444', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: '700', color: '#991b1b', marginBottom: '4px' }}>
                    No Records Found
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#7f1d1d', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
                    We could not find any active request matching "{query}". 
                    Please make sure you entered the exact Tracking ID, Email ID, or 10-digit mobile number used when submitting your request.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
