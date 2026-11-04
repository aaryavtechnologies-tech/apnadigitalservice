import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { isStaffRole, resolveAccountRole } from '../../lib/accountRole';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const verifiedUserId = useRef(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let timer;
    const refresh = async (session, ticket) => {
      try {
        const { data, error } = await supabase.auth.getUser(session.access_token);
        const user = !error && data?.user?.id === session.user.id ? data.user : null;
        const nextRole = user ? await resolveAccountRole(supabase, user.id) : null;
        if (ticket !== generation.current) return;
        verifiedUserId.current = isStaffRole(nextRole) ? user.id : null;
        setRole(nextRole);
        setAdminUser(verifiedUserId.current ? { ...user, fullName: user.user_metadata?.full_name || user.email, role: nextRole } : null);
      } catch {
        if (ticket === generation.current) {
          verifiedUserId.current = null;
          setRole(null);
          setAdminUser(null);
        }
      } finally {
        if (ticket === generation.current) setLoading(false);
      }
    };

    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      const ticket = ++generation.current;
      clearTimeout(timer);
      const userId = session?.user?.id;
      if (!userId || userId !== verifiedUserId.current) {
        verifiedUserId.current = null;
        setRole(null);
        setAdminUser(null);
        setLoading(Boolean(userId));
      }
      // Recheck the same account in the background so token refresh keeps the workspace mounted.
      if (userId) timer = setTimeout(() => void refresh(session, ticket), 0);
    }).data.subscription;
    return () => {
      generation.current++;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function adminSignIn(email, password) {
    if (!supabase) return { success: false, error: 'Sign in is temporarily unavailable. Please contact support.' };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const userRole = await resolveAccountRole(supabase, data?.user?.id);
      if (!isStaffRole(userRole)) {
        await supabase.auth.signOut({ scope: 'local' });
        return { success: false, error: 'Access denied. This account does not have staff access.' };
      }
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async function adminSignOut() {
    generation.current++;
    verifiedUserId.current = null;
    setAdminUser(null); setRole(null);
    setLoading(false);
    if (supabase) await supabase.auth.signOut({ scope: 'local' });
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
