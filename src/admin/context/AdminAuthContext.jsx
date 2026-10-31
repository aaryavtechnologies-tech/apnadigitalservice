import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { isStaffRole, resolveAccountRole } from '../../lib/accountRole';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);

  useEffect(() => {
    let active = true;
    const timers = new Set();
    const refresh = async () => {
      const ticket = ++generation.current;
      setLoading(true);
      try {
        const { data, error } = supabase ? await supabase.auth.getUser() : { data: null };
        const user = !error ? data?.user : null;
        const nextRole = user ? await resolveAccountRole(supabase, user.id) : null;
        if (!active || ticket !== generation.current) return;
        setRole(nextRole);
        setAdminUser(isStaffRole(nextRole) ? { ...user, fullName: user.user_metadata?.full_name || user.email, role: nextRole } : null);
      } catch {
        if (active && ticket === generation.current) { setRole(null); setAdminUser(null); }
      } finally { if (active && ticket === generation.current) setLoading(false); }
    };
    void refresh();
    const subscription = supabase?.auth.onAuthStateChange(() => {
      // Run Supabase calls outside the auth event's internal lock.
      generation.current++;
      setLoading(true); setRole(null); setAdminUser(null);
      const timer = setTimeout(() => { timers.delete(timer); void refresh(); }, 0);
      timers.add(timer);
    }).data.subscription;
    return () => { active = false; generation.current++; subscription?.unsubscribe(); timers.forEach(clearTimeout); };
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
    setAdminUser(null); setRole(null);
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
