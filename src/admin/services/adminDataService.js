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

    const dbData = data || [];
    const dbAppIds = new Set(dbData.map(item => item.application_id));

    // Auto-sync any local applications that haven't reached Supabase yet
    if (localApps && localApps.length > 0) {
      for (const localApp of localApps) {
        if (localApp.appId && !dbAppIds.has(localApp.appId)) {
          try {
            const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
            const safeUserId = isValidUUID(localApp.userId) ? localApp.userId : null;

            const syncPayload = {
              application_id: localApp.appId,
              user_id: safeUserId,
              service_id: localApp.serviceId || 'voter-id',
              service_slug: localApp.serviceSlug || 'voter-id',
              service_name: localApp.serviceName || 'Digital Service',
              customer_name: localApp.fullName || 'Valued Customer',
              customer_email: localApp.email || 'customer@apnadigital.in',
              customer_phone: localApp.phone || '9876543210',
              request_notes: localApp.notes || null,
              status: localApp.status || 'Request Received',
              operator_note: localApp.operatorNote || 'Application registered. Awaiting verification.',
              service_charge: localApp.serviceCharge || null,
              payment_status: (localApp.paymentStatus || 'pending').toLowerCase(),
              payment_note: localApp.paymentNote || null,
              payment_verified_at: localApp.paymentVerifiedAt || null,
              payment_screenshot_url: localApp.paymentScreenshotUrl || null,
              payment_screenshot_name: localApp.paymentScreenshotName || null,
              user_document_url: localApp.userDocumentUrl || null,
              user_document_name: localApp.userDocumentName || null,
              user_documents: localApp.userDocuments || [],
              form_data: localApp.formData || {}
            };

            const { error: syncErr } = await supabase
              .from('service_requests')
              .upsert([syncPayload], { onConflict: 'application_id' });

            if (!syncErr) {
              console.log('Auto-synced local application to Supabase:', localApp.appId);
              dbAppIds.add(localApp.appId);
              dbData.unshift(syncPayload);
            } else {
              console.warn('Sync to Supabase notice:', syncErr.message);
            }
          } catch (syncEx) {
            console.warn('Sync exception:', syncEx.message);
          }
        }
      }
    }

    if (dbData && dbData.length > 0) {
      const dbApps = dbData.map(item => ({
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
        serviceCharge: item.service_charge,
        paymentStatus: item.payment_status || 'pending',
        paymentNote: item.payment_note || '',
        paymentVerifiedAt: item.payment_verified_at,
        paymentScreenshotUrl: item.payment_screenshot_url,
        paymentScreenshotName: item.payment_screenshot_name,
        userDocumentUrl: item.user_document_url,
        userDocumentName: item.user_document_name,
        userDocuments: item.user_documents || [],
        formData: item.form_data || {},
        documentUrl: item.document_url,
        documentName: item.document_name,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      // Merge: prefer whichever record has the newer updatedAt (local writes win if fresher)
      const mergedMap = new Map();
      localApps.forEach(a => mergedMap.set(a.appId, a));
      dbApps.forEach(a => {
        const existing = mergedMap.get(a.appId);
        if (!existing) {
          mergedMap.set(a.appId, a);
        } else {
          // Keep the record with the newer updatedAt timestamp; local wins on tie
          const localTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
          const dbTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          if (dbTime > localTime) {
            mergedMap.set(a.appId, a);
          }
          // else keep local (it's fresher or same age)
        }
      });
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

  const now = new Date().toISOString();

  // Update in localStorage
  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const idx = local.findIndex(a => a.appId === appId);
    if (idx !== -1) {
      local[idx].status = newStatus;
      local[idx].updatedAt = now;

      // If operatorNote is default, auto-update with an informative description for the customer
      const currentNote = local[idx].operatorNote || '';
      const isDefault = !currentNote || currentNote.includes('Awaiting operator verification');
      if (isDefault) {
        if (newStatus === 'Processing') {
          local[idx].operatorNote = 'Application verified and currently being processed with authorized department records.';
        } else if (newStatus === 'Under Review' || newStatus === 'Under Verification') {
          local[idx].operatorNote = 'Your application documents and details are currently under active review by our verification desk.';
        } else if (newStatus === 'Completed') {
          local[idx].operatorNote = 'Application verified and completed successfully by the authorized department.';
        } else if (newStatus === 'Additional Information Required') {
          local[idx].operatorNote = 'Additional document or details required. Please connect with our support desk via WhatsApp.';
        } else if (newStatus === 'Unable to Process') {
          local[idx].operatorNote = 'Unable to process application with provided details. Please contact helpdesk.';
        }
      }

      localStorage.setItem('apna_applications', JSON.stringify(local));

      // Broadcast update event so open customer dashboards immediately update in real time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('apna_applications_updated'));
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Update in Supabase — capture and return any DB error for the admin to see
  let dbWarning = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const updateData = { 
        status: newStatus,
        updated_at: now
      };
      
      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('application_id', appId);

      if (error) {
        dbWarning = `⚠️ Supabase DB not updated: ${error.message}`;
        console.warn('Supabase status update failed:', error.message);
      }
    } catch (err) {
      dbWarning = `⚠️ Supabase DB not updated: ${err.message || 'Network error'}`;
      console.warn('Supabase status update error:', err);
    }
  } else if (!isSupabaseConfigured || !supabase) {
    dbWarning = '⚠️ Supabase not configured — only saved locally.';
  }

  return { success: true, dbWarning };
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

  const now = new Date().toISOString();

  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const idx = local.findIndex(a => a.appId === appId);
    if (idx !== -1) {
      local[idx].operatorNote = operatorNote;
      local[idx].updatedAt = now;
      localStorage.setItem('apna_applications', JSON.stringify(local));

      // Broadcast update event so open customer dashboards immediately update in real time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('apna_applications_updated'));
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Update in Supabase — capture and return any DB error for the admin to see
  let dbWarning = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          operator_note: operatorNote,
          updated_at: now
        })
        .eq('application_id', appId);

      if (error) {
        dbWarning = `⚠️ Supabase DB not updated: ${error.message}`;
        console.warn('Supabase note update failed:', error.message);
      }
    } catch (err) {
      dbWarning = `⚠️ Supabase DB not updated: ${err.message || 'Network error'}`;
      console.warn(err);
    }
  } else if (!isSupabaseConfigured || !supabase) {
    dbWarning = '⚠️ Supabase not configured — only saved locally.';
  }

  return { success: true, dbWarning };
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

  const now = new Date().toISOString();

  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const idx = local.findIndex(a => a.appId === appId);
    if (idx !== -1) {
      local[idx].documentUrl = documentUrl;
      local[idx].documentName = documentName;
      local[idx].status = 'Completed';
      local[idx].operatorNote = 'Document verified and issued. Ready for instant download.';
      local[idx].updatedAt = now;
      localStorage.setItem('apna_applications', JSON.stringify(local));

      // Broadcast update event so open customer dashboards immediately update in real time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('apna_applications_updated'));
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Update in Supabase — capture and return any DB error for the admin to see
  let dbWarning = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          document_url: documentUrl,
          document_name: documentName,
          status: 'Completed',
          operator_note: 'Document verified and issued. Ready for instant download.',
          updated_at: now
        })
        .eq('application_id', appId);

      if (error) {
        dbWarning = `⚠️ Supabase DB not updated: ${error.message}`;
        console.warn('Supabase document attach failed:', error.message);
      }
    } catch (err) {
      dbWarning = `⚠️ Supabase DB not updated: ${err.message || 'Network error'}`;
      console.warn(err);
    }
  } else if (!isSupabaseConfigured || !supabase) {
    dbWarning = '⚠️ Supabase not configured — only saved locally.';
  }

  return { success: true, dbWarning };
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

    // Broadcast update event so open customer dashboards immediately update in real time
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('apna_applications_updated'));
    }
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

