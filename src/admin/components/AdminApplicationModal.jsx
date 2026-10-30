import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Phone, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  UploadCloud, 
  Trash2, 
  Download, 
  Lock, 
  Eye, 
  MessageCircle, 
  Loader2,
  CreditCard,
  CheckCircle2,
  FileCheck,
  Clock,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  updateRequestStatus, 
  updateOperatorNote, 
  attachDocumentRecord, 
  deleteApplicationRecord,
  updatePaymentStatus
} from '../services/adminDataService';
import { uploadDocumentToCloudinary } from '../services/cloudinaryService';
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
  const { isSuperAdmin, isViewOnly, role } = useAdminAuth();

  const [status, setStatus] = useState(app?.status || 'Request Received');
  const [operatorNote, setOperatorNote] = useState(app?.operatorNote || '');
  const [documentUrl, setDocumentUrl] = useState(app?.documentUrl || '');
  const [documentName, setDocumentName] = useState(app?.documentName || '');

  // Payment Status Management State
  const [paymentStatus, setPaymentStatus] = useState(app?.paymentStatus || 'pending');
  const [paymentNote, setPaymentNote] = useState(app?.paymentNote || '');
  const [savingPayment, setSavingPayment] = useState(false);

  // File upload state for deliverable document to customer
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // General action state
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Only reset modal state when opening a DIFFERENT application (app.appId change)
  // NOT on every parent re-render/selectedApp update — that was disabling the Update & Save Note buttons
  useEffect(() => {
    if (app) {
      setStatus(app.status || 'Request Received');
      setOperatorNote(app.operatorNote || '');
      setDocumentUrl(app.documentUrl || '');
      setDocumentName(app.documentName || '');
      setPaymentStatus(app.paymentStatus || 'pending');
      setPaymentNote(app.paymentNote || '');
      setSelectedFile(null);
      setUploadError(null);
      setActionNotice(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.appId]);

  if (!app) return null;

  // Find matching service definition
  const serviceMeta = getServiceBySlug(app.serviceSlug) || {};

  // Form Field Label Formatter
  const getFieldLabel = (key) => {
    if (serviceMeta?.formFields && Array.isArray(serviceMeta.formFields)) {
      const match = serviceMeta.formFields.find(f => f.id === key);
      if (match && match.label) return match.label;
    }
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Helper to determine if a file is an image
  const isImageDoc = (url = '', name = '') => {
    const clean = `${url} ${name}`.toLowerCase();
    if (clean.includes('.pdf')) return false;
    return (
      clean.includes('.jpg') ||
      clean.includes('.jpeg') ||
      clean.includes('.png') ||
      clean.includes('.webp') ||
      clean.includes('.gif') ||
      clean.includes('/image/upload/') ||
      clean.includes('blob:')
    );
  };

  // Normalize customer uploaded documents list with labels, filenames and previews
  const customerDocuments = [];
  const seenUrls = new Set();

  // 1. First, from app.userDocuments array
  if (Array.isArray(app.userDocuments) && app.userDocuments.length > 0) {
    app.userDocuments.forEach((doc, idx) => {
      if (typeof doc === 'string' && doc && !seenUrls.has(doc)) {
        seenUrls.add(doc);
        customerDocuments.push({
          label: `Uploaded Document ${idx + 1}`,
          name: `Document ${idx + 1}`,
          url: doc,
          fieldId: `doc_${idx}`
        });
      } else if (doc && doc.url && !seenUrls.has(doc.url)) {
        seenUrls.add(doc.url);
        customerDocuments.push({
          label: doc.label || (doc.fieldId ? getFieldLabel(doc.fieldId) : null) || doc.name || `Document ${idx + 1}`,
          name: doc.name || `document_${idx + 1}`,
          url: doc.url,
          fieldId: doc.fieldId || `doc_${idx}`
        });
      }
    });
  }

  // 2. Also check dynamic fields in app.formData (for forms where multiple files are uploaded)
  if (app.formData && typeof app.formData === 'object') {
    Object.entries(app.formData).forEach(([key, val]) => {
      if (
        typeof val === 'string' &&
        (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('blob:')) &&
        val !== app.paymentScreenshotUrl &&
        !seenUrls.has(val)
      ) {
        const isFileField = serviceMeta?.formFields?.some(f => f.id === key && f.type === 'file');
        const looksLikeDoc = val.includes('cloudinary') || /\.(pdf|png|jpg|jpeg|webp)($|\?)/i.test(val) || key.includes('doc') || key.includes('pdf') || key.includes('photo') || key.includes('signature') || key.includes('aadhaar') || key.includes('pan');

        if (isFileField || looksLikeDoc) {
          seenUrls.add(val);
          const customName = app.formData[`${key}_name`] || `${key}`;
          customerDocuments.push({
            label: getFieldLabel(key),
            name: customName,
            url: val,
            fieldId: key
          });
        }
      }
    });
  }

  // 3. Fallback to app.userDocumentUrl if not already included
  if (app.userDocumentUrl && !seenUrls.has(app.userDocumentUrl) && app.userDocumentUrl !== app.paymentScreenshotUrl) {
    seenUrls.add(app.userDocumentUrl);
    customerDocuments.push({
      label: app.userDocumentName ? getFieldLabel(app.userDocumentName) : 'Customer Document',
      name: app.userDocumentName || 'Customer Document',
      url: app.userDocumentUrl,
      fieldId: 'primary_doc'
    });
  }

  // Check if form data has values (excluding document URLs, payment screenshot, and file name fields)
  const isDocumentKeyOrVal = (key, val) => {
    if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('blob:'))) {
      return true;
    }
    if (key.endsWith('_name') || key === 'paymentScreenshotUrl' || key === 'paymentScreenshotName' || key === 'userDocumentUrl' || key === 'userDocumentName') {
      return true;
    }
    const isFileField = serviceMeta?.formFields?.some(f => f.id === key && f.type === 'file');
    if (isFileField) return true;
    return false;
  };

  const formDataEntries = app.formData && typeof app.formData === 'object' 
    ? Object.entries(app.formData).filter(([key, val]) => val !== undefined && val !== null && val !== '' && !isDocumentKeyOrVal(key, val))
    : [];

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
      const msg = `Database confirmed status: "${status}".`;
      setActionNotice({ 
        type: res.dbWarning ? 'warning' : 'success', 
        text: res.dbWarning ? `${msg} (${res.dbWarning})` : msg 
      });
      if (onUpdated) onUpdated({ status });
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
      const msg = 'Database confirmed operator remarks were saved.';
      setActionNotice({ 
        type: res.dbWarning ? 'warning' : 'success', 
        text: res.dbWarning ? `${msg} (${res.dbWarning})` : msg 
      });
      if (onUpdated) onUpdated({ operatorNote });
    } else {
      setActionNotice({ type: 'error', text: res.error || 'Failed to update note.' });
    }
  };

  // Save Payment Verification Status Handler
  const handleSavePayment = async (statusOverride) => {
    if (isViewOnly) return;
    const targetStatus = statusOverride || paymentStatus;
    setSavingPayment(true);
    setActionNotice(null);

    const res = await updatePaymentStatus(app.appId, targetStatus, paymentNote, role);
    setSavingPayment(false);

    if (res.success) {
      setPaymentStatus(targetStatus);
      const label = targetStatus === 'received' ? 'Received (Verified)' : targetStatus === 'failed' ? 'Failed / Rejected' : 'Pending Verification';
      const msg = `Database confirmed payment status: "${label}".`;
      setActionNotice({ 
        type: res.dbWarning ? 'warning' : 'success', 
        text: res.dbWarning ? `${msg} \n${res.dbWarning}` : msg 
      });
      // Pass the updated fields to parent so it can refresh selectedApp from localStorage immediately
      if (onUpdated) onUpdated({ paymentStatus: targetStatus, paymentNote });
    } else {
      setActionNotice({ type: 'error', text: res.error || 'Failed to update payment status.' });
    }
  };

  // Upload Verified Document via Cloudinary Handler
  const handleUploadDocument = async () => {
    if (isViewOnly || !selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('Document file size exceeds 5MB limit.');
      return;
    }

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
          text: `Verified document "${uploadRes.originalName}" uploaded & delivered to customer!` 
        });
        if (onUpdated) onUpdated({ status: 'Completed', documentUrl: uploadRes.secureUrl, documentName: uploadRes.originalName });
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
        <div className="admin-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                {app.appId}
              </span>
              <span className="admin-role-pill" style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' }}>
                {app.serviceName}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '4px' }}>
                Fee: ₹{app.serviceCharge || serviceMeta.serviceCharge || '100'}
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
                background: actionNotice.type === 'success' ? '#F0FDF4' : actionNotice.type === 'warning' ? '#FFFBEB' : '#FEF2F2',
                color: actionNotice.type === 'success' ? '#15803D' : actionNotice.type === 'warning' ? '#B45309' : '#B91C1C',
                border: `1px solid ${actionNotice.type === 'success' ? '#BBF7D0' : actionNotice.type === 'warning' ? '#FDE68A' : '#FECACA'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                whiteSpace: 'pre-line'
              }}
            >
              {actionNotice.type === 'success' ? <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
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
            {/* Column 1: Customer Info, Dynamic Form Responses & Customer Uploaded Documents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 1. Customer Basic Information */}
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
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                      Customer Initial Note:
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 10px', borderRadius: '6px' }}>
                      {app.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Dynamic Form Responses Submitted by Customer */}
              <div className="admin-detail-box">
                <div className="admin-detail-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} style={{ color: '#0284C7' }} />
                  <span>Submitted Service Form Details</span>
                </div>

                {formDataEntries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {formDataEntries.map(([key, val]) => (
                      <div 
                        key={key}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                          {getFieldLabel(key)}
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 700, marginTop: '2px', wordBreak: 'break-word' }}>
                          {String(val)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '8px', fontStyle: 'italic' }}>
                    No specific form fields recorded for this application.
                  </div>
                )}
              </div>

              {/* 3. Customer Uploaded Documents Section */}
              <div className="admin-detail-box">
                <div className="admin-detail-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCheck size={16} style={{ color: '#16A34A' }} />
                    <span>Customer Uploaded Documents</span>
                  </div>
                  {customerDocuments.length > 0 && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: '#DCFCE7',
                      color: '#15803D',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid #86EFAC'
                    }}>
                      {customerDocuments.length} {customerDocuments.length === 1 ? 'Document' : 'Documents'}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '12px' }}>
                  {customerDocuments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {customerDocuments.map((doc, idx) => {
                        const isImg = isImageDoc(doc.url, doc.name);
                        return (
                          <div 
                            key={doc.url || idx}
                            style={{
                              background: '#FFFFFF',
                              border: '1.5px solid #CBD5E1',
                              borderRadius: '12px',
                              padding: '14px',
                              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}
                          >
                            {/* Document Header & Type Badge */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '8px',
                                  background: isImg ? '#EFF6FF' : '#FEF2F2',
                                  color: isImg ? '#0284C7' : '#DC2626',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  {isImg ? <ImageIcon size={18} /> : <FileText size={18} />}
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                                    {doc.label}
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px', wordBreak: 'break-all' }}>
                                    {doc.name || 'Uploaded File'}
                                  </div>
                                </div>
                              </div>

                              <span style={{
                                fontSize: '0.70rem',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '9999px',
                                background: isImg ? '#E0F2FE' : '#FEE2E2',
                                color: isImg ? '#0369A1' : '#991B1B',
                                border: `1px solid ${isImg ? '#BAE6FD' : '#FECACA'}`,
                                textTransform: 'uppercase',
                                flexShrink: 0
                              }}>
                                {isImg ? 'Photo / Image' : 'PDF Document'}
                              </span>
                            </div>

                            {/* Image Thumbnail / Preview IF Image */}
                            {isImg && (
                              <div 
                                style={{
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: '1.5px solid #E2E8F0',
                                  background: '#0F172A',
                                  maxHeight: '200px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                                onClick={() => window.open(doc.url, '_blank')}
                                title="Click to view full size"
                              >
                                <img 
                                  src={doc.url} 
                                  alt={doc.label} 
                                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}

                            {/* Action Button */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="admin-btn admin-btn-success"
                                style={{ flex: 1, justifyContent: 'center', padding: '8px 14px', fontSize: '0.80rem' }}
                              >
                                <ExternalLink size={13} />
                                <span>View / Download {doc.label}</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Explicit requirement: "IF NO DOC THAN SHWO IN UI NO DOC AVAIBLE" */
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '12px 14px', 
                        borderRadius: '8px', 
                        background: '#F8FAFC', 
                        border: '1px dashed #CBD5E1', 
                        color: '#64748B', 
                        fontSize: '0.86rem', 
                        fontWeight: 600 
                      }}
                    >
                      <AlertCircle size={16} style={{ color: '#94A3B8', flexShrink: 0 }} />
                      <span>No document available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct WhatsApp Action */}
              <div className="admin-detail-box">
                <div className="admin-detail-title">Customer WhatsApp Connect</div>
                {whatsappUrl ? (
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="admin-btn admin-btn-success"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp Customer (+91 {cleanPhone.slice(-10)})</span>
                  </a>
                ) : (
                  <button className="admin-btn admin-btn-secondary" style={{ width: '100%', marginTop: '8px' }} disabled>
                    <Phone size={16} /> Phone number not provided
                  </button>
                )}
              </div>
            </div>

            {/* Column 2: Payment Verification, Status Management & Verified Document Delivery */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 1. Payment Verification Card */}
              <div className="admin-detail-box">
                <div className="admin-detail-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={15} style={{ color: '#EA580C' }} />
                    <span>Payment Verification</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>
                      ₹{app.serviceCharge || serviceMeta.serviceCharge || '100'} Due
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      background: paymentStatus === 'received' ? '#DCFCE7' : paymentStatus === 'failed' ? '#FEE2E2' : '#FEF3C7',
                      color: paymentStatus === 'received' ? '#15803D' : paymentStatus === 'failed' ? '#B91C1C' : '#B45309',
                      border: `1px solid ${paymentStatus === 'received' ? '#86EFAC' : paymentStatus === 'failed' ? '#FCA5A5' : '#FDE68A'}`
                    }}>
                      {paymentStatus === 'received' ? '✓ Received' : paymentStatus === 'failed' ? '✕ Failed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  {app.paymentScreenshotUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div 
                        style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1.5px solid #E2E8F0',
                          background: '#0F172A',
                          maxHeight: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(app.paymentScreenshotUrl, '_blank')}
                        title="Click to view full size screenshot"
                      >
                        <img 
                          src={app.paymentScreenshotUrl} 
                          alt="Payment Proof Screenshot" 
                          style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <a 
                          href={app.paymentScreenshotUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="admin-btn admin-btn-secondary"
                          style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
                        >
                          <ExternalLink size={14} />
                          <span>View Full-Size Payment Proof</span>
                        </a>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#16A34A', fontWeight: 700 }}>
                          <CheckCircle2 size={15} /> Uploaded
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div 
                      style={{
                        padding: '12px 14px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        color: '#B91C1C',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>No payment proof screenshot attached</span>
                    </div>
                  )}

                  {/* Super Admin Payment Status Modifier Controls */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1.5px dashed #CBD5E1' }}>
                    <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Update Payment Status:</span>
                      <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        Customer sees this in their dashboard
                      </span>
                    </div>

                    {/* Quick 1-Click Status Toggles */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                      <button
                        type="button"
                        className="admin-btn"
                        style={{
                          padding: '7px 4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          justifyContent: 'center',
                          background: paymentStatus === 'received' ? '#16A34A' : '#F0FDF4',
                          color: paymentStatus === 'received' ? '#FFFFFF' : '#15803D',
                          border: '1.5px solid #86EFAC',
                          borderRadius: '8px'
                        }}
                        disabled={isViewOnly || savingPayment}
                        onClick={() => handleSavePayment('received')}
                      >
                        <CheckCircle2 size={13} />
                        <span>Received</span>
                      </button>

                      <button
                        type="button"
                        className="admin-btn"
                        style={{
                          padding: '7px 4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          justifyContent: 'center',
                          background: paymentStatus === 'failed' ? '#DC2626' : '#FEF2F2',
                          color: paymentStatus === 'failed' ? '#FFFFFF' : '#B91C1C',
                          border: '1.5px solid #FCA5A5',
                          borderRadius: '8px'
                        }}
                        disabled={isViewOnly || savingPayment}
                        onClick={() => handleSavePayment('failed')}
                      >
                        <AlertCircle size={13} />
                        <span>Failed</span>
                      </button>

                      <button
                        type="button"
                        className="admin-btn"
                        style={{
                          padding: '7px 4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          justifyContent: 'center',
                          background: paymentStatus === 'pending' ? '#D97706' : '#FFFBEB',
                          color: paymentStatus === 'pending' ? '#FFFFFF' : '#B45309',
                          border: '1.5px solid #FDE68A',
                          borderRadius: '8px'
                        }}
                        disabled={isViewOnly || savingPayment}
                        onClick={() => handleSavePayment('pending')}
                      >
                        <Clock size={13} />
                        <span>Pending</span>
                      </button>
                    </div>

                    {/* Optional Payment Remarks / UTR input */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="admin-input" 
                        style={{ flex: 1, padding: '7px 10px', fontSize: '0.80rem' }}
                        placeholder="Payment note / reason (e.g. UTR verified or blurry image)"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        disabled={isViewOnly || savingPayment}
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                        disabled={isViewOnly || savingPayment}
                        onClick={() => handleSavePayment()}
                      >
                        {savingPayment ? <Loader2 size={13} className="spin-animation" /> : <Save size={13} />}
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Status Update Control */}
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

              {/* 3. Operator Note / Remarks */}
              <div className="admin-detail-box">
                <div className="admin-detail-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Super Admin Live Status Remarks</span>
                  {isViewOnly && <Lock size={13} style={{ color: '#F59E0B' }} />}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>
                  (This message appears directly inside the customer&apos;s live tracking dashboard)
                </div>

                <textarea
                  className="admin-search-input"
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                  value={operatorNote}
                  onChange={(e) => setOperatorNote(e.target.value)}
                  placeholder="e.g. Payment verified. Department verification initiated."
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

              {/* 4. Verified Document Delivery (Admin Upload to Customer) */}
              <div className="admin-detail-box">
                <div className="admin-detail-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Verified Document Delivery (PDF / Image)</span>
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
                      gap: '10px',
                      marginTop: '8px'
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
                              attachDocumentRecord(app.appId, null, null, role).then((res) => {
                                if (res.success) {
                                  setDocumentUrl('');
                                  setDocumentName('');
                                  setActionNotice({ type: 'success', text: 'Database confirmed the document was removed.' });
                                  if (onUpdated) onUpdated();
                                } else {
                                  setActionNotice({ type: 'error', text: res.error || 'Could not remove document from the database.' });
                                }
                              }).catch((error) => setActionNotice({ type: 'error', text: error.message }));
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
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center',
                      color: 'var(--admin-text-muted)',
                      fontSize: '0.84rem',
                      marginTop: '8px'
                    }}
                  >
                    <Lock size={20} style={{ margin: '0 auto 8px', color: '#F59E0B' }} />
                    <div>No verified document attached yet.</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-dim)', marginTop: '4px' }}>
                      (Document upload to Cloudinary is restricted to Super Admin)
                    </div>
                  </div>
                ) : (
                  /* Super Admin: File Dropzone & Cloudinary Uploader */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <div className="admin-dropzone">
                      <input 
                        type="file" 
                        id="cloudinary-doc-file" 
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="cloudinary-doc-file" style={{ cursor: 'pointer', display: 'block' }}>
                        <UploadCloud size={28} style={{ color: '#EA580C', margin: '0 auto 6px' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0F172A' }}>
                          {selectedFile ? selectedFile.name : 'Click to select Verified PDF or File'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                          Accepts PDF, JPG, PNG, WEBP (Max 5MB)
                        </div>
                      </label>
                    </div>

                    {uploadError && (
                      <div style={{ fontSize: '0.78rem', color: '#EF4444' }}>
                        {uploadError}
                      </div>
                    )}

                    {isUploading && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#EA580C' }}>
                          <span>Uploading to Cloudinary...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#EA580C', transition: 'width 0.2s' }} />
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
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

