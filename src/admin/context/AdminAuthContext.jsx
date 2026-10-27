import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [role, setRole] = useState(null); // 'super_admin' | 'admin' | 'customer' | null
  const [loading, setLoading] = useState(true);

  // Check saved demo role or stored credentials on mount
  useEffect(() => {
    async function initAuth() {
      // 1. Check if demo test role is explicitly forced in local/sessionStorage
      const demoRole = sessionStorage.getItem('apna_admin_demo_role');
      if (demoRole === 'super_admin' || demoRole === 'admin') {
        const demoEmail = demoRole === 'super_admin' 
          ? 'help.apnadigitalservice@gmail.com' 
          : 'operator@apnadigitalservice.com';
        
        setRole(demoRole);
        setAdminUser({
          id: 'demo-' + demoRole,
          email: demoEmail,
          fullName: demoRole === 'super_admin' ? 'Meher (Super Admin)' : 'Staff Admin (View Only)',
          role: demoRole
        });
        setLoading(false);
        return;
      }

      // 2. If Supabase is configured, check active session & query public.profiles
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await resolveUserRole(session.user);
          } else {
            setAdminUser(null);
            setRole(null);
          }
        } catch (err) {
          console.error('Error checking admin auth session:', err);
        }
      }

      setLoading(false);
    }

    initAuth();

    // Listen to Supabase auth changes
    let subscription = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const demoRole = sessionStorage.getItem('apna_admin_demo_role');
        if (demoRole) return;

        if (session?.user) {
          await resolveUserRole(session.user);
        } else {
          setAdminUser(null);
          setRole(null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  /**
   * Helper to fetch role from public.profiles table
   */
  async function resolveUserRole(authUser) {
    let resolvedRole = 'customer';

    // Auto-detect super admin email rule
    if (authUser.email === 'help.apnadigitalservice@gmail.com') {
      resolvedRole = 'super_admin';
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, full_name, phone')
          .eq('id', authUser.id)
          .single();

        if (!error && data?.role) {
          resolvedRole = data.role;
        }
      } catch (err) {
        console.warn('Could not query role from profiles table:', err);
      }
    }

    setRole(resolvedRole);
    setAdminUser({
      id: authUser.id,
      email: authUser.email,
      fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
      role: resolvedRole
    });
  }

  /**
   * Sign In with Email & Password (Strict Role Gating)
   */
  async function adminSignIn(email, password) {
    sessionStorage.removeItem('apna_admin_demo_role');
    
    if (!isSupabaseConfigured || !supabase) {
      // Local fallback for testing without Supabase
      if (email.toLowerCase().includes('super') || email.toLowerCase() === 'help.apnadigitalservice@gmail.com') {
        return switchDemoRole('super_admin');
      } else {
        return switchDemoRole('admin');
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.user) {
      // Strict role check: customer accounts are forbidden in the admin portal!
      let userRole = 'customer';
      if (data.user.email === 'help.apnadigitalservice@gmail.com') {
        userRole = 'super_admin';
      } else {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        if (prof?.role) userRole = prof.role;
      }

      if (userRole !== 'super_admin' && userRole !== 'admin') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Access Denied: Only authorized Super Admin or Admin staff can access this portal.'
        };
      }

      await resolveUserRole(data.user);
      return { success: true };
    }

    return { success: false, error: 'Sign in failed' };
  }

  /**
   * Request OTP code to be sent to registered Admin email
   */
  async function sendAdminOtp(email) {
    if (!email) return { success: false, error: 'Please enter your registered email address.' };

    if (!isSupabaseConfigured || !supabase) {
      return { success: true, isSimulation: true };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Verify 6-digit OTP code received on email and sign in
   */
  async function verifyAdminOtp(email, token) {
    if (!token) return { success: false, error: 'Please enter the 6-digit OTP.' };

    if (!isSupabaseConfigured || !supabase) {
      if (email.toLowerCase() === 'help.apnadigitalservice@gmail.com') {
        switchDemoRole('super_admin');
      } else {
        switchDemoRole('admin');
      }
      return { success: true };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      // also attempt type: 'recovery' if user requested password reset token
      const retry = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery'
      });
      if (retry.error) {
        return { success: false, error: retry.error.message };
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await resolveUserRole(session.user);
      return { success: true };
    }

    return { success: false, error: 'OTP verification failed' };
  }

  /**
   * Sign Out
   */
  async function adminSignOut() {
    sessionStorage.removeItem('apna_admin_demo_role');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setAdminUser(null);
    setRole(null);
  }

  /**
   * Fast Demo Role Switcher for instant QA testing
   */
  function switchDemoRole(targetRole) {
    if (targetRole === 'super_admin') {
      sessionStorage.setItem('apna_admin_demo_role', 'super_admin');
      setRole('super_admin');
      setAdminUser({
        id: 'demo-super-admin',
        email: 'help.apnadigitalservice@gmail.com',
        fullName: 'Meher (Super Admin)',
        role: 'super_admin'
      });
    } else if (targetRole === 'admin') {
      sessionStorage.setItem('apna_admin_demo_role', 'admin');
      setRole('admin');
      setAdminUser({
        id: 'demo-admin-staff',
        email: 'operator@apnadigitalservice.com',
        fullName: 'Staff Operator (Admin)',
        role: 'admin'
      });
    } else {
      sessionStorage.removeItem('apna_admin_demo_role');
      setRole(null);
      setAdminUser(null);
    }
    return { success: true };
  }

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isViewOnly = role === 'admin';

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        role,
        isSuperAdmin,
        isAdmin,
        isViewOnly,
        loading,
        adminSignIn,
        adminSignOut,
        sendAdminOtp,
        verifyAdminOtp,
        switchDemoRole
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
