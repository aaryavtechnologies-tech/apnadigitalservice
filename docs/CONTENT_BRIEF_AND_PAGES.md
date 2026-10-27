# APNA DIGITAL SERVICE
## Complete Website Requirements, Content Brief & Pages Copy
*Extracted from official client brief (`docs/Apna_Digital_Service_Content_Brief.pdf`)*

---

## 1. Business Information
- **Business Name**: APNA DIGITAL SERVICE
- **Brand Subtitle / Trade**: Apna Pan Agency
- **Domain**: `www.apnadigitalservice.com`
- **Business Model**: Private online, backend-assisted digital documentation and application assistance platform.
- **Business Description**:
  Apna Digital Service is a privately operated online platform designed to make digital documentation and related assistance more convenient for customers across India. Customers can select a service, submit the required details and documents, and place a service request online. Our backend team reviews and processes eligible requests through applicable authorized systems and procedures, subject to eligibility, verification requirements, and service availability.
- **Important Disclaimer**:
  Apna Digital Service is a private business platform and is **NOT a government website, government department, or official government portal**. We do not guarantee approval or issuance of any government document.
- **Primary Contacts**:
  - Customer Support Phone: `8018246567` / `9124494239`
  - DL & RC Special Support: `9078620775`
  - Support Hours: Every day, 9:00 AM to 9:00 PM IST
  - Support Email: `help.apnadigitalservice@gmail.com`
  - Super Admin: Meher (`help.apnadigitalservice@gmail.com`)

---

## 2. All Seven (7) Initial Services — Detail Copy & Workflows

### Service 1: Voter ID / e-EPIC PDF Download Assistance
- **Slug**: `voter-id-pdf`
- **Short Name**: Voter ID PDF (Without OTP)
- **Description**: Assistance for customers who need to download an available Voter ID / e-EPIC PDF, especially helpful when mobile number is not linked or OTP is unavailable.
- **Workflow**:
  1. Customer submits the required voter identification details (EPIC number, State, Name).
  2. The backend team reviews and processes the request through the applicable authorized system.
  3. The available PDF is delivered online / via WhatsApp, subject to verification and access.
- **Requirements**: Voter EPIC Number or Name & Assembly details; State; WhatsApp number.
- **Form Link**: `https://forms.gle/dR8S5SBYRM9qrfvF8`
- **Dedicated Helpline**: `+91 9124494239`
- **Status**: Active Live Service

### Service 2: PAN Card PDF Download Assistance
- **Slug**: `pan-card-pdf`
- **Short Name**: PAN Card PDF Download
- **Description**: Assistance for customers who need to download an available PAN Card digital PDF copy (e-PAN).
- **Workflow**:
  1. Customer submits the required PAN identification details and verification information.
  2. The backend team processes the request through the applicable authorized system.
  3. The available PAN PDF is delivered online / via WhatsApp, subject to applicable rules and verification.
- **Requirements**: PAN Number or Aadhaar link details, Date of Birth, WhatsApp number.
- **Form Link**: `https://forms.gle/o2AfsRZuxcPpYBnL9`
- **Dedicated Helpline**: `+91 9124494239`
- **Status**: Active Live Service

### Service 3: Driving Licence (DL) PDF Download Assistance
- **Slug**: `driving-licence-pdf`
- **Short Name**: Driving Licence (DL) PDF
- **Description**: Assistance for customers who need to download an available verified digital Driving Licence PDF copy.
- **Workflow**:
  1. Customer provides the required driving licence details.
  2. The backend team processes the request through the applicable authorized system (Sarathi).
  3. The available digital document is delivered online, subject to verification and access.
- **Requirements**: Driving Licence Number, Date of Birth, State / RTO.
- **Form Link**: `https://forms.gle/DrgRW485k9QDQTf28`
- **Dedicated Helpline**: `+91 9078620775`
- **Status**: Active Live Service

### Service 4: Vehicle Registration Certificate (RC) PDF Download Assistance
- **Slug**: `vehicle-rc-pdf`
- **Short Name**: Vehicle RC PDF Download
- **Description**: Assistance for customers who need to download an available Vehicle Registration Certificate (RC) PDF.
- **Workflow**:
  1. Customer provides the required vehicle registration details.
  2. The backend team processes the request through the applicable authorized system (Vahan).
  3. The available RC PDF is delivered online, subject to verification and access.
- **Requirements**: Vehicle Registration Number (Plate Number), Chassis Number / Engine Number (last 5 digits).
- **Form Link**: `https://forms.gle/ffutHMr4xa6yDMHZA`
- **Dedicated Helpline**: `+91 9078620775`
- **Status**: Active Live Service

