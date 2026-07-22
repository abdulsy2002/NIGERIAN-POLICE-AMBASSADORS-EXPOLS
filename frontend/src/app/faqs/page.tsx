"use client";
import './faqs.css';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function FaqsPage() {
  // State to track which FAQ is currently open
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  // 1. Hero Typewriter State
  const [heroText, setHeroText] = useState("");
  const fullHeroText = "Help Center";

  // 2. CTA Typewriter State
  const [ctaText, setCtaText] = useState("");
  const ctaFullText = "Still Have Questions?";
  const hasTypedCta = useRef(false);
  const ctaRef = useRef<HTMLElement>(null);

  const toggleFaq = (id: string) => {
    setActiveIndex(activeIndex === id ? null : id);
  };

  useEffect(() => {
    // --- HERO TYPEWRITER EFFECT ---
    let i = 0;
    const heroTimer = setInterval(() => {
      if (i < fullHeroText.length) {
        setHeroText(fullHeroText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(heroTimer);
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
      clearInterval(heroTimer);
      if (ctaTimer) clearInterval(ctaTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          {/* JavaScript Typewriter Effect */}
          <h1>
            {heroText}
            <span className="typewriter-cursor">&nbsp;</span>
          </h1>
          <p>
            Find quick answers to common questions about registration, alumni benefits, events, and more. 
            Can't find what you're looking for? <Link href="/contact" style={{color: 'var(--color-secondary)', textDecoration: 'underline'}}>Contact us</Link>.
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="section">
        <div className="container">
          <div className="faq-grid">
            
            {/* Registration Category */}
            <div className="faq-category">
              <h3>📝 Registration</h3>
              {[
                { id: 'reg1', q: 'Who is eligible to register as an EX-POLS alumni?', a: 'Registration is open to all former students of Police Secondary Schools across Nigeria who attended between 1970-2020. You\'ll need to provide your admission number, year of attendance, and school name for verification.' },
                { id: 'reg2', q: 'What documents do I need to register?', a: 'You\'ll need: (1) A valid email address, (2) Your Police Secondary School admission number, (3) Year of entry/graduation, and (4) A passport photograph (optional but recommended). An authentication code from an admin may also be required.' },
                { id: 'reg3', q: 'Is registration free?', a: 'Yes! Registration is completely free for all verified alumni. There are no hidden fees or subscription charges. Optional donations to support our community projects are always welcome but never required.' }
              ].map(item => (
                <div key={item.id} className={`faq-item ${activeIndex === item.id ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => toggleFaq(item.id)}>
                    {item.q}
                    <i>▼</i>
                  </button>
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Events & Reunions Category */}
            <div className="faq-category">
              <h3>🎉 Events & Reunions</h3>
              {[
                { id: 'evt1', q: 'When is the next reunion?', a: 'Our 4th Annual Reunion is planned for Q4 2026 in Kano State. Exact dates and venue will be announced 3 months prior. Registered alumni receive early notifications and exclusive discounts.' },
                { id: 'evt2', q: 'Can I attend if I live outside Nigeria?', a: 'Absolutely! We welcome alumni from across the globe. Many of our events include virtual participation options. For in-person events, we can assist with accommodation recommendations and local transportation tips.' },
                { id: 'evt3', q: 'How do I volunteer for events?', a: 'Volunteer opportunities are posted in the alumni portal 2 months before each major event. You can also express interest anytime by contacting our Events Committee through the Contact Page.' }
              ].map(item => (
                <div key={item.id} className={`faq-item ${activeIndex === item.id ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => toggleFaq(item.id)}>
                    {item.q}
                    <i>▼</i>
                  </button>
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Alumni Benefits Category */}
            <div className="faq-category">
              <h3>🎁 Alumni Benefits</h3>
              {[
                { id: 'ben1', q: 'What benefits do registered alumni receive?', a: 'Benefits include: access to our professional networking directory, exclusive job postings, mentorship opportunities, event discounts, scholarship information for your children, and a verified alumni digital ID card.' },
                { id: 'ben2', q: 'Is there a mobile app?', a: 'We\'re currently developing a dedicated EX-POLS mobile app! In the meantime, our website is fully mobile-responsive. Sign up for our newsletter to be notified when the app launches.' }
              ].map(item => (
                <div key={item.id} className={`faq-item ${activeIndex === item.id ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => toggleFaq(item.id)}>
                    {item.q}
                    <i>▼</i>
                  </button>
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* General Category */}
            <div className="faq-category">
              <h3>ℹ️ General</h3>
              {[
                { id: 'gen1', q: 'How is my personal data protected?', a: 'We take privacy seriously. Your contact information is never sold or shared with third parties. You control your visibility settings in your profile. For full details, see our Privacy Policy.' },
                { id: 'gen2', q: 'How can I update my profile information?', a: 'Log in to your alumni account and navigate to "My Profile". You can update your contact details, occupation, location, and privacy preferences anytime. Changes save automatically.' },
                { id: 'gen3', q: 'What if I forgot my login details?', a: 'Click "Forgot Password" on the login page and enter your registered email. You\'ll receive a secure reset link. If you no longer have access to that email, contact our support team via the Contact Page for manual verification.' }
              ].map(item => (
                <div key={item.id} className={`faq-item ${activeIndex === item.id ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => toggleFaq(item.id)}>
                    {item.q}
                    <i>▼</i>
                  </button>
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
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
          <p>Our support team is ready to help you with any issues or inquiries you might have.</p>
          <Link href="/contact" className="btn btn-outline">Contact Support</Link>
        </div>
      </section>
    </>
  );
}