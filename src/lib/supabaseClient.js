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
 * Save new service request to Supabase service_requests table
 */
export async function saveServiceRequest(requestData) {
  // Always save in localStorage for instant offline access
  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    local.unshift(requestData);
    localStorage.setItem('apna_applications', JSON.stringify(local));
  } catch (err) {
    console.error('LocalStorage write failed', err);
  }

  // If Supabase is connected, also insert into service_requests table
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          application_id: requestData.appId,
          user_id: requestData.userId && requestData.userId !== 'guest' ? requestData.userId : null,
          service_id: requestData.serviceId,
          service_slug: requestData.serviceSlug,
          service_name: requestData.serviceName,
          customer_name: requestData.fullName,
          customer_email: requestData.email,
          customer_phone: requestData.phone,
          request_notes: requestData.notes,
          status: requestData.status || 'Request Received',
          operator_note: requestData.operatorNote
        }]);

      if (error) {
        console.warn('Could not insert to Supabase service_requests table (will use local):', error.message);
      }
    } catch (err) {
      console.warn('Supabase service_requests insert exception:', err);
    }
  }

  return true;
}

/**
 * Fetch applications for a customer from Supabase or localStorage
 */
export async function fetchCustomerApplications(user) {
  let localApps = [];
  try {
    const stored = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    if (user?.email) {
      localApps = stored.filter(app => !app.email || app.email.toLowerCase() === user.email.toLowerCase());
    } else {
      localApps = stored;
    }
  } catch (e) {
    console.error(e);
  }

  if (!supabase || !user) {
    return localApps;
  }

  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Map Supabase rows to app format
      const dbApps = data.map(item => ({
        appId: item.application_id,
        serviceSlug: item.service_slug,
        serviceName: item.service_name,
        fullName: item.customer_name,
        email: item.customer_email,
        phone: item.customer_phone,
        createdAt: item.created_at,
        status: item.status,
        operatorNote: item.operator_note,
        documentName: item.document_name,
        documentUrl: item.document_url,
        supportPhone: '9124494239'
      }));

      // Merge avoiding duplicates by appId
      const mergedMap = new Map();
      localApps.forEach(a => mergedMap.set(a.appId, a));
      dbApps.forEach(a => mergedMap.set(a.appId, a));
      return Array.from(mergedMap.values());
    }
  } catch (err) {
    console.warn('Could not fetch from Supabase service_requests, using local:', err);
  }

  return localApps;
}
