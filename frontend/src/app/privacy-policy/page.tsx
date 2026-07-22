import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Nigerian Police Ambassadors Expols (NPAE)',
  description: 'Privacy Policy for the Nigerian Police Ambassadors Expols (NPAE) National Base website.',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Poppins, sans-serif', lineHeight: 1.8, color: '#333' }}>
      <h1 style={{ color: '#003366', fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>Privacy Policy</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
        <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>1. Introduction</h2>
        <p>Welcome to the Nigerian Police Ambassadors Expols (NPAE) website ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including alumni registration, ambassador applications, reunion registrations, and member validation across all State Bases nationwide.</p>
        <p>By using our website, you consent to the data practices described in this policy.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>2. Information We Collect</h2>
        <p>We collect information that you provide directly to us when you register, fill out forms, or contact us. This includes:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Personal Identification:</strong> Full name, other names, gender, date of birth, National Identity Number (NIN), phone number, email address, and residential address.</li>
          <li><strong>Photographs & Documents:</strong> Passport photographs, SSCE certificates, and other supporting documents uploaded during registration.</li>
          <li><strong>Academic & Professional History:</strong> School attended, admission number, year of admission/graduation, highest qualification, current occupation, and organization.</li>
          <li><strong>Base Affiliation:</strong> Your State Base assignment and School Base information for proper member categorization.</li>
          <li><strong>Financial Information:</strong> Payment details processed securely through our third-party payment gateway (Paystack) for reunion tickets. <em>Note: We do not store your credit card or bank details on our servers.</em></li>
          <li><strong>Communications:</strong> Messages, subject lines, and contact details submitted via our contact form.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>3. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Identity Verification:</strong> To verify your status as an alumnus or ambassador and generate your unique National Identity Number (NPAE/[BaseCode]/[Year]/[Sequence]) and ID Card.</li>
          <li><strong>Communication:</strong> To send you important updates, broadcasts, newsletters, and information about upcoming reunions and events.</li>
          <li><strong>Event Management:</strong> To process your registration and payments for the annual NPAE National Reunion.</li>
          <li><strong>Networking:</strong> To facilitate connections and networking among alumni and ambassadors across all State Bases.</li>
          <li><strong>Security & Validation:</strong> To allow authorized personnel to validate the membership status of individuals using our public validation tool.</li>
          <li><strong>Audit & Compliance:</strong> To maintain audit logs of administrative actions for security and compliance purposes.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>4. How We Share Your Information</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Service Providers:</strong> With trusted third-party services that assist us in operating our website (e.g., Paystack for payments, Resend for email delivery, and MongoDB Atlas for secure database hosting).</li>
          <li><strong>Legal Requirements:</strong> If required to do so by law, court order, or governmental authority, or to protect the rights and safety of NPAE and its members.</li>
          <li><strong>With Your Consent:</strong> For any other purpose disclosed to you at the time we collect the information, with your explicit permission.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>5. Data Security</h2>
        <p>We implement robust administrative, technical, and physical security measures to protect your personal information. Your data is stored in secure, encrypted databases with the following protections:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Encryption:</strong> All passwords are hashed using bcrypt before storage.</li>
          <li><strong>Access Control:</strong> Access to sensitive information is restricted to authorized administrators with role-based permissions (Super Admin and Base Admin).</li>
          <li><strong>Audit Logging:</strong> All administrative actions (logins, approvals, deletions) are tracked with timestamps and IP addresses.</li>
          <li><strong>Soft Deletes:</strong> Data is never permanently deleted without proper authorization, preventing accidental data loss.</li>
          <li><strong>Rate Limiting:</strong> Protection against brute force attacks on login endpoints.</li>
        </ul>
        <p>However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>6. Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. We use:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Session Cookies:</strong> For maintaining your login session (stored as HttpOnly Secure Cookies).</li>
          <li><strong>Authentication Cookies:</strong> To verify your identity when accessing protected areas.</li>
        </ul>
        <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website (such as logging into your dashboard).</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>7. Your Data Protection Rights</h2>
        <p>Under the Nigeria Data Protection Act (NDPA) 2023, you have the following rights regarding your personal data:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you via your User Dashboard.</li>
          <li><strong>Right to Rectification:</strong> You can request that we correct any information you believe is inaccurate or incomplete.</li>
          <li><strong>Right to Erasure:</strong> You can request that we delete your personal data, subject to certain legal exceptions. Note: We use soft deletion, meaning data is archived rather than permanently destroyed unless explicitly requested.</li>
          <li><strong>Right to Restrict Processing:</strong> You can request that we restrict the processing of your personal data.</li>
          <li><strong>Right to Withdraw Consent:</strong> Where we rely on consent to process your data, you have the right to withdraw this consent at any time.</li>
        </ul>
        <p>To exercise any of these rights, please contact us using the details provided in Section 10.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>8. Data Retention</h2>
        <p>We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies. Audit logs are retained for security and compliance purposes.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>9. Children's Privacy</h2>
        <p>Our website is intended for adults (18 years and older). We do not knowingly collect personally identifiable information from children under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>10. Changes to This Privacy Policy</h2>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>11. Contact Us</h2>
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
        <div style={{ background: '#f8f9fc', padding: '20px', borderRadius: '12px', marginTop: '15px', borderLeft: '4px solid #003366' }}>
          <p style={{ margin: '0 0 10px 0' }}><strong>Nigerian Police Ambassadors Expols (NPAE)</strong></p>
          <p style={{ margin: '0 0 10px 0' }}>📧 Email: <a href="mailto:privacy@npae.org.ng" style={{ color: '#003366', textDecoration: 'none' }}>privacy@npae.org.ng</a></p>
          <p style={{ margin: 0 }}>📍 National Headquarters: Nigeria</p>
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
        <Link href="/" style={{ color: '#003366', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
      </div>
    </div>
  );
}