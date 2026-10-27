import React from 'react';
import { Phone, MessageCircle, Clock, ShieldCheck, Headphones } from 'lucide-react';

export default function HelplineBanner() {
  return (
    <section id="helpline" className="section-wrapper" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <div className="helpline-card">
        <div className="helpline-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green-700)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '8px' }}>
            <Headphones size={18} />
            <span>DIRECT OPERATOR ASSISTANCE</span>
          </div>

          <h3>Need Immediate Document Help?</h3>
          <p>
            Agar aapko form bharne ya document dhoondhne me koi dikkat aa rahi hai, toh turant hamare verified support agents se WhatsApp ya call par baat karein.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.88rem', color: 'var(--slate-600)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} style={{ color: 'var(--saffron-600)' }} />
              <span>Available 9:00 AM – 9:00 PM (All 7 Days)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--green-600)' }} />
              <span>Verified WhatsApp Support</span>
            </span>
          </div>
        </div>

        {/* Support Chips */}
        <div className="helpline-numbers-grid">
          {/* Helpline 1: PAN & Voter */}
          <div className="helpline-chip">
            <div className="helpline-chip-content">
              <div className="helpline-chip-icon" style={{ 
                background: '#ffedd5', 
                color: '#ea580c', 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Phone size={17} />
              </div>
              <div className="helpline-chip-text">
                <div className="helpline-chip-title">PAN & VOTER PDF HELPLINE</div>
                <div className="helpline-chip-num">9124494239</div>
              </div>
            </div>

            <a 
              href="https://wa.me/919124494239?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20PAN%20or%20Voter%20PDF" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp helpline-chat-btn"
            >
              <MessageCircle size={15} />
              <span>Chat</span>
            </a>
          </div>

          {/* Helpline 2: DL & RC */}
          <div className="helpline-chip">
            <div className="helpline-chip-content">
              <div className="helpline-chip-icon" style={{ 
                background: '#e0f2fe', 
                color: '#0284c7', 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Phone size={17} />
              </div>
              <div className="helpline-chip-text">
                <div className="helpline-chip-title">DL & VEHICLE RC HELPLINE</div>
                <div className="helpline-chip-num">9078620775</div>
              </div>
            </div>

            <a 
              href="https://wa.me/919078620775?text=Hello%20Apna%20Digital%20Service,%20I%20need%20assistance%20with%20DL%20or%20RC%20PDF" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp helpline-chat-btn"
            >
              <MessageCircle size={15} />
              <span>Chat</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
