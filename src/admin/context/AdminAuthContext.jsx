import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export const SUPER_ADMIN_EMAIL = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'help.apnadigitalservice@gmail.com').toLowerCase().trim();

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [role, setRole] = useState(null); // 'super_admin' | 'admin' | 'customer' | null
  const [loading, setLoading] = useState(true);

  // Check Supabase active session on mount
  useEffect(() => {
    async function initAuth() {
      // Clear legacy demo session bypass
      sessionStorage.removeItem('apna_admin_demo_role');

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
   * Helper to fetch role from public.profiles table or match super admin email
   */
  async function resolveUserRole(authUser) {
    let resolvedRole = 'customer';

    // Auto-detect super admin email rule
    if (authUser.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
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
      return { 
        success: false, 
        error: 'Supabase authentication is not configured in .env. Please connect your Supabase database.' 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.user) {
      // Strict role check: customer accounts are forbidden in the admin portal!
      let userRole = 'customer';
      if (data.user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
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

    return { success: false, error: 'Sign in failed. Please verify your credentials.' };
  }

  /**
   * Request OTP code to be sent to registered Admin email
   */
  async function sendAdminOtp(email) {
    if (!email) return { success: false, error: 'Please enter your registered email address.' };

    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        error: 'Supabase authentication is not configured in .env.' 
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/admin`
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
      return { 
        success: false, 
        error: 'Supabase authentication is not configured in .env.' 
      };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'email'
    });

    if (error) {
      // also attempt type: 'recovery' if user requested password reset token
      const retry = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
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
        superAdminEmail: SUPER_ADMIN_EMAIL
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
