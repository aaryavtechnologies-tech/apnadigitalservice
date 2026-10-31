/** Database-backed admin operations. Supabase is the sole source of truth. */
import { supabase, isSupabaseConfigured, createIsolatedAuthClient } from '../../lib/supabaseClient';

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
export async function createAdminCredentials({ email, password, fullName, phone, creatorId, role }) {
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
    // 1. Check if email already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      return { 
        success: false, 
        error: `An account with email "${normalizedEmail}" already exists with role: ${existingProfile.role}.` 
      };
    }

    // 2. Insert into admin_invitations with status 'pending'
    const { data: invitation, error: inviteError } = await supabase
      .from('admin_invitations')
      .upsert({
        email: normalizedEmail,
        full_name: (fullName || '').trim(),
        phone: (phone || '').trim(),
        created_by: creatorId || null,
        status: 'pending',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' })
      .select()
      .single();

    if (inviteError) {
      return { success: false, error: `Failed to record admin authorization: ${inviteError.message}` };
    }

    // 3. Register auth credentials using an isolated auth client
    // so Super Admin's active session is never disrupted.
    const authClient = createIsolatedAuthClient('apna-admin-signup');
    if (!authClient) {
      return { success: false, error: 'Supabase Auth client could not be initialized.' };
    }

    const { data: authData, error: authError } = await authClient.auth.signUp({
      email: normalizedEmail,
      password: password,
      options: {
        data: {
          full_name: (fullName || '').trim(),
          phone: (phone || '').trim(),
          invited_role: 'admin'
        }
      }
    });

    if (authError) {
      // Clean up the invitation if the auth creation failed
      await supabase.from('admin_invitations').delete().eq('email', normalizedEmail).catch(() => {});
      return { success: false, error: authError.message };
    }

    return { 
      success: true, 
      user: authData.user, 
      invitation,
      message: `Admin credentials created for ${normalizedEmail}. A confirmation email has been sent. The admin role will be activated once the user confirms their email.`
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
      supabase.from('admin_invitations').select('*').order('created_at', { ascending: false })
    ]);

    return {
      success: true,
      activeStaff: profilesRes.data || [],
      invitations: invitesRes.data || []
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
