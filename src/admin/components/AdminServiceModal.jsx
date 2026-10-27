import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Eye, 
  Crown, 
  Layers, 
  ExternalLink, 
  FileText, 
  Vote, 
  CreditCard, 
  Car, 
  Truck, 
  UserPlus, 
  FileEdit, 
  Fingerprint, 
  ShieldCheck,
  Save,
  Trash2,
  HelpCircle,
  Link as LinkIcon
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { saveServiceByAdmin, deleteServiceByAdmin } from '../../data/servicesData';
import ServiceIcon from '../../components/ServiceIcon';

const AVAILABLE_ICONS = [
  { name: 'CreditCard', label: 'PAN / Card' },
  { name: 'Vote', label: 'Voter ID' },
  { name: 'Car', label: 'Driving Licence' },
  { name: 'Truck', label: 'Vehicle RC' },
  { name: 'UserPlus', label: 'New Member' },
  { name: 'FileEdit', label: 'Correction' },
  { name: 'Fingerprint', label: 'e-KYC' },
  { name: 'ShieldCheck', label: 'Security' },
  { name: 'FileText', label: 'Document' }
];

const BADGE_COLORS = [
  { value: 'saffron', label: 'Saffron Orange' },
  { value: 'green', label: 'India Green' },
  { value: 'blue', label: 'Sky Blue' },
  { value: 'purple', label: 'Royal Purple' }
];

