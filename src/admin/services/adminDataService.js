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

/**
 * -----------------------------------------------------------------------------
 * Website Contact Inquiries Service
 * -----------------------------------------------------------------------------
 */
export async function fetchContactInquiries() {
  if (databaseUnavailable()) return [];
  const { data, error } = await supabase
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Could not load inquiries: ${error.message}`);
  return (data || []).map(item => ({
    id: item.id,
    name: item.name || '',
    phone: item.phone || '',
    topic: item.topic || 'General Inquiry',
    message: item.message || '',
    status: item.status || 'New',
    createdAt: item.created_at
  }));
}

export async function updateInquiryStatus(inquiryId, status, role) {
  if (role !== 'admin' && role !== 'super_admin') {
    return { success: false, error: 'Permission denied. Staff access required.' };
  }
  if (databaseUnavailable()) return { success: false, error: 'Database is not configured.' };
  try {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .update({ status })
      .eq('id', inquiryId)
      .select('id, status')
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Inquiry not found.' };
    return { success: true, inquiry: data };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to update inquiry status.' };
  }
}

export async function deleteInquiry(inquiryId, role) {
  const denied = requireSuperAdmin(role);
  if (denied) return { success: false, error: denied };
  if (databaseUnavailable()) return { success: false, error: 'Database is not configured.' };
  try {
    const { error } = await supabase
      .from('contact_inquiries')
      .delete()
      .eq('id', inquiryId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to delete inquiry.' };
  }
}

/**
 * -----------------------------------------------------------------------------
 * Super Admin: Create New Admin Credentials & Manage Staff
 * -----------------------------------------------------------------------------
 */
export async function createAdminCredentials({ email, password, fullName, phone, legacyInvitationId, role }) {
  const denied = requireSuperAdmin(role);
  if (denied) return { success: false, error: denied };
  if (databaseUnavailable()) return { success: false, error: 'Database is not configured.' };

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-admin', {
      body: { email: normalizedEmail, password, fullName, phone, legacyInvitationId }
    });

    if (error) {
      const response = await error.context?.json?.().catch(() => null);
      return { success: false, error: response?.error || error.message };
    }

    if (!data?.id) return { success: false, error: 'Supabase did not confirm admin creation.' };
    return {
      success: true,
      message: `Admin access is active for ${normalizedEmail}. They can sign in with their email and the password you set.`
    };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to create admin credentials.' };
  }
}

export async function fetchAdminTeam(role) {
  const denied = requireSuperAdmin(role);
  if (denied) return { success: false, error: denied };
  if (databaseUnavailable()) return { success: false, error: 'Database is not configured.' };

  try {
    const [profilesRes, invitesRes] = await Promise.all([
      supabase.from('profiles').select('*').in('role', ['admin', 'super_admin']).order('role', { ascending: false }),
      supabase.from('admin_invitations').select('*').eq('status', 'pending').order('created_at', { ascending: false })
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (invitesRes.error) throw invitesRes.error;
    const activeStaff = profilesRes.data || [];
    const staffEmails = new Set(activeStaff.map(staff => staff.email?.trim().toLowerCase()));
    return {
      success: true,
      activeStaff,
      invitations: (invitesRes.data || []).filter(invitation => !staffEmails.has(invitation.email?.trim().toLowerCase()))
    };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to load admin team.' };
  }
}

export async function revokeAdminInvitation(invitationId, role) {
  const denied = requireSuperAdmin(role);
  if (denied) return { success: false, error: denied };
  if (databaseUnavailable()) return { success: false, error: 'Database is not configured.' };

  try {
    const { error } = await supabase
      .from('admin_invitations')
      .delete()
      .eq('id', invitationId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to revoke invitation.' };
  }
}
export async function deleteAdminAccess(staffId, role) {
  const denied = requireSuperAdmin(role);
  if (denied) return { success: false, error: denied };
  if (databaseUnavailable()) return { success: false, error: 'Database is not configured.' };
  if (!staffId) return { success: false, error: 'Select an admin to delete.' };
  try {
    const { data, error } = await supabase.rpc('remove_admin_access', { target_id: staffId });
    if (error) return { success: false, error: error.message };
    if (data !== staffId) return { success: false, error: 'The database did not confirm deletion. Refresh the team list.' };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || 'Could not delete admin access.' };
  }
}
