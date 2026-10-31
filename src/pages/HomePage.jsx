import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import HowItWorks from '../components/HowItWorks';
import AboutSection from '../components/AboutSection';
import FAQSection from '../components/FAQSection';
import { getHomepageSettings, fetchHomepageSettings } from '../data/servicesData';

export default function HomePage({ services, onInitiateService, onOpenRequestModal }) {
  const [settings, setSettings] = useState(() => getHomepageSettings());

  useEffect(() => {
    let active = true;
    fetchHomepageSettings().then(value => { if (active) setSettings(value); }).catch(console.error);
    const handleSettingsChanged = () => {
      setSettings(getHomepageSettings());
    };
    window.addEventListener('apna_settings_changed', handleSettingsChanged);
    return () => { active = false; window.removeEventListener('apna_settings_changed', handleSettingsChanged); };
  }, []);

  const sections = settings?.sections || {};

  return (
    <div>
      {/* 1. Main Banner / Hero Section (Admin can toggle) */}
      {sections.hero !== false && (
        <Hero 
          onOpenRequestModal={onOpenRequestModal}
        />
      )}

      {/* 2. Core Assisted Services Grid (Admin can toggle) */}
      {sections.services !== false && (
        <ServicesSection 
          services={services}
          onInitiateService={onInitiateService}
        />
      )}

      {/* 3. How Apna Digital Service Works (Admin can toggle) */}
      {sections.howItWorks !== false && (
        <HowItWorks />
      )}

      {/* 4. About Apna Digital Service (Admin can toggle) */}
      {sections.about !== false && (
        <AboutSection />
      )}

      {(settings.customSections || []).map(section => (
        <section key={section.id} className="custom-home-section">
          <h2>{section.title}</h2><p style={{ whiteSpace: 'pre-line' }}>{section.body}</p>
        </section>
      ))}
      {/* 5. Frequently Asked Questions (Admin can toggle) */}
      {sections.faq !== false && (
        <FAQSection />
      )}
    </div>
  );
}
