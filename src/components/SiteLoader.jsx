import React, { useState, useEffect } from 'react';

export default function SiteLoader() {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let fadeTimer;
    const finish = () => {
      setFading(true);
      fadeTimer = setTimeout(() => setLoading(false), 400);
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    return () => { window.removeEventListener('load', finish); clearTimeout(fadeTimer); };
  }, []);

  if (!loading) return null;

  return (
    <div 
      className="site-loader-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: fading ? 'none' : 'auto'
      }}
    >
      <div 
        style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Outer 3-Colour Rotating Ring (Saffron, White, Green) */}
        <div className="loader-rotating-ring" />

        {/* Center Static Original Apna Digital Service Logo */}
        <img 
          src="/logo.png" 
          alt="Apna Digital Service" 
          style={{
            width: '46px',
            height: '46px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
            transform: 'none'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          color: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <span>APNA</span>
          <span style={{ color: '#F97316' }}>DIGITAL</span>
          <span style={{ color: '#16A34A' }}>SERVICE</span>
        </div>
        <div style={{
          fontSize: '0.78rem',
          color: '#64748B',
          fontWeight: 600,
          marginTop: '4px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          Loading Official Document Platform...
        </div>
      </div>
    </div>
  );
}
