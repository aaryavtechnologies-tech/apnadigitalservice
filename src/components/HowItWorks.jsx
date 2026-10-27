import React from 'react';
import { 
  FileCheck2, 
  SearchCheck, 
  MessageSquareShare, 
  DownloadCloud, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Choose Service',
      hindi: 'सेवा चुनें',
      desc: 'Select from PAN, Voter ID (without OTP), Driving Licence, or Vehicle RC assistance based on your need.',
      icon: FileCheck2
    },
    {
      num: '2',
      title: 'Submit Details',
      hindi: 'विवरण भरें',
      desc: 'Submit your basic request on the website or fill out our simple external Google Form with your document reference number.',
      icon: SearchCheck
    },
    {
      num: '3',
      title: 'Manual Verification',
      hindi: 'वेरिफिकेशन व पुष्टि',
      desc: 'Our operations team manually inspects the response spreadsheet, validates official records, and confirms details with you via WhatsApp.',
      icon: MessageSquareShare
    },
    {
      num: '4',
      title: 'Download on Website & WhatsApp',
      hindi: 'वेबसाइट व व्हाट्सएप पर पीडीएफ प्राप्त करें',
      desc: 'No long waiting. Your verified, high-resolution digital document PDF is made available for direct download in your Website Dashboard (under My Dashboard / Track Request) and dispatched to your WhatsApp.',
      icon: DownloadCloud
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">Simple & Transparent Process</span>
          <h2 className="section-title">How Apna Digital Service Works</h2>
          <p className="section-subtitle">
            No long queues, no confusing government portals. Follow these 4 easy steps to get your document PDF.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="step-card">
                <div className="step-number-badge">
                  {step.num}
                </div>
                <h3 className="step-title">{step.title}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--saffron-600)', fontWeight: '700', marginBottom: '8px' }}>
                  {step.hindi}
                </div>
                <p className="step-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Private Platform Disclaimer Alert */}
        <div className="compliance-disclaimer-box">
          <div className="disclaimer-icon">
            <HelpCircle size={24} />
          </div>
          <div className="disclaimer-text">
            <h4>Important Notice & Disclaimer</h4>
            <p>
              Apna Digital Service (Apna Pan Agency) is an independent, privately-operated documentation assistance platform. 
              We are <strong>NOT affiliated with any government department, RTO, Election Commission, or Income Tax Department</strong>. 
              We assist citizens in retrieving official public copies with ease. We do not ask for or store confidential government passwords or OTPs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
