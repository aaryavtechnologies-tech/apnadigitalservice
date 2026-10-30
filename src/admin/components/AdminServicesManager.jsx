import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  ExternalLink, 
  Phone, 
  Layers, 
  Lock, 
  Eye, 
  QrCode, 
  IndianRupee, 
  UploadCloud, 
  CheckCircle, 
  FileCheck2
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getAllServices, getMasterQrCodeUrl, updateMasterQrCodeUrl } from '../../data/servicesData';
import { uploadDocumentToCloudinary } from '../services/cloudinaryService';
import AdminServiceModal from './AdminServiceModal';
import ServiceIcon from '../../components/ServiceIcon';

export default function AdminServicesManager() {
  const { isSuperAdmin, isViewOnly, role } = useAdminAuth();

  const [servicesList, setServicesList] = useState(() => getAllServices());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Master QR Code Manager State
  const [masterQr, setMasterQr] = useState('/default-payment-qr.png');
  const [isUploadingMasterQr, setIsUploadingMasterQr] = useState(false);
  const [masterQrNotice, setMasterQrNotice] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const refreshServices = () => {
    setServicesList(getAllServices());
  };

  useEffect(() => {
    getMasterQrCodeUrl().then(url => {
      if (url) setMasterQr(url);
    });

    const handleChanged = () => {
      refreshServices();
      getMasterQrCodeUrl().then(url => {
        if (url) setMasterQr(url);
      });
    };

    window.addEventListener('apna_services_changed', handleChanged);
    window.addEventListener('apna_settings_changed', handleChanged);
    return () => {
      window.removeEventListener('apna_services_changed', handleChanged);
      window.removeEventListener('apna_settings_changed', handleChanged);
    };
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

  // Upload New Master QR Code
  const handleUploadMasterQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file || isViewOnly) return;

    if (file.size > 5 * 1024 * 1024) {
      setMasterQrNotice({ type: 'error', text: 'Master QR code image size must be less than 5MB.' });
      return;
    }

    setIsUploadingMasterQr(true);
    setMasterQrNotice(null);

    const res = await uploadDocumentToCloudinary(file);
    setIsUploadingMasterQr(false);

    if (res.success && res.secureUrl) {
      setMasterQr(res.secureUrl);
      const updateRes = await updateMasterQrCodeUrl(res.secureUrl, role);
      if (updateRes.success) {
        setMasterQrNotice({ type: 'success', text: 'Master QR code updated and deployed live!' });
      } else {
        setMasterQrNotice({ type: 'error', text: updateRes.error || 'Failed to update master QR setting.' });
      }
    } else {
      setMasterQrNotice({ type: 'error', text: res.error || 'Cloudinary upload failed.' });
    }
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
      {/* 1. Master QR Code Global Strip */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: '1.5px solid #E2E8F0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a 
            href={masterQr}
            target="_blank"
            rel="noopener noreferrer"
            title="Click to view / inspect full size QR image"
            style={{
              width: '76px',
              height: '96px',
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '10px',
              padding: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <img 
              src={masterQr} 
              alt="Master QR" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
              onError={(e) => { e.target.src = '/default-payment-qr.png'; }}
            />
          </a>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '12px' }}>
                GLOBAL PAYMENT GATEWAY
              </span>
              <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Active on all forms
              </span>
            </div>
            <h3 style={{ margin: '4px 0 2px', fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              Master Payment QR Code & Scan-to-Pay
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B' }}>
              Customers scan this QR code to pay the service fee. You can change this QR code image anytime.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {masterQrNotice && (
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: masterQrNotice.type === 'error' ? '#DC2626' : '#16A34A'
            }}>
              {masterQrNotice.text}
            </span>
          )}

          {!isViewOnly ? (
            <label 
              className="admin-btn admin-btn-primary" 
              style={{ cursor: isUploadingMasterQr ? 'wait' : 'pointer', padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <UploadCloud size={16} />
              <span>{isUploadingMasterQr ? 'Uploading QR...' : 'Change Master QR Code'}</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUploadMasterQr}
                disabled={isUploadingMasterQr}
              />
            </label>
          ) : (
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              (Master QR managed by Super Admin)
            </span>
          )}
        </div>
      </div>

      {/* 2. Top Controls Strip - Crisp Clean Light Card */}
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
                Native Services & Dynamic Forms Manager
              </h2>
            </div>
            <p className="admin-services-header-desc">
              Manage website services, customize form questions for each service, set fees, and review active offerings.
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
                <span>+ Add New Service</span>
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

        {/* Real-time Filters Bar */}
        <div className="admin-services-filter-row">
          <div className="admin-services-search-wrap">
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              placeholder="Search by title, Hindi, slug, or keywords..."
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className={`admin-pill-filter ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({totalCount})
            </button>
            <button 
              type="button"
              className={`admin-pill-filter ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              Active ({activeCount})
            </button>
            <button 
              type="button"
              className={`admin-pill-filter ${statusFilter === 'phase2' ? 'active' : ''}`}
              onClick={() => setStatusFilter('phase2')}
            >
              Phase 2 ({phase2Count})
            </button>
          </div>
        </div>
      </div>

      {/* 3. Services Cards Grid */}
      <div className="admin-services-grid">
        {filtered.map((srv) => {
          const fieldsCount = Array.isArray(srv.formFields) ? srv.formFields.length : 0;
          const fee = srv.serviceCharge || '100';

          return (
            <div key={srv.id} className="admin-service-card">
              <div className="admin-service-body">
                {/* Header Row: Icon + Catalog Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div 
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#FFF7ED',
                      border: '1.5px solid #FED7AA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F97316'
                    }}
                  >
                    <ServiceIcon name={srv.iconName} size={24} color="#EA580C" />
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

                {/* Service Titles */}
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

                {/* Form & Pricing Integrations */}
                <div className="admin-service-integrations">
                  {/* Service Charge */}
                  <div className="admin-service-row">
                    <span className="admin-service-row-label">
                      <IndianRupee size={14} style={{ color: '#16A34A' }} /> Service Charge:
                    </span>
                    <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.92rem' }}>
                      ₹{fee}/-
                    </span>
                  </div>

                  {/* Dynamic Form Fields */}
                  <div className="admin-service-row">
                    <span className="admin-service-row-label">
                      <FileCheck2 size={14} style={{ color: '#0284C7' }} /> Form Questions:
                    </span>
                    <span style={{ color: '#0284C7', fontWeight: 700, fontSize: '0.84rem' }}>
                      {fieldsCount} custom {fieldsCount === 1 ? 'field' : 'fields'}
                    </span>
                  </div>

                  {/* Payment QR Code */}
                  <div className="admin-service-row">
                    <span className="admin-service-row-label">
                      <QrCode size={14} style={{ color: '#D97706' }} /> Payment QR:
                    </span>
                    <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.82rem' }}>
                      UPI Scan & Pay Active
                    </span>
                  </div>

                  {/* Helpline */}
                  <div className="admin-service-row">
                    <span className="admin-service-row-label">
                      <Phone size={14} style={{ color: '#475569' }} /> Helpline:
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
                  <span>View Page</span>
                </a>

                <button 
                  type="button" 
                  className="admin-btn admin-btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={() => handleOpenEdit(srv)}
                >
                  {isSuperAdmin ? <Edit3 size={13} /> : <Eye size={13} />}
                  <span>{isSuperAdmin ? 'Edit Form & Price' : 'Inspect Details'}</span>
                </button>
              </div>
            </div>
          );
        })}
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
