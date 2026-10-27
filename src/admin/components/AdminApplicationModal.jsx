import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  UploadCloud, 
  Trash2, 
  Download, 
  Lock, 
  Eye, 
  Crown,
  MessageCircle,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  updateRequestStatus, 
  updateOperatorNote, 
  attachDocumentRecord, 
  deleteApplicationRecord 
} from '../services/adminDataService';
import { uploadDocumentToCloudinary, isCloudinaryConfigured } from '../services/cloudinaryService';
import { getServiceBySlug } from '../../data/servicesData';

const STATUS_OPTIONS = [
  'Request Received',
  'Awaiting Form Verification',
  'Under Review',
  'Additional Information Required',
  'Processing',
  'Completed',
  'Unable to Process'
];

export default function AdminApplicationModal({ app, onClose, onUpdated }) {
  if (!app) return null;

  const { isSuperAdmin, isViewOnly, role } = useAdminAuth();

  const [status, setStatus] = useState(app.status || 'Request Received');
  const [operatorNote, setOperatorNote] = useState(app.operatorNote || '');
  const [documentUrl, setDocumentUrl] = useState(app.documentUrl || '');
  const [documentName, setDocumentName] = useState(app.documentName || '');

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // General action state
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Find matching service data to retrieve linked Google Sheet URL
  const serviceMeta = getServiceBySlug(app.serviceSlug) || {};
  const spreadsheetUrl = serviceMeta.spreadsheetUrl || null;

  // WhatsApp connect link
  const cleanPhone = (app.phone || '').replace(/\D/g, '');
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/91${cleanPhone.slice(-10)}?text=Hello%20${encodeURIComponent(app.fullName || 'Customer')},%20this%20is%20Apna%20Digital%20Service%20regarding%20your%20Application%20${encodeURIComponent(app.appId)}%20for%20${encodeURIComponent(app.serviceName || 'service')}.`
    : null;

  // Save Status Handler
  const handleSaveStatus = async () => {
    if (isViewOnly) return;
    setSavingStatus(true);
    setActionNotice(null);

    const res = await updateRequestStatus(app.appId, status, role);
    setSavingStatus(false);

    if (res.success) {
      setActionNotice({ type: 'success', text: `Status successfully updated to "${status}".` });
      if (onUpdated) onUpdated();
    } else {
      setActionNotice({ type: 'error', text: res.error || 'Failed to update status.' });
    }
  };

  // Save Operator Note Handler
  const handleSaveNote = async () => {
    if (isViewOnly) return;
    setSavingNote(true);
    setActionNotice(null);

    const res = await updateOperatorNote(app.appId, operatorNote, role);
    setSavingNote(false);

    if (res.success) {
      setActionNotice({ type: 'success', text: 'Operator note updated successfully.' });
      if (onUpdated) onUpdated();
    } else {
      setActionNotice({ type: 'error', text: res.error || 'Failed to update note.' });
    }
  };

  // Upload Document via Cloudinary Handler
  const handleUploadDocument = async () => {
    if (isViewOnly || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setActionNotice(null);

    try {
      const uploadRes = await uploadDocumentToCloudinary(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (!uploadRes.success) {
        setIsUploading(false);
        setUploadError(uploadRes.error || 'Document upload failed.');
        return;
      }

      // Attach document to application record
      const attachRes = await attachDocumentRecord(
        app.appId, 
        uploadRes.secureUrl, 
        uploadRes.originalName, 
        role
      );

      setIsUploading(false);

      if (attachRes.success) {
        setDocumentUrl(uploadRes.secureUrl);
        setDocumentName(uploadRes.originalName);
        setStatus('Completed');
        setOperatorNote('Document verified and issued. Ready for instant download.');
        setSelectedFile(null);
        setActionNotice({ 
          type: 'success', 
          text: `Document "${uploadRes.originalName}" uploaded to Cloudinary & delivered to customer!` 
        });
        if (onUpdated) onUpdated();
      } else {
        setUploadError(attachRes.error || 'Failed to attach document record.');
      }
    } catch (err) {
      setIsUploading(false);
      setUploadError(err.message || 'Upload exception.');
    }
  };

  // Delete Request Handler
  const handleDeleteRequest = async () => {
    if (isViewOnly) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete application "${app.appId}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    const res = await deleteApplicationRecord(app.appId, role);
    if (res.success) {
      if (onUpdated) onUpdated();
      onClose();
    } else {
      setActionNotice({ type: 'error', text: res.error || 'Failed to delete record.' });
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header" style={{ borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                {app.appId}
              </span>
              <span className="admin-role-pill" style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' }}>
                {app.serviceName}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
              Submitted on: {new Date(app.createdAt || Date.now()).toLocaleString('en-IN')}
            </div>
          </div>

          <button 
            className="admin-btn admin-btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">
          {/* Action Notice Alert */}
          {actionNotice && (
            <div 
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                background: actionNotice.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                color: actionNotice.type === 'success' ? '#15803D' : '#B91C1C',
                border: `1px solid ${actionNotice.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {actionNotice.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{actionNotice.text}</span>
            </div>
          )}

          {/* Role Status Reminder */}
          {isViewOnly && (
            <div className="view-only-lock-alert">
              <Eye size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>View-Only Mode Active:</strong> You can view all customer information and document links, but all edits, status changes, and file uploads are disabled. To make modifications, log in as Super Admin.
              </div>
            </div>
          )}

          {/* Grid Layout */}
          <div className="admin-modal-grid">
            {/* Column 1: Customer Details & Verification Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="admin-detail-box">
                <div className="admin-detail-title">Customer Information</div>
                <div className="admin-detail-row">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Full Name:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{app.fullName || 'Not provided'}</span>
                </div>
                <div className="admin-detail-row">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Email Address:</span>
                  <span style={{ color: '#0F172A' }}>{app.email || 'Not provided'}</span>
                </div>
                <div className="admin-detail-row">
                  <span style={{ color: 'var(--admin-text-muted)' }}>WhatsApp / Phone:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{app.phone || 'Not provided'}</span>
                </div>
                <div className="admin-detail-row">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Target Service:</span>
                  <span style={{ color: '#0284C7', fontWeight: 700 }}>{app.serviceName}</span>
                </div>
                {app.notes && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                      Customer Notes / Application Inputs:
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 12px', borderRadius: '6px' }}>
                      {app.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Actions Strip: WhatsApp & Google Sheet */}
              <div className="admin-detail-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="admin-detail-title">Operational Quick Links</div>
                
                {/* 1. WhatsApp Customer */}
                {whatsappUrl ? (
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="admin-btn admin-btn-success"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp Customer (+91 {cleanPhone.slice(-10)})</span>
                  </a>
                ) : (
                  <button className="admin-btn admin-btn-secondary" disabled>
                    <Phone size={16} /> Phone not provided
                  </button>
                )}

                {/* 2. Google Sheets Responses Launcher */}
                {spreadsheetUrl ? (
                  <a 
                    href={spreadsheetUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="admin-btn admin-btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', borderColor: '#BBF7D0', color: '#15803D', background: '#F0FDF4', fontWeight: 600 }}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Open Service Google Sheet Responses</span>
                  </a>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)', textAlign: 'center' }}>
                    No Google Sheet link attached to this service.
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Status & Document Delivery */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status Update Control */}
              <div className="admin-detail-box">
                <div className="admin-detail-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Application Status</span>
                  {isViewOnly && <Lock size={13} style={{ color: '#F59E0B' }} />}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <select 
                    className="admin-select"
                    style={{ flex: 1 }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isViewOnly || savingStatus}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <button 
                    className="admin-btn admin-btn-primary"
                    onClick={handleSaveStatus}
                    disabled={isViewOnly || savingStatus || status === app.status}
                  >
                    {savingStatus ? <Loader2 size={15} className="spinner" /> : 'Update'}
                  </button>
                </div>
              </div>

              {/* Operator Note / Remarks */}
              <div className="admin-detail-box">
                <div className="admin-detail-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Super Admin Live Status Remarks</span>
                  {isViewOnly && <Lock size={13} style={{ color: '#F59E0B' }} />}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>
                  (This message appears directly inside the customer's live tracking box)
                </div>

                <textarea
                  className="admin-search-input"
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                  value={operatorNote}
                  onChange={(e) => setOperatorNote(e.target.value)}
                  placeholder="e.g. Google Form response verified. Document processing initiated."
                  disabled={isViewOnly || savingNote}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button 
                    className="admin-btn admin-btn-secondary"
                    onClick={handleSaveNote}
                    disabled={isViewOnly || savingNote || operatorNote === app.operatorNote}
                  >
                    {savingNote ? <Loader2 size={15} className="spinner" /> : 'Save Note'}
                  </button>
                </div>
              </div>

              {/* Cloudinary Document Delivery */}
              <div className="admin-detail-box">
                <div className="admin-detail-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Verified Document (PDF / Image)</span>
                  {isViewOnly && <Lock size={13} style={{ color: '#F59E0B' }} />}
                </div>

                {documentUrl ? (
                  /* Document is already uploaded & delivered */
                  <div 
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={20} style={{ color: '#16A34A', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {documentName || 'Verified_Document.pdf'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#15803D', fontWeight: 500 }}>
                          Delivered & unlocked for customer download
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <a 
                        href={documentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="admin-btn admin-btn-success"
                        style={{ flex: 1, padding: '7px 12px', fontSize: '0.82rem' }}
                      >
                        <Download size={14} />
                        <span>Preview / Download Document</span>
                      </a>

                      {isSuperAdmin && (
                        <button 
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '0.8rem', borderColor: '#FECACA', color: '#DC2626' }}
                          onClick={() => {
                            if (window.confirm('Remove this document from the application? Customer will no longer be able to download it.')) {
                              setDocumentUrl('');
                              setDocumentName('');
                              attachDocumentRecord(app.appId, null, null, role);
                              if (onUpdated) onUpdated();
                            }
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ) : isViewOnly ? (
                  /* View-Only Admin: Document upload is restricted */
                  <div 
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      border: '1px dashed #475569',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center',
                      color: 'var(--admin-text-muted)',
                      fontSize: '0.84rem'
                    }}
                  >
                    <Lock size={20} style={{ margin: '0 auto 8px', color: '#F59E0B' }} />
                    <div>No document attached yet.</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-dim)', marginTop: '4px' }}>
                      (Document upload to Cloudinary is restricted to Super Admin)
                    </div>
                  </div>
                ) : (
                  /* Super Admin: File Dropzone & Cloudinary Uploader */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="admin-dropzone">
                      <input 
                        type="file" 
                        id="cloudinary-doc-file" 
                        accept=".pdf,image/jpeg,image/png"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="cloudinary-doc-file" style={{ cursor: 'pointer', display: 'block' }}>
                        <UploadCloud size={28} style={{ color: '#38BDF8', margin: '0 auto 6px' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>
                          {selectedFile ? selectedFile.name : 'Click to select PDF or Document'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                          Accepts PDF, JPG, PNG (Max 15MB)
                        </div>
                      </label>
                    </div>

                    {uploadError && (
                      <div style={{ fontSize: '0.78rem', color: '#FCA5A5' }}>
                        {uploadError}
                      </div>
                    )}

                    {isUploading && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#38BDF8' }}>
                          <span>Uploading to Cloudinary...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#38BDF8', transition: 'width 0.2s' }} />
                        </div>
                      </div>
                    )}

                    {selectedFile && !isUploading && (
                      <button 
                        className="admin-btn admin-btn-success"
                        style={{ width: '100%' }}
                        onClick={handleUploadDocument}
                      >
                        <UploadCloud size={16} />
                        <span>Upload & Deliver to Customer</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delete Record (Super Admin Only) */}
          {isSuperAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #334155' }}>
              <button 
                className="admin-btn admin-btn-danger"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={handleDeleteRequest}
              >
                <Trash2 size={14} />
                <span>Delete Application Record</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
