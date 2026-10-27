import React, { useState } from 'react';
import { X, Search, Clock, CheckCircle2, AlertCircle, FileText, Download, MessageCircle, Mail, Lock } from 'lucide-react';

export default function TrackApplicationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);

    const clean = query.trim();
    const cleanLower = clean.toLowerCase();
    const cleanUpper = clean.toUpperCase();

    // Look up in local storage
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

    if (foundMatches.length > 0) {
      setResults(foundMatches);
    } else {
      setResults([]);
    }
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
      `APPLICATION ID   : ${app.appId}\n` +
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
            <h3 style={{ fontSize: '1.2rem' }}>Track Application Status</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <form onSubmit={handleSearch} style={{ marginBottom: '22px' }}>
            <div className="form-field">
              <label className="form-label">
                Search by Email, Application ID, or Mobile Number
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter Email, App ID, or Mobile"
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
                Tip: Enter the exact Google account email you filled on the Google Form to view your requests.
              </span>
            </div>
          </form>

          {searched && (
            <div>
              {results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--slate-500)', fontWeight: '600' }}>
                    Found {results.length} application record{results.length > 1 ? 's' : ''}:
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
                              APPLICATION ID
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                              {result.appId}
                            </div>
                          </div>

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

                        <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                          <strong>Service:</strong> {result.serviceName}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginBottom: '14px', lineHeight: '1.5' }}>
                          <strong>Verification Desk Note:</strong> {result.operatorNote || 'Request received. Verification in progress with Google Forms response sheet.'}
                        </div>

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
                    Please make sure you entered the exact Email ID, Application ID, or 10-digit mobile number used when submitting your request.
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
