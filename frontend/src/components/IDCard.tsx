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
  schoolOrOrg: string;
}

export default function IDCard({
  memberType,
  fullName,
  identityNumber,
  passportPhoto,
  chapterCode,
  schoolOrOrg,
}: IDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // ✅ Check if passport photo exists and is not empty
  const hasPhoto = passportPhoto && passportPhoto.trim() !== '';

  const qrData = JSON.stringify({
    identityNumber,
    fullName,
    memberType,
    chapterCode,
    schoolOrOrg,
    organization: 'Nigerian Police Ambassadors Expols (NPAE)',
  });

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    } as any);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [85.6, 145],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 145);
    pdf.save(`${fullName.replace(/\s+/g, '_')}_ID_Card.pdf`);
  };

  return (
    <div>
      <div
        ref={cardRef}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px', background: '#fff' }}
      >
        {/* ── FRONT FACE ── */}
        <div className="id-card-front">
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
                <p className="school-text" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#003366' }}>
                  {schoolOrOrg.toUpperCase()}
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
                {/* ✅ FIXED: Handle missing photo */}
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
                    fontSize: '3rem',
                    color: '#9ca3af'
                  }}>
                    👤
                  </div>
                )}
              </div>

              {/* Vertical ID Number */}
              <div className="vertical-id">
                {identityNumber.split('').map((char, i) => (
                  <span key={i} className="id-digit">{char}</span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="front-footer">
              {/* Small grayscale photo */}
              <div className="small-photo-wrapper">
                {/* ✅ FIXED: Handle missing photo */}
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
                    fontSize: '1.5rem',
                    color: '#6b7280'
                  }}>
                    👤
                  </div>
                )}
              </div>

              {/* Member info */}
              <div className="footer-text">
                <p className="member-name">{fullName}</p>
                <p className="member-org" style={{ fontSize: '0.7rem' }}>NPAE MEMBER</p>
                <p className="member-chapter" style={{ fontSize: '0.7rem', color: '#666' }}>
                  BASE: {chapterCode}
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
        <div className="id-card-back">
          <div className="back-content">
            <p className="cert-text">
              This is to certify that the bearer is a registered member of the
              <strong> Nigerian Police Ambassadors Expols (NPAE)</strong>.
            </p>

            <div className="back-center-block">
              <img src="/police-logo.png" alt="Police Logo" className="back-logo" />
              <div className="back-text-block">
                <h2 className="back-police">NPAE</h2>
                <p className="back-force">NATIONAL BASE</p>
                <p className="back-school" style={{ fontWeight: 'bold', color: '#003366' }}>
                  {schoolOrOrg}
                </p>
              </div>
              <img src="/expols-logo.png" alt="EXPOLS Logo" className="back-logo" />
            </div>

            <p className="lost-text">
              If found, please return to the nearest NPAE State Base Office or Police Station.
            </p>

            {/* QR Code */}
            <div className="back-qr-center">
              <QRCodeCanvas
                value={qrData}
                size={90}
                level="H"
                includeMargin={false}
                fgColor="#003366"
              />
            </div>

            <div className="back-divider" />

            {/* Signature + photo row */}
            <div className="back-footer-bottom">
              <div className="back-small-photo">
                {/* ✅ FIXED: Handle missing photo */}
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
                    fontSize: '2rem',
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
          }}
        >
          Download National ID Card PDF
        </button>
      </div>
    </div>
  );
}