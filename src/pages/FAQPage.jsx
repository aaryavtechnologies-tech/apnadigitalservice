import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle, PhoneCall } from 'lucide-react';
import { FAQ_ITEMS } from '../data/servicesData';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = FAQ_ITEMS.filter(item => 
    item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '50px 24px 80px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-tag">Frequently Asked Questions</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '8px', marginBottom: '14px' }}>
            Official Help Center & FAQs
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Find transparent answers regarding our backend-assisted services, document requirements, and verification workflows.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '650px',
          margin: '0 auto 40px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Search size={20} color="var(--slate-400)" />
          <input 
            type="text" 
            placeholder="Search questions (e.g., OTP, Voter ID, payment, status...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.98rem',
              fontFamily: 'inherit',
              color: 'var(--navy-900)'
            }}
          />
          {searchTerm && (
            <button 
              type="button" 
              onClick={() => setSearchTerm('')} 
              style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* FAQs Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '48px' }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '22px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    boxShadow: isOpen ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={20} color="var(--saffron-600)" flexShrink={0} />
                    ) : (
                      <ChevronDown size={20} color="var(--slate-400)" flexShrink={0} />
                    )}
                  </div>

                  {isOpen && (
                    <div style={{
                      marginTop: '14px',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--slate-100)',
                      fontSize: '0.95rem',
                      color: 'var(--slate-600)',
                      lineHeight: '1.65'
                    }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--slate-500)', fontSize: '1rem' }}>
                No questions found matching "{searchTerm}". Please contact our support team.
              </p>
            </div>
          )}
        </div>

        {/* Still Have Questions Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #fff7ed 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px', color: 'var(--navy-900)' }}>
              Still have questions?
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--slate-600)' }}>
              Our support operators are available daily from 9:00 AM to 9:00 PM IST.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href="https://wa.me/919124494239" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle size={16} />
              <span>WhatsApp Support</span>
            </a>
            <a 
              href="tel:9124494239" 
              className="btn-secondary"
            >
              <PhoneCall size={16} />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
