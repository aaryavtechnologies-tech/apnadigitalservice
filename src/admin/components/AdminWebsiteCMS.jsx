import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  PhoneCall, 
  FileText, 
  ShieldCheck, 
  Info, 
  Layout, 
  HelpCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  getLocalWebsiteContent, 
  saveWebsiteSectionContent, 
  saveWebsiteSectionsBatch,
  resetWebsiteSectionContent, 
  syncRemoteWebsiteContent 
} from '../../services/websiteContentService';
import { DEFAULT_WEBSITE_CONTENT } from '../../data/defaultWebsiteContent';

// Mapping each subtab to all database section keys it manages
const TAB_CONFIG = {
  homepage_hero: {
    title: 'Hero & Announcement',
    keys: ['announcement', 'homepage_hero'],
    labels: ['Header Announcement & Helpline Ticker', 'Hero Headlines, CTA & Banner Image']
  },
  homepage_services: {
    title: 'Services Grid Content',
    keys: ['homepage_services', 'homepage_how_it_works'],
    labels: ['Services Grid Headers', 'How It Works Process Steps']
  },
  homepage_about: {
    title: 'Homepage About & Pillars',
    keys: ['homepage_about'],
    labels: ['Mission, Privacy & About Pillars']
  },
  about_page: {
    title: 'Dedicated About Page (/about)',
    keys: ['about_page'],
    labels: ['Full About Page Story & Approach']
  },
  contact_page: {
    title: 'Contact & Helplines (/contact)',
    keys: ['contact_page'],
    labels: ['Official Helplines, WhatsApp & Address']
  },
  footer: {
    title: 'Footer & Disclaimer',
    keys: ['footer'],
    labels: ['Global Footer Disclaimer & Copyright']
  }
};

