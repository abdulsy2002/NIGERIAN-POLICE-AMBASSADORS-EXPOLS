// src/app/about/page.tsx
'use client'; // REQUIRED for JavaScript/React hooks to work in Next.js
import './about.css';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function AboutPage() {
  // States for Typing Effects
  const [heroText, setHeroText] = useState('');
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaParagraph, setCtaParagraph] = useState('');
  
  // States for UI
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [stats, setStats] = useState({ alumni: 0, schools: 0, fields: 0, states: 0 });
  
  const statsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // 1. HERO TYPING EFFECT
  useEffect(() => {
    const texts = [
      'Uniting EX-POLS Across Nigeria',
      'Building Strong Alumni Connections',
      'Promoting Unity & Leadership',
      'Connecting Alumni Nationwide',
      'Empowering Future Generations'
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeEffect = () => {
      const currentText = texts[textIndex];
      setHeroText(isDeleting ? currentText.substring(0, charIndex--) : currentText.substring(0, charIndex++));
      
      let speed = isDeleting ? 50 : 100;
      if (!isDeleting && charIndex === currentText.length + 1) { speed = 2000; isDeleting = true; }
      if (isDeleting && charIndex === 0) { isDeleting = false; textIndex = (textIndex + 1) % texts.length; }
      setTimeout(typeEffect, speed);
    };
    setTimeout(typeEffect, 200);
  }, []);

  // 2. CTA TYPING EFFECT
  useEffect(() => {
    const ctaTitles = [
      "Ready to Reconnect With Your Alumni Family?",
      "Become Part of the EX-POLS Legacy",
      "Build Lifelong Alumni Connections"
    ];
    const ctaParagraphs = [
      "Join thousands of EX-POLS alumni building networks, careers, and communities across Nigeria.",
      "Connect with professionals, mentors, and old classmates through our growing alumni community.",
      "Register today and stay updated on reunions, opportunities, and community activities."
    ];
    let textIndex = 0, charIndex = 0, isDeleting = false;

    const typeCTAEffect = () => {
      const currentTitle = ctaTitles[textIndex];
      const currentParagraph = ctaParagraphs[textIndex];

      if (!isDeleting) {
        setCtaTitle(currentTitle.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentTitle.length) {
          setCtaParagraph(currentParagraph);
          isDeleting = true;
          setTimeout(typeCTAEffect, 2000);
          return;
        }
      } else {
        setCtaTitle(currentTitle.substring(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % ctaTitles.length;
        }
      }
      setTimeout(typeCTAEffect, isDeleting ? 50 : 100);
    };
    typeCTAEffect();
  }, []);

  // 3. SCROLL TO TOP VISIBILITY
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4. HERO FADE-IN ANIMATION
  useEffect(() => {
    if (heroRef.current) {
      setTimeout(() => heroRef.current?.classList.add('hero-visible'), 100);
    }
  }, []);

  // 5. STATS COUNTER ANIMATION
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          const targets = { alumni: 500, schools: 28, fields: 30, states: 36 };
          const duration = 2000;
          const steps = 60;
          const interval = duration / steps;
          let step = 0;
          
          const counter = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setStats({
              alumni: Math.floor(targets.alumni * eased),
              schools: Math.floor(targets.schools * eased),
              fields: Math.floor(targets.fields * eased),
              states: Math.floor(targets.states * eased)
            });
            if (step >= steps) { clearInterval(counter); setStats(targets); }
          }, interval);
        }
      });
    }, { threshold: 0.3 });

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsAnimated]);

  // 6. SCROLL ANIMATIONS FOR SECTIONS
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('animate-in');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.about-grid, .mv-grid, .services-grid, .values-grid, .cta-section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="container">
          <div className="hero-content">
            <p className="section-subtitle">ABOUT NIGERIAN POLICE AMBASSADORS</p>
            {/* Dynamic Hero Text */}
            <h1 id="typing-text">{heroText}</h1>
            <p>Fostering unity, professional development, and community service among former students of Police Secondary Schools.</p>
            <div className="hero-buttons">
              <button onClick={() => scrollToSection('mission')} className="btn btn-primary">Learn More</button>
            </div>
          </div>
          <div className="experience-badge">
             <span className="number">50+</span>
             <span>Years of Excellence</span>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2>Who We Are</h2>
              <p className="lead">The Nigerian Police Ambassadors EX-POLS KANO Base is a prestigious alumni association dedicated to fostering unity, professional development, and community service.</p>
              <p>We bring together distinguished alumni from various Police Secondary Schools across Nigeria, creating a powerful network of professionals committed to excellence in service to the nation.</p>
              <p>Our mission is to maintain the values instilled in us during our formative years at Police Secondary Schools while contributing meaningfully to national development.</p>
              
              <div className="values-list">
                <div className="value-item">
                  <div className="value-icon">🛡️</div>
                  <div className="value-text"><h4>Integrity</h4><p>Upholding the highest standards of honesty and ethical conduct.</p></div>
                </div>
                <div className="value-item">
                  <div className="value-icon">🤝</div>
                  <div className="value-text"><h4>Unity</h4><p>Fostering brotherhood and sisterhood among alumni.</p></div>
                </div>
                <div className="value-item">
                  <div className="value-icon">🌍</div>
                  <div className="value-text"><h4>Service</h4><p>Dedicated to community development and national progress.</p></div>
                </div>
              </div>
            </div>
            <div className="about-image">
              <img src="/image (203).jpg" alt="Alumni Gathering" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'; }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-number">{stats.alumni}+</div><p>Registered Alumni</p></div>
            <div className="stat-card"><div className="stat-icon">🏫</div><div className="stat-number">{stats.schools}+</div><p>Partner Schools</p></div>
            <div className="stat-card"><div className="stat-icon">💼</div><div className="stat-number">{stats.fields}+</div><p>Professional Fields</p></div>
            <div className="stat-card"><div className="stat-icon">🗺️</div><div className="stat-number">{stats.states}</div><p>States Covered</p></div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section" id="mission">
        <div className="container">
          <div className="section-header"><h2>Our Mission & Vision</h2></div>
          <div className="mv-grid">
            <div className="mv-card"><div className="mv-icon"></div><h3>Our Mission</h3><p>To create a vibrant network of Police Secondary School alumni that promotes professional excellence, fosters lifelong friendships, and contributes to national development.</p></div>
            <div className="mv-card"><div className="mv-icon">️</div><h3>Our Vision</h3><p>To be the leading alumni association in Nigeria, recognized for producing distinguished professionals who exemplify integrity, leadership, and service to humanity.</p></div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section services-section">
        <div className="container">
          <div className="section-header"><h2>What We Do</h2><p>Empowering alumni and communities through various initiatives and programs</p></div>
          <div className="services-grid">
            <div className="service-card"><div className="service-icon">🤝</div><h3>Alumni Networking</h3><p>Connecting alumni across professions and locations for mentorship, collaboration, and career advancement opportunities.</p></div>
            <div className="service-card"><div className="service-icon">🌍</div><h3>Community Service</h3><p>Organizing outreach programs, educational support, and development projects in underserved communities.</p></div>
            <div className="service-card"><div className="service-icon">🎓</div><h3>Mentorship Programs</h3><p>Guiding current students and young alumni through career counseling, skill development, and professional guidance.</p></div>
            <div className="service-card"><div className="service-icon">📚</div><h3>Scholarship Support</h3><p>Providing educational assistance and scholarships to deserving students from Police Secondary Schools.</p></div>
            <div className="service-card"><div className="service-icon">📈</div><h3>Career Development</h3><p>Offering workshops, training sessions, and job placement assistance to enhance professional growth.</p></div>
            <div className="service-card"><div className="service-icon">🎉</div><h3>Annual Reunions</h3><p>Hosting yearly gatherings to strengthen bonds, celebrate achievements, and plan future initiatives.</p></div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="values-section">
        <div className="container">
          <div className="section-header"><h2>Our Core Values</h2><p>The principles that guide our actions and define our character</p></div>
          <div className="values-grid">
            <div className="value-card"><span className="value-number">01</span><h3>Excellence</h3><p>Striving for the highest standards in all our endeavors</p></div>
            <div className="value-card"><span className="value-number">02</span><h3>Loyalty</h3><p>Unwavering commitment to our alma mater and fellow alumni</p></div>
            <div className="value-card"><span className="value-number">03</span><h3>Discipline</h3><p>Maintaining the military precision and order instilled in us</p></div>
            <div className="value-card"><span className="value-number">04</span><h3>Compassion</h3><p>Serving humanity with empathy and understanding</p></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <p className="section-subtitle">JOIN THE COMMUNITY</p>
            {/* Dynamic CTA Text */}
            <h2 id="cta-typing-text">{ctaTitle}</h2>
            <p id="cta-changing-text">{ctaParagraph}</p>
            <div className="cta-buttons">
              <Link href="/form" className="btn btn-primary">Register Now</Link>
              <Link href="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button onClick={scrollToTop} className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} aria-label="Scroll to top">↑</button>
    </>
  );
}