import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Layers, 
  ExternalLink, 
  FileText, 
  Save, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  QrCode, 
  IndianRupee, 
  UploadCloud, 
  Eye, 
  FileCheck2,
  Calendar,
  Phone,
  Sparkles
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { saveServiceByAdmin, deleteServiceByAdmin } from '../../data/servicesData';
import { uploadDocumentToCloudinary } from '../services/cloudinaryService';
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
  { name: 'FileText', label: 'Document / Tax' }
];

const CARD_THEMES = [
  { value: 'tricolour', label: '🇮🇳 Indian Tri-colour (Auto-cycle)', hex: '#FF9933' },
  { value: 'saffron', label: '🇮🇳 Saffron / Kesari', hex: '#EA580C' },
  { value: 'navy', label: '🇮🇳 Ashoka Navy Blue', hex: '#1E3A8A' },
  { value: 'green', label: '🇮🇳 India Green / Harit', hex: '#16A34A' },
  { value: 'ocean', label: '🌊 Oceanic Cyan Blue', hex: '#0284C7' },
  { value: 'teal', label: '🌿 Petrol Teal', hex: '#0D9488' },
  { value: 'midnight', label: '🌌 Midnight Navy', hex: '#0F172A' },
  { value: 'purple', label: '🔮 Royal Purple', hex: '#9333EA' },
  { value: 'coral', label: '🌺 Crimson Coral', hex: '#E11D48' }
];

const BADGE_COLORS = [
  { value: 'saffron', label: 'Saffron Orange' },
  { value: 'green', label: 'India Green' },
  { value: 'blue', label: 'Sky Blue' },
  { value: 'purple', label: 'Royal Purple' }
];

const FIELD_TYPES = [
  { type: 'text', label: 'Text Input (Single Line)', icon: FileText },
  { type: 'number', label: 'Numeric (Digits Only)', icon: FileCheck2 },
  { type: 'date', label: 'Date Picker (DD-MM-YYYY)', icon: Calendar },
  { type: 'tel', label: 'Mobile / WhatsApp Number', icon: Phone },
  { type: 'file', label: 'Document / File Upload (PDF/Image)', icon: UploadCloud },
  { type: 'select', label: 'Dropdown Selection', icon: Layers },
  { type: 'textarea', label: 'Textarea (Multi-line)', icon: FileText }
];

