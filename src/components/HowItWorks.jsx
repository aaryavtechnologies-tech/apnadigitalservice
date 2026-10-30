import React from 'react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works-section" style={{ width: '100%', padding: '0', background: '#FFFFFF', overflow: 'hidden' }}>


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
