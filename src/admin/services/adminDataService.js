/**
 * Apna Digital Service — Admin Data Operations Service
 * Strict Role-Based Enforcement:
 * - Super Admin ('super_admin'): Full Write & Delete permissions
 * - Admin ('admin'): STRICTLY READ-ONLY (Mutations are rejected at service level)
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

/**
 * Fetch all service requests for the admin verification queue
 * @returns {Promise<Array>} List of application records
 */
export async function fetchAllAdminApplications() {
  let localApps = [];
  try {
    localApps = JSON.parse(localStorage.getItem('apna_applications') || '[]');
  } catch (err) {
    console.error('Error reading localStorage applications:', err);
  }

  if (!isSupabaseConfigured || !supabase) {
    return localApps;
  }

  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch failed, falling back to local:', error.message);
      return localApps;
    }

    if (data && data.length > 0) {
      const dbApps = data.map(item => ({
        appId: item.application_id,
        serviceId: item.service_id,
        serviceSlug: item.service_slug,
        serviceName: item.service_name,
        fullName: item.customer_name,
        email: item.customer_email,
        phone: item.customer_phone,
        notes: item.request_notes,
        status: item.status,
        operatorNote: item.operator_note,
        documentUrl: item.document_url,
        documentName: item.document_name,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      // Merge with local avoiding duplicates
      const mergedMap = new Map();
      localApps.forEach(a => mergedMap.set(a.appId, a));
      dbApps.forEach(a => mergedMap.set(a.appId, a));
      const combined = Array.from(mergedMap.values());
      
      // Update local cache
      try {
        localStorage.setItem('apna_applications', JSON.stringify(combined));
      } catch (e) {
        console.error(e);
      }
      return combined;
    }
  } catch (err) {
    console.warn('Exception during fetchAllAdminApplications:', err);
  }

  return localApps;
}

/**
 * Update request status (Super Admin Only)
 */
export async function updateRequestStatus(appId, newStatus, currentRole) {
  if (currentRole !== 'super_admin') {
    return {
      success: false,
      error: 'Permission Denied: Your account role is "Admin" (View Only). Only Super Admin can change status.'
    };
  }

  // Update in localStorage
  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const idx = local.findIndex(a => a.appId === appId);
    if (idx !== -1) {
      local[idx].status = newStatus;
      local[idx].updatedAt = new Date().toISOString();
      localStorage.setItem('apna_applications', JSON.stringify(local));
    }
  } catch (e) {
    console.error(e);
  }

  // Update in Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('application_id', appId);

      if (error) {
        console.warn('Supabase status update failed:', error.message);
      }
    } catch (err) {
      console.warn('Supabase status update error:', err);
    }
  }

  return { success: true };
}

/**
 * Update operator remarks / notes (Super Admin Only)
 */
export async function updateOperatorNote(appId, operatorNote, currentRole) {
  if (currentRole !== 'super_admin') {
    return {
      success: false,
      error: 'Permission Denied: Your account role is "Admin" (View Only). Only Super Admin can update operator notes.'
    };
  }

  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const idx = local.findIndex(a => a.appId === appId);
    if (idx !== -1) {
      local[idx].operatorNote = operatorNote;
      local[idx].updatedAt = new Date().toISOString();
      localStorage.setItem('apna_applications', JSON.stringify(local));
    }
  } catch (e) {
    console.error(e);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('service_requests')
        .update({ 
          operator_note: operatorNote,
          updated_at: new Date().toISOString()
        })
        .eq('application_id', appId);
    } catch (err) {
      console.warn(err);
    }
  }

  return { success: true };
}

/**
 * Attach verified document URL (Super Admin Only)
 */
export async function attachDocumentRecord(appId, documentUrl, documentName, currentRole) {
  if (currentRole !== 'super_admin') {
    return {
      success: false,
      error: 'Permission Denied: Your account role is "Admin" (View Only). Only Super Admin can attach documents.'
    };
  }

  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const idx = local.findIndex(a => a.appId === appId);
    if (idx !== -1) {
      local[idx].documentUrl = documentUrl;
      local[idx].documentName = documentName;
      local[idx].status = 'Completed';
      local[idx].operatorNote = 'Document verified and issued. Ready for instant download.';
      local[idx].updatedAt = new Date().toISOString();
      localStorage.setItem('apna_applications', JSON.stringify(local));
    }
  } catch (e) {
    console.error(e);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('service_requests')
        .update({ 
          document_url: documentUrl,
          document_name: documentName,
          status: 'Completed',
          operator_note: 'Document verified and issued. Ready for instant download.',
          updated_at: new Date().toISOString()
        })
        .eq('application_id', appId);
    } catch (err) {
      console.warn(err);
    }
  }

  return { success: true };
}

/**
 * Delete application record (Super Admin Only)
 */
export async function deleteApplicationRecord(appId, currentRole) {
  if (currentRole !== 'super_admin') {
    return {
      success: false,
      error: 'Permission Denied: Your account role is "Admin" (View Only). Only Super Admin can delete records.'
    };
  }

  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const filtered = local.filter(a => a.appId !== appId);
    localStorage.setItem('apna_applications', JSON.stringify(filtered));
  } catch (e) {
    console.error(e);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('service_requests')
        .delete()
        .eq('application_id', appId);
    } catch (err) {
      console.warn(err);
    }
  }

  return { success: true };
}