/**
 * Update payment verification status (Super Admin Only)
 * @param {string} appId
 * @param {'received' | 'failed' | 'pending'} paymentStatus
 * @param {string} paymentNote
 * @param {string} currentRole
 */
export async function updatePaymentStatus(appId, paymentStatus, paymentNote = '', currentRole) {
  if (currentRole !== 'super_admin') {
    return {
      success: false,
      error: 'Permission Denied: Your account role is "Admin" (View Only). Only Super Admin can update payment verification status.'
    };
  }

  const normalizedStatus = (paymentStatus || 'pending').toLowerCase();
  const now = new Date().toISOString();

  // Update in localStorage
  try {
    const local = JSON.parse(localStorage.getItem('apna_applications') || '[]');
    const idx = local.findIndex(a => a.appId === appId);
    if (idx !== -1) {
      local[idx].paymentStatus = normalizedStatus;
      local[idx].paymentNote = paymentNote;
      local[idx].paymentVerifiedAt = now;
      local[idx].updatedAt = now;

      // Automatically sync overall status & live note for customer
      if (normalizedStatus === 'received') {
        if (!local[idx].status || local[idx].status === 'Request Received' || local[idx].status === 'Awaiting Form Verification') {
          local[idx].status = 'Processing';
        }
        if (!local[idx].operatorNote || local[idx].operatorNote.includes('Awaiting operator verification')) {
          local[idx].operatorNote = 'Payment verified & received. Application is actively being processed with the department.';
        }
      } else if (normalizedStatus === 'failed') {
        local[idx].status = 'Unable to Process';
        local[idx].operatorNote = paymentNote ? `Payment Failed: ${paymentNote}` : 'Payment verification failed. Please contact support via WhatsApp or re-upload payment proof.';
      }

      localStorage.setItem('apna_applications', JSON.stringify(local));

      // Broadcast update event so open customer dashboards immediately update in real time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('apna_applications_updated'));
      }
    }
  } catch (e) {
    console.error('Error updating localStorage payment status:', e);
  }

  // Update in Supabase — capture and return any DB error for the admin to see
  let dbWarning = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const updatePayload = {
        payment_status: normalizedStatus,
        payment_note: paymentNote,
        payment_verified_at: now,
        updated_at: now
      };

      if (normalizedStatus === 'received') {
        updatePayload.status = 'Processing';
      } else if (normalizedStatus === 'failed') {
        updatePayload.status = 'Unable to Process';
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updatePayload)
        .eq('application_id', appId);

      if (error) {
        dbWarning = `⚠️ Supabase DB not updated: ${error.message}`;
        console.warn('Supabase payment status update warning:', error.message);
      }
    } catch (err) {
      dbWarning = `⚠️ Supabase DB not updated: ${err.message || 'Network error'}`;
      console.warn('Supabase payment update exception:', err);
    }
  } else if (!isSupabaseConfigured || !supabase) {
    dbWarning = '⚠️ Supabase not configured — only saved locally.';
  }

  return { success: true, paymentStatus: normalizedStatus, paymentNote, dbWarning };
}