### Service 5: Ayushman Card — New Member Addition Assistance
- **Slug**: `ayushman-new-member`
- **Short Name**: Ayushman New Member
- **Description**: Assistance with eligible requests to add a family member or beneficiary to an Ayushman scheme record, where the official system permits it.
- **Workflow**:
  1. Customer submits the required family/member details and supporting documents.
  2. The backend team reviews and processes eligible cases through the authorized Ayushman system.
  3. Additional documents or verification may be required.
  4. Any addition is subject to official eligibility checks and approval.
- **Requirements**: Existing Ration Card / Family ID, Aadhaar of new member, relationship proof.
- **Dedicated Helpline**: `+91 8018246567` / `+91 9124494239`
- **Status**: Phase 2 Service (Configurable via Admin)

### Service 6: Ayushman Card — Correction Assistance
- **Slug**: `ayushman-correction`
- **Short Name**: Ayushman Card Correction
- **Description**: Assistance with eligible corrections to an existing Ayushman Card or associated beneficiary details, where permitted by the official system.
- **Workflow**:
  1. Customer submits the existing card/member details and supporting documents.
  2. Customer specifies the correction required (e.g. spelling, DOB, gender).
  3. The backend team reviews and processes the eligible request through the authorized system.
  4. Additional documents or verification may be required.
  5. Completion depends on official verification and approval.
- **Requirements**: PM-JAY / ABHA ID, Aadhaar Card, proof of correction.
- **Dedicated Helpline**: `+91 8018246567` / `+91 9124494239`
- **Status**: Phase 2 Service (Configurable via Admin)

### Service 7: Ayushman Card — e-KYC Assistance
- **Slug**: `ayushman-ekyc`
- **Short Name**: Ayushman e-KYC
- **Description**: Assistance to eligible beneficiaries who need to complete Ayushman Card e-KYC through the applicable authorized system.
- **Workflow**:
  1. Customer submits the required Ayushman Card or beneficiary details.
  2. The backend team reviews the request and assists with e-KYC through the authorized system.
  3. OTP, biometric authentication, or other verification may be required according to the official process.
  4. Completion is subject to beneficiary eligibility, successful verification, and official system availability.
- **Requirements**: Beneficiary ID / Aadhaar number, mobile number for biometric/e-KYC consent.
- **Dedicated Helpline**: `+91 8018246567` / `+91 9124494239`
- **Status**: Phase 2 Service (Configurable via Admin)

---

## 3. Dynamic Architecture Requirement: Super Admin Service Additions
> ⚡ **CRITICAL ARCHITECTURAL DIRECTIVE**:
> Whenever a Super Admin adds a new service (via Admin Panel or database), the platform must:
> 1. Dynamically render a Service Card on the Home Page.
> 2. Dynamically provision a dedicated Service Page (`/service/:slug`) with its own description, requirements, steps, disclaimer, Google Form link, and WhatsApp support.
> 3. Store service metadata in a centralized store (`servicesData.js` / Supabase `services` table).

---

## 4. About Apna Digital Service
**Headline**: About Apna Digital Service  
Apna Digital Service is a privately operated online platform designed to make digital documentation and related assistance more convenient for customers across India.

Our platform allows customers to submit service requests and required information online. Our backend team reviews each request and provides assistance through applicable authorized systems and procedures.

We aim to offer a simple, organized, and customer-friendly experience through online request submission, service updates, and dedicated support.

- **Our Mission**: To make digital documentation assistance more accessible and convenient through a reliable online service experience.
- **Our Approach**: Simple online requests, responsible document handling, transparent service information, and customer-focused support.
- **Core Truth**: Apna Digital Service is a private business platform and is not a government website or government department.

---

## 5. How It Works (6-Step Official Lifecycle)
1. **Choose a Service**: Browse available services and select the service you require.
2. **Submit Your Details**: Complete the relevant form and upload required documents securely, wherever applicable.
3. **Complete Your Assistance Confirmation**: Review the applicable service assistance terms and settle payment/confirmation directly with support.
4. **Request Processing**: Our backend team reviews your request and assists through authorized systems, subject to eligibility and verification requirements.
5. **Track Your Request**: Use your request/order ID to check the status of your service request.
6. **Receive Your Service Result**: Once processing is complete, the available document or service result will be provided online / WhatsApp wherever applicable.

*Important*: Processing times may vary depending on the service, verification requirements, and official system availability. Submission does not guarantee approval or issuance.

---

## 6. Complete FAQ Repository (All 12 Official Questions)
1. **What is Apna Digital Service?**  
   Apna Digital Service is a privately operated online platform that provides digital documentation assistance and related online services.
