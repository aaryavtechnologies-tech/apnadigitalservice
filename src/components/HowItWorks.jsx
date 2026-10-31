import React from 'react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works-section" style={{ width: '100%', padding: '0', background: '#FFFFFF', overflow: 'hidden' }}>


      <div className="mobile-process">
        <h2>How Apna Digital Service Works</h2>
        <ol>
          <li><strong>Choose your service</strong>Sign in or create an account, then select the service you need.</li>
          <li><strong>Submit your details</strong>Complete the form and upload the required documents and payment proof.</li>
          <li><strong>Track your request</strong>Save your Tracking ID and check verification updates in your account.</li>
          <li><strong>Receive your document</strong>View the completed request and download your available document.</li>
        </ol>
      </div>
      {/* 100% Full-Width Diagram Container — Zero Empty Spaces on Desktop & Mobile */}
      <div 
        className="how-it-works-full-banner"
        style={{
          width: '100%',
          overflow: 'hidden',
          background: '#ffffff',
          lineHeight: 0
        }}
      >
        <img 
          src="/how-it-works-diagram.png" 
          alt="How Apna Digital Service Works — 4 Easy Steps: Choose Service, Submit Details, Verification, Get PDF" 
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </div>
    </section>
  );
}
