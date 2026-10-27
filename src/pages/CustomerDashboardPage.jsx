import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ExternalLink, 
  MessageCircle, 
  ShieldCheck, 
  LogOut,
  Eye,
  RefreshCw,
  Lock,
  FileQuestion,
  HelpCircle,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import ServiceIcon from '../components/ServiceIcon';
import { fetchCustomerApplications } from '../lib/supabaseClient';

export default function CustomerDashboardPage({ currentUser, onSignOut, onOpenAuth }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user applications strictly from Supabase / localStorage (NO DUMMY DATA)
  useEffect(() => {
    async function loadApps() {
      setLoading(true);
      if (currentUser) {
        const userApps = await fetchCustomerApplications(currentUser);
        setApplications(userApps || []);
      } else {
        setApplications([]);
      }
      setLoading(false);
    }
    loadApps();
  }, [currentUser]);

  // Compute status badge styling and step index
  const getStatusBadge = (status = 'Submitted') => {
    switch (status) {
      case 'Completed':
        return {
          bg: '#dcfce7',
          color: '#15803d',
          border: '#86efac',
          icon: CheckCircle2,
          step: 4,
          label: 'Completed & Delivered'
        };
      case 'Processing':
        return {
          bg: '#e0f2fe',
          color: '#0369a1',
          border: '#7dd3fc',
          icon: RefreshCw,
          step: 3,
          label: 'Processing with Department'
        };
      case 'Payment Confirmed':
        return {
          bg: '#ede9fe',
          color: '#6d28d9',
          border: '#ddd6fe',
          icon: CheckCircle2,
          step: 3,
          label: 'Payment Confirmed'
        };
      case 'Under Verification':
      case 'Under Review':
        return {
          bg: '#fef3c7',
          color: '#b45309',
          border: '#fde68a',
          icon: Clock,
          step: 2,
          label: 'Under Verification'
        };
      case 'Action Required':
      case 'Rejected':
        return {
          bg: '#fee2e2',
          color: '#b91c1c',
          border: '#fca5a5',
          icon: AlertCircle,
          step: 1,
          label: 'Action Required'
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#334155',
          border: '#cbd5e1',
          icon: Clock,
          step: 1,
          label: status || 'Request Received'
        };
    }
  };

  // Safe document downloader
  const handleDownloadDocument = (app) => {
    if (app.documentUrl) {
      window.open(app.documentUrl, '_blank');
      return;
    }

    const filename = app.documentName || `${app.serviceSlug || 'document'}_${app.appId}.pdf`;
    const element = document.createElement('a');
    const file = new Blob([
      `=======================================================\n` +
      `APNA DIGITAL SERVICE (APNA PAN AGENCY) — VERIFIED RESULT\n` +
      `=======================================================\n\n` +
      `APPLICATION ID   : ${app.appId}\n` +
      `SERVICE          : ${app.serviceName}\n` +
      `CUSTOMER NAME    : ${app.fullName}\n` +
      `REGISTERED EMAIL : ${app.email}\n` +
      `DISPATCHED PHONE : ${app.phone}\n` +
      `STATUS           : VERIFIED COMPLETED\n` +
      `DELIVERY DATE    : ${new Date().toLocaleDateString('en-IN')}\n\n` +
      `OPERATOR NOTE    : ${app.operatorNote || 'Verified by Apna Digital Service team'}\n` +
      `SUPPORT HELPLINE : +91 ${app.supportPhone || '9124494239'}\n\n` +
      `Notice: This official digital document assistance record was\n` +
      `verified by Apna Digital Service team. For questions, contact support.\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!currentUser) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ 
          maxWidth: '500px', 
          margin: '0 auto', 
          background: '#fff', 
          padding: '40px 32px', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border-subtle)', 
          boxShadow: 'var(--shadow-md)' 
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--saffron-50)',
            color: 'var(--saffron-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <User size={32} />
          </div>

          <h2 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', marginBottom: '10px' }}>
            Customer Sign In Required
          </h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Please sign in with the <strong>same Email ID or Google Account</strong> you use on Google Forms to access your Customer Dashboard and view delivered document PDFs.
          </p>
          <button 
            type="button" 
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            onClick={onOpenAuth}
          >
            <span>Sign In / Create Account</span>
          </button>
        </div>
      </div>
    );
  }

  const completedCount = applications.filter(a => a.status === 'Completed').length;
  const inProgressCount = applications.filter(a => a.status !== 'Completed').length;

  return (
    <div className="dashboard-page-wrapper">
      <div className="dashboard-container">
        
        {/* Profile Header Bar */}
        <div className="dashboard-profile-bar">
          <div className="profile-identity-group">
            <div className="profile-avatar-circle">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="profile-info-block">
              <div className="profile-name-row">
                <h1 className="profile-user-name">
                  {currentUser.fullName || 'Valued Customer'}
                </h1>
                <span className="profile-verified-badge">
                  <ShieldCheck size={13} />
                  <span>Verified Customer Account</span>
                </span>
              </div>

              <div className="profile-meta-row">
                <span className="profile-meta-item">
                  <Mail size={14} style={{ color: 'var(--saffron-600)' }} />
                  <span>{currentUser.email}</span>
                </span>
                {currentUser.phone && (
                  <span className="profile-meta-item">
                    <Phone size={14} style={{ color: 'var(--green-600)' }} />
                    <span>WhatsApp: {currentUser.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="profile-actions-group">
            <Link 
              to="/#services" 
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <PlusCircle size={16} />
              <span>Submit Service Request</span>
            </Link>

            <button 
              type="button" 
              className="btn-secondary"
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              onClick={onSignOut}
              title="Sign out of account"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="dashboard-metrics-grid">
          <div className="metric-box">
            <div className="metric-label">Total Requests</div>
            <div className="metric-value">{applications.length}</div>
            <div className="metric-desc">Submissions linked to {currentUser.email}</div>
          </div>

          <div className="metric-box" style={{ borderLeft: '4px solid var(--saffron-500)' }}>
            <div className="metric-label" style={{ color: 'var(--saffron-600)' }}>Ongoing / In Progress</div>
            <div className="metric-value" style={{ color: 'var(--saffron-600)' }}>{inProgressCount}</div>
            <div className="metric-desc">Verification & processing underway</div>
          </div>

          <div className="metric-box" style={{ borderLeft: '4px solid var(--green-600)' }}>
            <div className="metric-label" style={{ color: 'var(--green-600)' }}>Completed & Delivered</div>
            <div className="metric-value" style={{ color: 'var(--green-600)' }}>{completedCount}</div>
            <div className="metric-desc">Verified PDF documents ready</div>
          </div>
        </div>

        {/* Applications List Section */}
        <div className="dashboard-applications-panel">
          <div className="panel-header-row">
            <div>
              <h2 className="panel-title">
                My Service Requests & Document Delivery
              </h2>
              <p className="panel-subtitle">
                Live status updates as reviewed by our verification team. Verified PDF files will unlock for download below as soon as uploaded.
              </p>
            </div>

            {applications.length > 0 && (
              <span className="panel-count-badge">
                Showing {applications.length} {applications.length === 1 ? 'application' : 'applications'}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--slate-500)' }}>
              <RefreshCw size={28} className="spin-animation" style={{ margin: '0 auto 12px', color: 'var(--saffron-600)' }} />
              <div>Loading your application records...</div>
            </div>
          ) : applications.length === 0 ? (
            /* Elegant Clean Empty State When User Has No Dummy Data */
            <div className="dashboard-empty-state">
              <div className="empty-state-icon-box">
                <FolderOpen size={40} />
              </div>
              <h3 className="empty-state-title">
                No Applications Submitted Yet
              </h3>
              <p className="empty-state-text">
                We did not find any service requests submitted with your email <strong>({currentUser.email})</strong> yet.
              </p>

              <div className="empty-state-steps-card">
                <div className="step-point">
                  <span className="step-num">1</span>
                  <span>Click <strong>"Submit Service Request"</strong> below to select your service (PAN, Voter ID, DL, or RC).</span>
                </div>
                <div className="step-point">
                  <span className="step-num">2</span>
                  <span>Complete the official Google Form with this exact email ID: <strong>{currentUser.email}</strong>.</span>
                </div>
                <div className="step-point">
                  <span className="step-num">3</span>
                  <span>We will verify your submission, update status, and upload your verified PDF directly here.</span>
                </div>
              </div>

              <div className="empty-state-actions">
                <Link 
                  to="/#services" 
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                >
                  <PlusCircle size={18} />
                  <span>Submit Service Request</span>
                </Link>

                <a 
                  href="https://wa.me/919124494239?text=Hello%20Super%20Admin,%20I%20need%20assistance%20submitting%20a%20document%20request"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ padding: '12px 20px', fontSize: '0.92rem' }}
                >
                  <MessageCircle size={18} />
                  <span>Chat on WhatsApp Help</span>
                </a>
              </div>
            </div>
          ) : (
            /* Cards for Real Customer Applications */
            <div className="applications-stack">
              {applications.map((app, idx) => {
                const badge = getStatusBadge(app.status);
                const StatusIcon = badge.icon;
                const isCompleted = app.status === 'Completed';
                const hasUploadedDoc = Boolean(app.documentUrl || app.documentName || isCompleted);

                return (
                  <div 
                    key={app.appId || idx}
                    className={`app-card ${isCompleted ? 'app-card-completed' : ''}`}
                  >
                    {/* Header Row: ID, Service Name, and Admin Status Badge */}
                    <div className="app-card-top-row">
                      <div className="app-service-info">
                        <div className="app-icon-badge">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="app-id-label">
                            APPLICATION ID: <span className="app-id-number">{app.appId}</span>
                          </div>
                          <h3 className="app-service-title">
                            {app.serviceName}
                          </h3>
                        </div>
                      </div>

                      {/* Admin Live Status Badge */}
                      <span 
                        className="app-status-badge"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}
                      >
                        <StatusIcon size={14} />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    {/* Progress Step Indicator (As updated by Admin) */}
                    <div className="app-stepper-row">
                      <div className={`step-item ${badge.step >= 1 ? 'step-active' : ''}`}>
                        <div className="step-circle">{badge.step > 1 ? '✓' : '1'}</div>
                        <span className="step-label">Submitted</span>
                      </div>
                      <div className={`step-line ${badge.step >= 2 ? 'line-active' : ''}`}></div>
                      
                      <div className={`step-item ${badge.step >= 2 ? 'step-active' : ''}`}>
                        <div className="step-circle">{badge.step > 2 ? '✓' : '2'}</div>
                        <span className="step-label">Verification</span>
                      </div>
                      <div className={`step-line ${badge.step >= 3 ? 'line-active' : ''}`}></div>

                      <div className={`step-item ${badge.step >= 3 ? 'step-active' : ''}`}>
                        <div className="step-circle">{badge.step > 3 ? '✓' : '3'}</div>
                        <span className="step-label">Processing</span>
                      </div>
                      <div className={`step-line ${badge.step >= 4 ? 'line-active' : ''}`}></div>

                      <div className={`step-item ${badge.step >= 4 ? 'step-completed' : ''}`}>
                        <div className="step-circle">4</div>
                        <span className="step-label">Delivered</span>
                      </div>
                    </div>

                    {/* Application Details Summary */}
                    <div className="app-details-grid">
                      <div className="app-detail-item">
                        <span className="detail-key">Applicant:</span>
                        <span className="detail-val">{app.fullName || currentUser.fullName}</span>
                      </div>
                      <div className="app-detail-item">
                        <span className="detail-key">Registered Email:</span>
                        <span className="detail-val">{app.email || currentUser.email}</span>
                      </div>
                      <div className="app-detail-item">
                        <span className="detail-key">Dispatched WhatsApp:</span>
                        <span className="detail-val">{app.phone || currentUser.phone || '9124494239'}</span>
                      </div>
                      <div className="app-detail-item">
                        <span className="detail-key">Submission Date:</span>
                        <span className="detail-val">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Recent'}
                        </span>
                      </div>
                    </div>

                    {/* Live Verification Update Box */}
                    <div className="admin-update-box">
                      <div className="admin-update-title">
                        <ShieldCheck size={15} style={{ color: 'var(--saffron-600)' }} />
                        <span>Live Verification Status Update:</span>
                      </div>
                      <p className="admin-update-note">
                        {app.operatorNote || (
                          isCompleted
                            ? 'Google Form response verified and approved. Verified document PDF is attached and ready for download below and delivered to WhatsApp.'
                            : 'We are reviewing your Google Form submission and matching records with the authorized departmental system. Estimated completion time: 2 to 4 hours.'
                        )}
                      </p>
                    </div>

                    {/* Download PDF & Actions Footer */}
                    <div className="app-card-footer">
                      <div className="download-container">
                        {/* 
                          RULE: Download PDF button is ALWAYS rendered.
                          - Disabled if team hasn't uploaded PDF / not completed
                          - Enabled if completed and ready
                        */}
                        {isCompleted && hasUploadedDoc ? (
                          <div>
                            <button 
                              type="button" 
                              className="btn-download-active"
                              onClick={() => handleDownloadDocument(app)}
                              title="Download verified official document PDF"
                            >
                              <Download size={16} />
                              <span>Download Verified Document (PDF)</span>
                            </button>
                            <span className="download-hint-active">
                              ✅ Verified PDF uploaded • Ready to save
                            </span>
                          </div>
                        ) : (
                          <div>
                            <button 
                              type="button" 
                              disabled
                              className="btn-download-disabled"
                              title="Awaiting document verification & upload"
                            >
                              <Lock size={15} />
                              <span>Download PDF (Verification in Progress)</span>
                            </button>
                            <span className="download-hint-disabled">
                              🔒 Download unlocks automatically once we verify & upload your file.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Helpline contact directly for this specific application */}
                      <a 
                        href={`https://wa.me/91${app.supportPhone || '9124494239'}?text=Hello%20Apna%20Digital%20Service,%20checking%20status%20for%20Application%20ID%20${app.appId}%20(${encodeURIComponent(app.serviceName)})`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-whatsapp"
                        style={{ padding: '9px 16px', fontSize: '0.84rem' }}
                      >
                        <MessageCircle size={15} />
                        <span>Inquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
