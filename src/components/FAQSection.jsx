import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../data/servicesData';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section-wrapper" style={{ paddingTop: '20px' }}>
      <div className="section-header">
        <span className="section-tag">Got Questions?</span>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Find clear answers regarding document formats, manual verification, and WhatsApp delivery.
        </p>
      </div>

      <div className="faq-grid">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="faq-item"
              onClick={() => toggle(index)}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                {isOpen ? <ChevronUp size={18} color="var(--saffron-600)" /> : <ChevronDown size={18} color="var(--slate-400)" />}
              </div>

              {isOpen && (
                <div className="faq-answer">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
