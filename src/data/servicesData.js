import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Master Services Configuration
// Dynamic Data Store: Any service added here or via Super Admin dynamically generates:
// 1. A Card on the Home Page
// 2. Its own dedicated Service Detail Page (/service/:slug)

export const DEFAULT_SERVICES = [
  {
    id: 'pan-card',
    slug: 'pan-card-pdf',
    title: 'PAN Card PDF Download Assistance',
    hindiTitle: 'पैन कार्ड पीडीएफ डाउनलोड सहायता',
    shortName: 'PAN Card PDF',
    cardTitle: 'PAN Card PDF',
    cardSubtitle: 'Assistance for customers who need to download an available PAN Card',
    cardButtonText: 'DOWNLOAD →',
    cardTheme: 'tricolour',
    badge: 'Instant Processing',
    badgeColor: 'saffron',
    iconName: 'CreditCard',
    serviceCharge: '110',
    qrCodeUrl: '/default-payment-qr.png',
    description: 'Assistance for customers who need to download an available PAN Card PDF (e-PAN). Ideal if physical card is lost, damaged, or urgent digital copy is required.',
    status: 'active',
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20PAN%20Card%20PDF',
    formFields: [
      { id: 'aadhaar_pdf', label: 'Aadhaar Card PDF (should be clear)', type: 'file', placeholder: 'Upload Aadhaar PDF or clear photo (Max 5MB)', required: true },
      { id: 'pan_number', label: 'Pan Number', type: 'text', placeholder: 'Enter 10-digit PAN Number (e.g. ABCDE1234F)', required: true },
      { id: 'photo', label: 'Passport Photo', type: 'file', placeholder: 'Upload clear passport size photo', required: true },
      { id: 'signature', label: 'Signature', type: 'file', placeholder: 'Upload clear photo of your signature', required: true },
      { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp Number to receive PDF', required: true }
    ],
    features: ['Aadhaar / PAN linked record lookup', 'High-resolution official PDF format', 'Fast turnaround time', 'Direct WhatsApp PDF delivery'],
    workflow: ['Customer submits required PAN identification details.', 'Backend operations team processes the request.', 'Available PAN PDF is delivered on WhatsApp.'],
    requirements: ['10-digit PAN Number or linked Aadhaar Number', 'Date of Birth (as per records)', '10-digit WhatsApp Mobile Number'],
    disclaimer: 'Apna Digital Service assists in downloading authorized e-PAN duplicates through public facilitation workflows. We are not NSDL/UTIITSL.'
  },
  {
    id: 'voter-id',
    slug: 'voter-id-pdf',
    title: 'Voter ID / e-EPIC PDF Download Assistance',
    hindiTitle: 'वोटर कार्ड पीडीएफ डाउनलोड (बिना ओटीपी)',
    shortName: 'Voter ID PDF',
    cardTitle: 'Voter ID Pdf',
    cardSubtitle: 'Assistance for customers who need to download an available Voter ID',
    cardButtonText: 'DOWNLOAD →',
    cardTheme: 'tricolour',
    badge: 'Without OTP • High Demand',
    badgeColor: 'green',
    iconName: 'Vote',
    serviceCharge: '115',
    qrCodeUrl: '/default-payment-qr.png',
    description: 'Assistance for customers who need to download an available Voter ID / e-EPIC PDF. Specially optimized for cases where mobile number is not linked or OTP does not arrive.',
    status: 'active',
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Voter%20ID%20PDF%20(No%20OTP)',
    formFields: [
      { id: 'epic_number', label: 'Voter ID / EPIC Number', type: 'text', placeholder: 'Enter your Voter ID or EPIC Number', required: true },
      { id: 'state_name', label: 'State Name', type: 'text', placeholder: 'Enter state name (e.g. Odisha, Bihar, etc.)', required: true },
      { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp Number to receive PDF', required: true }
    ],
    features: ['Assistance available even without linked mobile OTP', 'EPIC number or electoral roll details lookup', 'Original official digital PDF copy', 'Direct dispatch via WhatsApp'],
    workflow: ['Customer submits voter identification details (EPIC number or Name/Assembly).', 'Backend operations team reviews and retrieves available copy.', 'e-EPIC PDF delivered online / directly on WhatsApp.'],
    requirements: ['Voter EPIC Number (Voter ID Number) OR Full Name with State & District', 'Father / Husband Name', '10-digit WhatsApp Mobile Number'],
    disclaimer: 'This service provides facilitation assistance to locate and retrieve the available official e-EPIC copy. We are not the Election Commission of India.'
  },
  {
    id: 'driving-licence',
    slug: 'driving-licence-pdf',
    title: 'Driving Licence (DL) PDF Download Assistance',
    hindiTitle: 'ड्राइविंग लाइसेंस पीडीएफ डाउनलोड सहायता',
    shortName: 'Driving Licence PDF',
    cardTitle: 'Driving Licence PDF',
    cardSubtitle: 'Assistance for customers who need to download an available Driving Licence',
    cardButtonText: 'DOWNLOAD →',
    cardTheme: 'tricolour',
    badge: 'Sarathi Verified',
    badgeColor: 'blue',
    iconName: 'Car',
    serviceCharge: '100',
    qrCodeUrl: '/default-payment-qr.png',
    description: 'Assistance for customers who need to download an available Driving Licence PDF. Get verified digital DL proof for traffic police, insurance, or RTO procedures.',
    status: 'active',
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Driving%20Licence%20PDF',
    formFields: [
      { id: 'dl_number', label: 'Driving Licence (DL) Number', type: 'text', placeholder: 'Enter DL Number (e.g. DL-XXXXXXXXXXXXX)', required: true },
      { id: 'dob', label: 'Date of Birth (DD-MM-YYYY)', type: 'date', placeholder: 'Select Date of Birth', required: true },
      { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp Number to receive PDF', required: true }
    ],
    features: ['Sarathi Parivahan verified database retrieval', 'Covers 2-Wheeler, LMV, Transport & Commercial licences', 'Official digital copy with QR & validity details', 'Express support on WhatsApp'],
    workflow: ['Customer provides required driving licence details.', 'Backend team processes request through applicable system.', 'Available digital document is delivered directly on WhatsApp.'],
    requirements: ['Driving Licence Number (e.g. DL-XXXXXXXXXXXXX)', 'Date of Birth of licence holder', 'State and RTO name where issued'],
    disclaimer: 'This service provides retrieval assistance for existing valid driving licences. We do not issue new licences.'
  },
  {
    id: 'vehicle-rc',
    slug: 'vehicle-rc-pdf',
    title: 'Vehicle Registration Certificate (RC) PDF Download Assistance',
    hindiTitle: 'गाड़ी आरसी (RC) पीडीएफ डाउनलोड सहायता',
    shortName: 'Vehicle RC PDF',
    cardTitle: 'Vehicle RC PDF',
    cardSubtitle: 'Assistance for customers who need to download an available Vehicle RC',
    cardButtonText: 'DOWNLOAD →',
    cardTheme: 'tricolour',
    badge: 'All Vehicles Covered',
    badgeColor: 'purple',
    iconName: 'Truck',
    serviceCharge: '100',
    qrCodeUrl: '/default-payment-qr.png',
    description: 'Assistance for customers who need to download an available Vehicle Registration Certificate (RC) PDF. Retrieve lost or damaged vehicle ownership proof quickly.',
    status: 'active',
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Vehicle%20RC%20PDF',
    formFields: [
      { id: 'rc_number', label: 'Vehicle Registration Number (RC Number)', type: 'text', placeholder: 'e.g. OD02AB1234', required: true },
      { id: 'chassis_last5', label: 'Last 5 Digits of Chassis Number', type: 'text', placeholder: 'Enter last 5 digits of Chassis number', required: true },
      { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp Number to receive PDF', required: true }
    ],
    features: ['Covers Motorcycles, Cars, Commercial Trucks & Tractors', 'Vahan verified registration data', 'Includes Engine No, Chassis No & Fitness details', 'Direct dispatch via WhatsApp'],
    workflow: ['Customer provides required vehicle registration details.', 'Backend team processes request through applicable system.', 'Available RC PDF delivered online.'],
    requirements: ['Vehicle Registration Number (e.g. MH01AB1234)', 'Last 5 digits of Chassis Number or Engine Number', 'Owner name as registered'],
    disclaimer: 'We facilitate digital duplicate downloads of existing vehicle registration records. We are not an RTO or MoRTH.'
  },
  {
    id: 'ayushman-new-member',
    slug: 'ayushman-new-member',
    title: 'Ayushman Card — New Member Addition Assistance',
    hindiTitle: 'आयुष्मान कार्ड — नया सदस्य जोड़ने हेतु सहायता',
    shortName: 'Ayushman New Member',
    cardTitle: 'Ayushman New Member',
    cardSubtitle: 'Assistance with eligible requests to add a family member or beneficiary',
    cardButtonText: 'DOWNLOAD →',
    cardTheme: 'tricolour',
    badge: 'High Demand',
    badgeColor: 'saffron',
    iconName: 'UserPlus',
    serviceCharge: '100',
    qrCodeUrl: '/default-payment-qr.png',
    description: 'Assistance with eligible requests to add a family member or beneficiary to an Ayushman scheme record, where the official system permits it.',
    status: 'active',
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20Card%20New%20Member%20Addition',
    formFields: [
      { id: 'ration_card_number', label: 'Ration Card Number / PM-JAY Family ID', type: 'text', placeholder: 'Enter Ration Card or Family ID', required: true },
      { id: 'member_name', label: 'Member Full Name (to be added)', type: 'text', placeholder: 'Enter full name of member', required: true },
      { id: 'relation', label: 'Relationship with Head of Family', type: 'text', placeholder: 'e.g. Son, Daughter, Wife', required: true },
      { id: 'member_aadhaar', label: 'Member Aadhaar Card (PDF / Photo)', type: 'file', placeholder: 'Upload member Aadhaar copy', required: true },
      { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp number', required: true }
    ],
    features: ['Eligibility verification based on NFSA / Ration Card data', 'Assistance submitting documentation through authorized channels', 'Guidance for relationship verification documents', 'Direct WhatsApp updates'],
    workflow: ['Customer submits required family/member details and documents.', 'Backend team reviews and coordinates through authorized system.', 'Status updates delivered on WhatsApp.'],
    requirements: ['Existing Family Ration Card / PM-JAY Family ID', 'Aadhaar card of member to be added', 'Proof of relationship'],
    disclaimer: 'Addition is subject to government eligibility norms and official approval.'
  },
  {
    id: 'ayushman-correction',
    slug: 'ayushman-correction',
    title: 'Ayushman Card — Correction Assistance',
    hindiTitle: 'आयुष्मान कार्ड — सुधार / संशोधन सहायता',
    shortName: 'Ayushman Correction',
    cardTitle: 'Ayushman Card Correction',
    cardSubtitle: 'Assistance with eligible corrections to an existing Ayushman Card',
    cardButtonText: 'DOWNLOAD →',
    cardTheme: 'tricolour',
    badge: 'Assisted Service',
    badgeColor: 'blue',
    iconName: 'FileEdit',
    serviceCharge: '100',
    qrCodeUrl: '/default-payment-qr.png',
    description: 'Assistance with eligible corrections to an existing Ayushman Card or associated beneficiary details, where permitted by the official system.',
    status: 'active',
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20Card%20Correction',
    formFields: [
      { id: 'ayushman_id', label: 'Existing Ayushman Card / Beneficiary ID', type: 'text', placeholder: 'Enter Ayushman Card ID', required: true },
      { id: 'correction_type', label: 'Correction Required', type: 'select', placeholder: 'Select correction required', required: true, options: ['Name Spelling Correction', 'Date of Birth / Age Correction', 'Gender Correction', 'Address Correction'] },
      { id: 'aadhaar_doc', label: 'Correct Aadhaar Card (PDF / Photo)', type: 'file', placeholder: 'Upload Aadhaar copy with correct details', required: true },
      { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp number', required: true }
    ],
    features: ['Spelling correction in beneficiary name', 'Date of Birth / Age discrepancy guidance', 'Gender and relationship corrections', 'Backend coordination through official portal'],
    workflow: ['Customer submits card details and supporting documents.', 'Customer specifies correction required.', 'Backend team coordinates through authorized portal.'],
    requirements: ['Existing Ayushman Card / Beneficiary ID', 'Valid Aadhaar Card with corrected details', 'Proof supporting correction'],
    disclaimer: 'Correction requests depend on verification against authorized databases.'
  },
  {
    id: 'ayushman-ekyc',
    slug: 'ayushman-ekyc',
    title: 'Ayushman Card — e-KYC Assistance',
    hindiTitle: 'आयुष्मान कार्ड — ई-केवाईसी (e-KYC) सहायता',
    shortName: 'Ayushman e-KYC',
    cardTitle: 'Ayushman e-KYC',
    cardSubtitle: 'Complete biometric & Aadhaar verification for Ayushman Card',
    cardButtonText: 'DOWNLOAD →',
    cardTheme: 'tricolour',
    badge: 'Assisted Service',
    badgeColor: 'purple',
    iconName: 'Fingerprint',
    serviceCharge: '100',
    qrCodeUrl: '/default-payment-qr.png',
    description: 'Assistance to eligible beneficiaries who need to complete Ayushman Card e-KYC through the applicable authorized system.',
    status: 'active',
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20e-KYC',
    formFields: [
      { id: 'pmjay_id', label: 'PM-JAY ID or Ration Card Number', type: 'text', placeholder: 'Enter PM-JAY ID or Ration Card No.', required: true },
      { id: 'aadhaar_number', label: 'Aadhaar Number (Linked with Mobile)', type: 'text', placeholder: 'Enter 12-digit Aadhaar number', required: true },
      { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: '10-digit WhatsApp number', required: true }
    ],
    features: ['e-KYC status verification check', 'Guidance for OTP or Biometric authentication', 'Photo update and card re-generation support', 'Complete confidentiality maintained'],
    workflow: ['Customer submits required Ayushman Card or beneficiary details.', 'Backend team reviews request and assists with e-KYC.', 'Status confirmed on WhatsApp.'],
    requirements: ['PM-JAY ID or Ration Card Number', 'Aadhaar Number linked with active mobile number', 'Physical presence if biometric required'],
    disclaimer: 'We do not collect or store OTPs or biometric data on our servers.'
  }
];

export const ACTIVE_SERVICES = DEFAULT_SERVICES;

/**
 * Global Homepage & Site Settings Configuration
 */
export const DEFAULT_HOMEPAGE_SETTINGS = {
  sections: {
    hero: true,
    services: true,
    howItWorks: true,
    about: true,
    faq: true
  },
  hero: {
    tagline: 'Direct Assisted Services',
    title: 'Digital Services, Made Simple.',
    subtitle: 'Submit your request online. Our backend team will assist you through the applicable process.',
    bannerImageUrl: '/hero-banner.png'
  },
  howItWorks: {
    tagline: 'Simple & Transparent Process',
    title: 'How Apna Digital Service Works',
    subtitle: 'Follow these 4 simple steps to submit your request and receive your verified document PDF.',
    diagramImageUrl: '/how-it-works-diagram.png'
  },
  contact: {
    primaryPhone: '8018246567',
    whatsappPhone: '8018246567',
    supportEmail: 'help.apnadigitalservice@gmail.com',
    operatingHours: 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
    address: 'Digital Facilitation Hub, Main Road, India'
  },
  footer: {
    disclaimer: 'Apna Digital Service is an independent digital facilitation platform that assists customers with authorized online applications, document retrieval, and compliance workflows. We operate with strict customer consent.',
    copyright: '© 2026 Apna Digital Service. All rights reserved.'
  }
};

export function getHomepageSettings() {
  try {
    const stored = localStorage.getItem('apna_homepage_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_HOMEPAGE_SETTINGS,
        ...parsed,
        sections: { ...DEFAULT_HOMEPAGE_SETTINGS.sections, ...(parsed.sections || {}) },
        hero: { ...DEFAULT_HOMEPAGE_SETTINGS.hero, ...(parsed.hero || {}) },
        howItWorks: { ...DEFAULT_HOMEPAGE_SETTINGS.howItWorks, ...(parsed.howItWorks || {}) },
        contact: { ...DEFAULT_HOMEPAGE_SETTINGS.contact, ...(parsed.contact || {}) },
        footer: { ...DEFAULT_HOMEPAGE_SETTINGS.footer, ...(parsed.footer || {}) }
      };
    }
  } catch (e) {
    console.error('Error reading apna_homepage_settings:', e);
  }
  return DEFAULT_HOMEPAGE_SETTINGS;
}

export function saveHomepageSettings(newSettings, role) {
  if (role !== 'super_admin') {
    return {
      success: false,
      error: 'Permission Denied: Only Super Admin can modify homepage configuration and site content.'
    };
  }

  try {
    const merged = {
      ...DEFAULT_HOMEPAGE_SETTINGS,
      ...newSettings,
      sections: { ...DEFAULT_HOMEPAGE_SETTINGS.sections, ...(newSettings.sections || {}) },
      hero: { ...DEFAULT_HOMEPAGE_SETTINGS.hero, ...(newSettings.hero || {}) },
      howItWorks: { ...DEFAULT_HOMEPAGE_SETTINGS.howItWorks, ...(newSettings.howItWorks || {}) },
      contact: { ...DEFAULT_HOMEPAGE_SETTINGS.contact, ...(newSettings.contact || {}) },
      footer: { ...DEFAULT_HOMEPAGE_SETTINGS.footer, ...(newSettings.footer || {}) }
    };

    localStorage.setItem('apna_homepage_settings', JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('apna_settings_changed', { detail: merged }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('site_settings').upsert([{
        id: 'homepage_config',
        key: 'homepage_config',
        value: merged,
        updated_at: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.warn('Supabase site_settings upsert notice:', error.message);
      }).catch(err => console.warn(err));
    }

    return { success: true, settings: merged };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to save homepage settings' };
  }
}

/**
 * Global Site Settings Helper for Payment QR Code
 */
export async function getMasterQrCodeUrl() {
  try {
    const local = localStorage.getItem('apna_master_qr');
    if (local) return local;
  } catch (e) {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'master_qr_code_url')
        .single();
      if (data?.value) {
        try {
          localStorage.setItem('apna_master_qr', data.value);
        } catch (e) {}
        return data.value;
      }
    } catch (e) {}
  }
  return '/default-payment-qr.png';
}

export async function updateMasterQrCodeUrl(newUrl, role) {
  if (role !== 'super_admin' && role !== 'admin') {
    return {
      success: false,
      error: 'Permission Denied: Only administrators can update the Master Payment QR code.'
    };
  }

  try {
    localStorage.setItem('apna_master_qr', newUrl);
    window.dispatchEvent(new Event('apna_settings_changed'));
  } catch (e) {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'master_qr_code_url', 
          value: newUrl, 
          updated_at: new Date().toISOString() 
        });
    } catch (err) {
      console.warn('Supabase site_settings update error:', err);
    }
  }

  return { success: true };
}

/**
 * Retrieve ALL services (including active, phase2, and inactive)
 * Reads from localStorage 'apna_master_services', merging missing fields with DEFAULT_SERVICES.
 */
const SERVICES_VERSION = 'v4_exact_7_services_creative';

export function getAllServices() {
  try {
    // Migration: If user has old cache, refresh to new mockup cards & Indian Tri-colour
    if (localStorage.getItem('apna_services_version') !== SERVICES_VERSION) {
      localStorage.setItem('apna_services_version', SERVICES_VERSION);
      localStorage.setItem('apna_master_services', JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }

    const stored = localStorage.getItem('apna_master_services');
    if (stored) {
      const list = JSON.parse(stored);
      if (Array.isArray(list) && list.length > 0) {
        return list.map(item => {
          const def = DEFAULT_SERVICES.find(d => d.id === item.id || d.slug === item.slug);
          const isOldTitle = ['Voter Link', 'PAN Find', 'DL Download', 'RC Download', 'Ayushman Member', 'Ayushman Edit'].includes(item.cardTitle);
          return {
            ...def,
            ...item,
            cardTitle: (isOldTitle || !item.cardTitle) ? (def?.cardTitle || item.title) : item.cardTitle,
            cardSubtitle: (isOldTitle || !item.cardSubtitle) ? (def?.cardSubtitle || item.description?.slice(0, 68)) : item.cardSubtitle,
            cardButtonText: item.cardButtonText || def?.cardButtonText || 'DOWNLOAD →',
            cardTheme: (isOldTitle || !item.cardTheme) ? (def?.cardTheme || 'tricolour') : item.cardTheme
          };
        });
      }
    }
  } catch (err) {
    console.error('Error reading apna_master_services:', err);
  }

  // Initialize with DEFAULT_SERVICES
  try {
    localStorage.setItem('apna_services_version', SERVICES_VERSION);
    localStorage.setItem('apna_master_services', JSON.stringify(DEFAULT_SERVICES));
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SERVICES;
}

/**
 * Retrieve only active or live services for customer display.
 * ALL active services are shown (zero Google Form dependency).
 */
export function getActiveServices() {
  const all = getAllServices();
  return all.filter(s => s.status !== 'inactive');
}

/**
 * Find service by slug
 */
export function getServiceBySlug(slug) {
  const all = getAllServices();
  return all.find(s => s.slug === slug);
}

/**
 * Save Service (Create new OR Update existing)
 * Strict Role Guard: Only 'super_admin' can save
 */
export function saveServiceByAdmin(serviceData, role) {
  if (role !== 'super_admin') {
    return {
      success: false,
      error: 'Permission Denied: Your account has View-Only Admin privileges. Only Super Admin can add or modify services.'
    };
  }

  try {
    const list = [...getAllServices()];
    const phone = serviceData.supportPhone || '8018246567';
    const title = serviceData.title || 'Untitled Service';

    const normalizedService = {
      ...serviceData,
      id: serviceData.id || 'srv-' + Date.now(),
      slug: serviceData.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: title,
      hindiTitle: serviceData.hindiTitle || title,
      shortName: serviceData.shortName || title.slice(0, 22),
      cardTitle: serviceData.cardTitle || serviceData.shortName || title.slice(0, 22),
      cardSubtitle: serviceData.cardSubtitle || serviceData.description?.slice(0, 75) || 'Download or apply for official document copy',
      cardButtonText: serviceData.cardButtonText || 'DOWNLOAD →',
      cardTheme: serviceData.cardTheme || serviceData.badgeColor || 'blue',
      badge: serviceData.badge || 'Live Service',
      badgeColor: serviceData.badgeColor || 'saffron',
      iconName: serviceData.iconName || 'FileText',
      serviceCharge: serviceData.serviceCharge || '100',
      qrCodeUrl: serviceData.qrCodeUrl || '/default-payment-qr.png',
      formFields: Array.isArray(serviceData.formFields) ? serviceData.formFields : [],
      description: serviceData.description || 'Assistance for online application and verification.',
      status: serviceData.status || 'active',
      supportPhone: phone,
      supportWhatsapp: `https://wa.me/91${phone}?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20${encodeURIComponent(title)}`,
      features: Array.isArray(serviceData.features) && serviceData.features.length > 0 
        ? serviceData.features 
        : [
            'Dedicated manual verification',
            'Official authorized processing',
            'Direct dispatch via WhatsApp',
            'Fast operator assistance'
          ],
      workflow: Array.isArray(serviceData.workflow) && serviceData.workflow.length > 0
        ? serviceData.workflow
        : [
            'Customer submits required identification details on the platform.',
            'Backend team checks eligibility and records against authorized systems.',
            'Verified document/receipt is delivered directly on WhatsApp and dashboard.'
          ],
      requirements: Array.isArray(serviceData.requirements) && serviceData.requirements.length > 0
        ? serviceData.requirements
        : [
            'Official reference / Identification number',
            'Full Name as per records',
            '10-digit WhatsApp Mobile Number for receiving PDF'
          ],
      disclaimer: serviceData.disclaimer || 'Apna Digital Service is a privately operated assistance platform and is not a government portal.'
    };

    const existingIdx = list.findIndex(s => s.id === normalizedService.id || s.slug === normalizedService.slug);
    if (existingIdx !== -1) {
      list[existingIdx] = normalizedService;
    } else {
      list.push(normalizedService);
    }

    localStorage.setItem('apna_master_services', JSON.stringify(list));
    window.dispatchEvent(new Event('apna_services_changed'));

    // Asynchronously sync to Supabase public.services table if available
    if (isSupabaseConfigured && supabase) {
      try {
        supabase.from('services').upsert([{
          id: normalizedService.id,
          slug: normalizedService.slug,
          title: normalizedService.title,
          hindi_title: normalizedService.hindiTitle,
          short_name: normalizedService.shortName,
          card_title: normalizedService.cardTitle,
          card_subtitle: normalizedService.cardSubtitle,
          card_button_text: normalizedService.cardButtonText,
          card_theme: normalizedService.cardTheme,
          badge: normalizedService.badge,
          badge_color: normalizedService.badgeColor,
          icon_name: normalizedService.iconName,
          service_charge: normalizedService.serviceCharge,
          qr_code_url: normalizedService.qrCodeUrl,
          form_fields: normalizedService.formFields,
          description: normalizedService.description,
          status: normalizedService.status,
          support_phone: normalizedService.supportPhone,
          support_whatsapp: normalizedService.supportWhatsapp,
          features: normalizedService.features,
          workflow: normalizedService.workflow,
          requirements: normalizedService.requirements,
          disclaimer: normalizedService.disclaimer,
          updated_at: new Date().toISOString()
        }]).then(({ error }) => {
          if (error) console.warn('Supabase services upsert notice:', error.message);
        });
      } catch (err) {
        console.warn('Supabase services sync exception:', err);
      }
    }

    return { success: true, service: normalizedService };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to save service' };
  }
}

/**
 * Delete or Deactivate Service
 * Strict Role Guard: Only 'super_admin' can delete
 */
export function deleteServiceByAdmin(serviceId, role) {
  if (role !== 'super_admin') {
    return {
      success: false,
      error: 'Permission Denied: Your account has View-Only Admin privileges. Only Super Admin can delete services.'
    };
  }

  try {
    let list = getAllServices();
    const isDefault = DEFAULT_SERVICES.some(d => d.id === serviceId);
    if (isDefault) {
      list = list.map(s => s.id === serviceId ? { ...s, status: 'inactive' } : s);
    } else {
      list = list.filter(s => s.id !== serviceId);
    }

    localStorage.setItem('apna_master_services', JSON.stringify(list));
    window.dispatchEvent(new Event('apna_services_changed'));

    // Sync to Supabase public.services
    if (isSupabaseConfigured && supabase) {
      try {
        if (isDefault) {
          supabase.from('services').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', serviceId);
        } else {
          supabase.from('services').delete().eq('id', serviceId);
        }
      } catch (err) {
        console.warn('Supabase service delete exception:', err);
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to delete service' };
  }
}

// Backward compatibility alias
export function addServiceByAdmin(newService) {
  const res = saveServiceByAdmin(newService, 'super_admin');
  return res.success;
}

export const FAQ_ITEMS = [
  {
    q: 'What is Apna Digital Service?',
    a: 'Apna Digital Service is a privately operated online platform that provides digital documentation assistance and related online services.'
  },
  {
    q: 'Who can use the platform?',
    a: 'Customers from across India may submit service requests, subject to the eligibility and requirements of the selected service.'
  },
  {
    q: 'Which services are available?',
    a: 'Our initial services include Voter ID PDF Download (without OTP), PAN Card PDF Download, Driving Licence PDF Download, RC PDF Download, Ayushman Card New Member Addition, Ayushman Card Correction, and Ayushman Card e-KYC assistance.'
  },
  {
    q: 'How do I request a service?',
    a: 'Select the required service, complete the relevant form, provide the necessary information and documents, and complete the applicable confirmation.'
  },
  {
    q: 'Which documents are required?',
    a: 'Requirements depend on the selected service. Please check the relevant dedicated service page before submitting your request.'
  },
  {
    q: 'How long does processing take?',
    a: 'Processing times vary according to the service, verification requirements, and official system availability. An estimate will be communicated where available.'
  },
  {
    q: 'Is service approval guaranteed?',
    a: 'No. Approval, correction, addition, verification, or document issuance is subject to applicable rules, eligibility checks, and the relevant authority.'
  },
  {
    q: 'How can I check my request status?',
    a: 'Use your order/request ID, registered email, or mobile number through the "Track Request" facility or log into "My Dashboard" on our website.'
  },
  {
    q: 'Where will I receive and download my verified document PDF?',
    a: 'You can download your verified document PDF directly from your Website Customer Dashboard (accessible via "My Dashboard" or "Track Request"), and our team also dispatches the document straight to your registered WhatsApp mobile number.'
  },
  {
    q: 'What if payment succeeds but my request is not confirmed?',
    a: 'Keep your payment receipt or transaction reference and contact our support team.'
  },
  {
    q: 'How can I contact customer support?',
    a: 'Call 8018246567 or 9124494239. Support is available every day from 9:00 AM to 9:00 PM IST.'
  },
  {
    q: 'Is Apna Digital Service a government website?',
    a: 'No. Apna Digital Service is a private business platform and is not a government website or government department.'
  },
  {
    q: 'How can I request a refund or cancellation?',
    a: 'Please refer to the Refund and Cancellation Policy for applicable terms and procedures.'
  }
];