export default function AdminWebsiteCMS() {
  const { role, isSuperAdmin, isViewOnly } = useAdminAuth();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState('homepage_hero');
  
  // Working content state (cloned from existing website content)
  const [content, setContent] = useState(() => getLocalWebsiteContent());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Animated green check success modal state
  const [successModal, setSuccessModal] = useState({
    open: false,
    title: '',
    sectionTitle: '',
    savedLabels: [],
    timestamp: ''
  });

  // Sync latest from Supabase on mount
  useEffect(() => {
    syncRemoteWebsiteContent().then(fresh => {
      if (fresh) setContent(fresh);
    });
  }, []);

  // Notice auto-dismiss
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(t);
    }
  }, [notice]);

  // Field change helper
  const handleFieldChange = (sectionKey, fieldKey, value) => {
    setContent(prev => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldKey]: value
      }
    }));
  };

  // Save current active tab sections atomically in a batch
  const handleSaveSection = async (tabId) => {
    if (isViewOnly) return;
    setSaving(true);
    setNotice(null);

    const tabInfo = TAB_CONFIG[tabId] || {
      title: getSectionTitle(tabId),
      keys: [tabId],
      labels: [getSectionTitle(tabId)]
    };

    // Build batch payload for all sections in this tab
    const batch = {};
    tabInfo.keys.forEach(k => {
      batch[k] = content[k] || {};
    });

    const res = await saveWebsiteSectionsBatch(batch, role);
    setSaving(false);

    if (res.success) {
      setSuccessModal({
        open: true,
        title: 'Changes Saved Successfully!',
        sectionTitle: tabInfo.title,
        savedLabels: tabInfo.labels,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } else {
      setNotice({
        type: 'error',
        text: res.error || 'Failed to save content changes to database.'
      });
    }
  };

  // Reset section to default original text
  const handleResetSection = async (tabId) => {
    if (isViewOnly) return;
    const tabInfo = TAB_CONFIG[tabId] || {
      title: getSectionTitle(tabId),
      keys: [tabId],
      labels: [getSectionTitle(tabId)]
    };

    if (!window.confirm(`Are you sure you want to restore the original default text for ${tabInfo.title}?`)) {
      return;
    }

    setSaving(true);
    const resetBatch = {};
    tabInfo.keys.forEach(k => {
      resetBatch[k] = DEFAULT_WEBSITE_CONTENT[k] || {};
    });

    const res = await saveWebsiteSectionsBatch(resetBatch, role);
    setSaving(false);

    if (res.success) {
      setContent(prev => ({
        ...prev,
        ...resetBatch
      }));
      setSuccessModal({
        open: true,
        title: 'Default Text Restored!',
        sectionTitle: tabInfo.title,
        savedLabels: tabInfo.labels.map(l => `${l} (Default Values)`),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } else {
      setNotice({
        type: 'error',
        text: res.error || 'Failed to reset content.'
      });
    }
  };

  const getSectionTitle = (key) => {
    return TAB_CONFIG[key]?.title || 'Website Content';
  };

  const subTabs = [
    { id: 'homepage_hero', label: 'Hero & Announcement', icon: Globe },
    { id: 'homepage_services', label: 'Services Grid Content', icon: Layout },
    { id: 'homepage_about', label: 'Homepage About & Pillars', icon: ShieldCheck },
    { id: 'about_page', label: 'About Page (/about)', icon: FileText },
    { id: 'contact_page', label: 'Contact & Helplines', icon: PhoneCall },
    { id: 'footer', label: 'Footer & Disclaimer', icon: Info }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* Animated Green Tick Success Modal */}
      {successModal.open && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={() => setSuccessModal(prev => ({ ...prev, open: false }))}
        >
          <div 
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(22, 163, 74, 0.15)',
              textAlign: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Green Circle with Checkmark */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#DCFCE7',
              border: '3px solid #86EFAC',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 10px 25px rgba(22, 163, 74, 0.25)'
            }}>
              <Check size={44} strokeWidth={3} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              {successModal.title}
            </h3>

            <p style={{ fontSize: '0.90rem', color: '#64748B', margin: '0 0 20px' }}>
              Changes to <strong>{successModal.sectionTitle}</strong> are now saved in database & immediately live across the portal.
            </p>

            {/* Saved Content Badges */}
            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '14px',
              padding: '14px 18px',
              textAlign: 'left',
              marginBottom: '22px'
            }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Content Saved to Database:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {successModal.savedLabels.map((lbl, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600, color: '#15803D' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
                    <span>{lbl}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #E2E8F0', fontSize: '0.74rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                <span>Database: public.website_content</span>
                <span>{successModal.timestamp}</span>
              </div>
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.94rem', fontWeight: 700, borderRadius: '12px' }}
              onClick={() => setSuccessModal(prev => ({ ...prev, open: false }))}
            >
              Done / Continue Editing
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Notice */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        border: '1.5px solid #334155',
        borderRadius: '16px',
        padding: '20px 24px',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Super Admin Website CMS (Live Content Editor)
            </h2>
            <div style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '3px' }}>
              All existing website texts are pre-loaded below. Review and edit any heading, description, or helpline live across the portal.
            </div>
          </div>
        </div>

        {/* Top Header Actions: Clear View Live Site button (No duplicate save button) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a 
            href="/" 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}
          >
            <ExternalLink size={15} style={{ color: '#F97316' }} />
            <span>View Live Site</span>
          </a>
        </div>
      </div>

      {/* Action Notification Toast */}
      {notice && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: notice.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${notice.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: notice.type === 'success' ? '#15803D' : '#B91C1C',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          {notice.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        borderBottom: '1.5px solid #E2E8F0'
      }}>
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: 700,
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#EA580C' : '#64748B',
                borderBottom: isActive ? '3px solid #EA580C' : '3px solid transparent',
                boxShadow: isActive ? '0 -2px 8px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Homepage Hero & Announcements */}
      {activeSubTab === 'homepage_hero' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Announcement Bar */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Header Announcement & Helpline Strip
            </h3>
            <div className="admin-input-group">
              <label>Announcement Bar Text (Visible at the very top of all pages)</label>
              <input 
                type="text"
                className="admin-input"
                value={content.announcement?.text || ''}
                onChange={(e) => handleFieldChange('announcement', 'text', e.target.value)}
                placeholder="Instant Digital Assistance Helpline: +91 8018246567 (Mon-Sat 9AM-8PM)"
                disabled={isViewOnly}
              />
            </div>
          </div>

          {/* Hero Content */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Hero Banner Section
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>Hero Tagline Badge</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_hero?.taglineBadge || ''}
                  onChange={(e) => handleFieldChange('homepage_hero', 'taglineBadge', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Hero Headline Title</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_hero?.title || ''}
                  onChange={(e) => handleFieldChange('homepage_hero', 'title', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div className="admin-input-group" style={{ marginBottom: '16px' }}>
              <label>Hero Subtitle Description</label>
              <textarea 
                rows={2}
                className="admin-textarea"
                value={content.homepage_hero?.subtitle || ''}
                onChange={(e) => handleFieldChange('homepage_hero', 'subtitle', e.target.value)}
                disabled={isViewOnly}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>CTA Strip Title (Below Full-Width Banner)</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_hero?.ctaHeadline || ''}
                  onChange={(e) => handleFieldChange('homepage_hero', 'ctaHeadline', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>CTA Strip Subtitle Bullet</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_hero?.ctaSubtitle || ''}
                  onChange={(e) => handleFieldChange('homepage_hero', 'ctaSubtitle', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-input-group">
                <label>Primary Button Text</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_hero?.primaryBtnText || 'Submit Service Request'}
                  onChange={(e) => handleFieldChange('homepage_hero', 'primaryBtnText', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>WhatsApp Button Text</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_hero?.secondaryBtnText || 'WhatsApp Help'}
                  onChange={(e) => handleFieldChange('homepage_hero', 'secondaryBtnText', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Homepage Services & How It Works */}
      {activeSubTab === 'homepage_services' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Services Section Headers
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>Section Pill Tag</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_services?.tag || ''}
                  onChange={(e) => handleFieldChange('homepage_services', 'tag', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Main Section Title</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_services?.title || ''}
                  onChange={(e) => handleFieldChange('homepage_services', 'title', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Section Subtitle Description</label>
              <textarea 
                rows={2}
                className="admin-textarea"
                value={content.homepage_services?.subtitle || ''}
                onChange={(e) => handleFieldChange('homepage_services', 'subtitle', e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              How Apna Digital Service Works Section
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>Process Pill Tag</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_how_it_works?.tag || ''}
                  onChange={(e) => handleFieldChange('homepage_how_it_works', 'tag', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Process Section Title</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_how_it_works?.title || ''}
                  onChange={(e) => handleFieldChange('homepage_how_it_works', 'title', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Process Subtitle</label>
              <textarea 
                rows={2}
                className="admin-textarea"
                value={content.homepage_how_it_works?.subtitle || ''}
                onChange={(e) => handleFieldChange('homepage_how_it_works', 'subtitle', e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Homepage About & Trust Pillars */}
      {activeSubTab === 'homepage_about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Homepage About Section Header
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>Section Tag</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_about?.tag || ''}
                  onChange={(e) => handleFieldChange('homepage_about', 'tag', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Section Title</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.homepage_about?.title || ''}
                  onChange={(e) => handleFieldChange('homepage_about', 'title', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div className="admin-input-group" style={{ marginBottom: '16px' }}>
              <label>Section Subtitle / Brief</label>
              <textarea 
                rows={2}
                className="admin-textarea"
                value={content.homepage_about?.subtitle || ''}
                onChange={(e) => handleFieldChange('homepage_about', 'subtitle', e.target.value)}
                disabled={isViewOnly}
              />
            </div>

            <div className="admin-input-group">
              <label>Important Notice / Disclaimer Strip</label>
              <textarea 
                rows={2}
                className="admin-textarea"
                value={content.homepage_about?.disclaimerNotice || ''}
                onChange={(e) => handleFieldChange('homepage_about', 'disclaimerNotice', e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>

          {/* 3 Core Trust Pillars */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              The 3 Brand Trust Pillars (Mission, Security, Assistance)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Pillar 1: Mission */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div className="admin-input-group" style={{ marginBottom: '10px' }}>
                  <label>Pillar 1 Title</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={content.homepage_about?.missionTitle || 'Our Mission'}
                    onChange={(e) => handleFieldChange('homepage_about', 'missionTitle', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="admin-input-group">
                  <label>Pillar 1 Description</label>
                  <textarea 
                    rows={3}
                    className="admin-textarea"
                    value={content.homepage_about?.missionDesc || ''}
                    onChange={(e) => handleFieldChange('homepage_about', 'missionDesc', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
              </div>

              {/* Pillar 2: Security */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div className="admin-input-group" style={{ marginBottom: '10px' }}>
                  <label>Pillar 2 Title</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={content.homepage_about?.privacyTitle || 'Privacy & Security'}
                    onChange={(e) => handleFieldChange('homepage_about', 'privacyTitle', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="admin-input-group">
                  <label>Pillar 2 Description</label>
                  <textarea 
                    rows={3}
                    className="admin-textarea"
                    value={content.homepage_about?.privacyDesc || ''}
                    onChange={(e) => handleFieldChange('homepage_about', 'privacyDesc', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
              </div>

              {/* Pillar 3: Assistance */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div className="admin-input-group" style={{ marginBottom: '10px' }}>
                  <label>Pillar 3 Title</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={content.homepage_about?.assistanceTitle || 'Human Assistance'}
                    onChange={(e) => handleFieldChange('homepage_about', 'assistanceTitle', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="admin-input-group">
                  <label>Pillar 3 Description</label>
                  <textarea 
                    rows={3}
                    className="admin-textarea"
                    value={content.homepage_about?.assistanceDesc || ''}
                    onChange={(e) => handleFieldChange('homepage_about', 'assistanceDesc', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Dedicated About Page */}
      {activeSubTab === 'about_page' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Dedicated About Page Header (/about)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>Header Tag</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.about_page?.tag || ''}
                  onChange={(e) => handleFieldChange('about_page', 'tag', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Header Title</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.about_page?.title || ''}
                  onChange={(e) => handleFieldChange('about_page', 'title', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Header Subtitle</label>
              <textarea 
                rows={2}
                className="admin-textarea"
                value={content.about_page?.subtitle || ''}
                onChange={(e) => handleFieldChange('about_page', 'subtitle', e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>

          {/* 3 Core Description Paragraphs */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Core Description Paragraphs
            </h3>

            <div className="admin-input-group" style={{ marginBottom: '14px' }}>
              <label>Paragraph 1: Platform Overview</label>
              <textarea 
                rows={3}
                className="admin-textarea"
                value={content.about_page?.paragraph1 || ''}
                onChange={(e) => handleFieldChange('about_page', 'paragraph1', e.target.value)}
                disabled={isViewOnly}
              />
            </div>

            <div className="admin-input-group" style={{ marginBottom: '14px' }}>
              <label>Paragraph 2: Backend & Assistance Flow</label>
              <textarea 
                rows={3}
                className="admin-textarea"
                value={content.about_page?.paragraph2 || ''}
                onChange={(e) => handleFieldChange('about_page', 'paragraph2', e.target.value)}
                disabled={isViewOnly}
              />
            </div>

            <div className="admin-input-group">
              <label>Paragraph 3: Customer Value & Support</label>
              <textarea 
                rows={3}
                className="admin-textarea"
                value={content.about_page?.paragraph3 || ''}
                onChange={(e) => handleFieldChange('about_page', 'paragraph3', e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>

          {/* Mission & Approach Cards */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Mission & Approach Cards
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div className="admin-input-group" style={{ marginBottom: '10px' }}>
                  <label>Mission Card Title</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={content.about_page?.missionTitle || 'Our Mission'}
                    onChange={(e) => handleFieldChange('about_page', 'missionTitle', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="admin-input-group">
                  <label>Mission Card Statement</label>
                  <textarea 
                    rows={3}
                    className="admin-textarea"
                    value={content.about_page?.missionDesc || ''}
                    onChange={(e) => handleFieldChange('about_page', 'missionDesc', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div className="admin-input-group" style={{ marginBottom: '10px' }}>
                  <label>Approach Card Title</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={content.about_page?.approachTitle || 'Our Approach'}
                    onChange={(e) => handleFieldChange('about_page', 'approachTitle', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="admin-input-group">
                  <label>Approach Card Statement</label>
                  <textarea 
                    rows={3}
                    className="admin-textarea"
                    value={content.about_page?.approachDesc || ''}
                    onChange={(e) => handleFieldChange('about_page', 'approachDesc', e.target.value)}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: Contact Page & Helplines */}
      {activeSubTab === 'contact_page' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Contact Page Header (/contact)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>Header Tag</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.contact_page?.tag || ''}
                  onChange={(e) => handleFieldChange('contact_page', 'tag', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Header Title</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.contact_page?.title || ''}
                  onChange={(e) => handleFieldChange('contact_page', 'title', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Header Subtitle</label>
              <textarea 
                rows={2}
                className="admin-textarea"
                value={content.contact_page?.subtitle || ''}
                onChange={(e) => handleFieldChange('contact_page', 'subtitle', e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Official Customer Helplines & Office Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>Primary Helpline (DL / RC / Voter) *</label>
                <input 
                  type="tel"
                  className="admin-input"
                  value={content.contact_page?.primaryPhone1 || '+91 8018246567'}
                  onChange={(e) => handleFieldChange('contact_page', 'primaryPhone1', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Secondary Helpline Phone</label>
                <input 
                  type="tel"
                  className="admin-input"
                  value={content.contact_page?.primaryPhone2 || '+91 9124494239'}
                  onChange={(e) => handleFieldChange('contact_page', 'primaryPhone2', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-input-group">
                <label>WhatsApp Support Mobile Number *</label>
                <input 
                  type="tel"
                  className="admin-input"
                  value={content.contact_page?.whatsappNumber || '+91 8018246567'}
                  onChange={(e) => handleFieldChange('contact_page', 'whatsappNumber', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Official Support Email Address</label>
                <input 
                  type="email"
                  className="admin-input"
                  value={content.contact_page?.supportEmail || 'help.apnadigitalservice@gmail.com'}
                  onChange={(e) => handleFieldChange('contact_page', 'supportEmail', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="admin-input-group">
                <label>Operating Hours</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.contact_page?.operatingHours || 'Monday – Saturday: 9:00 AM – 8:00 PM IST'}
                  onChange={(e) => handleFieldChange('contact_page', 'operatingHours', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>

              <div className="admin-input-group">
                <label>Office / Postal Address</label>
                <input 
                  type="text"
                  className="admin-input"
                  value={content.contact_page?.officeAddress || 'Bhubaneswar, Odisha, India - 751024'}
                  onChange={(e) => handleFieldChange('contact_page', 'officeAddress', e.target.value)}
                  disabled={isViewOnly}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: Footer & Legal Notices */}
      {activeSubTab === 'footer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Global Footer Content & Disclaimers
            </h3>

            <div className="admin-input-group" style={{ marginBottom: '16px' }}>
              <label>Footer Brand Description Statement</label>
              <textarea 
                rows={3}
                className="admin-textarea"
                value={content.footer?.brandDesc || ''}
                onChange={(e) => handleFieldChange('footer', 'brandDesc', e.target.value)}
                disabled={isViewOnly}
              />
            </div>

            <div className="admin-input-group" style={{ marginBottom: '16px' }}>
              <label>Statutory Private Platform Disclaimer</label>
              <textarea 
                rows={3}
                className="admin-textarea"
                value={content.footer?.disclaimer || ''}
                onChange={(e) => handleFieldChange('footer', 'disclaimer', e.target.value)}
                disabled={isViewOnly}
              />
            </div>

            <div className="admin-input-group">
              <label>Copyright Statement</label>
              <input 
                type="text"
                className="admin-input"
                value={content.footer?.copyright || '© 2026 Apna Digital Service. All rights reserved.'}
                onChange={(e) => handleFieldChange('footer', 'copyright', e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Footer Bar for the Section */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: '16px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          disabled={isViewOnly || saving}
          onClick={() => handleResetSection(activeSubTab)}
        >
          <RotateCcw size={14} />
          <span>Reset Section to Default Text</span>
        </button>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          style={{ padding: '10px 24px', fontSize: '0.90rem', fontWeight: 700 }}
          disabled={isViewOnly || saving}
          onClick={() => handleSaveSection(activeSubTab)}
        >
          {saving ? <Loader2 size={16} className="spin-animation" /> : <Save size={16} />}
          <span>Save Changes to {getSectionTitle(activeSubTab)}</span>
        </button>
      </div>

    </div>
  );
}
