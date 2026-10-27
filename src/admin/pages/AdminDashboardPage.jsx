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
  Sparkles
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AdminApplicationModal from '../components/AdminApplicationModal';
import AdminServicesManager from '../components/AdminServicesManager';
import AdminServiceModal from '../components/AdminServiceModal';
import { useAdminAuth } from '../context/AdminAuthContext';
import { fetchAllAdminApplications } from '../services/adminDataService';
import { getActiveServices, getAllServices } from '../../data/servicesData';

export default function AdminDashboardPage() {
  const { adminUser, role, isSuperAdmin, isViewOnly, loading } = useAdminAuth();
  const navigate = useNavigate();

  // Active Tab: 'queue' | 'services'
  const [activeTab, setActiveTab] = useState('queue');

  const [applications, setApplications] = useState([]);
  const [fetching, setFetching] = useState(true);
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
    const data = await fetchAllAdminApplications();
    setApplications(data);
    setFetching(false);
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
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>App ID & Date</th>
                    <th>Target Service</th>
                    <th>Customer Contact</th>
                    <th>Live Status</th>
                    <th>Verified Document</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
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
                    filteredApps.map((app) => (
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
                          <div style={{ fontSize: '0.74rem', color: '#0284C7', fontWeight: 600 }}>
                            {app.serviceSlug}
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

                        {/* Status Badge */}
                        <td>
                          <span className={`admin-status-badge ${getStatusBadgeClass(app.status)}`}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                            {app.status || 'Request Received'}
                          </span>
                        </td>

                        {/* Document Status */}
                        <td>
                          {app.documentUrl ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34D399', fontSize: '0.82rem', fontWeight: 600 }}>
                              <CheckCircle2 size={16} />
                              <span>PDF Attached</span>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--admin-text-dim)', fontSize: '0.82rem' }}>
                              <Lock size={14} />
                              <span>Awaiting Upload</span>
                            </div>
                          )}
                        </td>

                        {/* Actions Button */}
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => setSelectedApp(app)}
                          >
                            {isSuperAdmin ? <Crown size={13} style={{ color: '#F59E0B' }} /> : <Eye size={13} />}
                            <span>{isSuperAdmin ? 'Inspect / Edit' : 'Inspect Details'}</span>
                          </button>
                        </td>
                      </tr>
                    ))
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
          onUpdated={() => {
            loadApplications();
            fetchAllAdminApplications().then(updatedList => {
              const fresh = updatedList.find(a => a.appId === selectedApp.appId);
              if (fresh) setSelectedApp(fresh);
            });
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
