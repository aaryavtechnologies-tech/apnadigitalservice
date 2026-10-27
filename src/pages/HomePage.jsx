import React from 'react';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import HowItWorks from '../components/HowItWorks';
import HelplineBanner from '../components/HelplineBanner';
import FAQSection from '../components/FAQSection';

export default function HomePage({ services, onInitiateService, onOpenRequestModal }) {
  return (
    <div>
      <Hero 
        onOpenRequestModal={onOpenRequestModal}
      />

      <ServicesSection 
        services={services}
        onInitiateService={onInitiateService}
      />

      <HowItWorks />

      <HelplineBanner />

      <FAQSection />
    </div>
  );
}
