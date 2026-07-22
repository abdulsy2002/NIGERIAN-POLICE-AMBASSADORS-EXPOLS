"use client";
import './gallery.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGalleryImages } from '@/app/actions';

export default function GalleryPage() {
  const [heroText, setHeroText] = useState('');
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaParagraph, setCtaParagraph] = useState('');
  const [activeGallery, setActiveGallery] = useState('agm1');
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string; title: string }>({ open: false, src: '', title: '' });
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // New state for database images
  const [databaseImages, setDatabaseImages] = useState<any[]>([]);
  const [loadingDbImages, setLoadingDbImages] = useState(true);

  // Fetch database images on mount
  useEffect(() => {
    const fetchDbImages = async () => {
      setLoadingDbImages(true);
      const result = await getGalleryImages();
      if (result.success) {
        setDatabaseImages(result.data);
      }
      setLoadingDbImages(false);
    };
    fetchDbImages();
  }, []);

  // Hero typing effect
  useEffect(() => {
    const texts = ['Pictures Gallery', 'Photo Archive', 'Memory Lane'];
    let textIndex = 0, charIndex = 0, isDeleting = false;
    
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
      setTimeout(type, speed);
    };
    setTimeout(type, 1000);
  }, []);

  // CTA typing effect
  useEffect(() => {
    const galleryTitles = [
      "Have Photos to Share?",
      "Preserve Our Alumni Memories",
      "Become Part of Our History"
    ];
    const galleryParagraphs = [
      "Help us preserve our history! Submit your event photos to be featured in our official gallery.",
      "Share reunion moments, alumni events, and unforgettable memories with the EX-POLS community.",
      "Your photos help keep our alumni legacy alive for future generations across Nigeria."
    ];

    let textIndex = 0, charIndex = 0, isDeleting = false;

    const typeGalleryEffect = () => {
      const currentTitle = galleryTitles[textIndex];
      const currentParagraph = galleryParagraphs[textIndex];

      if (!isDeleting) {
        setCtaTitle(currentTitle.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentTitle.length) {
          setCtaParagraph(currentParagraph);
          isDeleting = true;
          setTimeout(typeGalleryEffect, 2000);
          return;
        }
      } else {
        setCtaTitle(currentTitle.substring(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          textIndex++;
          if (textIndex >= galleryTitles.length) textIndex = 0;
        }
      }
      setTimeout(typeGalleryEffect, isDeleting ? 50 : 100);
    };
    typeGalleryEffect();
  }, []);

  // Scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.open) return;
      if (e.key === 'Escape') setLightbox({ open: false, src: '', title: '' });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.open]);

  const handleGalleryNav = (target: string) => {
    setActiveGallery(target);
    const element = document.getElementById(target);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <p className="section-subtitle">OUR MEMORIES</p>
          <h1>Welcome to Our <span id="typing-text">{heroText}</span></h1>
          <p>Relive the moments from our Annual General Meetings, reunions, and community events. Browse photos from each gathering and celebrate the legacy of EX-POLS KANO Base.</p>
          <div className="hero-buttons">
            <a href="#agm-gallery" className="btn btn-primary">View AGM Photos</a>
            <a href="#recent-uploads" className="btn btn-outline">Recent Uploads</a>
          </div>
        </div>
      </section>

      {/* Gallery Navigation */}
      <section className="section" id="agm-gallery">
        <div className="container text-center">
          <p className="section-subtitle">BROWSE BY EVENT</p>
          <h2 className="section-title">Photo Gallery</h2>
          <p className="section-text">Click on any section below to view photos from our events and gatherings.</p>
          
          <div className="gallery-nav">
            <button 
              onClick={() => handleGalleryNav('agm1')}
              className={`gallery-nav-btn ${activeGallery === 'agm1' ? 'active' : ''}`}
            >
              📅 1st AGM
            </button>
            <button 
              onClick={() => handleGalleryNav('agm2')}
              className={`gallery-nav-btn ${activeGallery === 'agm2' ? 'active' : ''}`}
            >
              📅 2nd AGM
            </button>
            <button 
              onClick={() => handleGalleryNav('agm3')}
              className={`gallery-nav-btn ${activeGallery === 'agm3' ? 'active' : ''}`}
            >
              📅 3rd AGM
            </button>
            <button 
              onClick={() => handleGalleryNav('recent-uploads')}
              className={`gallery-nav-btn ${activeGallery === 'recent-uploads' ? 'active' : ''}`}
            >
              🆕 Recent Uploads
            </button>
          </div>
        </div>
      </section>

      {/* 1st AGM Gallery */}
      <section id="agm1" className="gallery-section" style={{display: activeGallery === 'agm1' ? 'block' : 'none'}}>
        <div className="container">
          <div className="gallery-header">
            <h3>🎉 1st Annual General Meeting</h3>
            <p>Kano State • December 2023</p>
          </div>
          
          <div className="gallery-grid">
            {[10, 18, 49, 7, 27, 50].map((id) => (
              <div key={id} className="gallery-item">
                <img src={`/1st agm/image (${id}).jpeg`} alt={`1st AGM ${id}`} loading="lazy" />
                <div className="gallery-overlay">
                  <h4>Photo {id}</h4>
                  <button className="btn-view" onClick={(e) => {
                    e.stopPropagation();
                    setLightbox({ open: true, src: `/1st agm/image (${id}).jpeg`, title: `1st AGM Photo ${id}` });
                  }}>🔍</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center" style={{marginTop: '30px'}}>
            <Link href="/gallery/1st-agm" className="btn btn-primary">View All 1st AGM Photos →</Link>
          </div>
        </div>
      </section>

      {/* 2nd AGM Gallery */}
      <section id="agm2" className="gallery-section" style={{display: activeGallery === 'agm2' ? 'block' : 'none'}}>
        <div className="container">
          <div className="gallery-header">
            <h3>🎉 2nd Annual General Meeting</h3>
            <p>Kano State • December 2024</p>
          </div>
          
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div key={id} className="gallery-item">
                <img src={`/2nd agm/image (${id}).jpeg`} alt={`2nd AGM ${id}`} loading="lazy" />
                <div className="gallery-overlay">
                  <h4>Photo {id}</h4>
                  <button className="btn-view" onClick={(e) => {
                    e.stopPropagation();
                    setLightbox({ open: true, src: `/2nd agm/image (${id}).jpeg`, title: `2nd AGM Photo ${id}` });
                  }}>🔍</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center" style={{marginTop: '30px'}}>
            <Link href="/gallery/2nd-agm" className="btn btn-primary">View All 2nd AGM Photos →</Link>
          </div>
        </div>
      </section>

      {/* 3rd AGM Gallery */}
      <section id="agm3" className="gallery-section" style={{display: activeGallery === 'agm3' ? 'block' : 'none'}}>
        <div className="container">
          <div className="gallery-header">
            <h3>🎉 3rd Annual General Meeting</h3>
            <p>Kano State • December 2025</p>
          </div>
          
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div key={id} className="gallery-item">
                <img src={`/3rd agm/image (${id}).jpg`} alt={`3rd AGM ${id}`} loading="lazy" />
                <div className="gallery-overlay">
                  <h4>Photo {id}</h4>
                  <button className="btn-view" onClick={(e) => {
                    e.stopPropagation();
                    setLightbox({ open: true, src: `/3rd agm/image (${id}).jpg`, title: `3rd AGM Photo ${id}` });
                  }}>🔍</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center" style={{marginTop: '30px'}}>
            <Link href="/gallery/3rd-agm" className="btn btn-primary">View All 3rd AGM Photos →</Link>
          </div>
        </div>
      </section>

      {/* Recent Uploads from Admin Panel */}
      <section id="recent-uploads" className="gallery-section" style={{display: activeGallery === 'recent-uploads' ? 'block' : 'none'}}>
        <div className="container">
          <div className="gallery-header">
            <h3>🆕 Recent Uploads</h3>
            <p>Latest photos added by our admin team</p>
          </div>
          
          {loadingDbImages ? (
            <div className="text-center" style={{padding: '60px 20px'}}>
              <p style={{fontSize: '1.2rem', color: 'var(--color-text-light)'}}>Loading photos...</p>
            </div>
          ) : databaseImages.length === 0 ? (
            <div className="text-center" style={{padding: '60px 20px'}}>
              <p style={{fontSize: '1.2rem', color: 'var(--color-text-light)', marginBottom: '20px'}}>
                No photos uploaded yet. Check back soon!
              </p>
              <Link href="/contact" className="btn btn-primary">Submit Your Photos</Link>
            </div>
          ) : (
            <>
              <div className="gallery-grid">
                {databaseImages.map((img) => (
                  <div key={img._id} className="gallery-item">
                    <img src={img.imageUrl} alt={img.title} loading="lazy" />
                    <div className="gallery-overlay">
                      <h4>{img.title}</h4>
                      <p style={{fontSize: '0.9rem', opacity: 0.9, marginBottom: '10px'}}>{img.category}</p>
                      <button className="btn-view" onClick={(e) => {
                        e.stopPropagation();
                        setLightbox({ open: true, src: img.imageUrl, title: img.title });
                      }}>🔍</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center" style={{marginTop: '30px'}}>
                <p style={{color: 'var(--color-text-light)', fontSize: '0.95rem'}}>
                  Showing {databaseImages.length} photo{databaseImages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Submit Photos CTA */}
      <section id="submit" className="section">
        <div className="container">
          <p className="section-subtitle">PHOTO GALLERY</p>
          <h2 className="section-title" id="gallery-typing-text">
            {ctaTitle}
          </h2>
          <p id="gallery-changing-text">
            {ctaParagraph}
          </p>
          <Link href="/contact" className="btn btn-primary">
            Submit Photos
          </Link>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div className="lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightbox({ open: false, src: '', title: '' }); }}>
          <button className="lightbox-close" onClick={() => setLightbox({ open: false, src: '', title: '' })}>&times;</button>
          <img src={lightbox.src} alt={lightbox.title} />
          <div className="lightbox-caption">{lightbox.title}</div>
          <button className="lightbox-nav prev">&#10094;</button>
          <button className="lightbox-nav next">&#10095;</button>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button 
        id="scroll-top-btn" 
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
      >
        ↑
      </button>
    </>
  );
}