import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CheckCheck, 
  Download, 
  ExternalLink, 
  Eye, 
  Crown, 
  Lock,
  FileSpreadsheet,
  ArrowUpRight,
  Layers,
  Inbox,
  Plus,
  Sparkles,
  LayoutDashboard,
  Globe,
  PhoneCall,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AdminApplicationModal from '../components/AdminApplicationModal';
import AdminServicesManager from '../components/AdminServicesManager';
import AdminServiceModal from '../components/AdminServiceModal';
import AdminWebsiteCMS from '../components/AdminWebsiteCMS';
import { useAdminAuth } from '../context/AdminAuthContext';
import { fetchAllAdminApplications } from '../services/adminDataService';
import { getActiveServices, getAllServices, getHomepageSettings, fetchHomepageSettings, saveHomepageSettings } from '../../data/servicesData';

export default function AdminDashboardPage() {
  const { adminUser, role, isSuperAdmin, isViewOnly, loading } = useAdminAuth();
  const navigate = useNavigate();

  // Active Tab: 'queue' | 'services' | 'homepage'
  const [activeTab, setActiveTab] = useState('queue');

  // Homepage & Site Content Management State
  const [homepageConfig, setHomepageConfig] = useState(() => getHomepageSettings());
  const [savingConfig, setSavingConfig] = useState(false);
  const [configNotice, setConfigNotice] = useState(null);
  useEffect(() => {
    fetchHomepageSettings().then(setHomepageConfig).catch(error => setConfigNotice({ type: 'error', text: error.message }));
  }, []);

  const [applications, setApplications] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [applicationsError, setApplicationsError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  // Quick Add Service Modal state from top header
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  // Filters & Search for Queue
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [allServicesList, setAllServicesList] = useState(() => getAllServices());

  // Redirect if not authenticated as admin
  useEffect(() => {
    if (!loading && (!role || (role !== 'super_admin' && role !== 'admin'))) {
      navigate('/admin/login');
    }
  }, [loading, role, navigate]);

  // Load all applications
  const loadApplications = async () => {
    setFetching(true);
    setApplicationsError('');
    try {
      const data = await fetchAllAdminApplications();
      setApplications(data);
    } catch (error) {
      setApplications([]);
      setApplicationsError(error.message || 'Could not load applications from the database.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (role === 'super_admin' || role === 'admin') {
      loadApplications();
    }
  }, [role]);

  // Sync services on change
  useEffect(() => {
    const handleServicesChanged = () => {
      setAllServicesList(getAllServices());
    };
    window.addEventListener('apna_services_changed', handleServicesChanged);
    return () => window.removeEventListener('apna_services_changed', handleServicesChanged);
  }, []);

  // Filtered applications computation
  const filteredApps = applications.filter((app) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      (app.appId && app.appId.toLowerCase().includes(term)) ||
      (app.fullName && app.fullName.toLowerCase().includes(term)) ||
      (app.phone && app.phone.includes(term)) ||
      (app.email && app.email.toLowerCase().includes(term)) ||
      (app.serviceName && app.serviceName.toLowerCase().includes(term));

    const matchesService = serviceFilter === 'ALL' || 
      app.serviceSlug === serviceFilter || 
      app.serviceId === serviceFilter;

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesService && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = applications.length;
  const pendingCount = applications.filter(a => 
    a.status === 'Request Received' || 
    a.status === 'Awaiting Form Verification' || 
    a.status === 'Under Review'
  ).length;
  const processingCount = applications.filter(a => a.status === 'Processing').length;
  const completedCount = applications.filter(a => a.status === 'Completed' || a.documentUrl).length;

  const liveServices = allServicesList.filter(s => s.status !== 'inactive');

  // Status Badge Class Helper
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Request Received': return 'status-received';
      case 'Awaiting Form Verification': return 'status-verification';
      case 'Under Review': return 'status-review';
      case 'Processing': return 'status-processing';
      case 'Completed': return 'status-completed';
      case 'Unable to Process': return 'status-rejected';
      default: return 'status-received';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
          <RefreshCw size={28} className="spinner" style={{ margin: '0 auto 12px' }} />
          <div>Checking Administrator Privileges...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* 1. Tricolour Brand Navigation Tabs */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}
      >
        <div className="admin-tabs-nav" style={{ margin: 0, border: 'none' }}>
          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <Inbox size={18} />
            <span>Verification Queue</span>
            <span className="admin-tab-count">{applications.length}</span>
          </button>

          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Layers size={18} />
            <span>Services Catalog & Settings</span>
            <span className="admin-tab-count">{allServicesList.length}</span>
          </button>

          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'homepage' ? 'active' : ''}`}
            onClick={() => setActiveTab('homepage')}
          >
            <Globe size={18} />
            <span>Website CMS & Content</span>
          </button>
        </div>

        {/* Quick Action Button */}
        <div>
          {isSuperAdmin ? (
            <button 
              type="button"
              className="admin-btn"
              style={{
                background: 'linear-gradient(90deg, #F97316 0%, #16A34A 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                padding: '8px 16px'
              }}
              onClick={() => setIsAddServiceModalOpen(true)}
            >
              <Plus size={16} />
              <span>+ Add Service</span>
            </button>
          ) : (
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: '#7DD3FC',
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                padding: '6px 12px',
                borderRadius: '8px'
              }}
            >
              <Eye size={14} />
              <span>View-Only Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. TAB CONTENT */}
      {activeTab === 'services' ? (
        /* Services Catalog Manager Component */
        <AdminServicesManager />
      ) : activeTab === 'homepage' ? (
        /* Homepage & Sections Management Component */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Action Bar */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                Homepage & Site Content Management
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748B' }}>
                Toggle homepage sections (Hero, Services, How It Works, About, FAQ), update banner text, helpline numbers, and legal disclaimers.
              </p>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                className="admin-btn"
                style={{
                  background: 'linear-gradient(90deg, #F97316 0%, #16A34A 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                }}
                disabled={savingConfig}
                onClick={async () => {
                  setSavingConfig(true);
                  const res = await saveHomepageSettings(homepageConfig, role);
                  setSavingConfig(false);
                  if (res.success) {
                    setConfigNotice({ type: 'success', text: 'Homepage configuration saved and published live!' });
                    setTimeout(() => setConfigNotice(null), 3000);
                  } else {
                    setConfigNotice({ type: 'error', text: res.error || 'Failed to save settings.' });
                  }
                }}
              >
                <Save size={16} />
                <span>{savingConfig ? 'Saving...' : 'Save & Publish Changes'}</span>
              </button>
            )}
          </div>

          {configNotice && (
            <div style={{
              padding: '14px 20px',
              borderRadius: '12px',
              background: configNotice.type === 'error' ? '#FEE2E2' : '#DCFCE7',
              color: configNotice.type === 'error' ? '#991B1B' : '#166534',
              border: configNotice.type === 'error' ? '1px solid #FCA5A5' : '1px solid #86EFAC',
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {configNotice.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
              <span>{configNotice.text}</span>
            </div>
          )}

          {/* Section 1: Homepage Section Visibility (Show / Hide) */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFF7ED', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#0F172A' }}>
                  1. Homepage Sections Visibility
                </h3>
                <div style={{ fontSize: '0.80rem', color: '#64748B' }}>
                  Toggle which main sections are displayed on the public homepage.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '16px' }}>
              {[
                { key: 'hero', label: '1. Hero / Main Banner Section' },
                { key: 'services', label: '2. Document Services Grid' },
                { key: 'howItWorks', label: '3. How It Works (4-Step Banner)' },
                { key: 'about', label: '4. About Apna Digital Service' },
                { key: 'faq', label: '5. Frequently Asked Questions (FAQ)' }
              ].map(sec => {
                const isEnabled = homepageConfig.sections?.[sec.key] !== false;
                return (
                  <div 
                    key={sec.key} 
                    style={{
                      border: isEnabled ? '1.5px solid #86EFAC' : '1.5px solid #E2E8F0',
                      background: isEnabled ? '#F0FDF4' : '#F8FAFC',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.90rem', color: isEnabled ? '#166534' : '#64748B' }}>
                      {sec.label}
                    </div>
                    <button
                      type="button"
                      disabled={isViewOnly}
                      onClick={() => {
                        setHomepageConfig(prev => ({
                          ...prev,
                          sections: {
                            ...prev.sections,
                            [sec.key]: !isEnabled
                          }
                        }));
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        border: 'none',
                        cursor: isViewOnly ? 'default' : 'pointer',
                        background: isEnabled ? '#16A34A' : '#94A3B8',
                        color: '#FFFFFF'
                      }}
                    >
                      {isEnabled ? '● Visible on Homepage' : '○ Hidden from Homepage'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <section style={{ background: '#fff', padding: 24, borderRadius: 16 }}>
            <h3>Additional homepage sections</h3>
            {(homepageConfig.customSections || []).map((section, index) => (
              <div key={section.id} style={{ display: 'grid', gap: 10, margin: '20px 0' }}>
                <label>Section title<input className="form-input" value={section.title} disabled={!isSuperAdmin} onChange={e => setHomepageConfig(prev => ({ ...prev, customSections: prev.customSections.map((item, i) => i === index ? { ...item, title: e.target.value } : item) }))} /></label>
                <label>Section text<textarea className="form-input" value={section.body} disabled={!isSuperAdmin} onChange={e => setHomepageConfig(prev => ({ ...prev, customSections: prev.customSections.map((item, i) => i === index ? { ...item, body: e.target.value } : item) }))} /></label>
                {isSuperAdmin && <button type="button" className="admin-btn" onClick={() => setHomepageConfig(prev => ({ ...prev, customSections: prev.customSections.filter(item => item.id !== section.id) }))}>Remove section</button>}
              </div>
            ))}
            {isSuperAdmin && <button type="button" className="admin-btn" onClick={() => setHomepageConfig(prev => ({ ...prev, customSections: [...(prev.customSections || []), { id: crypto.randomUUID(), title: 'New section', body: '' }] }))}>Add section</button>}
            <p>Use Save &amp; Publish Changes above to publish your sections.</p>
          </section>
          {/* Section 2: Full Website Content CMS (Super Admin Live Text Editor) */}
          <AdminWebsiteCMS />
        </div>
      ) : (
        /* Verification Queue & Dashboard Overview */
        <>
          {/* Stat Summary Cards with Tricolour Top Accent */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#F97316' }}>
                <FileText size={24} />
              </div>
              <div>
                <div className="admin-stat-value">{totalCount}</div>
                <div className="admin-stat-label">Total Applications</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
                <Clock size={24} />
              </div>
              <div>
                <div className="admin-stat-value">{pendingCount}</div>
                <div className="admin-stat-label">Awaiting Verification</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38BDF8' }}>
                <RefreshCw size={24} />
              </div>
              <div>
                <div className="admin-stat-value">{processingCount}</div>
                <div className="admin-stat-label">In Processing</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#34D399' }}>
                <CheckCheck size={24} />
              </div>
              <div>
                <div className="admin-stat-value">{completedCount}</div>
                <div className="admin-stat-label">Delivered & Ready</div>
              </div>
            </div>
          </div>

          {/* Rapid Google Sheets Quick Strip */}
          <div className="admin-sheets-strip">
            <div className="admin-sheets-info">
              <FileSpreadsheet size={22} style={{ color: '#16A34A' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                  Authorized Google Sheets Responses
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  1-Click direct links to match website requests against customer form submissions
                </div>
              </div>
            </div>

            <div className="admin-sheets-links">
              {liveServices.filter(s => s.spreadsheetUrl).map((srv) => (
                <a 
                  key={srv.id} 
                  href={srv.spreadsheetUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="admin-sheet-chip"
                  title={`Open Google Sheets responses for ${srv.title}`}
                >
                  <span>{srv.shortName}</span>
                  <ArrowUpRight size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Verification Queue Card */}
          <div className="admin-card">
            {/* Controls Header */}
            <div className="admin-card-header">
              <div className="admin-card-title">
                <Inbox size={20} style={{ color: 'var(--admin-saffron)' }} />
                <span>Customer Verification Queue ({filteredApps.length})</span>
              </div>

              <div className="admin-filters-bar">
                {/* Real-time Search */}
                <input 
                  type="text"
                  placeholder="Search by ID, Name, Phone, Email..."
                  className="admin-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Filter by Service */}
                <select 
                  className="admin-select"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  <option value="ALL">All Services</option>
                  {liveServices.map(s => (
                    <option key={s.id} value={s.slug}>{s.shortName}</option>
                  ))}
                </select>

                {/* Filter by Status */}
                <select 
                  className="admin-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Request Received">Request Received</option>
                  <option value="Awaiting Form Verification">Awaiting Form Verification</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Unable to Process">Unable to Process</option>
                </select>

                {/* Reload Queue Button */}
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={loadApplications}
                  title="Refresh Queue"
                >
                  <RefreshCw size={15} className={fetching ? 'spinner' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Verification Queue Table */}
            {applicationsError && (
              <div role="alert" style={{ padding: '14px 16px', marginBottom: '12px', border: '1px solid #FCA5A5', borderRadius: '8px', background: '#FEF2F2', color: '#991B1B' }}>
                <strong>Database data unavailable.</strong> {applicationsError} The queue below is not presented as current until the database can be reached.
              </div>
            )}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>App ID & Date</th>
                    <th>Target Service</th>
                    <th>Customer Contact</th>
                    <th>Payment Proof</th>
                    <th>Customer Document</th>
                    <th>Live Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                        <div style={{ display: 'inline-flex', padding: '12px', background: '#F1F5F9', borderRadius: '50%', marginBottom: '12px', color: '#0F172A' }}>
                          <Inbox size={28} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', marginBottom: '4px' }}>
                          No service requests match the selected filters
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#64748B' }}>
                          {searchTerm || serviceFilter !== 'ALL' || statusFilter !== 'ALL'
                            ? 'Try clearing your search keyword or resetting the status filters.'
                            : 'New customer applications submitted on the website will instantly appear in this queue.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const hasUserDoc = Boolean(
                        app.userDocumentUrl || 
                        (Array.isArray(app.userDocuments) && app.userDocuments.length > 0)
                      );
                      const userDocsCount = Array.isArray(app.userDocuments) ? app.userDocuments.length : (app.userDocumentUrl ? 1 : 0);

                      return (
                        <tr key={app.appId} style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(app)}>
                          {/* App ID & Date */}
                          <td>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                              {app.appId}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                              {new Date(app.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </td>

                          {/* Target Service */}
                          <td>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>
                              {app.serviceName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 600 }}>
                                {app.serviceSlug}
                              </span>
                              {app.serviceCharge && (
                                <span style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  ₹{app.serviceCharge}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Customer Contact */}
                          <td>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>
                              {app.fullName || 'Anonymous User'}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>
                              📞 {app.phone || 'No phone'}
                            </div>
                            {app.email && (
                              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                ✉️ {app.email}
                              </div>
                            )}
                          </td>

                          {/* Payment Screenshot & Verification Status */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                              {app.paymentScreenshotUrl ? (
                                <a 
                                  href={app.paymentScreenshotUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    color: '#0284C7',
                                    background: '#F0F9FF',
                                    padding: '3px 7px',
                                    borderRadius: '5px',
                                    border: '1px solid #BAE6FD',
                                    textDecoration: 'none'
                                  }}
                                >
                                  <ExternalLink size={11} />
                                  <span>Proof Attached</span>
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                                  No Proof
                                </span>
                              )}

                              {/* Payment Status Pill */}
                              <span style={{
                                fontSize: '0.70rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                background: (app.paymentStatus || 'pending') === 'received' ? '#DCFCE7' : (app.paymentStatus || 'pending') === 'failed' ? '#FEE2E2' : '#FEF3C7',
                                color: (app.paymentStatus || 'pending') === 'received' ? '#15803D' : (app.paymentStatus || 'pending') === 'failed' ? '#B91C1C' : '#B45309',
                                border: `1px solid ${(app.paymentStatus || 'pending') === 'received' ? '#86EFAC' : (app.paymentStatus || 'pending') === 'failed' ? '#FCA5A5' : '#FDE68A'}`
                              }}>
                                {(app.paymentStatus || 'pending') === 'received' ? '✓ Received' : (app.paymentStatus || 'pending') === 'failed' ? '✕ Failed' : '⏳ Pending'}
                              </span>
                            </div>
                          </td>

                          {/* Customer Uploaded Document (or "No document available") */}
                          <td>
                            {hasUserDoc ? (
                              <a 
                                href={app.userDocumentUrl || app.userDocuments?.[0]?.url} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  color: '#0284C7',
                                  background: '#F0F9FF',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #BAE6FD',
                                  textDecoration: 'none'
                                }}
                              >
                                <FileText size={13} />
                                <span>{userDocsCount > 1 ? `${userDocsCount} Documents` : 'View Document'}</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: '#64748B',
                                background: '#F1F5F9',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                display: 'inline-block'
                              }}>
                                No document available
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td>
                            <span className={`admin-status-badge ${getStatusBadgeClass(app.status)}`}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                              {app.status || 'Request Received'}
                            </span>
                          </td>

                          {/* Actions Button */}
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="admin-btn admin-btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => setSelectedApp(app)}
                            >
                              <Eye size={13} />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Application Inspection & Status/Document Updater */}
      {selectedApp && (
        <AdminApplicationModal 
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdated={(updatedFields) => {
            if (updatedFields) setSelectedApp(current => current ? { ...current, ...updatedFields } : current);
            loadApplications();
          }}
        />
      )}

      {/* Modal: Quick Add Service */}
      <AdminServiceModal 
        isOpen={isAddServiceModalOpen}
        service={null}
        onClose={() => setIsAddServiceModalOpen(false)}
        onSaved={() => {
          setAllServicesList(getAllServices());
        }}
      />
    </AdminLayout>
  );
}