export default function AdminServiceModal({ service, isOpen, onClose, onSaved }) {
  const { isSuperAdmin, isViewOnly, role } = useAdminAuth();
  const isEditing = Boolean(service && service.id);

  // Active Tab: 'card' | 'details' | 'fields' | 'payment' | 'preview'
  const [activeTab, setActiveTab] = useState('card');

  // Homepage Card Appearance State
  const [cardTitle, setCardTitle] = useState(service?.cardTitle || service?.shortName || service?.title || '');
  const [cardSubtitle, setCardSubtitle] = useState(service?.cardSubtitle || service?.description?.slice(0, 75) || '');
  const [cardButtonText, setCardButtonText] = useState(service?.cardButtonText || 'DOWNLOAD →');
  const [cardTheme, setCardTheme] = useState(service?.cardTheme || 'blue');

  // Service Page Identity State
  const [title, setTitle] = useState(service?.title || '');
  const [hindiTitle, setHindiTitle] = useState(service?.hindiTitle || '');
  const [shortName, setShortName] = useState(service?.shortName || '');
  const [slug, setSlug] = useState(service?.slug || '');
  const [badge, setBadge] = useState(service?.badge || 'Live Service');
  const [badgeColor, setBadgeColor] = useState(service?.badgeColor || 'saffron');
  const [iconName, setIconName] = useState(service?.iconName || 'FileText');
  const [status, setStatus] = useState(service?.status || 'active');
  const [supportPhone, setSupportPhone] = useState(service?.supportPhone || '8018246567');
  const [description, setDescription] = useState(service?.description || '');
  const [requirementsText, setRequirementsText] = useState(
    Array.isArray(service?.requirements) ? service.requirements.join('\n') : ''
  );

  // Payment & Pricing State
  const [serviceCharge, setServiceCharge] = useState(service?.serviceCharge || '100');
  const [qrCodeUrl, setQrCodeUrl] = useState(service?.qrCodeUrl || '/default-payment-qr.png');
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [qrUploadNotice, setQrUploadNotice] = useState(null);

  // Dynamic Form Fields State
  const [formFields, setFormFields] = useState(() => {
    if (Array.isArray(service?.formFields) && service.formFields.length > 0) {
      return service.formFields;
    }
    return [
      { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp Number', required: true }
    ];
  });

  // New Field Creator State
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');
  const [newRequired, setNewRequired] = useState(true);
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newOptionsStr, setNewOptionsStr] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Sync state whenever service prop updates
  useEffect(() => {
    if (service) {
      setCardTitle(service.cardTitle || service.shortName || service.title || '');
      setCardSubtitle(service.cardSubtitle || service.description?.slice(0, 75) || '');
      setCardButtonText(service.cardButtonText || 'DOWNLOAD →');
      setCardTheme(service.cardTheme || 'blue');
      setTitle(service.title || '');
      setHindiTitle(service.hindiTitle || '');
      setShortName(service.shortName || '');
      setSlug(service.slug || '');
      setBadge(service.badge || 'Live Service');
      setBadgeColor(service.badgeColor || 'saffron');
      setIconName(service.iconName || 'FileText');
      setStatus(service.status || 'active');
      setSupportPhone(service.supportPhone || '8018246567');
      setDescription(service.description || '');
      setRequirementsText(Array.isArray(service.requirements) ? service.requirements.join('\n') : '');
      setServiceCharge(service.serviceCharge || '100');
      setQrCodeUrl(service.qrCodeUrl || '/default-payment-qr.png');
      setFormFields(Array.isArray(service.formFields) && service.formFields.length > 0 
        ? service.formFields 
        : [{ id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp Number', required: true }]
      );
    } else {
      setCardTitle('');
      setCardSubtitle('');
      setCardButtonText('DOWNLOAD →');
      setCardTheme('blue');
      setTitle('');
      setHindiTitle('');
      setShortName('');
      setSlug('');
      setBadge('Live Service');
      setBadgeColor('saffron');
      setIconName('FileText');
      setStatus('active');
      setSupportPhone('8018246567');
      setDescription('');
      setRequirementsText('');
      setServiceCharge('100');
      setQrCodeUrl('/default-payment-qr.png');
      setFormFields([{ id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp Number', required: true }]);
    }
  }, [service, isOpen]);

  if (!isOpen) return null;

  // Auto-slugify on title change if not editing
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
    if (!isEditing && !shortName) {
      setShortName(val.slice(0, 22));
    }
    if (!isEditing && !cardTitle) {
      setCardTitle(val.slice(0, 20));
    }
  };

  // Field Management Helpers
  const handleCreateField = () => {
    if (!newLabel.trim()) return;

    const fieldKey = newLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '') || `field_${Date.now()}`;

    const newFieldObj = {
      id: `${fieldKey}_${Date.now().toString().slice(-4)}`,
      label: newLabel.trim(),
      type: newType,
      required: newRequired,
      placeholder: newPlaceholder.trim() || `Enter ${newLabel.trim()}`,
      options: newType === 'select' && newOptionsStr.trim()
        ? newOptionsStr.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    setFormFields(prev => [...prev, newFieldObj]);
    setNewLabel('');
    setNewType('text');
    setNewPlaceholder('');
    setNewOptionsStr('');
    setNewRequired(true);
    setIsAddingField(false);
  };

  const handleRemoveField = (idx) => {
    setFormFields(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMoveField = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= formFields.length) return;
    const copy = [...formFields];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setFormFields(copy);
  };

  // Upload Custom QR Code to Cloudinary
  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setQrUploadNotice({ type: 'error', text: 'QR code image size must be less than 5MB.' });
      return;
    }

    setIsUploadingQr(true);
    setQrUploadNotice(null);

    const res = await uploadDocumentToCloudinary(file);
    setIsUploadingQr(false);

    if (res.success && res.secureUrl) {
      setQrCodeUrl(res.secureUrl);
      setQrUploadNotice({ type: 'success', text: 'Custom QR code uploaded to Cloudinary!' });
    } else {
      setQrUploadNotice({ type: 'error', text: res.error || 'Failed to upload QR code.' });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isViewOnly) return;

    if (!title.trim() && !cardTitle.trim()) {
      setNotice({ type: 'error', text: 'Service card title is required.' });
      return;
    }

    setSaving(true);
    setNotice(null);

    const finalTitle = title.trim() || cardTitle.trim() || 'Untitled Service';

    const payload = {
      ...(service || {}),
      id: service?.id,
      cardTitle: cardTitle.trim() || shortName.trim() || finalTitle.slice(0, 22),
      cardSubtitle: cardSubtitle.trim() || description.slice(0, 75) || 'Download official verified copy',
      cardButtonText: cardButtonText.trim() || 'DOWNLOAD →',
      cardTheme: cardTheme || 'blue',
      title: finalTitle,
      hindiTitle: hindiTitle.trim() || finalTitle,
      shortName: shortName.trim() || cardTitle.trim() || finalTitle.slice(0, 22),
      slug: slug.trim() || finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      badge: badge.trim(),
      badgeColor,
      iconName,
      status,
      serviceCharge: serviceCharge.trim() || '100',
      qrCodeUrl: qrCodeUrl.trim() || '/default-payment-qr.png',
      formFields: formFields,
      supportPhone: supportPhone.trim() || '8018246567',
      description: description.trim() || cardSubtitle.trim(),
      requirements: requirementsText.trim() ? requirementsText.split('\n').map(s => s.trim()).filter(Boolean) : []
    };

    const res = saveServiceByAdmin(payload, role);
    setSaving(false);

    if (res.success) {
      setNotice({ type: 'success', text: `Service "${payload.cardTitle || payload.title}" saved successfully!` });
      if (onSaved) onSaved(res.service);
      setTimeout(() => {
        onClose();
      }, 900);
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
      <div 
        className="admin-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '980px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="admin-modal-header" style={{ borderBottom: '1px solid #E2E8F0', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #F97316 0%, #16A34A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <ServiceIcon name={iconName} size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                  {isEditing ? `Edit: ${service.title}` : 'Add New Assisted Service'}
                </h3>
                <span className={`admin-status-badge ${status === 'active' ? 'status-completed' : 'status-processing'}`}>
                  ● {status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Configure service details, dynamic form questions, and QR code scan-and-pay
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="admin-close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', padding: '0 24px', overflowX: 'auto' }}>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
            onClick={() => setActiveTab('card')}
            style={{ padding: '12px 18px', fontSize: '0.88rem' }}
          >
            <Sparkles size={16} />
            <span>1. Homepage Card UI</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
            style={{ padding: '12px 18px', fontSize: '0.88rem' }}
          >
            <FileText size={16} />
            <span>2. Service Page Details</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
            onClick={() => setActiveTab('fields')}
            style={{ padding: '12px 18px', fontSize: '0.88rem' }}
          >
            <Layers size={16} />
            <span>3. Form Fields Builder</span>
            <span className="admin-tab-count" style={{ background: '#0284C7', color: '#FFFFFF' }}>
              {formFields.length}
            </span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
            style={{ padding: '12px 18px', fontSize: '0.88rem' }}
          >
            <QrCode size={16} />
            <span>4. Payment & QR</span>
            <span style={{ fontSize: '0.74rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              ₹{serviceCharge}
            </span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
            style={{ padding: '12px 18px', fontSize: '0.88rem' }}
          >
            <Eye size={16} />
            <span>5. Live Preview</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {notice && (
            <div 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                background: notice.type === 'error' ? '#FEE2E2' : '#DCFCE7',
                color: notice.type === 'error' ? '#991B1B' : '#166534',
                border: notice.type === 'error' ? '1px solid #FCA5A5' : '1px solid #86EFAC'
              }}
            >
              {notice.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              <span>{notice.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} id="service-form">
            {/* TAB 1: HOMEPAGE CARD UI (Exact Match With Marked Mockup) */}
            {activeTab === 'card' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '0.86rem',
                    color: '#1E40AF',
                    lineHeight: 1.45
                  }}>
                    <strong>Homepage Service Card Styling:</strong> Configure the title, 1-line subtitle, action button, and color theme. The card will appear exactly like this on the customer homepage grid.
                  </div>

                  <div className="admin-input-group">
                    <label>Card Title (Display on Card) *</label>
                    <input 
                      type="text" 
                      value={cardTitle} 
                      onChange={(e) => setCardTitle(e.target.value)} 
                      placeholder="e.g. DL Download, RC Download, PAN Find"
                      disabled={isViewOnly}
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Keep it concise (1-3 words) for clean card appearance</span>
                  </div>

                  <div className="admin-input-group">
                    <label>Card Subtitle (1-line description) *</label>
                    <input 
                      type="text" 
                      value={cardSubtitle} 
                      onChange={(e) => setCardSubtitle(e.target.value)} 
                      placeholder="e.g. Download Driving Licence PDF instantly"
                      disabled={isViewOnly}
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Short 1-line prompt, avoid heavy text or paragraphs</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="admin-input-group">
                      <label>Card Button Text</label>
                      <input 
                        type="text" 
                        value={cardButtonText} 
                        onChange={(e) => setCardButtonText(e.target.value)} 
                        placeholder="e.g. DOWNLOAD →, APPLY →, SEARCH →"
                        disabled={isViewOnly}
                      />
                    </div>

                    <div className="admin-input-group">
                      <label>Service Fee (₹)</label>
                      <input 
                        type="number" 
                        value={serviceCharge} 
                        onChange={(e) => setServiceCharge(e.target.value)} 
                        placeholder="e.g. 100"
                        disabled={isViewOnly}
                      />
                    </div>
                  </div>

                  {/* Card Theme Color Selector */}
                  <div className="admin-input-group">
                    <label>Card Color Theme</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '4px' }}>
                      {CARD_THEMES.map(theme => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => !isViewOnly && setCardTheme(theme.value)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: cardTheme === theme.value ? `2px solid ${theme.hex}` : '1.5px solid #E2E8F0',
                            background: cardTheme === theme.value ? '#F8FAFC' : '#FFFFFF',
                            cursor: isViewOnly ? 'default' : 'pointer',
                            textAlign: 'left',
                            boxShadow: cardTheme === theme.value ? `0 0 0 2px ${theme.hex}33` : 'none'
                          }}
                        >
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.hex, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.80rem', fontWeight: cardTheme === theme.value ? 700 : 500, color: '#1E293B' }}>
                            {theme.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="admin-input-group">
                      <label>Icon Symbol</label>
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
                        <option value="active">Active (Visible on Homepage)</option>
                        <option value="phase2">Phase 2 (Upcoming Service)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Card Preview */}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                    Live Homepage Card Preview
                  </div>

                  <div style={{ maxWidth: '300px' }}>
                    <div className={`custom-service-card card-theme-${cardTheme === 'tricolour' ? 'saffron' : (cardTheme || 'saffron')}`} style={{ pointerEvents: 'none' }}>
                      <div className="card-watermark-circle" aria-hidden="true" />

                      <div className="card-top-row">
                        <div className="card-frosted-icon-badge">
                          <ServiceIcon name={iconName} size={22} color="#FFFFFF" />
                        </div>
                        <span className="card-price-pill">
                          ₹{serviceCharge || '100'}
                        </span>
                      </div>

                      <div className="card-body-content">
                        <h3 className="card-heading-title">
                          {cardTitle || title || 'Driving Licence PDF'}
                        </h3>
                        <p className="card-subtext-desc">
                          {cardSubtitle || 'Assistance for customers who need to download an available Driving Licence'}
                        </p>
                      </div>

                      <div className="card-bottom-row">
                        <span className="card-pill-button">
                          {cardButtonText || 'DOWNLOAD →'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '14px', lineHeight: 1.4 }}>
                    ℹ️ The full service page will open at <code>/service/{slug || 'service-name'}</code> when customer clicks this card. You can configure that page in Tab 2.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SERVICE PAGE DETAILS */}
            {activeTab === 'details' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="admin-input-group">
                    <label>Service Title (English) *</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => handleTitleChange(e.target.value)} 
                      placeholder="e.g. Voter ID / e-EPIC PDF Download Assistance"
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
                      placeholder="e.g. वोटर कार्ड पीडीएफ डाउनलोड (बिना ओटीपी)"
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
                        placeholder="e.g. Voter ID PDF"
                        disabled={isViewOnly}
                      />
                    </div>

                    <div className="admin-input-group">
                      <label>URL Slug (/service/slug)</label>
                      <input 
                        type="text" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)} 
                        placeholder="e.g. voter-id-pdf"
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
                        placeholder="e.g. Without OTP • High Demand"
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
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="admin-input-group">
                      <label>Icon Symbol</label>
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
                        <option value="active">Active (Visible to public)</option>
                        <option value="phase2">Phase 2 (Upcoming Service)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-input-group">
                    <label>Dedicated Helpline Phone (10 digits)</label>
                    <input 
                      type="tel" 
                      value={supportPhone} 
                      onChange={(e) => setSupportPhone(e.target.value)} 
                      placeholder="e.g. 9124494239"
                      disabled={isViewOnly}
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>Short Description (Shown on card)</label>
                    <textarea 
                      className="admin-search-input"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Assistance for customers who need..."
                      disabled={isViewOnly}
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>Required Documents / Checklist (One per line)</label>
                    <textarea 
                      className="admin-search-input"
                      rows="3"
                      value={requirementsText}
                      onChange={(e) => setRequirementsText(e.target.value)}
                      placeholder="Voter EPIC Number or Name&#10;Father / Husband Name&#10;WhatsApp Mobile Number"
                      disabled={isViewOnly}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DYNAMIC FORM FIELDS BUILDER */}
            {activeTab === 'fields' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                      Custom Service Form Fields
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748B' }}>
                      These fields will appear on the customer application form for this service.
                    </p>
                  </div>

                  {!isAddingField && !isViewOnly && (
                    <button
                      type="button"
                      className="admin-btn"
                      style={{ background: '#0284C7', color: '#FFFFFF', fontSize: '0.84rem' }}
                      onClick={() => setIsAddingField(true)}
                    >
                      <Plus size={16} />
                      <span>Add New Field</span>
                    </button>
                  )}
                </div>

                {/* New Field Creator Card */}
                {isAddingField && (
                  <div style={{
                    background: '#F0F9FF',
                    border: '1.5px solid #BAE6FD',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0369A1', marginBottom: '12px' }}>
                      Add New Form Question / Field
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div className="admin-input-group">
                        <label>Field Question / Label *</label>
                        <input
                          type="text"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="e.g. Aadhaar Card PDF / Vehicle Number"
                          autoFocus
                        />
                      </div>

                      <div className="admin-input-group">
                        <label>Input Type *</label>
                        <select
                          className="admin-select"
                          value={newType}
                          onChange={(e) => setNewType(e.target.value)}
                        >
                          {FIELD_TYPES.map(t => (
                            <option key={t.type} value={t.type}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="admin-input-group">
                        <label>Mandatory / Required?</label>
                        <select
                          className="admin-select"
                          value={newRequired ? 'yes' : 'no'}
                          onChange={(e) => setNewRequired(e.target.value === 'yes')}
                        >
                          <option value="yes">Required (*)</option>
                          <option value="no">Optional</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: newType === 'select' ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '14px' }}>
                      <div className="admin-input-group">
                        <label>Placeholder / Helper Text</label>
                        <input
                          type="text"
                          value={newPlaceholder}
                          onChange={(e) => setNewPlaceholder(e.target.value)}
                          placeholder="e.g. Enter 10-digit number / Upload clear PDF"
                        />
                      </div>

                      {newType === 'select' && (
                        <div className="admin-input-group">
                          <label>Dropdown Options (Comma separated)</label>
                          <input
                            type="text"
                            value={newOptionsStr}
                            onChange={(e) => setNewOptionsStr(e.target.value)}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={() => setIsAddingField(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        style={{ background: '#0284C7', color: '#FFFFFF' }}
                        onClick={handleCreateField}
                      >
                        <Plus size={15} />
                        <span>Add Field to Form</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Fields List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formFields.map((field, idx) => (
                    <div 
                      key={field.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          background: '#F1F5F9', 
                          color: '#475569', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 800
                        }}>
                          {idx + 1}
                        </span>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.94rem' }}>
                              {field.label}
                            </span>
                            {field.required ? (
                              <span style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 800 }}>* Required</span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(Optional)</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', gap: '12px', marginTop: '2px' }}>
                            <span>Type: <strong style={{ color: '#0284C7' }}>{field.type}</strong></span>
                            {field.placeholder && <span>Placeholder: "{field.placeholder}"</span>}
                            {Array.isArray(field.options) && field.options.length > 0 && (
                              <span>Options: [{field.options.join(', ')}]</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 8px' }}
                          onClick={() => handleMoveField(idx, -1)}
                          disabled={idx === 0}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 8px' }}
                          onClick={() => handleMoveField(idx, 1)}
                          disabled={idx === formFields.length - 1}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        {!isViewOnly && (
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 8px' }}
                            onClick={() => handleRemoveField(idx)}
                            title="Delete Field"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px 16px', 
                  background: '#F8FAFC', 
                  borderRadius: '8px', 
                  border: '1px dashed #CBD5E1', 
                  fontSize: '0.82rem', 
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <QrCode size={16} style={{ color: '#F97316' }} />
                  <span>
                    <strong>Note:</strong> The Payment QR Code and Payment Screenshot Upload are automatically attached at the end of every service application form.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: PAYMENT & QR CODE */}
            {activeTab === 'payment' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="admin-input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IndianRupee size={16} style={{ color: '#16A34A' }} />
                      <span>Service Charge / Application Fee (₹) *</span>
                    </label>
                    <input 
                      type="number" 
                      value={serviceCharge} 
                      onChange={(e) => setServiceCharge(e.target.value)} 
                      placeholder="e.g. 115"
                      disabled={isViewOnly}
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      Displayed on the form above the QR Code (e.g. Service Charge: ₹{serviceCharge}/-)
                    </span>
                  </div>

                  <div className="admin-input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <QrCode size={16} style={{ color: '#F97316' }} />
                      <span>Payment QR Code Image URL</span>
                    </label>
                    <input 
                      type="text" 
                      value={qrCodeUrl} 
                      onChange={(e) => setQrCodeUrl(e.target.value)} 
                      placeholder="/default-payment-qr.png or https://res.cloudinary.com/..."
                      disabled={isViewOnly}
                    />
                  </div>

                  {!isViewOnly && (
                    <div style={{
                      border: '1.5px dashed #CBD5E1',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                      background: '#F8FAFC'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', marginBottom: '4px' }}>
                        Upload New QR Code Image to Cloudinary
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '12px' }}>
                        Supports JPG, PNG or WEBP (Direct Cloudinary upload)
                      </div>
                      <label className="admin-btn admin-btn-secondary" style={{ cursor: isUploadingQr ? 'wait' : 'pointer' }}>
                        <UploadCloud size={16} />
                        <span>{isUploadingQr ? 'Uploading to Cloudinary...' : 'Select QR Code Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleQrUpload}
                          disabled={isUploadingQr}
                        />
                      </label>
                      {qrUploadNotice && (
                        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: qrUploadNotice.type === 'error' ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
                          {qrUploadNotice.text}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => setQrCodeUrl('/default-payment-qr.png')}
                    >
                      Reset to Official Master QR
                    </button>
                  </div>
                </div>

                {/* QR Code Live Card Preview */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                    CUSTOMER PAYMENT DISPLAY
                  </div>
                  
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                    Service Charge: <span style={{ color: '#16A34A' }}>₹{serviceCharge}/-</span>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#FFFFFF',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}>
                    <img 
                      src={qrCodeUrl} 
                      alt="Payment QR Code" 
                      style={{ 
                        maxWidth: '260px', 
                        maxHeight: '360px', 
                        width: 'auto', 
                        height: 'auto', 
                        objectFit: 'contain', 
                        display: 'block', 
                        borderRadius: '6px' 
                      }}
                      onError={(e) => { e.target.src = '/default-payment-qr.png'; }}
                    />
                    <a
                      href={qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#0284C7',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>Open Full Size QR in New Tab</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LIVE FORM PREVIEW */}
            {activeTab === 'preview' && (
              <div style={{
                maxWidth: '560px',
                margin: '0 auto',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #CBD5E1',
                padding: '28px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.76rem', color: '#0284C7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    WEBSITE APPLICATION FORM
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
                    {title || 'Service Title Here'}
                  </h3>
                  <div style={{ fontSize: '0.84rem', color: '#64748B' }}>
                    {hindiTitle || 'हिंदी शीर्षक यहाँ दिखेगा'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Fixed applicant identity fields */}
                  <div className="admin-input-group">
                    <label>Full Name *</label>
                    <input type="text" placeholder="Applicant full name" disabled />
                  </div>

                  {/* Dynamic Fields */}
                  {formFields.map((field) => (
                    <div key={field.id} className="admin-input-group">
                      <label>
                        {field.label} {field.required && <span style={{ color: '#DC2626' }}>*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select className="admin-select" disabled>
                          <option>{field.placeholder || 'Select option'}</option>
                          {field.options?.map((opt, i) => (
                            <option key={i}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea className="admin-search-input" rows="2" placeholder={field.placeholder} disabled />
                      ) : field.type === 'file' ? (
                        <div style={{
                          border: '1.5px dashed #CBD5E1',
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center',
                          background: '#F8FAFC',
                          color: '#64748B',
                          fontSize: '0.82rem'
                        }}>
                          <UploadCloud size={20} style={{ margin: '0 auto 4px', color: '#0284C7' }} />
                          <div>{field.placeholder || 'Upload File (PDF / Image)'}</div>
                        </div>
                      ) : (
                        <input type={field.type} placeholder={field.placeholder} disabled />
                      )}
                    </div>
                  ))}

                  {/* Fixed Payment Section */}
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1.5px solid #FED7AA',
                    background: '#FFF7ED',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#9A3412', marginBottom: '8px' }}>
                      Service Charge: ₹{serviceCharge}/-
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '8px',
                      margin: '0 auto 10px',
                      maxWidth: '240px'
                    }}>
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          width: 'auto', 
                          height: 'auto', 
                          objectFit: 'contain', 
                          display: 'block', 
                          borderRadius: '6px' 
                        }}
                        onError={(e) => { e.target.src = '/default-payment-qr.png'; }}
                      />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#7C2D12' }}>
                      Scan & Pay via GPay, PhonePe, Paytm or BHIM UPI
                    </div>
                  </div>

                  {/* Fixed Payment Screenshot Upload */}
                  <div className="admin-input-group">
                    <label>Upload Payment Screenshot <span style={{ color: '#DC2626' }}>*</span></label>
                    <div style={{
                      border: '1.5px dashed #CBD5E1',
                      borderRadius: '8px',
                      padding: '14px',
                      textAlign: 'center',
                      background: '#F8FAFC',
                      color: '#64748B',
                      fontSize: '0.84rem'
                    }}>
                      <UploadCloud size={20} style={{ margin: '0 auto 4px', color: '#16A34A' }} />
                      <div>Upload Payment Screenshot (PDF or Image, Max 5MB)</div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="admin-btn"
                    style={{
                      background: 'linear-gradient(90deg, #F97316 0%, #16A34A 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      justifyContent: 'center',
                      padding: '12px',
                      fontSize: '0.94rem',
                      marginTop: '8px'
                    }}
                    disabled
                  >
                    Submit Application & Generate Tracking ID
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '20px',
                marginTop: '20px',
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
                    form="service-form"
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
                    <span>{saving ? 'Saving...' : isEditing ? 'Save Service & Fields' : 'Publish New Service'}</span>
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
