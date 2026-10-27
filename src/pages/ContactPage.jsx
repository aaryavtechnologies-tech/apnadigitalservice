import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  ShieldCheck, 
  Send, 
  CheckCircle,
  HelpCircle,
  Headphones
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Service-related enquiry');
  const [message, setMessage] = useState('');
  const [dispatched, setDispatched] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const encoded = encodeURIComponent(
      `Hello Apna Digital Service,\nName: ${name}\nPhone: ${phone}\nTopic: ${subject}\nMessage: ${message}`
    );
    // Direct WhatsApp dispatch
    window.open(`https://wa.me/919124494239?text=${encoded}`, '_blank');
    setDispatched(true);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '50px 24px 80px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-tag">Get in Touch</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '8px', marginBottom: '14px' }}>
            Contact Customer Support
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
            We are committed to helping customers with their digital documentation and service requests. Reach out to our operators daily.
          </p>
        </div>

        <div className="contact-page-grid">
          
          {/* Left Column: Official Support Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={22} style={{ color: 'var(--saffron-600)' }} />
                <span>Customer Helplines</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--saffron-50)',
                    color: 'var(--saffron-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Primary Helplines
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                      +91 8018246567 / +91 9124494239
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      Assistance for PAN Card, Voter ID & General Enquiries
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--green-50)',
                    color: 'var(--green-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Driving Licence & Vehicle RC Helpline
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                      +91 9078620775
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      Sarathi & Vahan digital duplicate assistance
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--slate-100)',
                    color: 'var(--navy-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Official Support Email
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      help.apnadigitalservice@gmail.com
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--slate-100)',
                    color: 'var(--navy-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Support Hours
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      Every day, 9:00 AM to 9:00 PM IST
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Topics List */}
              <div style={{
                background: 'var(--slate-50)',
                padding: '18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>
                  We are here to assist you with:
                </div>
                <ul style={{ listStyle: 'none', fontSize: '0.84rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>✓ Service-related enquiries</li>
                  <li>✓ Assistance with submitted requests</li>
                  <li>✓ Confirmation & transaction queries</li>
                  <li>✓ Request status updates</li>
                  <li>✓ Document delivery assistance</li>
                  <li>✓ General customer support</li>
                </ul>
              </div>

            </div>

            {/* Security Tip */}
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              fontSize: '0.86rem',
              color: '#78350f',
              lineHeight: '1.55'
            }}>
              <strong>Security Guidance:</strong> For faster assistance, please keep your order/request ID available. 
              <strong> Do not share passwords, bank OTPs, or unnecessary sensitive data</strong> through public messages.
            </div>

          </div>

          {/* Right Column: Direct Dispatch Contact Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', marginBottom: '8px' }}>
              Send an Inquiry
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginBottom: '22px' }}>
              Fill out this quick form to connect with our WhatsApp support desk instantly.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Your Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-field">
                <label className="form-label">WhatsApp Mobile Number *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>

              <div className="form-field">
                <label className="form-label">Inquiry Topic</label>
                <select 
                  className="form-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="Service-related enquiry">Service-related enquiry</option>
                  <option value="Status update on submitted request">Status update on submitted request</option>
                  <option value="Voter ID without OTP query">Voter ID without OTP query</option>
                  <option value="PAN Card PDF query">PAN Card PDF query</option>
                  <option value="DL or Vehicle RC assistance">DL or Vehicle RC assistance</option>
                  <option value="Document delivery assistance">Document delivery assistance</option>
                  <option value="General support">General support</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Message Details *</label>
                <textarea 
                  className="form-textarea"
                  rows={4}
                  placeholder="Explain your query or mention your Application ID..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-whatsapp" 
                style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}
              >
                <MessageCircle size={18} />
                <span>Connect via WhatsApp</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
