import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { addServiceByAdmin } from '../data/servicesData';

export default function AdminAddServiceModal({ isOpen, onClose, onServiceAdded }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [hindiTitle, setHindiTitle] = useState('');
  const [shortName, setShortName] = useState('');
  const [slug, setSlug] = useState('');
  const [badge, setBadge] = useState('New Live Service');
  const [badgeColor, setBadgeColor] = useState('green');
  const [iconName, setIconName] = useState('FileText');
  const [description, setDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [supportPhone, setSupportPhone] = useState('9124494239');
  const [requirementsInput, setRequirementsInput] = useState('');
  const [workflowInput, setWorkflowInput] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
    if (!shortName) {
      setShortName(val.slice(0, 20));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newService = {
      id: 'srv-' + Date.now(),
      slug: slug || 'service-' + Date.now(),
      title,
      hindiTitle: hindiTitle || title,
      shortName: shortName || title,
      badge,
      badgeColor,
      iconName,
      description,
      status: 'active',
      formUrl: formUrl || null,
      spreadsheetUrl: null,
      supportPhone,
      supportWhatsapp: `https://wa.me/91${supportPhone}?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20${encodeURIComponent(title)}`,
      features: [
        'Dedicated manual verification',
        'Official authorized processing',
        'Direct dispatch via WhatsApp',
        'Fast operator assistance'
      ],
      workflow: workflowInput.trim() 
        ? workflowInput.split('\n').filter(Boolean)
        : [
            'Customer submits required identification details on the platform.',
            'Backend team checks eligibility and records against authorized systems.',
            'Verified document/receipt is delivered directly on WhatsApp and dashboard.'
          ],
      requirements: requirementsInput.trim()
        ? requirementsInput.split('\n').filter(Boolean)
        : [
            'Document/Reference Number',
            'Full Name & Identity Proof',
            'WhatsApp Mobile Number'
          ],
      disclaimer: `Apna Digital Service assists customers in official document retrieval. We do not claim official authority for ${title}.`
    };

    const ok = addServiceByAdmin(newService);
    if (ok) {
      setSuccess(true);
      if (onServiceAdded) onServiceAdded(newService);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} style={{ color: 'var(--saffron-600)' }} />
            <h3 style={{ fontSize: '1.2rem' }}>Super Admin: Add New Service</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <CheckCircle size={48} style={{ color: 'var(--green-600)', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.3rem', color: 'var(--navy-900)' }}>
                New Service Created Successfully!
              </h4>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
                A new card has been added to the Home Page and its dedicated page is live at: <br />
                <code>/service/{slug}</code>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{
                background: 'var(--saffron-50)',
                border: '1px solid var(--saffron-200)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                color: 'var(--saffron-700)',
                marginBottom: '18px'
              }}>
                ⚡ <strong>Dynamic Architecture Note:</strong> Creating this service will automatically generate a new card on the Home Page AND a dedicated Service Detail page (<code>/service/:slug</code>).
              </div>

              <div className="form-field">
                <label className="form-label">Service Title (English) *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Birth Certificate PDF Download Assistance"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-field">
                  <label className="form-label">Hindi Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. जन्म प्रमाण पत्र पीडीएफ"
                    value={hindiTitle}
                    onChange={(e) => setHindiTitle(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Page URL Slug *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. birth-certificate-pdf"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-field">
                  <label className="form-label">Badge Label</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Express Process"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Icon (SVG)</label>
                  <select 
                    className="form-select"
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                  >
                    <option value="FileText">Document (FileText)</option>
                    <option value="CreditCard">ID Card (CreditCard)</option>
                    <option value="Vote">Election / Vote</option>
                    <option value="Car">Car / Driving</option>
                    <option value="Truck">Truck / Vehicle RC</option>
                    <option value="UserPlus">User Plus (Ayushman)</option>
                    <option value="FileEdit">File Edit (Correction)</option>
                    <option value="Fingerprint">Fingerprint (e-KYC)</option>
                    <option value="ShieldCheck">Shield / Security</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Description *</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="Clear description of what this service assists with..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-field">
                  <label className="form-label">Google Form URL</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://forms.gle/..."
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Assigned Support Phone *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="9124494239"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Requirements (One per line)</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="e.g.&#10;Reference Number&#10;Date of Birth&#10;WhatsApp Mobile Number"
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '10px' }}
              >
                <PlusCircle size={16} />
                <span>Publish Service (Home Card + Dedicated Page)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
