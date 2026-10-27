import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

export default function PolicyPage() {
  const location = useLocation();
  const path = location.pathname;

  let policyType = 'privacy';
  if (path.includes('terms')) policyType = 'terms';
  else if (path.includes('refund')) policyType = 'refund';
  else if (path.includes('disclaimer')) policyType = 'disclaimer';

  const renderContent = () => {
    switch (policyType) {
      case 'terms':
        return (
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>
              Terms & Conditions
            </h1>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: '28px' }}>
              Last Updated: October 2026
            </div>

            <div className="policy-section-block">
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing or using the website, you agree to these Terms & Conditions. If you do not agree, discontinue use of the platform.</p>

              <h3>2. Nature of Our Business</h3>
              <p>Apna Digital Service is a privately operated online platform providing digital documentation assistance and related services. It is not a government website, department, or official government portal and does not claim government affiliation or endorsement unless expressly authorized.</p>

              <h3>3. Service Requests</h3>
              <p>Customers must provide accurate, complete, and lawful information. Incomplete, incorrect, inconsistent, or unverifiable information may delay or prevent processing.</p>

              <h3>4. Eligibility and Verification</h3>
              <p>Services are subject to applicable eligibility criteria, verification requirements, and procedures. Additional verification, including OTP or biometric authentication, may be required through the applicable authorized process.</p>

              <h3>5. Service Fees and Payments</h3>
              <p>Applicable fees will be displayed or communicated before payment. Customers should review the selected service and fee before paying. Additional charges must be disclosed before collection.</p>

              <h3>6. Processing Time</h3>
              <p>Processing times may vary with the service, verification requirements, technical availability, and actions required by relevant authorities. Estimates are indicative unless expressly stated otherwise.</p>

              <h3>7. No Guarantee of Approval</h3>
              <p>Submitting a request does not guarantee approval, correction, addition, verification, or issuance of a document. Final decisions remain subject to applicable rules and relevant authority processes.</p>

              <h3>8. Customer Responsibilities</h3>
              <p>Customers must provide truthful information, submit only documents they are legally entitled to provide, use the platform lawfully, cooperate with required verification, and retain order/payment references. Forged documents, impersonation, and misuse are prohibited.</p>

              <h3>9. Service Availability</h3>
              <p>Services may be unavailable due to maintenance, technical problems, procedural changes, or unavailability of relevant systems. Services may be suspended where necessary, subject to applicable obligations.</p>

              <h3>10. Limitation of Responsibility</h3>
              <p>To the extent permitted by law, the platform is not responsible for delays or decisions made by external authorities or systems beyond its control. Nothing excludes liability that cannot legally be excluded.</p>

              <h3>11. Refunds and Cancellations</h3>
              <p>Refunds and cancellations are governed by the separate Refund & Cancellation Policy.</p>

              <h3>12. Intellectual Property</h3>
              <p>Website content, branding, design elements, and materials owned by Apna Digital Service may not be copied or reused without permission, except as permitted by law.</p>

              <h3>13. Changes to Terms</h3>
              <p>Revised terms will be published on the website with an updated date.</p>

              <h3>14. Contact and Governing Law</h3>
              <p>Questions: 8018246567 / 9124494239. Support hours: every day, 9:00 AM to 9:00 PM. These terms are subject to applicable laws of India.</p>
            </div>
          </div>
        );

      case 'refund':
        return (
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>
              Refund & Cancellation Policy
            </h1>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: '28px' }}>
              Last Updated: October 2026
            </div>

            <div className="policy-section-block">
              <h3>1. One-Time Premium Purchase / Registration Fee</h3>
              <p>The one-time premium purchase or registration fee is non-refundable once the purchase has been successfully completed and the premium access has been activated. Customers are advised to review the available features, services, and applicable terms before completing their purchase.</p>

              <h3>2. Individual Service Fees</h3>
              <p>Service fees paid for individual service requests are eligible for a refund if Apna Digital Service is unable to provide the purchased service for reasons attributable to our platform or service team. If the service cannot be delivered, the customer may contact our support team with the order ID and payment reference. The request will be reviewed, and an eligible refund will be processed through the applicable payment method.</p>

              <h3>3. Duplicate or Failed Payments</h3>
              <p>If a payment is deducted more than once for the same transaction, or payment is successful but the service request is not created, the customer should contact support with the transaction reference. After verification, the applicable refund or resolution will be provided.</p>

              <h3>4. Incorrect Details or Customer-Related Issues</h3>
              <p>Customers are responsible for submitting accurate information and the required documents. If a request cannot be completed because of incorrect information, missing documents, failure to complete required verification, or customer ineligibility, refund eligibility will be assessed according to the circumstances and applicable law.</p>

              <h3>5. Government Approval and External Systems</h3>
              <p>Apna Digital Service does not guarantee approval or issuance of any government-related document. Delays or rejection by an external authority do not automatically qualify for a refund if the purchased assistance has already been provided. However, if our team fails to deliver the purchased service, the request will be reviewed under this policy.</p>

              <h3>6. Refund Processing</h3>
              <p>Approved refunds will be processed through the applicable payment method. The time taken for the refund to appear in the customer's account may depend on the payment provider and banking system.</p>

              <h3>7. How to Request a Refund</h3>
              <p>Please contact our support team and provide: Order or request ID, Payment transaction reference, and Reason for the refund request. Please do not share passwords or OTPs.</p>

              <h3>8. Customer Support</h3>
              <p>Phone: 8018246567 / 9124494239. Support Hours: Every day, 9:00 AM to 9:00 PM.</p>

              <h3>9. Policy Updates</h3>
              <p>Any updates to this policy will be published on the website. This policy is subject to applicable laws of India.</p>
            </div>
          </div>
        );

      case 'disclaimer':
        return (
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>
              Service Disclaimer
            </h1>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: '28px' }}>
              Official Platform Notice
            </div>

            <div className="policy-section-block">
              <div style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                marginBottom: '24px',
                color: '#78350f',
                lineHeight: '1.7'
              }}>
                <h3 style={{ color: '#92400e', marginBottom: '10px' }}>Private Enterprise Statement</h3>
                <p>
                  Apna Digital Service is a privately operated digital documentation assistance platform. It is <strong>NOT a government website, government department, or official government portal</strong>.
                </p>
                <p>
                  We provide assistance with eligible document-related requests through applicable authorized systems and procedures. Availability, processing, verification, approval, correction, addition, and issuance depend on service requirements, customer eligibility, and the applicable authority's processes.
                </p>
                <p>
                  <strong>We do not guarantee approval or issuance of any document.</strong> Customers must provide accurate information and complete required verification through the applicable authorized process. Service fees, requirements, and availability may vary. Review the relevant service page before submitting a request or making payment.
                </p>
              </div>

              <h3>Facilitation & Public Records</h3>
              <p>
                All brand names, trademarks, and references to government schemes (such as PAN, Voter ID / e-EPIC, Sarathi DL, Vahan RC, Ayushman Bharat PM-JAY) remain the property of their respective official authorities. Their mention here is purely indicative of the assistance services offered to citizens.
              </p>
            </div>
          </div>
        );

      case 'privacy':
      default:
        return (
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>
              Privacy Policy
            </h1>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: '28px' }}>
              Last Updated: October 2026
            </div>

            <div className="policy-section-block">
              <h3>1. Introduction</h3>
              <p>Apna Digital Service (“we”, “our”, or “us”) respects the privacy of visitors and customers. This policy explains how information may be collected, used, stored, and protected when you use the platform.</p>

              <h3>2. Information We May Collect</h3>
              <p>Depending on the service, we may collect name and contact details, information required to identify the relevant document or service, supporting documents, payment transaction references and status, and service request/order/communication records. We aim to collect only information reasonably necessary for the requested service.</p>

              <h3>3. How We Use Information</h3>
              <p>Information may be used to process requests, verify submitted information where required, communicate updates, confirm payments and manage refunds, respond to enquiries, maintain security, prevent misuse, and meet applicable legal obligations.</p>

              <h3>4. Authorized Processing</h3>
              <p>Where required, relevant information may be processed through applicable authorized systems or shared with service providers involved in completing the requested service, subject to applicable requirements.</p>

              <h3>5. Payment Information</h3>
              <p>Payments may be processed through third-party payment providers. Their applicable processes and security practices may apply. Customers should retain transaction references.</p>

              <h3>6. Data Security</h3>
              <p>Reasonable measures should be taken to protect information against unauthorized access, loss, misuse, or disclosure. Access should be limited to authorized personnel who need it for service processing. No online system can be guaranteed completely secure.</p>

              <h3>7. Data Retention and Deletion</h3>
              <p>Information should be retained only as long as reasonably necessary for service delivery, recordkeeping, dispute resolution, security, and applicable legal requirements. Requests concerning access, correction, or deletion will be handled subject to applicable legal and operational requirements.</p>

              <h3>8. Cookies and Technical Information</h3>
              <p>The website may use cookies or similar technologies for essential functionality, security, and performance. Any additional tracking or analytics should be disclosed where applicable.</p>

              <h3>9. Third-Party Services</h3>
              <p>Third-party payment providers and other service providers may process information under their own applicable terms and privacy practices.</p>

              <h3>10. Children's Information</h3>
              <p>Where a service involves a minor's information, required parent/guardian involvement and applicable legal safeguards must be followed.</p>

              <h3>11. Changes to This Policy</h3>
              <p>Updates will be published on this page when services, website functionality, or legal obligations change.</p>

              <h3>12. Contact</h3>
              <p>Privacy enquiries: 8018246567 / 9124494239. Support hours: every day, 9:00 AM to 9:00 PM.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '50px 24px 80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--slate-600)', marginBottom: '24px', fontWeight: '600' }}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--slate-200)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '32px',
          overflowX: 'auto'
        }}>
          <Link 
            to="/privacy-policy" 
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              fontWeight: '700',
              background: policyType === 'privacy' ? '#ffffff' : 'transparent',
              color: policyType === 'privacy' ? 'var(--navy-900)' : 'var(--slate-600)',
              whiteSpace: 'nowrap'
            }}
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms" 
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              fontWeight: '700',
              background: policyType === 'terms' ? '#ffffff' : 'transparent',
              color: policyType === 'terms' ? 'var(--navy-900)' : 'var(--slate-600)',
              whiteSpace: 'nowrap'
            }}
          >
            Terms & Conditions
          </Link>
          <Link 
            to="/refund-policy" 
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              fontWeight: '700',
              background: policyType === 'refund' ? '#ffffff' : 'transparent',
              color: policyType === 'refund' ? 'var(--navy-900)' : 'var(--slate-600)',
              whiteSpace: 'nowrap'
            }}
          >
            Refund & Cancellation
          </Link>
          <Link 
            to="/disclaimer" 
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              fontWeight: '700',
              background: policyType === 'disclaimer' ? '#ffffff' : 'transparent',
              color: policyType === 'disclaimer' ? 'var(--navy-900)' : 'var(--slate-600)',
              whiteSpace: 'nowrap'
            }}
          >
            Service Disclaimer
          </Link>
        </div>

        {/* Document Body */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          padding: '40px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
}
