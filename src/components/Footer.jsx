import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, Clock, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer({ onOpenRequestModal }) {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Col 1: Brand & Disclaimer */}
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <img 
              src="/logo.png" 
              alt="Apna Digital Service" 
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff' }} 
            />
            <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
              APNA <span style={{ color: 'var(--saffron-400)' }}>DIGITAL</span> <span style={{ color: 'var(--green-500)' }}>SERVICE</span>
            </h4>
          </div>

          <p>
            Apna Pan Agency provides seamless facilitation assistance for citizens needing fast retrieval of official PAN, Voter ID, Driving Licence, and Vehicle RC digital documents.
          </p>

          <div style={{
            fontSize: '0.78rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            lineHeight: '1.5',
            color: '#94a3b8'
          }}>
            <strong style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShieldCheck size={14} style={{ color: 'var(--saffron-400)' }} />
              <span>Private Platform Disclaimer</span>
            </strong>
            This website is privately operated and is <strong>NOT an official government portal</strong> or affiliated with any government department.
          </div>
        </div>

        {/* Col 2: Active Services with Dedicated Pages */}
        <div className="footer-col">
          <h5>Dedicated Service Pages</h5>
          <ul className="footer-links-list">
            <li>
              <Link to="/service/pan-card-pdf">
                PAN Card PDF Download
              </Link>
            </li>
            <li>
              <Link to="/service/voter-id-pdf">
                Voter ID PDF (Without OTP)
              </Link>
            </li>
            <li>
              <Link to="/service/driving-licence-pdf">
                Driving Licence (DL) PDF
              </Link>
            </li>
            <li>
              <Link to="/service/vehicle-rc-pdf">
                Vehicle RC PDF Download
              </Link>
            </li>
            <li>
              <Link to="/service/ayushman-new-member" style={{ color: 'var(--slate-400)' }}>
                Ayushman New Member
              </Link>
            </li>
            <li>
              <Link to="/service/ayushman-correction" style={{ color: 'var(--slate-400)' }}>
                Ayushman Card Correction
              </Link>
            </li>
            <li>
              <Link to="/service/ayushman-ekyc" style={{ color: 'var(--slate-400)' }}>
                Ayushman e-KYC
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Quick Navigation & Legal Pages */}
        <div className="footer-col">
          <h5>Company & Policies</h5>
          <ul className="footer-links-list">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/faq">Frequently Asked Questions</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/refund-policy">Refund & Cancellation</Link></li>
            <li><Link to="/disclaimer">Service Disclaimer</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact & Operations */}
        <div className="footer-col">
          <h5>Helpline & Support</h5>
          <ul className="footer-links-list">
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} style={{ color: 'var(--saffron-400)' }} />
              <span>+91 9124494239 (PAN/Voter)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} style={{ color: 'var(--green-400)' }} />
              <span>+91 9078620775 (DL/RC)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} style={{ color: 'var(--slate-400)' }} />
              <span>+91 8018246567 (Support)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} style={{ color: 'var(--slate-400)' }} />
              <span>help.apnadigitalservice@gmail.com</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-400)' }}>
              <Clock size={15} />
              <span>Mon – Sun: 9:00 AM – 9:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} Apna Digital Service (Apna Pan Agency). All rights reserved.
          <Link to="/admin/login" style={{ color: '#64748b', fontSize: '0.75rem', textDecoration: 'none', marginLeft: '14px' }}>
            🔒 Staff Portal
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Aap jude rahiye, services hum badhate rahenge!</span>
          <Sparkles size={14} style={{ color: 'var(--saffron-400)' }} />
        </div>
      </div>
    </footer>
  );
}
