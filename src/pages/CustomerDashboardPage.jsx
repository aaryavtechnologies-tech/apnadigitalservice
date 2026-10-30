import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ArrowRight,
  Crown,
  X,
  ZoomIn,
  Maximize2
} from 'lucide-react';
import ServiceIcon from '../components/ServiceIcon';
import { fetchCustomerApplications } from '../lib/supabaseClient';

// ── In-page Document Viewer ──────────────────────────────────────────────────
function DocumentViewer({ doc, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);
  if (!doc) return null;

  const isImage = doc.url && /\.(jpe?g|png|gif|webp|svg|bmp)/i.test(doc.url.split('?')[0]);
  const isPdf   = doc.url && /\.pdf/i.test(doc.url.split('?')[0]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      />

      {/* Viewer Card */}
      <div
        style={{
          position: 'fixed',
          zIndex: 9001,
          ...(fullscreen
            ? { inset: 0, borderRadius: 0 }
            : {
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(94vw, 820px)',
                maxHeight: '92vh',
                borderRadius: '20px'
              }),
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0, gap: '12px'
        }}>
          <span style={{
            color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {doc.name || 'Document'}
          </span>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => setFullscreen(f => !f)}
              title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
                width: 34, height: 34, borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Maximize2 size={16} />
            </button>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
                width: 34, height: 34, borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={onClose}
              title="Close"
              style={{
                background: 'rgba(239,68,68,0.75)', border: 'none', color: '#fff',
                width: 34, height: 34, borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isImage ? 0 : '0' }}
          onClick={() => isImage && setFullscreen(f => !f)}
        >
          {isImage ? (
            <img
              src={doc.url}
              alt={doc.name || 'Document'}
              style={{
                maxWidth: '100%',
                maxHeight: fullscreen ? '100vh' : 'calc(92vh - 60px)',
                objectFit: 'contain',
                display: 'block',
                cursor: fullscreen ? 'zoom-out' : 'zoom-in'
              }}
            />
          ) : isPdf ? (
            <iframe
              src={doc.url}
              title={doc.name || 'PDF Document'}
              style={{ width: '100%', height: fullscreen ? '100vh' : 'calc(92vh - 60px)', border: 'none', display: 'block' }}
            />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <FileText size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
              <p style={{ color: '#94a3b8', marginBottom: '16px' }}>Preview not available for this file type.</p>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '8px',
                  background: '#f97316', color: '#fff', fontWeight: 700,
                  textDecoration: 'none', fontSize: '0.875rem'
                }}
              >
                <ExternalLink size={16} /> Open File
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function CustomerDashboardPage({ currentUser, onSignOut, onOpenAuth }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerDoc, setViewerDoc] = useState(null);

  const openViewer = useCallback((url, name) => {
    if (!url) return;
    setViewerDoc({ url, name });
  }, []);
  const closeViewer = useCallback(() => setViewerDoc(null), []);

  const isSuperAdminOrAdmin = currentUser?.role === 'super_admin' || 
                              currentUser?.role === 'admin' || 
                              currentUser?.email?.toLowerCase().trim() === 'help.apnadigitalservice@gmail.com';

  // Automatically redirect Super Admin or Admin staff to the Admin Operations Portal
  useEffect(() => {
    if (isSuperAdminOrAdmin) {
      navigate('/admin');
    }
  }, [isSuperAdminOrAdmin, navigate]);

  // Load user applications strictly from Supabase (NO CACHED / FAKE DATA)
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    async function loadApps() {
      setLoading(true);
      setFetchError(null);
      if (currentUser) {
        try {
          const userApps = await fetchCustomerApplications(currentUser);
          setApplications(userApps || []);
        } catch (err) {
          setFetchError(err.message || 'Failed to load applications. Please refresh the page.');
          setApplications([]);
        }
      } else {
        setApplications([]);
      }
      setLoading(false);
    }
    loadApps();

    // Live sync: listen for admin status & payment updates
    const handleLiveSync = () => { loadApps(); };
    window.addEventListener('apna_applications_updated', handleLiveSync);

    // Poll Supabase every 15 seconds to show real-time status updates from admin
    const pollInterval = setInterval(() => { loadApps(); }, 15000);

    return () => {
      window.removeEventListener('apna_applications_updated', handleLiveSync);
      clearInterval(pollInterval);
    };
  }, [currentUser]);


  // Compute status badge styling and step index based on Admin status & payment status
  const getStatusBadge = (status = 'Submitted', paymentStatus = 'pending') => {
    const isPayReceived = (paymentStatus || '').toLowerCase() === 'received';
    const isPayFailed = (paymentStatus || '').toLowerCase() === 'failed';

    if (isPayFailed || status === 'Unable to Process' || status === 'Rejected' || status === 'Action Required') {
      return {
        bg: '#fee2e2',
        color: '#b91c1c',
        border: '#fca5a5',
        icon: AlertCircle,
        step: 1,
        label: isPayFailed ? 'Payment Failed / Action Required' : (status || 'Action Required')
      };
    }

    if (status === 'Completed') {
      return {
        bg: '#dcfce7',
        color: '#15803d',
        border: '#86efac',
        icon: CheckCircle2,
        step: 4,
        label: 'Completed & Delivered'
      };
    }

    if (status === 'Processing') {
      return {
        bg: '#e0f2fe',
        color: '#0369a1',
        border: '#7dd3fc',
        icon: RefreshCw,
        step: 3,
        label: 'Processing with Department'
      };
    }

    if (isPayReceived) {
      return {
        bg: '#dcfce7',
        color: '#15803d',
        border: '#86efac',
        icon: CheckCircle2,
        step: 2,
        label: 'Payment Received & Verified'
      };
    }

    if (status === 'Under Verification' || status === 'Under Review') {
      return {
        bg: '#fef3c7',
        color: '#b45309',
        border: '#fde68a',
        icon: Clock,
        step: 2,
        label: 'Under Verification'
      };
    }

    return {
      bg: '#fef3c7',
      color: '#b45309',
      border: '#fde68a',
      icon: Clock,
      step: 1,
      label: status || 'Request Received'
    };
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
      `APNA DIGITAL SERVICE — VERIFIED RESULT\n` +
      `=======================================================\n\n` +
      `TRACKING ID      : ${app.appId}\n` +
      `SERVICE          : ${app.serviceName}\n` +
      `CUSTOMER NAME    : ${app.fullName}\n` +
      `REGISTERED EMAIL : ${app.email}\n` +
      `DISPATCHED PHONE : ${app.phone}\n` +
      `STATUS           : VERIFIED COMPLETED\n` +
      `DELIVERY DATE    : ${new Date().toLocaleDateString('en-IN')}\n\n` +
      `OPERATOR NOTE    : ${app.operatorNote || 'Verified by Apna Digital Service team'}\n` +
      `SUPPORT HELPLINE : +91 ${app.supportPhone || '8018246567'}\n\n` +
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
            Please sign in with your registered Email ID or Google Account to access your Customer Dashboard and view delivered document PDFs.
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
      {/* In-page Document Viewer (image/PDF modal) */}
      <DocumentViewer doc={viewerDoc} onClose={closeViewer} />

      <div className="dashboard-container">
        

        {/* Super Admin Notice Banner if viewing Customer Dashboard */}
        {isSuperAdminOrAdmin && (
          <div 
            style={{
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '1.5px solid #FDE68A',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Crown size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.96rem' }}>
                  Super Admin Account Detected ({currentUser.email})
                </div>
                <div style={{ fontSize: '0.82rem', color: '#B45309' }}>
                  You have full operator write privileges to manage applications, update status, and upload verified documents.
                </div>
              </div>
            </div>
            <Link 
              to="/admin" 
              className="btn-primary" 
              style={{ 
                padding: '10px 18px', 
                fontSize: '0.88rem', 
                background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Open Super Admin Portal</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

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
              <div>Loading your application records from database...</div>
            </div>
          ) : fetchError ? (
            <div style={{
              background: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '14px',
              padding: '24px',
              textAlign: 'center',
              margin: '20px 0'
            }}>
              <AlertCircle size={32} style={{ color: '#DC2626', margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '1rem', marginBottom: '8px' }}>
                Could Not Load Applications
              </div>
              <div style={{ color: '#B91C1C', fontSize: '0.875rem', marginBottom: '16px' }}>
                {fetchError}
              </div>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
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
                  <span>Fill the required details, scan the QR code to pay the service fee, and attach your payment screenshot.</span>
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
                const badge = getStatusBadge(app.status, app.paymentStatus);
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
                            TRACKING ID: <span className="app-id-number">{app.appId}</span>
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

                    {/* Submission Details: Fee, Payment Proof & Customer Documents */}
                    {(() => {
                      const customerDocs = [];
                      if (Array.isArray(app.userDocuments) && app.userDocuments.length > 0) {
                        app.userDocuments.forEach((doc, dIdx) => {
                          if (typeof doc === 'string') {
                            customerDocs.push({ name: `Document ${dIdx + 1}`, url: doc });
                          } else if (doc && doc.url) {
                            customerDocs.push({ name: doc.name || `Document ${dIdx + 1}`, url: doc.url });
                          }
                        });
                      } else if (app.userDocumentUrl) {
                        customerDocs.push({ name: 'Uploaded Document', url: app.userDocumentUrl });
                      }

                      const formEntries = app.formData && typeof app.formData === 'object'
                        ? Object.entries(app.formData).filter(([_, val]) => val !== undefined && val !== null && val !== '')
                        : [];

                      const formatLabel = (key) => key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());

                      return (
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          marginTop: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-600)' }}>Service Fee:</span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                                ₹{app.serviceCharge || '100'}
                              </span>
                            </div>

                            {/* Live Payment Verification Status Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-600)' }}>Payment Status:</span>
                              <span style={{
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                padding: '3px 9px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: (app.paymentStatus || 'pending') === 'received' ? '#dcfce7' : (app.paymentStatus || 'pending') === 'failed' ? '#fee2e2' : '#fef3c7',
                                color: (app.paymentStatus || 'pending') === 'received' ? '#15803d' : (app.paymentStatus || 'pending') === 'failed' ? '#b91c1c' : '#b45309',
                                border: `1px solid ${(app.paymentStatus || 'pending') === 'received' ? '#86efac' : (app.paymentStatus || 'pending') === 'failed' ? '#fca5a5' : '#fde68a'}`
                              }}>
                                {(app.paymentStatus || 'pending') === 'received' ? (
                                  <>
                                    <CheckCircle2 size={13} />
                                    <span>Payment Received (Verified)</span>
                                  </>
                                ) : (app.paymentStatus || 'pending') === 'failed' ? (
                                  <>
                                    <AlertCircle size={13} />
                                    <span>Payment Failed / Rejected</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={13} />
                                    <span>Under Verification</span>
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Payment Proof Status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-600)' }}>Payment Proof:</span>
                              {app.paymentScreenshotUrl ? (
                                <button
                                  type="button"
                                  onClick={() => openViewer(app.paymentScreenshotUrl, 'Payment Proof')}
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    fontSize: '0.78rem', 
                                    color: '#0284c7', 
                                    fontWeight: 700,
                                    background: '#e0f2fe',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Eye size={12} />
                                  <span>View Proof</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 600 }}>Not Attached</span>
                              )}
                            </div>
                          </div>

                          {/* Payment Remark Notice if Admin attached a note */}
                          {app.paymentNote && (
                            <div style={{
                              fontSize: '0.78rem',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              background: (app.paymentStatus || 'pending') === 'failed' ? '#FEF2F2' : '#F8FAFC',
                              color: (app.paymentStatus || 'pending') === 'failed' ? '#991B1B' : '#475569',
                              border: `1px solid ${(app.paymentStatus || 'pending') === 'failed' ? '#FECACA' : '#E2E8F0'}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <AlertCircle size={14} style={{ flexShrink: 0 }} />
                              <span><strong>Payment Note:</strong> {app.paymentNote}</span>
                            </div>
                          )}

                            {/* User Uploaded Documents vs "No document available" */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-600)' }}>Your Documents:</span>
                              {customerDocs.length > 0 ? (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {customerDocs.map((doc, dIdx) => (
                                    <button
                                      key={dIdx}
                                      type="button"
                                      onClick={() => openViewer(doc.url, doc.name)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.76rem',
                                        color: '#15803d',
                                        background: '#dcfce7',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Eye size={11} />
                                      <span>{doc.name}</span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  padding: '2px 8px', 
                                  borderRadius: '4px', 
                                  background: '#f1f5f9', 
                                  border: '1px solid #cbd5e1', 
                                  color: '#64748b', 
                                  fontSize: '0.76rem', 
                                  fontWeight: 600 
                                }}>
                                  No document available
                                </span>
                              )}
                            </div>

                          {/* Form Fields Summary If Any */}
                          {formEntries.length > 0 && (
                            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {formEntries.map(([fKey, fVal]) => (
                                <span 
                                  key={fKey}
                                  style={{
                                    fontSize: '0.76rem',
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    color: '#334155'
                                  }}
                                >
                                  <strong style={{ color: '#0f172a' }}>{formatLabel(fKey)}:</strong> {String(fVal)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Dynamic Live Verification Status Update Box (Adapts to Super Admin changes in real-time) */}
                    {(() => {
                      const isPayReceived = (app.paymentStatus || '').toLowerCase() === 'received';
                      const isPayFailed = (app.paymentStatus || '').toLowerCase() === 'failed';
                      const isUnableToProcess = app.status === 'Unable to Process' || app.status === 'Rejected';
                      const isActionRequired = app.status === 'Additional Information Required' || app.status === 'Action Required';
                      const isProcessing = app.status === 'Processing';
                      const isUnderReview = app.status === 'Under Review' || app.status === 'Under Verification';
                      const isCompletedStatus = app.status === 'Completed' || (isCompleted && hasUploadedDoc);

                      // 1. Payment Failed or Unable to Process (Red Box)
                      if (isPayFailed || isUnableToProcess) {
                        return (
                          <div 
                            className="admin-update-box"
                            style={{
                              background: '#FEF2F2',
                              border: '1.5px solid #FCA5A5',
                              borderRadius: '12px',
                              padding: '14px 16px',
                              margin: '14px 0'
                            }}
                          >
                            <div className="admin-update-title" style={{ color: '#991B1B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0 }} />
                              <span>⚠️ Action Required — Verification Unsuccessful:</span>
                            </div>
                            <p className="admin-update-note" style={{ color: '#7F1D1D', marginTop: '6px', fontSize: '0.88rem', lineHeight: 1.45 }}>
                              {app.paymentNote || app.operatorNote || 'Payment or application details verification could not be completed with the provided screenshot. Please check transaction reference / UTR or contact our helpline via WhatsApp.'}
                            </p>
                            <div style={{ marginTop: '10px' }}>
                              <a 
                                href={`https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service%20Support,%20my%20application%20${encodeURIComponent(app.appId)}%20has%20a%20verification%20issue.%20Please%20assist.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.80rem',
                                  fontWeight: 700,
                                  color: '#FFFFFF',
                                  background: '#DC2626',
                                  padding: '7px 14px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                                }}
                              >
                                <MessageCircle size={14} />
                                <span>Resolve via WhatsApp Helpdesk (+91 8018246567)</span>
                              </a>
                            </div>
                          </div>
                        );
                      }

                      // 2. Additional Information Required (Warm Orange Box)
                      if (isActionRequired) {
                        return (
                          <div 
                            className="admin-update-box"
                            style={{
                              background: '#FFF7ED',
                              border: '1.5px solid #FDBA74',
                              borderRadius: '12px',
                              padding: '14px 16px',
                              margin: '14px 0'
                            }}
                          >
                            <div className="admin-update-title" style={{ color: '#C2410C', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertCircle size={18} style={{ color: '#EA580C', flexShrink: 0 }} />
                              <span>⚠️ Additional Information Required for Verification:</span>
                            </div>
                            <p className="admin-update-note" style={{ color: '#9A3412', marginTop: '6px', fontSize: '0.88rem', lineHeight: 1.45 }}>
                              {app.operatorNote || 'Additional details or clearer document copies are required to complete verification. Please connect with our support desk on WhatsApp.'}
                            </p>
                            <div style={{ marginTop: '10px' }}>
                              <a 
                                href={`https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service%20Support,%20regarding%20my%20application%20${encodeURIComponent(app.appId)},%20I%20am%20providing%20the%20required%20additional%20information.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.80rem',
                                  fontWeight: 700,
                                  color: '#FFFFFF',
                                  background: '#EA580C',
                                  padding: '7px 14px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)'
                                }}
                              >
                                <MessageCircle size={14} />
                                <span>Submit Details on WhatsApp (+91 8018246567)</span>
                              </a>
                            </div>
                          </div>
                        );
                      }

                      // 3. Completed & Verified (Green Box)
                      if (isCompletedStatus) {
                        return (
                          <div 
                            className="admin-update-box"
                            style={{
                              background: '#F0FDF4',
                              border: '1.5px solid #86EFAC',
                              borderRadius: '12px',
                              padding: '14px 16px',
                              margin: '14px 0'
                            }}
                          >
                            <div className="admin-update-title" style={{ color: '#166534', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={18} style={{ color: '#16A34A', flexShrink: 0 }} />
                              <span>✓ Application Verified & Official Document Delivered:</span>
                            </div>
                            <p className="admin-update-note" style={{ color: '#14532D', marginTop: '6px', fontSize: '0.88rem', lineHeight: 1.45 }}>
                              {app.operatorNote || (hasUploadedDoc ? 'Application verified and payment approved. Verified official document PDF is attached and ready for instant download below.' : 'Application verified and completed successfully by the authorized department.')}
                            </p>
                          </div>
                        );
                      }

                      // 4. Processing Status (Blue Box)
                      if (isProcessing) {
                        return (
                          <div 
                            className="admin-update-box"
                            style={{
                              background: '#EFF6FF',
                              border: '1.5px solid #93C5FD',
                              borderRadius: '12px',
                              padding: '14px 16px',
                              margin: '14px 0'
                            }}
                          >
                            <div className="admin-update-title" style={{ color: '#1D4ED8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <RefreshCw size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                              <span>⚡ Department Processing in Progress:</span>
                            </div>
                            <p className="admin-update-note" style={{ color: '#1E3A8A', marginTop: '6px', fontSize: '0.88rem', lineHeight: 1.45 }}>
                              {app.operatorNote || 'Application details verified. Your request is now actively being processed with the authorized issuing department records.'}
                            </p>
                          </div>
                        );
                      }

                      // 5. Payment Received / Verified (Green Box)
                      if (isPayReceived) {
                        return (
                          <div 
                            className="admin-update-box"
                            style={{
                              background: '#F0FDF4',
                              border: '1.5px solid #86EFAC',
                              borderRadius: '12px',
                              padding: '14px 16px',
                              margin: '14px 0'
                            }}
                          >
                            <div className="admin-update-title" style={{ color: '#15803D', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={18} style={{ color: '#16A34A', flexShrink: 0 }} />
                              <span>✓ Payment Received (₹{app.serviceCharge || '100'} Verified & Approved):</span>
                            </div>
                            <p className="admin-update-note" style={{ color: '#14532D', marginTop: '6px', fontSize: '0.88rem', lineHeight: 1.45 }}>
                              {app.operatorNote || app.paymentNote || 'Payment proof verified successfully. Your request is now actively queued for department processing.'}
                            </p>
                          </div>
                        );
                      }

                      // 6. Under Review / Under Verification (Amber Box with Shield)
                      if (isUnderReview) {
                        return (
                          <div 
                            className="admin-update-box"
                            style={{
                              background: '#FFFBEB',
                              border: '1.5px solid #FCD34D',
                              borderRadius: '12px',
                              padding: '14px 16px',
                              margin: '14px 0'
                            }}
                          >
                            <div className="admin-update-title" style={{ color: '#92400E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ShieldCheck size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                              <span>Live Verification Status: Under Review & Verification:</span>
                            </div>
                            <p className="admin-update-note" style={{ color: '#78350F', marginTop: '6px', fontSize: '0.88rem', lineHeight: 1.45 }}>
                              {app.operatorNote || 'Your application documents and details are currently under active review by our verification desk.'}
                            </p>
                          </div>
                        );
                      }

                      // 7. Default: Awaiting operator verification (Amber box matching screenshot)
                      return (
                        <div 
                          className="admin-update-box"
                          style={{
                            background: '#FFFBEB',
                            border: '1.5px solid #FDE68A',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            margin: '14px 0'
                          }}
                        >
                          <div className="admin-update-title" style={{ color: '#92400E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                            <span>Live Verification Status Update:</span>
                          </div>
                          <p className="admin-update-note" style={{ color: '#78350F', marginTop: '6px', fontSize: '0.88rem', lineHeight: 1.45 }}>
                            {app.operatorNote || 'Application submitted with payment proof. Awaiting operator verification.'}
                          </p>
                        </div>
                      );
                    })()}

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
