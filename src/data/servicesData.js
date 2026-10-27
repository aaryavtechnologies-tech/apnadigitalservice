import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Master Services Configuration
// Dynamic Data Store: Any service added here or via Super Admin dynamically generates:
// 1. A Card on the Home Page
// 2. Its own dedicated Service Detail Page (/service/:slug)

export const DEFAULT_SERVICES = [
  {
    id: 'voter-id',
    slug: 'voter-id-pdf',
    title: 'Voter ID / e-EPIC PDF Download Assistance',
    hindiTitle: 'वोटर कार्ड पीडीएफ डाउनलोड (बिना ओटीपी)',
    shortName: 'Voter ID PDF',
    badge: 'Without OTP • High Demand',
    badgeColor: 'green',
    iconName: 'Vote',
    description: 'Assistance for customers who need to download an available Voter ID / e-EPIC PDF. Specially optimized for cases where mobile number is not linked or OTP does not arrive.',
    status: 'active',
    formUrl: 'https://forms.gle/dR8S5SBYRM9qrfvF8',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1KVS7Je_SV5CC_XL7w3AhBCk2X5xXS6GY5AQSVAicngw/edit?resourcekey=&gid=158630102#gid=158630102',
    supportPhone: '9124494239',
    supportWhatsapp: 'https://wa.me/919124494239?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Voter%20ID%20PDF%20(No%20OTP)',
    features: [
      'Assistance available even without linked mobile OTP',
      'EPIC number or electoral roll details lookup',
      'Original official digital PDF copy',
      'Direct dispatch via WhatsApp'
    ],
    workflow: [
      'Customer submits the required voter identification details (EPIC number or Name/Assembly).',
      'The backend operations team reviews and processes the request through the applicable authorized system.',
      'The available e-EPIC PDF is delivered online / directly on WhatsApp, subject to verification and access.'
    ],
    requirements: [
      'Voter EPIC Number (Voter ID Number) OR Full Name with State & District',
      'Father / Husband Name (for identity confirmation)',
      '10-digit WhatsApp Mobile Number for receiving PDF'
    ],
    disclaimer: 'This service provides facilitation assistance to locate and retrieve the available official e-EPIC copy. Apna Digital Service is privately operated and is not the Election Commission of India.'
  },
  {
    id: 'pan-card',
    slug: 'pan-card-pdf',
    title: 'PAN Card PDF Download Assistance',
    hindiTitle: 'पैन कार्ड पीडीएफ डाउनलोड सहायता',
    shortName: 'PAN Card PDF',
    badge: 'Instant Processing',
    badgeColor: 'saffron',
    iconName: 'CreditCard',
    description: 'Assistance for customers who need to download an available PAN Card PDF (e-PAN). Ideal if physical card is lost, damaged, or urgent digital copy is required.',
    status: 'active',
    formUrl: 'https://forms.gle/o2AfsRZuxcPpYBnL9',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/163PzjqCl72anqGbuRlJWD8elgcP5s86o_u8rU5aMj24/edit?resourcekey=&gid=1248588140#gid=1248588140',
    supportPhone: '9124494239',
    supportWhatsapp: 'https://wa.me/919124494239?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20PAN%20Card%20PDF',
    features: [
      'Aadhaar / PAN linked record lookup',
      'High-resolution government acceptable PDF format',
      'Fast turnaround time',
      'Direct WhatsApp PDF delivery'
    ],
    workflow: [
      'Customer submits the required PAN identification details and verification information.',
      'The backend operations team processes the request through the applicable authorized system.',
      'The available PAN PDF is delivered online, subject to applicable rules and verification.'
    ],
    requirements: [
      '10-digit PAN Number or linked Aadhaar Number',
      'Date of Birth (as per records)',
      '10-digit WhatsApp Mobile Number'
    ],
    disclaimer: 'Apna Digital Service assists in downloading authorized e-PAN duplicates through public facilitation workflows. We are not the Income Tax Department or NSDL/UTIITSL.'
  },
  {
    id: 'driving-licence',
    slug: 'driving-licence-pdf',
    title: 'Driving Licence (DL) PDF Download Assistance',
    hindiTitle: 'ड्राइविंग लाइसेंस पीडीएफ डाउनलोड सहायता',
    shortName: 'Driving Licence PDF',
    badge: 'Sarathi Verified',
    badgeColor: 'blue',
    iconName: 'Car',
    description: 'Assistance for customers who need to download an available Driving Licence PDF. Get verified digital DL proof for traffic police, insurance, or RTO procedures.',
    status: 'active',
    formUrl: 'https://forms.gle/DrgRW485k9QDQTf28',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1SJtUkFBjKuSYlVd-u1PqRBj_lf8h8G5-ufwOwtbsKQc/edit?resourcekey=&gid=24079836#gid=24079836',
    supportPhone: '9078620775',
    supportWhatsapp: 'https://wa.me/919078620775?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Driving%20Licence%20PDF',
    features: [
      'Sarathi Parivahan verified database retrieval',
      'Covers 2-Wheeler, LMV, Transport & Commercial licences',
      'Official digital copy with QR & validity details',
      'Express support on WhatsApp'
    ],
    workflow: [
      'Customer provides the required driving licence details.',
      'The backend team processes the request through the applicable authorized system.',
      'The available digital document is delivered online, subject to verification and access.'
    ],
    requirements: [
      'Driving Licence Number (e.g. DL-XXXXXXXXXXXXX)',
      'Date of Birth of licence holder',
      'State and RTO name where issued'
    ],
    disclaimer: 'This service provides retrieval assistance for existing valid driving licences through official channels. We do not issue new licences or modify licensing records.'
  },
  {
    id: 'vehicle-rc',
    slug: 'vehicle-rc-pdf',
    title: 'Vehicle Registration Certificate (RC) PDF Download Assistance',
    hindiTitle: 'गाड़ी आरसी (RC) पीडीएफ डाउनलोड सहायता',
    shortName: 'Vehicle RC PDF',
    badge: 'All Vehicles Covered',
    badgeColor: 'purple',
    iconName: 'Truck',
    description: 'Assistance for customers who need to download an available Vehicle Registration Certificate (RC) PDF. Retrieve lost or damaged vehicle ownership proof quickly.',
    status: 'active',
    formUrl: 'https://forms.gle/ffutHMr4xa6yDMHZA',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1ornMPtGwnY7NB51XrNqYYHfFurr7oe8TMLFjwZGTLyw/edit?resourcekey=&gid=589269107#gid=589269107',
    supportPhone: '9078620775',
    supportWhatsapp: 'https://wa.me/919078620775?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Vehicle%20RC%20PDF',
    features: [
      'Covers Motorcycles, Cars, Commercial Trucks & Tractors',
      'Vahan verified registration data',
      'Includes Engine No, Chassis No & Fitness details',
      'Direct dispatch via WhatsApp'
    ],
    workflow: [
      'Customer provides the required vehicle registration details.',
      'The backend team processes the request through the applicable authorized system.',
      'The available RC PDF is delivered online, subject to verification and access.'
    ],
    requirements: [
      'Vehicle Registration Number (e.g. MH01AB1234)',
      'Last 5 digits of Chassis Number or Engine Number',
      'Owner name as registered'
    ],
    disclaimer: 'We facilitate digital duplicate downloads of existing vehicle registration records. We are not an RTO or the Ministry of Road Transport and Highways (MoRTH).'
  },
  {
    id: 'ayushman-new-member',
    slug: 'ayushman-new-member',
    title: 'Ayushman Card — New Member Addition Assistance',
    hindiTitle: 'आयुष्मान कार्ड — नया सदस्य जोड़ने हेतु सहायता',
    shortName: 'Ayushman New Member',
    badge: 'Phase 2 Service',
    badgeColor: 'saffron',
    iconName: 'UserPlus',
    description: 'Assistance with eligible requests to add a family member or beneficiary to an Ayushman scheme record, where the official system permits it.',
    status: 'phase2',
    formUrl: null,
    spreadsheetUrl: null,
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20Card%20New%20Member%20Addition',
    features: [
      'Eligibility verification based on NFSA / Ration Card data',
      'Assistance in submitting documentation through authorized channels',
      'Guidance for relationship verification documents',
      'No guarantee of approval; subject to official scrutiny'
    ],
    workflow: [
      'Customer submits the required family/member details and supporting documents.',
      'The backend team reviews and processes eligible cases through the authorized Ayushman system.',
      'Additional documents or verification may be required.',
      'Any addition is subject to official eligibility checks and approval.'
    ],
    requirements: [
      'Existing Family Ration Card / PM-JAY Family ID',
      'Aadhaar card of the family member to be added',
      'Proof of relationship (Birth Certificate, Marriage Certificate, etc.)'
    ],
    disclaimer: 'Addition is subject strictly to government eligibility norms and official approval by competent authorities. Apna Digital Service does not guarantee addition or approval.'
  },
  {
    id: 'ayushman-correction',
    slug: 'ayushman-correction',
    title: 'Ayushman Card — Correction Assistance',
    hindiTitle: 'आयुष्मान कार्ड — सुधार / संशोधन सहायता',
    shortName: 'Ayushman Card Correction',
    badge: 'Phase 2 Service',
    badgeColor: 'blue',
    iconName: 'FileEdit',
    description: 'Assistance with eligible corrections to an existing Ayushman Card or associated beneficiary details, where permitted by the official system.',
    status: 'phase2',
    formUrl: null,
    spreadsheetUrl: null,
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20Card%20Correction',
    features: [
      'Spelling correction in beneficiary name',
      'Date of Birth / Age discrepancy resolution guidance',
      'Gender and relationship corrections',
      'Backend coordination through official portal'
    ],
    workflow: [
      'Customer submits the existing card/member details and supporting documents.',
      'Customer specifies the correction required.',
      'The backend team reviews and processes the eligible request through the authorized system.',
      'Additional documents or verification may be required.',
      'Completion depends on official verification and approval.'
    ],
    requirements: [
      'Existing Ayushman Card / PM-JAY Beneficiary ID',
      'Valid Aadhaar Card reflecting corrected details',
      'Proof supporting the correction requested'
    ],
    disclaimer: 'Correction requests depend on verification against authorized databases and approval by relevant state/national health authorities.'
  },
  {
    id: 'ayushman-ekyc',
    slug: 'ayushman-ekyc',
    title: 'Ayushman Card — e-KYC Assistance',
    hindiTitle: 'आयुष्मान कार्ड — ई-केवाईसी (e-KYC) सहायता',
    shortName: 'Ayushman e-KYC',
    badge: 'Phase 2 Service',
    badgeColor: 'purple',
    iconName: 'Fingerprint',
    description: 'Assistance to eligible beneficiaries who need to complete Ayushman Card e-KYC through the applicable authorized system.',
    status: 'phase2',
    formUrl: null,
    spreadsheetUrl: null,
    supportPhone: '8018246567',
    supportWhatsapp: 'https://wa.me/918018246567?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20Ayushman%20e-KYC',
    features: [
      'e-KYC status verification check',
      'Guidance for OTP or Biometric authentication',
      'Photo update and card re-generation support',
      'Complete confidentiality maintained'
    ],
    workflow: [
      'Customer submits the required Ayushman Card or beneficiary details.',
      'The backend team reviews the request and assists with e-KYC through the authorized system.',
      'OTP, biometric authentication, or other verification may be required according to the official process.',
      'Completion is subject to beneficiary eligibility, successful verification, and official system availability.'
    ],
    requirements: [
      'PM-JAY ID or Ration Card Number',
      'Aadhaar Number linked with active mobile number for authentication',
      'Beneficiary physical presence if biometric is required at authorized center'
    ],
    disclaimer: 'We do not collect or store OTPs or biometric data on our servers. Verification happens exclusively through the designated authorized government system.'
  }
];

