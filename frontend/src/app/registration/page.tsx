"use client";

import './registration.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RegistrationPage() {
  // Typewriter State
  const [typingText, setTypingText] = useState("");
  const fullText = "Join Our Network";

  // Typewriter Effect Logic
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypingText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Section - Background is handled entirely by CSS now! */}
      <section className="hero">
        <div className="container">
          <p className="section-subtitle">CREATE ACCOUNT</p>
          
          {/* Typewriter Text + Blinking Cursor */}
          <h1>
            {typingText}
            <span className="typewriter-cursor">&nbsp;</span>
          </h1>
          
          <p>Choose your registration path to become a part of the EX-POLS Kano Base community and unlock exclusive alumni benefits.</p>
        </div>
      </section>

      {/* Registration Options */}
      <section className="registration-options">
        <div className="container">
          <div className="options-grid">
            
            {/* EXPOLS Alumni Card */}
            <div className="option-card">
              <div className="option-icon">🎓</div>
              <h2>Register as EXPOLS</h2>
              <p>For former students of Police Secondary Schools across Nigeria. Verify your alumni status, connect with peers, and access exclusive alumni benefits.</p>
              <Link href="/form" className="option-btn primary">Start Registration →</Link>
            </div>

            {/* Ambassador Card */}
            <div className="option-card">
              <div className="option-icon">🌟</div>
              <h2>Register as Ambassador</h2>
              <p>For sponsors, donors, mentors, and partners who want to support the EX-POLS community, initiatives, and student development programs.</p>
              <Link href="/ambassador" className="option-btn secondary">Become an Ambassador →</Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}