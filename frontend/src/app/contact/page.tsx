"use client"; // REQUIRED FOR JAVASCRIPT

import './contact.css';
import Link from 'next/link';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { submitContactForm } from '@/app/actions';

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // 1. Hero Typewriter State
  const [typingText, setTypingText] = useState("");
  const fullText = "Contact & Support";

  // 2. CTA Typewriter State
  const [ctaText, setCtaText] = useState("");
  const ctaFullText = "Join The Community";
  const hasTypedCta = useRef(false);

  // Ref for CTA Scroll Animation
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // --- HERO TYPEWRITER EFFECT ---
    let i = 0;
    const typeTimer = setInterval(() => {
      if (i < fullText.length) {
        setTypingText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeTimer);
      }
    }, 100);

    // --- CTA SCROLL REVEAL & TYPEWRITER ---
    let ctaTimer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');

            if (entry.target === ctaRef.current && !hasTypedCta.current) {
              hasTypedCta.current = true;
              let j = 0;
              ctaTimer = setInterval(() => {
                if (j < ctaFullText.length) {
                  setCtaText(ctaFullText.substring(0, j + 1));
                  j++;
                } else {
                  if (ctaTimer) clearInterval(ctaTimer);
                }
              }, 80);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => {
      clearInterval(typeTimer);
      if (ctaTimer) clearInterval(ctaTimer);
      observer.disconnect();
    };
  }, []);

  // REAL FORM SUBMISSION TO MONGODB
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('loading');

    // Save form reference before await
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Call the server action
    const result = await submitContactForm(formData);

    if (result.success) {
      setFormStatus('success');
      form.reset(); // Clear the form
      setTimeout(() => setFormStatus('idle'), 4000);
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  // Smooth scroll to form
  const scrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section with Typewriter */}
      <section className="hero-small">
        <div className="container">
          <div className="hero-content">
            <h1>
              {typingText}
              <span className="typewriter-cursor">&nbsp;</span>
            </h1>
            <p>We'd love to hear from you! If you have any questions, suggestions, or need support, feel free to reach out.</p>
            <div className="quick-actions">
              <a href="#contact-form" onClick={scrollToForm} className="btn btn-primary">Send a Message</a>
              <Link href="/" className="btn btn-outline">Back to Home</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Intro */}
      <section className="contact-intro">
        <div className="container">
          <div className="intro-content">
            <p>Reach out through any of the channels below or send us a direct message using the form.</p>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section">
        <div className="container">
          <div className="section-header"><h2>CONTACT & SUPPORT</h2></div>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">✉️</div>
              <h3>Email</h3>
              <p>Send us a direct message for inquiries, support, or general questions.</p>
              <a href="mailto:Expolskanochapter@gmail.com" className="contact-link">Send Email →</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📷</div>
              <h3>Instagram</h3>
              <p>Follow our updates, events, and alumni stories on our official page.</p>
              <a href="https://www.instagram.com/expols__kano__division?igsh=MXJ0MmkzdWNlOWV4Zg==" target="_blank" rel="noopener noreferrer" className="contact-link">Follow Us →</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">👍</div>
              <h3>Facebook</h3>
              <p>Join our community group for discussions, announcements, and updates.</p>
              <a href="https://www.facebook.com/profile.php?id=61564225933835" target="_blank" rel="noopener noreferrer" className="contact-link">Like Page →</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">🎵</div>
              <h3>TikTok</h3>
              <p>Watch our latest videos, highlights, and behind-the-scenes content.</p>
              <a href="https://www.tiktok.com/@expols_kano_chapter?_r=1&_t=ZS-96zPZBuTXjb" target="_blank" rel="noopener noreferrer" className="contact-link">Follow Us →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section" style={{background: 'var(--white)'}} id="contact-form">
        <div className="container">
          <div className="contact-form-wrapper">
            <div className="form-container">
              <h3>Send Us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" name="email" placeholder="your.email@example.com" required />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" name="subject" placeholder="How can we help?" />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea name="message" rows={5} placeholder="Write your message here..." required></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block"
                  disabled={formStatus === 'loading'}
                  style={{ opacity: formStatus === 'loading' ? 0.7 : 1 }}
                >
                  {formStatus === 'loading' ? 'Sending...' : 
                   formStatus === 'success' ? '✅ Message Sent!' : 
                   formStatus === 'error' ? '❌ Failed to Send' : 'Send Message'}
                </button>
              </form>
            </div>
            <div className="info-container">
              <h3>📍 Our Location</h3>
              <div className="map-placeholder">
                <p><strong>EX-POLS KANO Base</strong></p>
                <p>Force Education Unit</p>
                <p>Kano State, Nigeria</p>
                <p className="office-hours">Office hours: Mon-Fri, 9AM-5PM</p>
              </div>
              <h3>📞 Contact Numbers</h3>
              <div className="quick-info">
                <ul>
                  <li>📱 09069694848</li>
                  <li>📱 08060051410</li>
                  <li>✉️ Expolskanochapter@gmail.com</li>
                </ul>
              </div>
              <h3>⚡ Quick Info</h3>
              <div className="quick-info">
                <ul>
                  <li>✅ Response time: 24-48 hours</li>
                  <li>✅ Alumni verification available</li>
                  <li>✅ Event inquiries welcome</li>
                  <li>✅ Partnership opportunities</li>
                </ul>
              </div>
              <h3>Find Us on Map</h3>
              <div className="map-embed">
                <p style={{textAlign: 'center', color: 'var(--text-light)'}}>Interactive map coming soon!<br/>Location: Kano State, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Scroll Reveal & Typewriter */}
      <section className="cta-section" ref={ctaRef}>
        <div className="container">
          <h2>
            {ctaText}
            <span className="typewriter-cursor">&nbsp;</span>
          </h2>
          <p>Connect with fellow alumni, access exclusive opportunities, and be part of something greater.</p>
          <Link href="/registration" className="btn btn-primary">Register Now</Link>
        </div>
      </section>
    </>
  );
}