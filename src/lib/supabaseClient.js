import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Trigger Google OAuth Sign-in with Supabase
 */
export async function signInWithGoogle() {
  if (!supabase) {
    return {
      error: {
        message: 'Supabase credentials missing in .env.'
      }
    };
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
}

/**
 * Register new user with Email, Password, Full Name and WhatsApp Phone
 */
export async function signUpWithEmail(email, password, fullName, phone) {
  if (!supabase) {
    return { error: { message: 'Supabase is not configured' } };
  }

  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone
      }
    }
  });
}

/**
 * Sign in existing user with Email and Password
 */
export async function signInWithEmail(email, password) {
  if (!supabase) {
    return { error: { message: 'Supabase is not configured' } };
  }

  return await supabase.auth.signInWithPassword({
    email,
    password
  });
}

/**
 * Save new service request to Supabase service_requests table.
 * ⚡ STRICT MODE: If Supabase is configured and the insert fails,
 * this function throws an Error so the UI can show a real error to the user.
 * localStorage is only used as a secondary sync AFTER a successful DB write.
 */
export async function saveServiceRequest(requestData) {
  const isValidUUID = (str) =>
    typeof str === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  // ── Supabase is the source of truth ──
  if (supabase) {
    const safeUserId = isValidUUID(requestData.userId) ? requestData.userId : null;

    const payload = {
      application_id:          requestData.appId,
      user_id:                 safeUserId,
      service_id:              requestData.serviceId,
      service_slug:            requestData.serviceSlug || requestData.serviceId,
      service_name:            requestData.serviceName,
      customer_name:           (requestData.fullName || 'Valued Customer').trim(),
      customer_email:          (requestData.email || '').trim() || null,
      customer_phone:          (requestData.phone || '').trim() || null,
      request_notes:           requestData.notes || null,
      status:                  requestData.status || 'Request Received',
      operator_note:           requestData.operatorNote || 'Application registered. Awaiting payment and document verification.',
      service_charge:          requestData.serviceCharge || null,
      payment_status:          (requestData.paymentStatus || 'pending').toLowerCase(),
      payment_note:            requestData.paymentNote || null,
      payment_verified_at:     requestData.paymentVerifiedAt || null,
      payment_screenshot_url:  requestData.paymentScreenshotUrl || null,
      payment_screenshot_name: requestData.paymentScreenshotName || null,
      user_document_url:       requestData.userDocumentUrl || null,
      user_document_name:      requestData.userDocumentName || null,
      user_documents:          requestData.userDocuments || [],
      form_data:               requestData.formData || {}
    };

    const { error } = await supabase
      .from('service_requests')
      .upsert([payload], { onConflict: 'application_id' });

    if (error) {
      // ❌ Real error — throw so the UI shows it to the user. No silent fallback.
      console.error('[saveServiceRequest] Supabase error:', error);
      throw new Error(
        `Failed to save your application to the database: ${error.message}\n\nPlease try again or contact support.`
      );
    }

    console.log('[saveServiceRequest] Saved to Supabase:', requestData.appId);

    // Secondary: also cache in localStorage so the user can see it immediately
    try {
      const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
      const existingIdx = local.findIndex(a => a.appId === requestData.appId);
      if (existingIdx !== -1) {
        local[existingIdx] = { ...local[existingIdx], ...requestData };
      } else {
        local.unshift(requestData);
      }
      localStorage.setItem('apna_applications', JSON.stringify(local));
    } catch (cacheErr) {
      // localStorage failure is non-critical — Supabase already has the data
      console.warn('[saveServiceRequest] localStorage cache failed (non-critical):', cacheErr);
    }

    return true;
  }

  // ── Supabase not configured: dev-mode only localStorage fallback ──
  console.warn('[saveServiceRequest] Supabase not configured. Saving to localStorage ONLY (dev mode).');
  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const existingIdx = local.findIndex(a => a.appId === requestData.appId);
    if (existingIdx !== -1) {
      local[existingIdx] = { ...local[existingIdx], ...requestData };
    } else {
      local.unshift(requestData);
    }
    localStorage.setItem('apna_applications', JSON.stringify(local));
  } catch (err) {
    throw new Error('Failed to save your application. Please check your internet connection and try again.');
  }

  return true;
}

/**
 * Fetch applications for a customer — STRICTLY from Supabase.
 * ⚡ NO localStorage fallback: only data confirmed in the database is shown.
 * Stale cached data is cleared so ghost entries don't appear.
 */
export async function fetchCustomerApplications(user) {
  // Always wipe stale localStorage so ghost entries never show
  try {
    localStorage.removeItem('apna_applications');
  } catch (_) {}

  if (!user) return [];

  // Supabase not configured (dev mode only)
  if (!supabase) {
    console.warn('[fetchCustomerApplications] Supabase not configured — returning empty list.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchCustomerApplications] Supabase error:', error);
      throw new Error(`Could not load your applications: ${error.message}`);
    }

    if (!data || data.length === 0) return [];

    return data.map(item => ({
      appId:                item.application_id,
      serviceId:            item.service_id,
      serviceSlug:          item.service_slug,
      serviceName:          item.service_name,
      fullName:             item.customer_name,
      email:                item.customer_email,
      phone:                item.customer_phone,
      notes:                item.request_notes,
      createdAt:            item.created_at,
      status:               item.status || 'Request Received',
      operatorNote:         item.operator_note || '',
      paymentStatus:        item.payment_status || 'pending',
      paymentNote:          item.payment_note || '',
      paymentVerifiedAt:    item.payment_verified_at || null,
      serviceCharge:        item.service_charge,
      paymentScreenshotUrl: item.payment_screenshot_url,
      paymentScreenshotName:item.payment_screenshot_name,
      userDocumentUrl:      item.user_document_url,
      userDocumentName:     item.user_document_name,
      userDocuments:        item.user_documents || [],
      formData:             item.form_data || {},
      documentName:         item.document_name,
      documentUrl:          item.document_url,
      supportPhone:         '8018246567'
    }));
  } catch (err) {
    console.error('[fetchCustomerApplications]', err);
    throw err;
  }
}

