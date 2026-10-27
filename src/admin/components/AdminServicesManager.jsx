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
      {/* Top Controls Strip */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.95) 100%)',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '20px'
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
                  color: '#fff'
                }}
              >
                <Layers size={20} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC' }}>
                Services Catalog Manager
              </h2>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
              Configure live citizen services, update Google Form URLs, map Google Sheet response targets, and manage helplines.
            </p>
          </div>

          {/* Add Service Button */}
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
                  padding: '10px 20px',
                  fontSize: '0.92rem'
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
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {filtered.map((srv) => (
          <div 
            key={srv.id}
            className="admin-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              border: srv.status === 'active' ? '1px solid rgba(22, 163, 74, 0.4)' : '1px solid #334155'
            }}
          >
            {/* Top info */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                <div 
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F97316'
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

              <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
                {srv.title}
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '10px' }}>
                {srv.hindiTitle}
              </div>

              {/* Badge */}
              <div style={{ marginBottom: '14px' }}>
                <span 
                  className="admin-role-pill"
                  style={{
                    background: srv.badgeColor === 'green' ? '#16A34A' : srv.badgeColor === 'blue' ? '#0284C7' : '#F97316',
                    color: '#FFFFFF',
                    fontSize: '0.72rem'
                  }}
                >
                  {srv.badge}
                </span>
              </div>

              {/* Integrations Indicator List */}
              <div 
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.8rem'
                }}
              >
                {/* Google Form */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LinkIcon size={13} style={{ color: '#F97316' }} /> Google Form:
                  </span>
                  {srv.formUrl ? (
                    <a 
                      href={srv.formUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#38BDF8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Configured</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ color: 'var(--admin-text-dim)' }}>Not linked</span>
                  )}
                </div>

                {/* Google Sheet */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileSpreadsheet size={13} style={{ color: '#16A34A' }} /> Sheet Responses:
                  </span>
                  {srv.spreadsheetUrl ? (
                    <a 
                      href={srv.spreadsheetUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#34D399', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Connected</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ color: 'var(--admin-text-dim)' }}>Not linked</span>
                  )}
                </div>

                {/* Helpline */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} style={{ color: '#F59E0B' }} /> Support Phone:
                  </span>
                  <span style={{ color: '#F8FAFC', fontWeight: 600 }}>
                    +91 {srv.supportPhone || '9124494239'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div 
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #334155',
                background: 'rgba(30, 41, 59, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
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
