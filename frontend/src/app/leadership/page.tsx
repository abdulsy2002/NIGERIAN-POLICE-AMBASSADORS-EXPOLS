"use client";
import './leadership.css';
import { useState, useEffect } from 'react';
import { getBoardMembers } from '@/app/actions';
import Link from 'next/link';

export default function LeadershipPage() {
  const [heroText, setHeroText] = useState('');
  const [members, setMembers] = useState<any[]>([]);

  // Fetch board members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      const result = await getBoardMembers();
      if (result.success) setMembers(result.data as any[]);
    };
    fetchMembers();
  }, []);

  // Hero typing effect
  useEffect(() => {
    const texts = ['Our Leadership', 'Executive Board', 'Our Champions'];
    let textIndex = 0, charIndex = 0, isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      const current = texts[textIndex];
      setHeroText(isDeleting
        ? current.substring(0, charIndex - 1)
        : current.substring(0, charIndex + 1));
      charIndex += isDeleting ? -1 : 1;

      let speed = isDeleting ? 40 : 80;
      if (!isDeleting && charIndex === current.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        speed = 400;
      }
      timer = setTimeout(type, speed);
    };

    const initial = setTimeout(type, 800);
    return () => { clearTimeout(initial); clearTimeout(timer); };
  }, []);

  const featuredMember = members.find((m: any) => m.isFeatured);
  const regularMembers = members.filter((m: any) => !m.isFeatured);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-small">
        <div className="container">
          <div className="hero-content">
            <h1>
              {heroText}
              <span className="typing-cursor">|</span>
            </h1>
            <p>Meet the dedicated executives guiding EX-POLS Kano Base towards excellence.</p>
          </div>
        </div>
      </section>

      {/* Board Members Section */}
      <section className="section">
        <div className="container text-center">
          <p className="section-subtitle">THE TEAM</p>
          <h2 className="section-title">Meet Our Executive Board</h2>
          <p className="section-text" style={{ maxWidth: '700px', margin: '0 auto 50px auto' }}>
            The dedicated leaders steering the Nigerian Police Ambassadors (EX-POLS Kano Base) towards excellence, unity, and community impact.
          </p>

          <div className="board-grid">
            {/* Featured Member (Chairman) */}
            {featuredMember && (
              <div className="board-card featured">
                <div className="board-photo-wrapper">
                  <img src={featuredMember.photoUrl} alt={featuredMember.name} className="board-photo" />
                  <div className="board-badge">{featuredMember.role}</div>
                </div>
                <h4 className="board-name">{featuredMember.name}</h4>
                <p className="board-role">{featuredMember.role}</p>
                <p className="board-bio">{featuredMember.bio}</p>
                <div className="board-social">
                  {featuredMember.linkedin && <a href={featuredMember.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">in</a>}
                  {featuredMember.twitter && <a href={featuredMember.twitter} target="_blank" rel="noopener noreferrer" className="social-link">𝕏</a>}
                </div>
              </div>
            )}

            {/* Regular Members */}
            {regularMembers.map((member: any) => (
              <div key={member._id} className="board-card">
                <div className="board-photo-wrapper">
                  <img src={member.photoUrl} alt={member.name} className="board-photo" />
                </div>
                <h4 className="board-name">{member.name}</h4>
                <p className="board-role">{member.role}</p>
                <p className="board-bio">{member.bio}</p>
                <div className="board-social">
                  {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">in</a>}
                  {member.twitter && <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="social-link">𝕏</a>}
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No board members have been added yet. Please check back later.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section" style={{ background: 'var(--primary)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '20px' }}>Want to Join Our Leadership Team?</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 30px auto', opacity: 0.9, fontSize: '1.1rem' }}>
            We're always looking for dedicated individuals who share our vision.
          </p>
          <Link href="/contact" className="btn btn-primary" style={{ background: 'var(--secondary)', color: '#000' }}>
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}