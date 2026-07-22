// src/app/gallery/2nd-agm/page.tsx
"use client";
import Link from 'next/link';
import { useState } from 'react';
export default function SecondAGM() {
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string; title: string }>({ open: false, src: '', title: '' });

  // Generate 98 images for 2nd AGM
  const images = Array.from({ length: 98 }, (_, i) => ({
    id: i + 1,
    title: `2nd AGM Photo ${i + 1}`,
    src: `/2nd agm/image (${i + 1}).jpeg` // Change to .jpeg if needed
  }));

  return (
    <>
      <section className="hero-small" style={{background: "var(--primary)", color: 'white', padding: '60px 0', textAlign: 'center'}}>
        <div className="container">
          <Link href="/gallery" style={{color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.9rem'}}>← Back to Gallery</Link>
          <h1 style={{fontSize: '2.5rem', marginTop: '10px'}}>2nd Annual General Meeting</h1>
          <p style={{opacity: 0.8}}>December 2024 • Kano State</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="gallery-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px'}}>
            {images.map((img) => (
              <div key={img.id} className="gallery-item" style={{cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} onClick={() => setLightbox({ open: true, src: img.src, title: img.title })}>
                <img src={img.src} alt={img.title} loading="lazy" style={{width: '100%', height: '200px', objectFit: 'cover', display: 'block'}} onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox.open && (
        <div className="lightbox" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}} onClick={() => setLightbox({ ...lightbox, open: false })}>
          <button style={{position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer'}}>&times;</button>
          <img src={lightbox.src} alt={lightbox.title} style={{maxWidth: '90%', maxHeight: '90vh', borderRadius: '10px'}} />
        </div>
      )}
    </>
  );
}