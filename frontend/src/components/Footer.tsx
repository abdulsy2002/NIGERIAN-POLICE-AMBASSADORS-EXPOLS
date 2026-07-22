import Link from "next/link";

export default function Footer() {
  return (
    <footer id="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-heading">Nigerian Police Ambassadors Expols</h3>
            <p className="footer-text">NPAE - National Base. Promoting unity, discipline, and networking among former Police Secondary School students across all 36 states and the FCT.</p>
            <div className="social-icons">
              <a href="https://www.facebook.com/profile.php?id=61564225933835" target="_blank" rel="noopener noreferrer" className="social-icon">f</a>
              <a href="https://www.instagram.com/npae_national" target="_blank" rel="noopener noreferrer" className="social-icon">ig</a>
              <a href="https://www.tiktok.com/@npae_national" target="_blank" rel="noopener noreferrer" className="social-icon">tt</a>
            </div>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/register">Register</Link></li>
              <li><Link href="/ambassador">Become an Ambassador</Link></li>
              <li><Link href="/reunion">Reunion</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Support</h4>
            <ul>
              <li><Link href="/faqs">FAQs</Link></li>
              <li><Link href="/validate">Validate Member</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4 className="footer-heading">Contact Info</h4>
            <p>📍 National Headquarters, Nigeria</p>
            <p>✉️ expolskanochapter@gmail.com</p>
            <p>📞 09069694848</p>
            <p>📞 08060051410</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Nigerian Police Ambassadors Expols (NPAE) - National Base. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}