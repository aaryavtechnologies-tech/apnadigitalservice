import React from 'react';
import { 
  FileCheck2, 
  SearchCheck, 
  CreditCard, 
  Cpu, 
  Search, 
  DownloadCloud, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage({ onOpenTrack }) {
  const steps = [
    {
      num: '1',
      title: 'Choose a Service',
      desc: 'Browse available services (PAN Card, Voter ID without OTP, Driving Licence, or Vehicle RC) and select the service you require.',
      icon: FileCheck2
    },
    {
      num: '2',
      title: 'Submit Your Details',
      desc: 'Complete the relevant website request form or open the linked official Google Form and provide the required document identification information securely.',
      icon: SearchCheck
    },
    {
      num: '3',
      title: 'Assistance Confirmation',
      desc: 'Review the applicable assistance terms. Our team coordinates directly on WhatsApp or phone for verification and confirmation.',
      icon: CreditCard
    },
    {
      num: '4',
      title: 'Request Processing',
      desc: 'Our dedicated backend operations team reviews your request and assists through authorized public systems, subject to eligibility and verification requirements.',
      icon: Cpu
    },
    {
      num: '5',
      title: 'Track Your Request',
      desc: 'Use your unique Application / Order ID through our online tracking facility or customer dashboard to check real-time progress.',
      icon: Search
    },
    {
      num: '6',
      title: 'Download on Website & WhatsApp',
      desc: 'Once processing is complete, your verified digital PDF is available for instant download in your Website Customer Dashboard (accessible under "My Dashboard" and "Track Request") and is also dispatched directly to your registered WhatsApp.',
      icon: DownloadCloud
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '50px 24px 80px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-tag">Step-by-Step Guide</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '8px', marginBottom: '16px' }}>
            How Apna Digital Service Works
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
            Our 6-step backend assisted lifecycle ensures fast, transparent, and accurate digital document retrieval.
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="how-it-works-page-grid">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--saffron-500) 0%, var(--green-600) 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.1)'
                  }}>
                    {step.num}
                  </div>
                  <div style={{ color: 'var(--slate-400)' }}>
                    <Icon size={24} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--slate-600)', lineHeight: '1.6', flexGrow: 1 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Important Processing Times Alert */}
        <div style={{
          background: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          marginBottom: '36px'
        }}>
          <HelpCircle size={26} style={{ color: '#b45309', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#92400e', marginBottom: '6px' }}>
              Important Processing Notice
            </h4>
            <p style={{ fontSize: '0.92rem', color: '#78350f', lineHeight: '1.6' }}>
              Processing times may vary depending on the service, verification requirements, and official system availability. 
              Submission does not guarantee approval or issuance. Final decisions remain subject to applicable rules and authorized authority processes.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/#services" className="btn-primary" style={{ padding: '13px 24px' }}>
            <span>Explore Services</span>
            <ArrowRight size={16} />
          </Link>
          <button 
            type="button" 
            className="btn-secondary" 
            style={{ padding: '13px 24px' }}
            onClick={onOpenTrack}
          >
            <span>Track Existing Request</span>
          </button>
        </div>

      </div>
    </div>
  );
}
