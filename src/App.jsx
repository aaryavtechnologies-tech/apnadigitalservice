import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import PolicyPage from './pages/PolicyPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import RequestModal from './components/RequestModal';
import AuthModal from './components/AuthModal';
import TrackApplicationModal from './components/TrackApplicationModal';
import FormInstructionModal from './components/FormInstructionModal';
import { getActiveServices } from './data/servicesData';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

// Admin Portal Imports
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminLoginPage from './admin/pages/AdminLoginPage';

// Helper component to auto-scroll to top or target section on route/hash change
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const id = hash.replace('#', '');
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
      return () => clearTimeout(timer);
    } else if (pathname === '/services') {
      const timer = setTimeout(() => {
        const elem = document.getElementById('services');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

/**
 * Main Content Component: Switches between Customer Web App and Admin Portal
 */
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [services, setServices] = useState(() => getActiveServices());

  useEffect(() => {
    const handleServicesChanged = () => {
      setServices(getActiveServices());
    };
    window.addEventListener('apna_services_changed', handleServicesChanged);
    return () => window.removeEventListener('apna_services_changed', handleServicesChanged);
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  const [selectedServiceForAction, setSelectedServiceForAction] = useState(null);
  const [selectedServiceForRequest, setSelectedServiceForRequest] = useState(null);
  const [pendingServiceAction, setPendingServiceAction] = useState(null);

  // Sync Supabase Auth state if configured & auto-route Super Admin to /admin
  useEffect(() => {
    if (isSupabaseConfigured) {
      const isAuthCallback = window.location.hash.includes('access_token') || 
                             window.location.search.includes('code') ||
                             window.location.hash.includes('type=magiclink') ||
                             window.location.hash.includes('type=recovery');

      const processSession = async (session) => {
        if (session?.user) {
          const userEmail = session.user.email?.toLowerCase().trim();
          const isSuperAdminEmail = userEmail === 'help.apnadigitalservice@gmail.com';
          let userRole = isSuperAdminEmail ? 'super_admin' : 'customer';

          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            if (prof?.role) userRole = prof.role;
          } catch (e) {
            console.warn('Profile fetch warning:', e);
          }

          const userObj = {
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            phone: session.user.user_metadata?.phone || '',
            role: userRole
          };
          setCurrentUser(userObj);
          localStorage.setItem('apna_user', JSON.stringify(userObj));

          // If user is super_admin or admin, automatically route to the admin portal!
          if (userRole === 'super_admin' || userRole === 'admin') {
            if (isAuthCallback || location.pathname === '/' || location.pathname === '/dashboard') {
              navigate('/admin');
            }
          }
        } else {
          setCurrentUser(null);
          localStorage.removeItem('apna_user');
        }
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        processSession(session);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        processSession(session);
      });

      return () => subscription.unsubscribe();
    }
  }, [location.pathname, navigate]);

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('apna_user');
  };

  const handleInitiateService = (service, type = 'google-form') => {
    setSelectedServiceForAction(service);

    if (!currentUser) {
      setPendingServiceAction({ service, type });
      setIsAuthModalOpen(true);
      return;
    }

    setIsInstructionModalOpen(true);
  };

  const handleProceedToForm = (service) => {
    setIsInstructionModalOpen(false);
    setSelectedServiceForRequest(service);
    setIsRequestModalOpen(true);
  };

  const handleOpenRequestModal = (service = null) => {
    if (!currentUser) {
      setPendingServiceAction({ service: service || services[0], type: 'request' });
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedServiceForRequest(service || services[0]);
    setIsRequestModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (pendingServiceAction) {
      setSelectedServiceForAction(pendingServiceAction.service);
      setIsInstructionModalOpen(true);
      setPendingServiceAction(null);
    }
  };

  // If navigating to Admin Portal: render dedicated Admin layout without customer chrome
  if (isAdminRoute) {
    return (
      <AdminAuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
        </Routes>
      </AdminAuthProvider>
    );
  }

  // Customer Portal
  return (
    <div className="apna-app-root">
      {/* Navigation Header (Strictly user-facing) */}
      <Header 
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenTrack={() => setIsTrackModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Dynamic Route Pages */}
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                services={services}
                onInitiateService={handleInitiateService}
                onOpenRequestModal={handleOpenRequestModal}
              />
            } 
          />

          <Route 
            path="/service/:slug" 
            element={
              <ServiceDetailPage 
                onInitiateService={handleInitiateService}
              />
            } 
          />

          <Route 
            path="/services" 
            element={
              <HomePage 
                services={services}
                onInitiateService={handleInitiateService}
                onOpenRequestModal={handleOpenRequestModal}
              />
            } 
          />

          <Route 
            path="/dashboard" 
            element={
              <CustomerDashboardPage 
                currentUser={currentUser}
                onSignOut={handleSignOut}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            } 
          />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage onOpenTrack={() => setIsTrackModalOpen(true)} />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/privacy-policy" element={<PolicyPage />} />
          <Route path="/terms" element={<PolicyPage />} />
          <Route path="/refund-policy" element={<PolicyPage />} />
          <Route path="/disclaimer" element={<PolicyPage />} />

          <Route 
            path="*" 
            element={
              <HomePage 
                services={services}
                onInitiateService={handleInitiateService}
                onOpenRequestModal={handleOpenRequestModal}
              />
            } 
          />
        </Routes>
      </main>

      <Footer 
        onOpenRequestModal={handleOpenRequestModal}
      />

      {/* Interactive Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <FormInstructionModal 
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        service={selectedServiceForAction}
        currentUser={currentUser}
        onProceedToForm={handleProceedToForm}
      />

      <RequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialService={selectedServiceForRequest}
        currentUser={currentUser}
      />

      <TrackApplicationModal 
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
