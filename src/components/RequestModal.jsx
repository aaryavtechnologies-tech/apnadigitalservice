import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  Copy, 
  Check, 
  Send, 
  AlertCircle, 
  ShieldCheck, 
  LayoutDashboard, 
  UploadCloud, 
  QrCode, 
  IndianRupee, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllServices, getMasterQrCodeUrl } from '../data/servicesData';
import { saveServiceRequest } from '../lib/supabaseClient';
import { uploadDocumentToCloudinary } from '../admin/services/cloudinaryService';
import ServiceIcon from './ServiceIcon';

export default function RequestModal({ isOpen, onClose, initialService, currentUser, onNavigateDashboard }) {
  const navigate = useNavigate();
  const allServices = getAllServices().filter(s => s.status !== 'inactive');

  const [selectedServiceId, setSelectedServiceId] = useState(
    initialService?.id || allServices[0]?.id || 'voter-id'
  );
  
  // Basic Applicant Identity
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  
  // Dynamic Service Fields Answers: { [fieldId]: value }
  const [formData, setFormData] = useState({});
  // Selected files from device (Uploads to Cloudinary ONLY when Submit is clicked)
  const [selectedDynamicFiles, setSelectedDynamicFiles] = useState({}); // { [fieldId]: { file, name, size, previewUrl } }
  const [selectedPaymentFile, setSelectedPaymentFile] = useState(null); // { file, name, size, previewUrl }

  // Upload Progress & Stage for Apna Logo Loading screen during Submit
  const [uploadStage, setUploadStage] = useState({
    message: '',
    progress: 0,
    detail: ''
  });

  // Master QR Fallback
  const [masterQr, setMasterQr] = useState('/default-payment-qr.png');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync initial user details and service selection
  useEffect(() => {
    if (currentUser?.email) setEmail(currentUser.email);
    if (currentUser?.fullName && !fullName) setFullName(currentUser.fullName);
    if (currentUser?.phone && !phone) setPhone(currentUser.phone);
    if (initialService?.id) setSelectedServiceId(initialService.id);
  }, [currentUser, initialService]);

  // Load master QR code
  useEffect(() => {
    getMasterQrCodeUrl().then(url => {
      if (url) setMasterQr(url);
    });
  }, []);

  const selectedService = allServices.find(s => s.id === selectedServiceId) || allServices[0] || {};
  const serviceFields = Array.isArray(selectedService.formFields) ? selectedService.formFields : [];
  const serviceCharge = selectedService.serviceCharge || '100';
  const qrCodeUrl = selectedService.qrCodeUrl || masterQr || '/default-payment-qr.png';

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle Dynamic Text / Select / Date Input
  const handleFieldChange = (fieldId, val) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: val
    }));
  };

  // Handle Dynamic File Selection (Device only - NO Cloudinary call here)
  const handleDynamicFileSelect = (fieldId, file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(`File "${file.name}" exceeds 5MB limit. Please choose a smaller file.`);
      return;
    }

    setSubmitError(null);
    const isImage = file.type.startsWith('image/');
    setSelectedDynamicFiles(prev => ({
      ...prev,
      [fieldId]: {
        file,
        name: file.name,
        size: formatFileSize(file.size),
        previewUrl: isImage ? URL.createObjectURL(file) : null
      }
    }));
  };

  const handleRemoveDynamicFile = (fieldId) => {
    setSelectedDynamicFiles(prev => {
      const copy = { ...prev };
      if (copy[fieldId]?.previewUrl) {
        URL.revokeObjectURL(copy[fieldId].previewUrl);
      }
      delete copy[fieldId];
      return copy;
    });
  };

  // Handle Payment Screenshot Selection (Device only - NO Cloudinary call here)
  const handlePaymentScreenshotSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Payment screenshot size must be less than 5MB.');
      return;
    }

    setSubmitError(null);
    const isImage = file.type.startsWith('image/');
    setSelectedPaymentFile({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      previewUrl: isImage ? URL.createObjectURL(file) : null
    });
  };

  const handleRemovePaymentScreenshot = () => {
    if (selectedPaymentFile?.previewUrl) {
      URL.revokeObjectURL(selectedPaymentFile.previewUrl);
    }
    setSelectedPaymentFile(null);
  };

  // Submit Handler: Uploads all selected device files to Cloudinary WITH APNA LOGO ANIMATION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!currentUser?.id) { setSubmitError('Please sign in before submitting your request.'); return; }

    // 1. Verify payment screenshot is selected
    if (!selectedPaymentFile?.file) {
      setSubmitError('Please select and attach your Payment Screenshot to verify your application fee.');
      return;
    }

    // 2. Verify all required dynamic file uploads are selected
    for (const f of serviceFields) {
      if (f.type === 'file' && f.required && !selectedDynamicFiles[f.id]?.file) {
        setSubmitError(`Please select the required document: ${f.label}`);
        return;
      }
    }

    // 3. Begin submission & Cloudinary upload with Apna Logo animation
    setSubmitting(true);
    setUploadStage({
      message: 'Connecting to Secure Cloud Gateway...',
      progress: 5,
      detail: 'Initiating Apna Digital Service transmission'
    });

    try {
      // Step A: Upload Payment Screenshot to Cloudinary
      setUploadStage({
        message: 'Uploading Payment Screenshot to Cloudinary...',
        progress: 15,
        detail: `${selectedPaymentFile.name} • ${selectedPaymentFile.size}`
      });

      const paymentRes = await uploadDocumentToCloudinary(
        selectedPaymentFile.file,
        (percent) => {
          setUploadStage({
            message: `Uploading Payment Screenshot (${percent}%)...`,
            progress: Math.min(45, Math.round(15 + (percent * 0.3))),
            detail: `${selectedPaymentFile.name} • ${selectedPaymentFile.size}`
          });
        },
        'apna_documents/payment_proofs'
      );

      if (!paymentRes.success || !paymentRes.secureUrl) {
        throw new Error(paymentRes.error || 'Failed to upload payment screenshot. Please check internet connection.');
      }

      const uploadedPaymentScreenshot = {
        url: paymentRes.secureUrl,
        name: paymentRes.originalName || selectedPaymentFile.name
      };

      // Step B: Upload Dynamic Service Files
      const userDocuments = [];
      const updatedFormData = { ...formData };
      const dynamicFieldsToUpload = serviceFields.filter(
        f => f.type === 'file' && selectedDynamicFiles[f.id]?.file
      );

      const totalDocs = dynamicFieldsToUpload.length;
      for (let i = 0; i < totalDocs; i++) {
        const field = dynamicFieldsToUpload[i];
        const fileObj = selectedDynamicFiles[field.id];

        const startPct = 45 + (i * (40 / Math.max(1, totalDocs)));
        const slicePct = 40 / Math.max(1, totalDocs);

        setUploadStage({
          message: `Uploading Document (${i + 1}/${totalDocs}): ${field.label}...`,
          progress: Math.round(startPct),
          detail: `${fileObj.name} • ${fileObj.size}`
        });

        const docRes = await uploadDocumentToCloudinary(
          fileObj.file,
          (pct) => {
            setUploadStage({
              message: `Uploading ${field.label} (${pct}%)...`,
              progress: Math.min(85, Math.round(startPct + (pct * slicePct * 0.01))),
              detail: `${fileObj.name} • ${fileObj.size}`
            });
          },
          'apna_documents/customer_docs'
        );

        if (!docRes.success || !docRes.secureUrl) {
          throw new Error(`Failed to upload ${field.label}: ${docRes.error || 'Upload error'}`);
        }

        userDocuments.push({
          fieldId: field.id,
          label: field.label,
          url: docRes.secureUrl,
          name: docRes.originalName || fileObj.name
        });

        updatedFormData[field.id] = docRes.secureUrl;
        updatedFormData[`${field.id}_name`] = docRes.originalName || fileObj.name;
      }

      // Step C: Generate Unique Application ID and save record
      setUploadStage({
        message: 'Registering Application & Generating Tracking ID...',
        progress: 92,
        detail: 'Saving to Apna Digital Service Verification Queue'
      });

      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const appId = `ADS-2026-${randomDigits}`;
      const primaryDoc = userDocuments[0] || null;

      const newApplication = {
        appId,
        userId: currentUser?.id || 'guest',
        serviceId: selectedService.id,
        serviceSlug: selectedService.slug,
        serviceName: selectedService.title,
        fullName: fullName.trim() || (currentUser?.fullName || 'Valued Customer'),
        email: (currentUser?.email || email || 'customer@apnadigital.in').trim(),
        phone: (phone || updatedFormData.whatsapp_number || updatedFormData.mobile_number || '9876543210').trim(),
        serviceCharge: serviceCharge,
        paymentScreenshotUrl: uploadedPaymentScreenshot.url,
        paymentScreenshotName: uploadedPaymentScreenshot.name,
        userDocumentUrl: primaryDoc ? primaryDoc.url : null,
        userDocumentName: primaryDoc ? primaryDoc.name : null,
        userDocuments: userDocuments,
        formData: {
          ...updatedFormData,
          serviceCharge: `₹${serviceCharge}`
        },
        createdAt: new Date().toISOString(),
        status: 'Request Received',
        operatorNote: 'Application submitted with payment proof. Awaiting operator verification.',
        documentUrl: null,
        documentName: null
      };

      await saveServiceRequest(newApplication);

      setUploadStage({
        message: 'Application Confirmed!',
        progress: 100,
        detail: `Assigned Tracking ID: ${appId}`
      });

      // Brief smooth transition to reveal success screen
      setTimeout(() => {
        setSubmitting(false);
        setSubmittedApp(newApplication);
      }, 500);

    } catch (err) {
      console.error('Submission error:', err);
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to submit application. Please check network and try again.');
    }
  };

  const handleCopy = () => {
    if (submittedApp) {
      navigator.clipboard.writeText(submittedApp.appId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    // Revoke any created preview URLs to prevent memory leaks
    if (selectedPaymentFile?.previewUrl) {
      URL.revokeObjectURL(selectedPaymentFile.previewUrl);
    }
    Object.values(selectedDynamicFiles).forEach(item => {
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setSelectedPaymentFile(null);
    setSelectedDynamicFiles({});
    setSubmittedApp(null);
    setSubmitError(null);
    setSubmitting(false);
    onClose();
  };

  const handleGoToDashboard = () => {
    handleClose();
    if (onNavigateDashboard) {
      onNavigateDashboard();
    } else {
      navigate('/dashboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-dialog request-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--saffron-50)',
              color: 'var(--saffron-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ServiceIcon name={selectedService.iconName || 'FileText'} size={20} color="var(--saffron-600)" />
            </div>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--navy-900)', display: 'block' }}>
                {submittedApp ? 'Application Confirmed' : submitting ? 'Uploading & Processing Application' : `Apply: ${selectedService.title || 'Service Form'}`}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--saffron-600)', fontWeight: 600 }}>
                {submittedApp ? 'Tracking ID Generated' : submitting ? 'Apna Digital Service' : selectedService.hindiTitle}
              </span>
            </div>
          </div>
          {!submitting && (
            <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Close">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {submittedApp ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: 'var(--green-100)', 
                color: 'var(--green-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}>
                <CheckCircle size={32} />
              </div>

              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '6px', color: 'var(--navy-900)' }}>
                Request Submitted Successfully!
              </h4>

              <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginBottom: '18px', lineHeight: '1.5' }}>
                Your service request and payment proof have been registered with our operations desk. Save your <strong>Tracking ID</strong> below to check live status.
              </p>

              {/* Unique Tracking ID Box */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px dashed var(--saffron-500)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                    YOUR TRACKING ID
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.04em', color: 'var(--navy-900)', wordBreak: 'break-all' }}>
                    {submittedApp.appId}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={handleCopy}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--border-subtle)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: copied ? 'var(--green-600)' : 'var(--navy-800)',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? 'Copied' : 'Copy Tracking ID'}</span>
                </button>
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px',
                textAlign: 'left',
                fontSize: '0.82rem',
                color: '#166534',
                marginBottom: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span>
                  Our operators will verify your payment screenshot and generate your verified PDF within 2 to 4 hours. You will receive the document directly on WhatsApp and in your website dashboard.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
                  onClick={handleGoToDashboard}
                >
                  <LayoutDashboard size={16} />
                  <span>My Dashboard</span>
                </button>

                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
                  onClick={handleClose}
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          ) : submitting ? (
            /* ========================================================
               APNA LOGO UPLOADING ANIMATION VIEW (REQUESTED BY USER)
               ======================================================== */
            <div style={{ textAlign: 'center', padding: '36px 14px 28px' }}>
              
              {/* Central Pulsing Apna Logo with Rotating Aura Rings */}
              <div style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Outer Rotating Energy Ring */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '3px dashed #ea580c',
                  animation: 'apnaRingSpin 3.2s linear infinite',
                  opacity: 0.85
                }} />

                {/* Inner Gradient Orbit Ring */}
                <div style={{
                  position: 'absolute',
                  inset: '8px',
                  borderRadius: '50%',
                  border: '3px solid transparent',
                  borderTopColor: '#16a34a',
                  borderRightColor: '#ea580c',
                  animation: 'apnaRingSpinReverse 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite'
                }} />

                {/* Ambient Radial Glow */}
                <div style={{
                  position: 'absolute',
                  inset: '16px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(234, 88, 12, 0.22) 0%, rgba(22, 163, 74, 0.1) 70%, transparent 100%)',
                  animation: 'apnaLogoPulse 2s ease-in-out infinite'
                }} />

                {/* Center Badge with Official Apna Logo */}
                <div style={{
                  position: 'relative',
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(234, 88, 12, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  border: '2px solid #fed7aa',
                  animation: 'apnaLogoPulse 2s ease-in-out infinite'
                }}>
                  <img 
                    src="/logo.png" 
                    alt="Apna Digital Service Logo" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
                </div>
              </div>

              {/* Title & Brand Slogan */}
              <h4 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '800', 
                color: 'var(--navy-900)', 
                marginBottom: '6px',
                letterSpacing: '-0.02em'
              }}>
                Uploading Documents & Securing Request
              </h4>

              <div style={{
                fontSize: '0.84rem',
                color: 'var(--saffron-700)',
                fontWeight: 700,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span>APNA DIGITAL SERVICE</span>
                <span>•</span>
                <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>Aapka Kaam, Hamari Zimmedari</span>
              </div>

              {/* Live Stage Progress Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px 20px',
                maxWidth: '460px',
                margin: '0 auto 20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#16a34a',
                      display: 'inline-block',
                      boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
                      animation: 'apnaDotPulse 1.5s infinite'
                    }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      {uploadStage.message || 'Processing your application...'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.86rem', fontWeight: '800', color: 'var(--saffron-600)' }}>
                    {uploadStage.progress || 0}%
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div style={{
                  width: '100%',
                  height: '7px',
                  background: '#e2e8f0',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: `${uploadStage.progress || 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ea580c 0%, #f59e0b 50%, #16a34a 100%)',
                    borderRadius: '20px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                {uploadStage.detail && (
                  <div style={{ 
                    fontSize: '0.76rem', 
                    color: 'var(--slate-500)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    <FileText size={13} style={{ flexShrink: 0, color: 'var(--slate-400)' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{uploadStage.detail}</span>
                  </div>
                )}
              </div>

              {/* Security Assurance Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: '#166534',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 600
              }}>
                <ShieldCheck size={14} style={{ color: '#16a34a' }} />
                <span>End-to-End Encrypted Cloud Storage & Instant Tracking ID</span>
              </div>

              {/* Scoped CSS Keyframes for the Apna Logo Loading */}
              <style>{`
                @keyframes apnaRingSpin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes apnaRingSpinReverse {
                  0% { transform: rotate(360deg); }
                  100% { transform: rotate(0deg); }
                }
                @keyframes apnaLogoPulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.06); }
                }
                @keyframes apnaDotPulse {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.4; transform: scale(0.85); }
                }
              `}</style>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="native-service-form">
              {submitError && (
                <div style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Service Switcher if not initiated from specific service */}
              {allServices.length > 1 && (
                <div className="form-field form-field-compact">
                  <label htmlFor="request-service" className="form-label form-label-compact">Selected Service *</label>
                  <select id="request-service"
                    className="form-select form-input-compact"
                    value={selectedServiceId}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      setFormData({});
                    }}
                    required
                  >
                    {allServices.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} (₹{s.serviceCharge || '100'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* SECTION 1: APPLICANT IDENTITY */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  1. APPLICANT DETAILS
                </div>

                <div className="request-applicant-grid">
                  <div className="form-field" style={{ margin: 0 }}>
                    <label htmlFor="request-name" className="form-label" style={{ fontSize: '0.8rem' }}>Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input form-input-compact"
                      id="request-name" placeholder="Applicant full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field" style={{ margin: 0 }}>
                    <label htmlFor="request-email" className="form-label" style={{ fontSize: '0.8rem' }}>Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input form-input-compact"
                      id="request-email" placeholder="For status updates"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DYNAMIC SERVICE FORM QUESTIONS */}
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--saffron-700)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                  2. REQUIRED SERVICE DETAILS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {serviceFields.map((field) => {
                    const fieldVal = formData[field.id] || '';
                    const selectedFile = selectedDynamicFiles[field.id];

                    return (
                      <div key={field.id} className="form-field" style={{ margin: 0 }}>
                        <label htmlFor={'request-field-' + field.id} className="form-label" style={{ fontSize: '0.84rem' }}>
                          {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                        </label>

                        {field.type === 'select' ? (
                          <select
                            className="form-select form-input-compact"
                            id={'request-field-' + field.id} value={fieldVal}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            required={field.required}
                          >
                            <option value="">{field.placeholder || 'Select an option'}</option>
                            {field.options?.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            className="form-input form-input-compact"
                            rows="2"
                            placeholder={field.placeholder}
                            id={'request-field-' + field.id} value={fieldVal}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            required={field.required}
                          />
                        ) : field.type === 'file' ? (
                          <div>
                            {selectedFile ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                background: '#f0fdf4',
                                border: '1.5px solid #86efac',
                                borderRadius: '8px',
                                fontSize: '0.84rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                  {selectedFile.previewUrl ? (
                                    <img
                                      src={selectedFile.previewUrl}
                                      alt="Document Preview"
                                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #bbf7d0', flexShrink: 0 }}
                                    />
                                  ) : (
                                    <div style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '6px',
                                      background: '#dcfce7',
                                      color: '#16a34a',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      <FileText size={20} />
                                    </div>
                                  )}
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ color: '#166534', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {selectedFile.name}
                                    </div>
                                    <div style={{ fontSize: '0.73rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span>{selectedFile.size}</span>
                                      <span>•</span>
                                      <span style={{ fontWeight: 700, color: '#16a34a' }}>Selected from device</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDynamicFile(field.id)}
                                  style={{
                                    background: '#ffffff',
                                    border: '1px solid #fca5a5',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    flexShrink: 0
                                  }}
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <div>
                                <label style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1.5px dashed #cbd5e1',
                                  borderRadius: '8px',
                                  padding: '14px',
                                  background: '#f8fafc',
                                  cursor: 'pointer'
                                }}>
                                  <UploadCloud size={22} style={{ color: 'var(--saffron-600)', marginBottom: '4px' }} />
                                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                    {field.placeholder || `Select ${field.label}`}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                                    PDF, JPG, PNG or WEBP from this device (Max 5MB)
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleDynamicFileSelect(field.id, e.target.files?.[0])}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            className="form-input form-input-compact"
                            placeholder={field.placeholder}
                            id={'request-field-' + field.id} value={fieldVal}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            required={field.required}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: FIXED PAYMENT SECTION WITH QR CODE & PAYMENT PROOF */}
              <div style={{
                background: '#fff7ed',
                border: '1.5px solid #fed7aa',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. APPLICATION FEE PAYMENT
                  </div>
                  <span style={{
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    background: '#ea580c',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}>
                    Fee: ₹{serviceCharge}/-
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#7c2d12', margin: '0 0 12px', lineHeight: '1.4' }}>
                  Scan the QR code below using any UPI app (GPay, PhonePe, Paytm, Amazon Pay or BHIM) to pay the service fee of <strong>₹{serviceCharge}/-</strong>.
                </p>

                {/* QR Code Graphic Card */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center',
                  marginBottom: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px',
                    margin: '0 auto 8px',
                    maxWidth: '280px',
                    minHeight: '200px'
                  }}>
                    <img 
                      src={qrCodeUrl} 
                      alt="Scan & Pay UPI QR Code" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '340px', 
                        width: 'auto', 
                        height: 'auto', 
                        objectFit: 'contain', 
                        display: 'block', 
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                      }}
                      onError={(e) => { e.target.src = '/default-payment-qr.png'; }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                      href={qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#ea580c',
                        textDecoration: 'none',
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        padding: '3px 10px',
                        borderRadius: '6px'
                      }}
                    >
                      <ExternalLink size={12} />
                      <span>View / Open Full QR</span>
                    </a>
                    <span style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 600 }}>
                      Scan via GPay, PhonePe, Paytm or BHIM
                    </span>
                  </div>
                </div>

                {/* Mandatory Payment Screenshot Selection from Device */}
                <div className="form-field" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', color: '#7c2d12', fontWeight: 800 }}>
                    Select Payment Screenshot from Device <span style={{ color: '#dc2626' }}>*</span>
                  </label>

                  {selectedPaymentFile ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1.5px solid #86efac',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        {selectedPaymentFile.previewUrl ? (
                          <img
                            src={selectedPaymentFile.previewUrl}
                            alt="Payment Preview"
                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #bbf7d0', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '6px',
                            background: '#dcfce7',
                            color: '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <CheckCircle size={22} />
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: '#166534', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedPaymentFile.name}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{selectedPaymentFile.size}</span>
                            <span>•</span>
                            <span style={{ fontWeight: 700, color: '#16a34a' }}>Selected (Uploads on Submit)</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePaymentScreenshot}
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          color: '#e11d48',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '5px 12px',
                          borderRadius: '6px',
                          flexShrink: 0
                        }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px dashed #ea580c',
                        borderRadius: '8px',
                        padding: '16px',
                        background: '#ffffff',
                        cursor: 'pointer'
                      }}>
                        <UploadCloud size={24} style={{ color: '#ea580c', marginBottom: '4px' }} />
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#9a3412' }}>
                          Click to Select Payment Screenshot from Device
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#7c2d12', marginTop: '2px' }}>
                          JPG, PNG, PDF or WEBP (Max 5MB • Uploads to Cloudinary on Submit)
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          onChange={handlePaymentScreenshotSelect}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '14px', 
                  fontSize: '1rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={18} />
                <span>Submit Request & Generate Tracking ID</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
