import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { adminSupabase as supabase } from '../../lib/supabaseClient';
import { isStaffRole, resolveAccountRole } from '../../lib/accountRole';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const expiresAt = useRef(0);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkExpiry = () => {
      if (expiresAt.current && Date.now() >= expiresAt.current) void adminSignOut();
    };
    const expiryTimer = setInterval(checkExpiry, 30000);
    window.addEventListener('focus', checkExpiry);
    // Only an explicit password submission can populate staff state. Focus and
    // token refresh events must not reinitialize or unmount the workspace.
    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAdminUser(null);
        setRole(null);
      }
      setLoading(false);
    }).data.subscription;
    return () => {
      clearInterval(expiryTimer);
      window.removeEventListener('focus', checkExpiry);
      subscription.unsubscribe();
    };
  }, []);

  async function adminSignIn(email, password) {
    if (!supabase) return { success: false, error: 'Sign in is temporarily unavailable. Please contact support.' };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const { error: activationError } = await supabase.rpc('activate_staff_session');
      if (activationError) { await supabase.auth.signOut({ scope: 'local' }); throw activationError; }
      const userRole = await resolveAccountRole(supabase, data?.user?.id);
      if (!isStaffRole(userRole)) {
        await supabase.auth.signOut({ scope: 'local' });
        return { success: false, error: 'Access denied. This account does not have staff access.' };
      }
      expiresAt.current = Date.now() + 8 * 60 * 60 * 1000;
      setRole(userRole);
      setAdminUser({ ...data.user, role: userRole, fullName: data.user.user_metadata?.full_name || data.user.email });
      setLoading(false);
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async function adminSignOut() {
    expiresAt.current = 0;
    setAdminUser(null); setRole(null);
    setLoading(false);
    if (supabase) {
      try {
        const { error } = await supabase.rpc('end_staff_session');
        if (error) console.error('[admin-auth] Server logout failed:', error.message);
      } finally {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) console.error('[admin-auth] Token logout failed:', error.message);
      }
    }
  }

  return <AdminAuthContext.Provider value={{ adminUser, role, loading,
    isAdmin: isStaffRole(role), isSuperAdmin: role === 'super_admin', isViewOnly: role === 'admin',
    adminSignIn, adminSignOut
  }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('AdminAuthProvider is required.');
  return context;
}
