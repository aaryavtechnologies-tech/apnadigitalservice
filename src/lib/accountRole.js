export const isStaffRole = role => role === 'admin' || role === 'super_admin';

// Roles come only from the database profile of the authenticated user.
// Email strings, editable user metadata, and local storage never grant access.
export async function resolveAccountRole(client, userId) {
  if (!client || !userId) return 'customer';
  try {
    const { data, error } = await client.from('profiles').select('role').eq('id', userId).single();
    return !error && isStaffRole(data?.role) ? data.role : 'customer';
  } catch { return 'customer'; }
}