export default function AdminServiceModal({ service, isOpen, onClose, onSaved }) {
  if (!isOpen) return null;

  const { isSuperAdmin, isViewOnly, role } = useAdminAuth();
  const isEditing = Boolean(service && service.id);

  // Form State
  const [title, setTitle] = useState(service?.title || '');
  const [hindiTitle, setHindiTitle] = useState(service?.hindiTitle || '');
  const [shortName, setShortName] = useState(service?.shortName || '');
  const [slug, setSlug] = useState(service?.slug || '');
  const [badge, setBadge] = useState(service?.badge || 'Live Service');
  const [badgeColor, setBadgeColor] = useState(service?.badgeColor || 'saffron');
  const [iconName, setIconName] = useState(service?.iconName || 'FileText');
  const [status, setStatus] = useState(service?.status || 'active');
  const [formUrl, setFormUrl] = useState(service?.formUrl || '');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(service?.spreadsheetUrl || '');
  const [supportPhone, setSupportPhone] = useState(service?.supportPhone || '9124494239');
  const [description, setDescription] = useState(service?.description || '');
  const [requirementsText, setRequirementsText] = useState(
    Array.isArray(service?.requirements) ? service.requirements.join('\n') : ''
  );
  const [workflowText, setWorkflowText] = useState(
    Array.isArray(service?.workflow) ? service.workflow.join('\n') : ''
  );

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Auto-slugify on title change if not editing
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
    if (!isEditing && !shortName) {
      setShortName(val.slice(0, 22));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isViewOnly) return;

    if (!title.trim()) {
      setNotice({ type: 'error', text: 'Service title is required.' });
      return;
    }

    setSaving(true);
    setNotice(null);

    const payload = {
      ...(service || {}),
      id: service?.id,
      title: title.trim(),
      hindiTitle: hindiTitle.trim() || title.trim(),
      shortName: shortName.trim() || title.slice(0, 22),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      badge: badge.trim(),
      badgeColor,
      iconName,
      status,
      formUrl: formUrl.trim() || null,
      spreadsheetUrl: spreadsheetUrl.trim() || null,
      supportPhone: supportPhone.trim() || '9124494239',
      description: description.trim(),
      requirements: requirementsText.trim() ? requirementsText.split('\n').map(s => s.trim()).filter(Boolean) : [],
      workflow: workflowText.trim() ? workflowText.split('\n').map(s => s.trim()).filter(Boolean) : []
    };

    const res = saveServiceByAdmin(payload, role);
    setSaving(false);

    if (res.success) {
      setNotice({ type: 'success', text: `Service "${payload.title}" saved successfully!` });
      if (onSaved) onSaved(res.service);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setNotice({ type: 'error', text: res.error || 'Failed to save service.' });
    }
  };

  const handleDelete = () => {
    if (isViewOnly || !isEditing) return;
    const confirmed = window.confirm(`Are you sure you want to delete or deactivate service "${title}"?`);
    if (!confirmed) return;

    const res = deleteServiceByAdmin(service.id, role);
    if (res.success) {
      if (onSaved) onSaved();
      onClose();
    } else {
      setNotice({ type: 'error', text: res.error || 'Failed to delete service.' });
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="admin-modal-header" style={{ borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #F97316 0%, #16A34A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>
                {isEditing ? `Edit Service: ${service.shortName || service.title}` : 'Add New Live Service'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                {isEditing 
                  ? 'Update Google Form, Sheet link, status, and display details'
                  : 'Instantly publish a new service to the customer catalog and detail page'}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="admin-btn admin-btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">
          {/* View-Only Warning */}
          {isViewOnly && (
            <div className="view-only-lock-alert">
              <Eye size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>View-Only Mode Enforced:</strong> You are inspecting this service with Admin read-only permissions. Modifying service fields or adding new services requires Super Admin credentials.
              </div>
            </div>
          )}

          {/* Action Notice */}
          {notice && (
            <div 
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                background: notice.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                color: notice.type === 'success' ? '#15803D' : '#B91C1C',
                border: `1px solid ${notice.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {notice.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{notice.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Service Preview Card - Light Mode Warm Glass */}
            <div 
              style={{
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#FFFFFF',
                    border: '1px solid #FED7AA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EA580C',
                    flexShrink: 0
                  }}
                >
                  <ServiceIcon iconName={iconName} size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                      {title || 'Service Title Here'}
                    </span>
                    <span 
                      className="admin-role-pill"
                      style={{
                        background: badgeColor === 'green' ? '#16A34A' : badgeColor === 'blue' ? '#0284C7' : '#EA580C',
                        color: '#FFFFFF',
                        fontSize: '0.7rem'
                      }}
                    >
                      {badge || 'Badge'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
                    {hindiTitle || 'हिंदी शीर्षक यहाँ दिखेगा'} • Slug: <code style={{ color: '#0284C7', fontWeight: 600 }}>/service/{slug || 'service-slug'}</code>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  className={`admin-status-badge ${status === 'active' ? 'status-completed' : status === 'phase2' ? 'status-processing' : 'status-rejected'}`}
                >
                  ● {status.toUpperCase()}
                </span>
                {isEditing && (
                  <a 
                    href={`/service/${slug}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="admin-btn admin-btn-secondary" 
                    style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                  >
                    <ExternalLink size={13} />
                    <span>View Customer Page</span>
                  </a>
                )}
              </div>
            </div>

            {/* Field Grid */}
            <div className="admin-modal-grid">
              {/* Left Column: Core Identity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-input-group">
                  <label>Service Title (English) *</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => handleTitleChange(e.target.value)} 
                    placeholder="e.g. PAN Card PDF Download Assistance"
                    disabled={isViewOnly}
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label>Hindi Title (हिंदी)</label>
                  <input 
                    type="text" 
                    value={hindiTitle} 
                    onChange={(e) => setHindiTitle(e.target.value)} 
                    placeholder="e.g. पैन कार्ड पीडीएफ डाउनलोड सहायता"
                    disabled={isViewOnly}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-input-group">
                    <label>Short Name (Chips)</label>
                    <input 
                      type="text" 
                      value={shortName} 
                      onChange={(e) => setShortName(e.target.value)} 
                      placeholder="e.g. PAN Card PDF"
                      disabled={isViewOnly}
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>URL Slug (/service/slug)</label>
                    <input 
                      type="text" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value)} 
                      placeholder="e.g. pan-card-pdf"
                      disabled={isViewOnly}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-input-group">
                    <label>Badge Text</label>
                    <input 
                      type="text" 
                      value={badge} 
                      onChange={(e) => setBadge(e.target.value)} 
                      placeholder="e.g. High Demand • Instant"
                      disabled={isViewOnly}
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>Badge Color</label>
                    <select 
                      className="admin-select"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      disabled={isViewOnly}
                    >
                      {BADGE_COLORS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-input-group">
                    <label>Category Icon</label>
                    <select 
                      className="admin-select"
                      value={iconName}
                      onChange={(e) => setIconName(e.target.value)}
                      disabled={isViewOnly}
                    >
                      {AVAILABLE_ICONS.map(i => (
                        <option key={i.name} value={i.name}>{i.label} ({i.name})</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label>Catalog Status</label>
                    <select 
                      className="admin-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={isViewOnly}
                    >
                      <option value="active">Active (Visible in Catalog)</option>
                      <option value="phase2">Phase 2 (Upcoming Badge)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Links, Google Forms & Helplines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LinkIcon size={14} style={{ color: '#F97316' }} />
                    <span>Customer Google Form URL (Step 1)</span>
                  </label>
                  <input 
                    type="url" 
                    value={formUrl} 
                    onChange={(e) => setFormUrl(e.target.value)} 
                    placeholder="https://forms.gle/..."
                    disabled={isViewOnly}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>
                    Opens in a new tab when customer clicks "Proceed to Form"
                  </span>
                </div>

                <div className="admin-input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ExternalLink size={14} style={{ color: '#16A34A' }} />
                    <span>Google Sheets Responses URL (Admin Matching)</span>
                  </label>
                  <input 
                    type="url" 
                    value={spreadsheetUrl} 
                    onChange={(e) => setSpreadsheetUrl(e.target.value)} 
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    disabled={isViewOnly}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>
                    Admin clicks this from the queue to quickly match records
                  </span>
                </div>

                <div className="admin-input-group">
                  <label>Dedicated Support Helpline (10-Digit Mobile)</label>
                  <input 
                    type="tel" 
                    value={supportPhone} 
                    onChange={(e) => setSupportPhone(e.target.value)} 
                    placeholder="e.g. 9124494239"
                    disabled={isViewOnly}
                  />
                </div>

                <div className="admin-input-group">
                  <label>Short Description (Shown on Home & Detail Page)</label>
                  <textarea 
                    className="admin-search-input"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Assistance for customers who need..."
                    disabled={isViewOnly}
                    style={{ minHeight: '68px' }}
                  />
                </div>

                <div className="admin-input-group">
                  <label>Required Documents (One per line)</label>
                  <textarea 
                    className="admin-search-input"
                    rows="3"
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    placeholder="Voter EPIC Number or Name&#10;Father / Husband Name&#10;WhatsApp Mobile Number"
                    disabled={isViewOnly}
                    style={{ minHeight: '68px' }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0'
              }}
            >
              {isEditing && isSuperAdmin ? (
                <button 
                  type="button" 
                  className="admin-btn admin-btn-danger" 
                  onClick={handleDelete}
                  style={{ fontSize: '0.84rem' }}
                >
                  <Trash2 size={14} />
                  <span>Deactivate Service</span>
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={onClose}
                >
                  Close
                </button>

                {isSuperAdmin ? (
                  <button 
                    type="submit" 
                    className="admin-btn"
                    style={{
                      background: 'linear-gradient(90deg, #F97316 0%, #16A34A 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)'
                    }}
                    disabled={saving}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : isEditing ? 'Save Service Changes' : 'Publish New Service'}</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-secondary" 
                    disabled 
                    title="Super Admin privileges required to edit services"
                  >
                    <Lock size={14} style={{ color: '#F59E0B' }} />
                    <span>Restricted to Super Admin</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