2. **Who can use the platform?**  
   Customers from across India may submit service requests, subject to the eligibility and requirements of the selected service.
3. **Which services are available?**  
   Our initial services include Voter ID PDF Download, PAN Card PDF Download, Driving Licence PDF Download, RC PDF Download, Ayushman Card New Member Addition, Ayushman Card Correction, and Ayushman Card e-KYC assistance.
4. **How do I request a service?**  
   Select the required service, complete the relevant form, provide the necessary information and documents, and complete the applicable confirmation.
5. **Which documents are required?**  
   Requirements depend on the selected service. Please check the relevant service page before submitting your request.
6. **How long does processing take?**  
   Processing times vary according to the service, verification requirements, and official system availability. An estimate will be communicated where available.
7. **Is service approval guaranteed?**  
   No. Approval, correction, addition, verification, or document issuance is subject to applicable rules, eligibility checks, and the relevant authority.
8. **How can I check my request status?**  
   Use your order/request ID through the available tracking facility, or contact customer support.
9. **What if payment succeeds but my request is not confirmed?**  
   Keep your payment receipt or transaction reference and contact our support team.
10. **How can I contact customer support?**  
    Call 8018246567 or 9124494239. Support is available every day from 9:00 AM to 9:00 PM IST.
11. **Is Apna Digital Service a government website?**  
    No. Apna Digital Service is a private business platform and is not a government website or government department.
12. **How can I request a refund or cancellation?**  
    Please refer to the Refund and Cancellation Policy for applicable terms and procedures.

---

## 7. Contact Us Page Content
- **Business**: Apna Digital Service
- **Commitment**: We are committed to helping customers with their digital documentation and service requests. For service, payment, request status, or document delivery enquiries, please contact our support team.
- **Customer Support Numbers**: `8018246567` / `9124494239` / `9078620775`
- **Support Hours**: Every day, 9:00 AM to 9:00 PM.
- **Support Categories**:
  - Service-related enquiries
  - Assistance with submitted requests
  - Payment confirmation and transaction queries
  - Request status updates
  - Document delivery assistance
  - General customer support
- **Guidance**: For faster assistance, keep your order/request ID available. Do not share passwords, OTPs, or unnecessary sensitive information through public messages.

---

## 8. Complete Policy Documents

### Privacy Policy (12 Sections)
1. **Introduction**: Apna Digital Service (“we”, “our”, or “us”) respects the privacy of visitors and customers. This policy explains how information may be collected, used, stored, and protected when you use the platform.
2. **Information We May Collect**: Depending on the service, we may collect name and contact details, information required to identify the relevant document or service, supporting documents, payment transaction references and status, and service request/order/communication records. We aim to collect only information reasonably necessary for the requested service.
3. **How We Use Information**: Information may be used to process requests, verify submitted information where required, communicate updates, confirm payments and manage refunds, respond to enquiries, maintain security, prevent misuse, and meet applicable legal obligations.
4. **Authorized Processing**: Where required, relevant information may be processed through applicable authorized systems or shared with service providers involved in completing the requested service, subject to applicable requirements.
5. **Payment Information**: Payments may be processed through third-party payment providers. Their applicable processes and security practices may apply. Customers should retain transaction references.
6. **Data Security**: Reasonable measures should be taken to protect information against unauthorized access, loss, misuse, or disclosure. Access should be limited to authorized personnel who need it for service processing. No online system can be guaranteed completely secure.
7. **Data Retention and Deletion**: Information should be retained only as long as reasonably necessary for service delivery, recordkeeping, dispute resolution, security, and applicable legal requirements. Requests concerning access, correction, or deletion will be handled subject to applicable legal and operational requirements.
8. **Cookies and Technical Information**: The website may use cookies or similar technologies for essential functionality, security, and performance. Any additional tracking or analytics should be disclosed where applicable.
9. **Third-Party Services**: Third-party payment providers and other service providers may process information under their own applicable terms and privacy practices.
10. **Children’s Information**: Where a service involves a minor’s information, required parent/guardian involvement and applicable legal safeguards must be followed.
11. **Changes to This Policy**: Updates will be published on this page when services, website functionality, or legal obligations change.
12. **Contact**: Privacy enquiries: 8018246567 / 9124494239. Support hours: every day, 9:00 AM to 9:00 PM.

