import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Phone, 
  Layers, 
  Lock, 
  Eye, 
  Crown,
  FileSpreadsheet,
  Link as LinkIcon,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getAllServices } from '../../data/servicesData';
import AdminServiceModal from './AdminServiceModal';
import ServiceIcon from '../../components/ServiceIcon';

export default function AdminServicesManager() {
  const { isSuperAdmin, isViewOnly } = useAdminAuth();

  const [servicesList, setServicesList] = useState(() => getAllServices());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const refreshServices = () => {
    setServicesList(getAllServices());
  };

  useEffect(() => {
    const handleChanged = () => refreshServices();
    window.addEventListener('apna_services_changed', handleChanged);
    return () => window.removeEventListener('apna_services_changed', handleChanged);
  }, []);

  const handleOpenAdd = () => {
    if (isViewOnly) return;
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setIsModalOpen(true);
  };

  // Filtered services
  const filtered = servicesList.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      s.title.toLowerCase().includes(term) ||
      (s.hindiTitle && s.hindiTitle.toLowerCase().includes(term)) ||
      s.slug.toLowerCase().includes(term) ||
      (s.shortName && s.shortName.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = servicesList.length;
  const activeCount = servicesList.filter(s => s.status === 'active').length;
  const phase2Count = servicesList.filter(s => s.status === 'phase2').length;

  return (
    <div>
      {/* Top Controls Strip - Crisp Clean Light Card */}
      <div className="admin-services-header-box">
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '18px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #F97316 0%, #16A34A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)'
                }}
              >
                <Layers size={20} />
              </div>
              <h2 className="admin-services-header-title">
                Services Catalog Manager
              </h2>
            </div>
            <p className="admin-services-header-desc">
              Configure live citizen services, update Google Form URLs, map Google Sheet response targets, and manage helplines.
            </p>
          </div>

          {/* Add Service Button */}
          <div>
            {isSuperAdmin ? (
              <button 
                type="button" 
                className="admin-btn admin-btn-primary"
                style={{
                  fontWeight: 700,
                  padding: '10px 18px',
                  fontSize: '0.9rem'
                }}
                onClick={handleOpenAdd}
              >
                <Plus size={18} />
                <span>+ Add New Live Service</span>
              </button>
            ) : (
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                disabled
                title="Super Admin required to create services"
                style={{ opacity: 0.6 }}
              >
                <Lock size={15} style={{ color: '#F59E0B' }} />
                <span>+ Add Service (Super Admin Only)</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search 
              size={16} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-dim)' }} 
            />
            <input 
              type="text" 
              placeholder="Search by title, Hindi name, or slug..."
              className="admin-search-input"
              style={{ width: '100%', paddingLeft: '36px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({totalCount})</option>
            <option value="active">Active Live ({activeCount})</option>
            <option value="phase2">Phase 2 / Upcoming ({phase2Count})</option>
            <option value="inactive">Inactive / Hidden</option>
          </select>
        </div>
      </div>

      {/* Services Cards Grid */}
      <div className="admin-services-grid">
        {filtered.map((srv) => (
          <div 
            key={srv.id}
            className={`admin-service-card ${srv.status === 'active' ? 'active-service' : 'phase2-service'}`}
          >
            {/* Top info */}
            <div className="admin-service-card-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                <div 
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EA580C',
                    flexShrink: 0
                  }}
                >
                  <ServiceIcon iconName={srv.iconName} size={22} />
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span 
                    className={`admin-status-badge ${srv.status === 'active' ? 'status-completed' : srv.status === 'phase2' ? 'status-processing' : 'status-rejected'}`}
                    style={{ fontSize: '0.74rem' }}
                  >
                    ● {srv.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Service Titles - High Contrast Deep Slate Colors */}
              <h3 className="admin-service-title">
                {srv.title}
              </h3>
              <div className="admin-service-hindi">
                {srv.hindiTitle}
              </div>

              {/* Service Feature Badge */}
              <div style={{ marginBottom: '14px' }}>
                <span 
                  className="admin-role-pill"
                  style={{
                    background: srv.badgeColor === 'green' ? '#16A34A' : srv.badgeColor === 'blue' ? '#0284C7' : '#EA580C',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    padding: '3px 9px'
                  }}
                >
                  {srv.badge}
                </span>
              </div>

              {/* Integrations Indicator List - Clean Light Surface */}
              <div className="admin-service-integrations">
                {/* Google Form */}
                <div className="admin-service-row">
                  <span className="admin-service-row-label">
                    <LinkIcon size={14} style={{ color: '#F97316' }} /> Google Form:
                  </span>
                  {srv.formUrl ? (
                    <a 
                      href={srv.formUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="admin-service-link-configured"
                    >
                      <span>Configured</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Not linked</span>
                  )}
                </div>

                {/* Google Sheet */}
                <div className="admin-service-row">
                  <span className="admin-service-row-label">
                    <FileSpreadsheet size={14} style={{ color: '#16A34A' }} /> Sheet Responses:
                  </span>
                  {srv.spreadsheetUrl ? (
                    <a 
                      href={srv.spreadsheetUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="admin-service-link-connected"
                    >
                      <span>Connected</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Not linked</span>
                  )}
                </div>

                {/* Helpline */}
                <div className="admin-service-row">
                  <span className="admin-service-row-label">
                    <Phone size={14} style={{ color: '#D97706' }} /> Support Phone:
                  </span>
                  <span style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.84rem' }}>
                    +91 {srv.supportPhone || '9124494239'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="admin-service-footer">
              <a 
                href={`/service/${srv.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="admin-btn admin-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                title="Open user-facing service page"
              >
                <ExternalLink size={13} />
                <span>Live Page</span>
              </a>

              <button 
                type="button" 
                className="admin-btn admin-btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => handleOpenEdit(srv)}
              >
                {isSuperAdmin ? <Edit3 size={13} /> : <Eye size={13} />}
                <span>{isSuperAdmin ? 'Edit Service' : 'Inspect Details'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Service Edit / Add Modal */}
      <AdminServiceModal 
        isOpen={isModalOpen}
        service={editingService}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        onSaved={() => {
          refreshServices();
        }}
      />
    </div>
  );
}