export const ACTIVE_SERVICES = DEFAULT_SERVICES;

/**
 * Retrieve ALL services (including active, phase2, and inactive)
 * Reads from localStorage 'apna_master_services', initializing with DEFAULT_SERVICES if not present.
 */
export function getAllServices() {
  try {
    const stored = localStorage.getItem('apna_master_services');
    if (stored) {
      const list = JSON.parse(stored);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.error('Error reading apna_master_services:', err);
  }

  // Initialize with DEFAULT_SERVICES
  try {
    localStorage.setItem('apna_master_services', JSON.stringify(DEFAULT_SERVICES));
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SERVICES;
}

/**
 * Retrieve only active or live services for the customer-facing catalog
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
    const phone = serviceData.supportPhone || '9124494239';
    const title = serviceData.title || 'Untitled Service';

    const normalizedService = {
      ...serviceData,
      id: serviceData.id || 'srv-' + Date.now(),
      slug: serviceData.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: title,
      hindiTitle: serviceData.hindiTitle || title,
      shortName: serviceData.shortName || title.slice(0, 22),
      badge: serviceData.badge || 'Live Service',
      badgeColor: serviceData.badgeColor || 'saffron',
      iconName: serviceData.iconName || 'FileText',
      description: serviceData.description || 'Assistance for online application and verification.',
      status: serviceData.status || 'active',
      formUrl: serviceData.formUrl || null,
      spreadsheetUrl: serviceData.spreadsheetUrl || null,
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
          badge: normalizedService.badge,
          badge_color: normalizedService.badgeColor,
          icon_name: normalizedService.iconName,
          description: normalizedService.description,
          status: normalizedService.status,
          form_url: normalizedService.formUrl,
          spreadsheet_url: normalizedService.spreadsheetUrl,
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