### Terms & Conditions (14 Sections)
1. **Acceptance of Terms**: By accessing or using the website, you agree to these Terms & Conditions. If you do not agree, discontinue use of the platform.
2. **Nature of Our Business**: Apna Digital Service is a privately operated online platform providing digital documentation assistance and related services. It is not a government website, department, or official government portal and does not claim government affiliation or endorsement unless expressly authorized.
3. **Service Requests**: Customers must provide accurate, complete, and lawful information. Incomplete, incorrect, inconsistent, or unverifiable information may delay or prevent processing.
4. **Eligibility and Verification**: Services are subject to applicable eligibility criteria, verification requirements, and procedures. Additional verification, including OTP or biometric authentication, may be required through the applicable authorized process.
5. **Service Fees and Payments**: Applicable fees will be displayed or communicated before payment. Customers should review the selected service and fee before paying. Additional charges must be disclosed before collection.
6. **Processing Time**: Processing times may vary with the service, verification requirements, technical availability, and actions required by relevant authorities. Estimates are indicative unless expressly stated otherwise.
7. **No Guarantee of Approval**: Submitting a request does not guarantee approval, correction, addition, verification, or issuance of a document. Final decisions remain subject to applicable rules and relevant authority processes.
8. **Customer Responsibilities**: Customers must provide truthful information, submit only documents they are legally entitled to provide, use the platform lawfully, cooperate with required verification, and retain order/payment references. Forged documents, impersonation, and misuse are prohibited.
9. **Service Availability**: Services may be unavailable due to maintenance, technical problems, procedural changes, or unavailability of relevant systems. Services may be suspended where necessary, subject to applicable obligations.
10. **Limitation of Responsibility**: To the extent permitted by law, the platform is not responsible for delays or decisions made by external authorities or systems beyond its control. Nothing excludes liability that cannot legally be excluded.
11. **Refunds and Cancellations**: Refunds and cancellations are governed by the separate Refund & Cancellation Policy.
12. **Intellectual Property**: Website content, branding, design elements, and materials owned by Apna Digital Service may not be copied or reused without permission, except as permitted by law.
13. **Changes to Terms**: Revised terms will be published on the website with an updated date.
14. **Contact and Governing Law**: Questions: 8018246567 / 9124494239. Support hours: every day, 9:00 AM to 9:00 PM. These terms are subject to applicable laws of India.

### Refund & Cancellation Policy (9 Sections)
1. **One-Time Premium Purchase / Registration Fee**: The one-time premium purchase or registration fee is non-refundable once the purchase has been successfully completed and the premium access has been activated. Customers are advised to review the available features, services, and applicable terms before completing their purchase.
2. **Individual Service Fees**: Service fees paid for individual service requests are eligible for a refund if Apna Digital Service is unable to provide the purchased service for reasons attributable to our platform or service team. If the service cannot be delivered, the customer may contact our support team with the order ID and payment reference. The request will be reviewed, and an eligible refund will be processed through the applicable payment method.
3. **Duplicate or Failed Payments**: If a payment is deducted more than once for the same transaction, or payment is successful but the service request is not created, the customer should contact support with the transaction reference. After verification, the applicable refund or resolution will be provided.
4. **Incorrect Details or Customer-Related Issues**: Customers are responsible for submitting accurate information and the required documents. If a request cannot be completed because of incorrect information, missing documents, failure to complete required verification, or customer ineligibility, refund eligibility will be assessed according to the circumstances and applicable law.
5. **Government Approval and External Systems**: Apna Digital Service does not guarantee approval or issuance of any government-related document. Delays or rejection by an external authority do not automatically qualify for a refund if the purchased assistance has already been provided. However, if our team fails to deliver the purchased service, the request will be reviewed under this policy.
6. **Refund Processing**: Approved refunds will be processed through the applicable payment method. The time taken for the refund to appear in the customer's account may depend on the payment provider and banking system.
7. **How to Request a Refund**: Please contact our support team and provide Order or request ID, Payment transaction reference, and Reason for the refund request. Please do not share passwords or OTPs.
8. **Customer Support**: Phone: 8018246567 / 9124494239. Support Hours: Every day, 9:00 AM to 9:00 PM.
9. **Policy Updates**: Any updates to this policy will be published on the website. This policy is subject to applicable laws of India.

### Service Disclaimer
Apna Digital Service is a privately operated digital documentation assistance platform. It is not a government website, government department, or official government portal.
We provide assistance with eligible document-related requests through applicable authorized systems and procedures. Availability, processing, verification, approval, correction, addition, and issuance depend on service requirements, customer eligibility, and the applicable authority’s processes.
We do not guarantee approval or issuance of any document. Customers must provide accurate information and complete required verification through the applicable authorized process. Service fees, requirements, and availability may vary. Review the relevant service page before submitting a request or making payment.
