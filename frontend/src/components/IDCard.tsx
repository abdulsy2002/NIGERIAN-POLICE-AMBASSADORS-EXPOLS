"use client";

import Image from 'next/image';
import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './ExpolsIdCard.css';

interface IDCardProps {
  memberType: 'alumni' | 'ambassador';
  fullName: string;
  identityNumber: string;
  passportPhoto: string;
  chapterCode: string;
  stateChapter?: string;
  schoolOrOrg?: string; // Kept optional for backward compatibility
}

export default function IDCard({
  memberType,
  fullName,
  identityNumber,
  passportPhoto,
  chapterCode,
  stateChapter,
}: IDCardProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // Check if passport photo exists and is not empty
  const hasPhoto = passportPhoto && passportPhoto.trim() !== '';

  // Format Chapter (replaces school / org everywhere)
  const rawChapter = (stateChapter || chapterCode || 'NAT').trim();
  const cleanChapter = rawChapter
    .replace(/\s*base$/i, '')
    .replace(/\s*chapter$/i, '')
    .trim()
    .toUpperCase();
  const displayChapter = cleanChapter && cleanChapter !== 'NAT'
    ? `${cleanChapter} CHAPTER`
    : 'NATIONAL CHAPTER';

  // Format Identity Number as NPAE/STATE CHAPTER/YEAR/0001
  const currentYear = new Date().getFullYear();
  const formattedIdNumber = (identityNumber && identityNumber !== 'PENDING')
    ? identityNumber
    : `NPAE/${cleanChapter || 'NAT'}/${currentYear}/0001`;

  // Extract 4-digit serial for vertical badge digits
  const serialMatch = formattedIdNumber.match(/(\d{4})$/);
  const verticalDigits = serialMatch ? serialMatch[1].split('') : formattedIdNumber.slice(-4).split('');

  // Generate Live Verification URL for QR Code
  const baseUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://npae.org.ng');
  const qrValidationUrl = `${baseUrl}/validate?id=${encodeURIComponent(formattedIdNumber)}`;

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;

    // Render Front Card
    const frontCanvas = await html2canvas(frontRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#f4f1ea',
    } as any);
    const frontImg = frontCanvas.toDataURL('image/png');

    // Render Back Card
    const backCanvas = await html2canvas(backRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#f4f1ea',
    } as any);
    const backImg = backCanvas.toDataURL('image/png');

    // Standard CR-80 Portrait ID Card: 54mm x 85.6mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 85.6],
    });

    // Page 1: Front Face
    pdf.addImage(frontImg, 'PNG', 0, 0, 54, 85.6);

    // Page 2: Back Face
    pdf.addPage([54, 85.6], 'portrait');
    pdf.addImage(backImg, 'PNG', 0, 0, 54, 85.6);

    pdf.save(`${fullName.replace(/\s+/g, '_')}_NPAE_ID_Card.pdf`);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px',
          background: '#fff',
        }}
      >
        {/* ── FRONT FACE ── */}
        <div ref={frontRef} className="id-card-front">
          {/* Left Side Stripe */}
          <div className="side-stripe">
            <div className="stripe-yellow"></div>
            <div className="stripe-green"></div>
            <div className="stripe-navy"></div>
          </div>

          <div className="card-content">
            {/* Top Header */}
            <div className="top-header">
              <h1 className="police-title">NPAE</h1>
            </div>

            {/* Sub Header with Logos */}
            <div className="sub-header">
              <img src="/police-logo.png" alt="Police Logo" className="header-logo" />
              <div className="header-text">
                <p className="force-text">NIGERIAN POLICE AMBASSADORS</p>
                <p className="expols-text">EXPOLS - NATIONAL BODY</p>
                <p className="chapter-text">
                  {displayChapter}
                </p>
              </div>
              <img src="/expols-logo.png" alt="EXPOLS Logo" className="header-logo" />
            </div>

            {/* Identity Banner */}
            <div className="identity-banner">
              <div className="banner-green">NPAE</div>
              <div className="banner-yellow">NATIONAL</div>
              <div className="banner-navy">ID CARD</div>
            </div>

            {/* Photo Area */}
            <div className="photo-area">
              <div className="photo-frame">
                {hasPhoto ? (
                  <Image
                    src={passportPhoto}
                    alt={fullName}
                    fill
                    unoptimized
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: '#9ca3af'
                  }}>
                    👤
                  </div>
                )}
              </div>

              {/* Vertical ID Serial Digits */}
              <div className="vertical-id">
                {verticalDigits.map((char, i) => (
                  <span key={i} className="id-digit">{char}</span>
                ))}
              </div>
            </div>

            {/* Full ID Number Strip */}
            <div className="id-number-bar">
              ID NO: {formattedIdNumber}
            </div>

            {/* Footer */}
            <div className="front-footer">
              {/* Small grayscale photo */}
              <div className="small-photo-wrapper">
                {hasPhoto ? (
                  <Image
                    src={passportPhoto}
                    alt={fullName}
                    fill
                    unoptimized
                    style={{ objectFit: 'cover', filter: 'grayscale(100%)' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: '#6b7280'
                  }}>
                    👤
                  </div>
                )}
              </div>

              {/* Member info */}
              <div className="footer-text">
                <p className="member-name">{fullName}</p>
                <p className="member-type-badge">
                  {memberType === 'ambassador' ? 'NPAE AMBASSADOR' : 'NPAE ALUMNI'}
                </p>
                <p className="member-chapter-badge">
                  {displayChapter}
                </p>
              </div>

              {/* Logo */}
              <div className="footer-logo-wrapper">
                <img src="/expols-logo.png" alt="Logo" className="footer-logo" />
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div ref={backRef} className="id-card-back">
          <div className="back-content">
            <p className="cert-text">
              This is to certify that the bearer is a registered member of the{' '}
              <strong>Nigerian Police Ambassadors Expols (NPAE)</strong> - {displayChapter}.
            </p>

            <div className="back-center-block">
              <img src="/police-logo.png" alt="Police Logo" className="back-logo" />
              <div className="back-text-block">
                <h2 className="back-police">NPAE</h2>
                <p className="back-force">STATE CHAPTER</p>
                <p className="back-chapter">
                  {displayChapter}
                </p>
              </div>
              <img src="/expols-logo.png" alt="EXPOLS Logo" className="back-logo" />
            </div>

            <p className="lost-text">
              If found, please return to the nearest NPAE {cleanChapter || 'State'} Chapter Office or Police Station.
            </p>

            {/* QR Code */}
            <div className="back-qr-center">
              <QRCodeCanvas
                value={qrValidationUrl}
                size={75}
                level="H"
                includeMargin={false}
                fgColor="#003366"
              />
            </div>

            <div className="back-divider" />

            {/* Signature + photo row */}
            <div className="back-footer-bottom">
              <div className="back-small-photo">
                {hasPhoto ? (
                  <img
                    src={passportPhoto}
                    alt={fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#9ca3af'
                  }}>
                    👤
                  </div>
                )}
              </div>
              <div className="signature-block">
                <img src="/signature.png" alt="Authorised Signature" className="signature-img" />
                <p className="sign-label">National Chairman</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleDownloadPDF}
          style={{
            background: '#003366',
            color: '#fff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '15px',
            boxShadow: '0 4px 12px rgba(0, 51, 102, 0.25)',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#002244')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#003366')}
        >
          Download Standard ID Card (PDF)
        </button>
      </div>
    </div>
  );
}