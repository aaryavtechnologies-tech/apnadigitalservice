/** Database-backed admin operations. Supabase is the sole source of truth. */
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

function databaseUnavailable() {
  return !isSupabaseConfigured || !supabase;
}

function requireSuperAdmin(role) {
  return role === 'super_admin' ? null : 'Permission denied. Only a Super Admin can change applications.';
}

export async function fetchAllAdminApplications() {
  if (databaseUnavailable()) throw new Error('Supabase is not configured. Applications cannot be loaded.');
  const { data, error } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(`Could not load applications from Supabase: ${error.message}`);
  return (data || []).map(item => ({
    appId: item.application_id, serviceId: item.service_id, serviceSlug: item.service_slug,
    serviceName: item.service_name, fullName: item.customer_name, email: item.customer_email,
    phone: item.customer_phone, notes: item.request_notes, status: item.status,
    operatorNote: item.operator_note, serviceCharge: item.service_charge,
    paymentStatus: item.payment_status || 'pending', paymentNote: item.payment_note || '',
    paymentVerifiedAt: item.payment_verified_at, paymentScreenshotUrl: item.payment_screenshot_url,
    paymentScreenshotName: item.payment_screenshot_name, userDocumentUrl: item.user_document_url,
    userDocumentName: item.user_document_name, userDocuments: item.user_documents || [],
    formData: item.form_data || {}, documentUrl: item.document_url, documentName: item.document_name,
    createdAt: item.created_at, updatedAt: item.updated_at
  }));
}

async function updateRequest(appId, payload, role) {
  const denied = requireSuperAdmin(role);
  if (denied) return { success: false, error: denied };
  if (databaseUnavailable()) return { success: false, error: 'Supabase is not configured; no change was made.' };
  try {
    const { data, error } = await supabase.from('service_requests').update(payload)
      .eq('application_id', appId).select('application_id').maybeSingle();
    if (error) return { success: false, error: `Database update failed: ${error.message}` };
    if (!data) return { success: false, error: 'No matching database record was updated. Refresh and verify the application.' };
    return { success: true };
  } catch (error) {
    return { success: false, error: `Database update failed: ${error.message || 'Network error'}` };
  }
}

export function updateRequestStatus(appId, status, role) {
  return updateRequest(appId, { status }, role);
}

export function updateOperatorNote(appId, operatorNote, role) {
  return updateRequest(appId, { operator_note: operatorNote }, role);
}

export function attachDocumentRecord(appId, documentUrl, documentName, role) {
  return updateRequest(appId, {
    document_url: documentUrl, document_name: documentName,
    ...(documentUrl ? { status: 'Completed', operator_note: 'Document verified and issued. Ready for instant download.' } : {})
  }, role);
}

export async function deleteApplicationRecord(appId, role) {
  const denied = requireSuperAdmin(role);
  if (denied) return { success: false, error: denied };
  if (databaseUnavailable()) return { success: false, error: 'Supabase is not configured; no record was deleted.' };
  try {
    const { data, error } = await supabase.from('service_requests').delete()
      .eq('application_id', appId).select('application_id').maybeSingle();
    if (error) return { success: false, error: `Database delete failed: ${error.message}` };
    if (!data) return { success: false, error: 'No matching database record was deleted. Refresh and verify the application.' };
    return { success: true };
  } catch (error) {
    return { success: false, error: `Database delete failed: ${error.message || 'Network error'}` };
  }
}

export async function updatePaymentStatus(appId, paymentStatus, paymentNote = '', role) {
  const normalizedStatus = (paymentStatus || 'pending').toLowerCase();
  if (!['pending', 'received', 'failed'].includes(normalizedStatus)) {
    return { success: false, error: 'Invalid payment status.' };
  }
  const payload = { payment_status: normalizedStatus, payment_note: paymentNote, payment_verified_at: new Date().toISOString() };
  if (normalizedStatus === 'received') payload.status = 'Processing';
  if (normalizedStatus === 'failed') payload.status = 'Unable to Process';
  const result = await updateRequest(appId, payload, role);
  return result.success ? { ...result, paymentStatus: normalizedStatus, paymentNote } : result;
}
