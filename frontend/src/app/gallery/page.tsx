"use client";
import './gallery.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGalleryImages } from '@/app/actions';
import { STATE_BASE_OPTIONS } from '@/lib/stateBaseCodes';

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
  const [stateBaseCode, setStateBaseCode] = useState('NAT');
  const [chapterLocked, setChapterLocked] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [galleryPagination, setGalleryPagination] = useState<any>(null);
  const [galleryPage, setGalleryPage] = useState(1);

  useEffect(() => {
    let active = true;
    fetch('/api/check-auth', { cache: 'no-store' }).then(async (response) => {
      if (!active) return;
      if (response.ok) {
        const data = await response.json();
        if (data.user?.stateBaseCode) {
          setStateBaseCode(data.user.stateBaseCode);
          setChapterLocked(true);
        }
      }
      if (active) setGalleryReady(true);
    }).catch((error: unknown) => {
      console.error('Unable to resolve gallery chapter.', error);
      if (active) setGalleryReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!galleryReady) return;
    let active = true;
    setLoadingDbImages(true);
    setGalleryError('');
    getGalleryImages(stateBaseCode, false, galleryPage).then((result) => {
      if (!active) return;
      if (result.success) {
        setDatabaseImages(result.data);
        setGalleryPagination(result.pagination);
      } else {
        setGalleryError(result.error || 'Unable to load gallery images.');
      }
      setLoadingDbImages(false);
    }).catch((error: unknown) => {
      if (!active) return;
      console.error('Unable to load gallery images.', error);
      setGalleryError('Unable to load gallery images.');
      setLoadingDbImages(false);
    });
    return () => { active = false; };
  }, [galleryReady, stateBaseCode, galleryPage]);

  // Hero typing effect
  useEffect(() => {
    const texts = ['Pictures Gallery', 'Photo Archive', 'Memory Lane'];
    // Use a ref object so the closure always reads the latest values
    const state = { textIndex: 0, charIndex: 0, isDeleting: false };
    let timerId: ReturnType<typeof setTimeout>;

    const type = () => {
      const current = texts[state.textIndex];

      if (state.isDeleting) {
        state.charIndex--;
        setHeroText(current.substring(0, state.charIndex));
      } else {
        state.charIndex++;
        setHeroText(current.substring(0, state.charIndex));
      }

      let speed = state.isDeleting ? 40 : 80;

      if (!state.isDeleting && state.charIndex === current.length) {
        speed = 2000; // pause at end of word
        state.isDeleting = true;
      } else if (state.isDeleting && state.charIndex === 0) {
        state.isDeleting = false;
        state.textIndex = (state.textIndex + 1) % texts.length;
        speed = 400; // pause before next word
      }

      timerId = setTimeout(type, speed);
    };

    timerId = setTimeout(type, 1000);
    // Cleanup: cancel the timer when the component unmounts
    return () => clearTimeout(timerId);
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

    const state = { textIndex: 0, charIndex: 0, isDeleting: false };
    let timerId: ReturnType<typeof setTimeout>;

    const typeGalleryEffect = () => {
      const currentTitle = galleryTitles[state.textIndex];
      const currentParagraph = galleryParagraphs[state.textIndex];

      if (!state.isDeleting) {
        state.charIndex++;
        setCtaTitle(currentTitle.substring(0, state.charIndex));
        if (state.charIndex === currentTitle.length) {
          setCtaParagraph(currentParagraph);
          state.isDeleting = true;
          timerId = setTimeout(typeGalleryEffect, 2000); // pause at full word
          return;
        }
      } else {
        state.charIndex--;
        setCtaTitle(currentTitle.substring(0, state.charIndex));
        if (state.charIndex === 0) {
          state.isDeleting = false;
          state.textIndex = (state.textIndex + 1) % galleryTitles.length;
        }
      }

      timerId = setTimeout(typeGalleryEffect, state.isDeleting ? 50 : 100);
    };

    timerId = setTimeout(typeGalleryEffect, 500);
    return () => clearTimeout(timerId);
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
            <label htmlFor="gallery-state-base">Chapter: </label>
            <select id="gallery-state-base" value={stateBaseCode} onChange={(event) => { setGalleryPage(1); setStateBaseCode(event.target.value); }} disabled={chapterLocked}>
              {STATE_BASE_OPTIONS.map(({ name, code }) => <option key={code} value={code}>{name}</option>)}
            </select>
          </div>
          
          {loadingDbImages ? (
            <div className="text-center" style={{padding: '60px 20px'}}>
              <p style={{fontSize: '1.2rem', color: 'var(--color-text-light)'}}>Loading photos...</p>
            </div>
          ) : galleryError ? (
            <div className="text-center" style={{padding: '60px 20px'}}>
              <p role="alert" style={{color: '#b91c1c'}}>{galleryError}</p>
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
                {databaseImages.map((img, index) => (
                  <div key={img.id || img._id || `${img.title || 'gallery-image'}-${index}`} className="gallery-item">
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
                  Showing {databaseImages.length} of {galleryPagination?.total ?? databaseImages.length} photos
                </p>
                {galleryPagination?.totalPages > 1 && (
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px'}}>
                    <button className="btn btn-outline" disabled={galleryPage <= 1} onClick={() => setGalleryPage(page => page - 1)}>Previous</button>
                    <span>Page {galleryPage} of {galleryPagination.totalPages}</span>
                    <button className="btn btn-outline" disabled={galleryPage >= galleryPagination.totalPages} onClick={() => setGalleryPage(page => page + 1)}>Next</button>
                  </div>
                )}
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