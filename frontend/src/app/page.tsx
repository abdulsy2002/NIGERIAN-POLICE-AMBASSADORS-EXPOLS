"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [heroText, setHeroText] = useState('');
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaParagraph, setCtaParagraph] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [stats, setStats] = useState({
    alumni: 0,
    schools: 0,
    states: 0,
    years: 0
  });
  
  const statsRef = useRef<HTMLDivElement>(null);
  const statsAnimated = useRef(false);
  const ctaRef = useRef<HTMLElement>(null);
  const ctaStarted = useRef(false);

  // Hero typing effect
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
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeEffect = () => {
      const currentText = texts[textIndex];

      if (isDeleting) {
        setHeroText(currentText.substring(0, charIndex--));
      } else {
        setHeroText(currentText.substring(0, charIndex++));
      }

      let speed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentText.length + 1) {
        speed = 2000;
        isDeleting = true;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex++;
        if (textIndex >= texts.length) {
          textIndex = 0;
        }
      }

      timeoutId = setTimeout(typeEffect, speed);
    };

    timeoutId = setTimeout(typeEffect, 200);
    return () => clearTimeout(timeoutId);
  }, []);

  // CTA typing effect (Scroll triggered)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !ctaStarted.current) {
          ctaStarted.current = true;

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

          let textIndex = 0;
          let charIndex = 0;
          let isDeleting = false;
          let timeoutId: ReturnType<typeof setTimeout>;

          const typeCTAEffect = () => {
            const currentTitle = ctaTitles[textIndex];
            const currentParagraph = ctaParagraphs[textIndex];

            if (!isDeleting) {
              setCtaTitle(currentTitle.substring(0, charIndex + 1));
              charIndex++;

              if (charIndex === currentTitle.length) {
                setCtaParagraph(currentParagraph);
                isDeleting = true;
                timeoutId = setTimeout(typeCTAEffect, 2000);
                return;
              }
            } else {
              setCtaTitle(currentTitle.substring(0, charIndex - 1));
              charIndex--;

              if (charIndex === 0) {
                isDeleting = false;
                textIndex++;
                if (textIndex >= ctaTitles.length) {
                  textIndex = 0;
                }
              }
            }

            timeoutId = setTimeout(typeCTAEffect, isDeleting ? 50 : 100);
          };

          timeoutId = setTimeout(typeCTAEffect, 100);
        }
      },
      { threshold: 0.3 } 
    );

    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero fade-in animation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHeroVisible(true);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, []);

  // Stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated.current) {
            statsAnimated.current = true;
            
            const targets = { alumni: 1500, schools: 30, states: 36, years: 25 };
            const duration = 2000;
            const steps = 100;
            const interval = duration / steps;

            let step = 0;
            const counter = setInterval(() => {
              step++;
              const progress = step / steps;
              
              setStats({
                alumni: Math.floor(targets.alumni * progress),
                schools: Math.floor(targets.schools * progress),
                states: Math.floor(targets.states * progress),
                years: Math.floor(targets.years * progress)
              });

              if (step >= steps) {
                clearInterval(counter);
                setStats(targets);
              }
            }, interval);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section */}
      <section 
        className="hero"
        style={{
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s ease'
        }}
      >
        <div className="container">
          <p className="section-subtitle">WELCOME TO EX-POLS KANO BASE</p>
          <h1>
            {heroText}
            <span className="typewriter-cursor">&nbsp;</span>
          </h1>
          <p>
            Connecting former Nigerian Police Secondary School students across Nigeria.
          </p>
          <div className="hero-buttons">
            <Link href="/registration" className="btn btn-primary">Register Now</Link>
            <Link href="/about" className="btn btn-outline">Learn More</Link>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>WHAT WE DO</h2>
            <p className="section-text">Our Core Mission</p>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <div className="card-icon">🤝</div>
              <h3>Alumni Networking</h3>
              <p>Connecting distinguished alumni across professions and states for mentorship, collaboration, and career advancement.</p>
              <Link href="/contact" className="btn btn-outline">Join Network →</Link>
            </div>
            <div className="card">
              <div className="card-icon">🎓</div>
              <h3>Mentorship</h3>
              <p>Guiding current students and young graduates through career counseling, skill development, and professional growth support.</p>
              <Link href="/about" className="btn btn-outline">Learn More →</Link>
            </div>
            <div className="card">
              <div className="card-icon">🌍</div>
              <h3>Community Service</h3>
              <p>Organizing outreach programs, educational support, and development projects that transform underserved communities.</p>
              <Link href="/contact" className="btn btn-outline">Get Involved →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-container" ref={statsRef}>
        <div className="container">
          <div className="grid grid-4">
            <div className="stat-item">
              <span className="stat-number">{stats.alumni.toLocaleString()}+</span>
              <p>Registered Alumni</p>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.schools}+</span>
              <p>Partner Schools</p>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.states}</span>
              <p>States Covered</p>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.years}</span>
              <p>Years of Legacy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Event */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>UPCOMING EVENT</h2>
            <p className="section-text"> 4th Annual Reunion - Coming Soon!</p>
          </div>
          <div className="card" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
            <p>Join fellow alumni for our biggest gathering yet! Network, reconnect, and celebrate the legacy of Police Secondary Schools with brothers and sisters from across Nigeria.</p>
            <ul style={{listStyle: 'none', padding: '15px 0', fontWeight: 500}}>
              <li> Date: Q4 2026 (TBA)</li>
              <li>📍 Venue: Kano State police command bompai, Nigeria</li>
              <li>👥 Expected: 1000+ Alumni</li>
            </ul>
            <Link href="/reunion" className="btn btn-primary">Get Notified</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" ref={ctaRef}>
        <div className="container">
          <p className="section-subtitle">JOIN THE COMMUNITY</p>
          <h2>
            {ctaTitle}
            <span className="typewriter-cursor">&nbsp;</span>
          </h2>
          <p 
            style={{ 
              opacity: ctaParagraph ? 1 : 0, 
              transition: 'opacity 0.5s ease',
              minHeight: '30px' 
            }}
          >
            {ctaParagraph}
          </p>
          <Link href="/registration" className="btn btn-outline">Register Today</Link>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button 
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </>
  );
}