"use client";

import Image from 'next/image';
import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface BoardMemberIDCardProps {
  name: string;
  role: string; // Position/Title
  photoUrl: string;
  isFeatured: boolean; // Chairman/VIP gets special styling
  bio?: string;
  linkedin?: string;
  twitter?: string;
}

export default function BoardMemberIDCard({
  name,
  role,
  photoUrl,
  isFeatured,
  bio,
  linkedin,
  twitter,
}: BoardMemberIDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const qrData = JSON.stringify({
    org: "Nigerian Police Ambassadors Expols (NPAE)",
    type: "Board Member",
    name,
    position: role,
    verified: true,
  });

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [85.6, 145],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 145);
    pdf.save(`${name.replace(/\s+/g, '_')}_Board_ID.pdf`);
  };

  return (
    <div>
      <div
        ref={cardRef}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px', background: '#fff' }}
      >
        {/* ── FRONT FACE ── */}
        <div style={{
          width: '340px',
          height: '540px',
          background: isFeatured 
            ? 'linear-gradient(135deg, #003366 0%, #001a33 100%)' 
            : 'linear-gradient(135deg, #1e40af 0%, #003366 100%)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Gold accent bar at top */}
          <div style={{
            height: '8px',
            background: 'linear-gradient(90deg, #f4b400 0%, #fbbf24 100%)',
            width: '100%',
          }} />

          {/* Header */}
          <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              <img src="/police-logo.png" alt="Police Logo" style={{ width: '40px', height: '40px' }} />
              <img src="/expols-logo.png" alt="NPAE Logo" style={{ width: '40px', height: '40px' }} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '1px' }}>
              NPAE
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', opacity: 0.9, letterSpacing: '0.5px' }}>
              BOARD OF DIRECTORS
            </p>
          </div>

          {/* Photo Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '0 20px',
            marginBottom: '15px',
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: isFeatured ? '5px solid #f4b400' : '4px solid #ffffff',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              background: '#fff',
            }}>
              <img 
                src={photoUrl} 
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Name and Position */}
          <div style={{ 
            padding: '0 25px', 
            textAlign: 'center',
            color: 'white',
            marginBottom: '15px',
          }}>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              fontSize: isFeatured ? '1.4rem' : '1.2rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}>
              {name}
            </h2>
            
            {/* Position Badge */}
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: isFeatured 
                ? 'linear-gradient(135deg, #f4b400 0%, #fbbf24 100%)'
                : 'rgba(255,255,255,0.2)',
              border: isFeatured ? 'none' : '2px solid #f4b400',
              borderRadius: '20px',
              fontSize: isFeatured ? '0.95rem' : '0.85rem',
              fontWeight: 700,
              color: isFeatured ? '#003366' : '#f4b400',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              {role}
            </div>

            {isFeatured && (
              <div style={{
                marginTop: '10px',
                fontSize: '0.75rem',
                color: '#f4b400',
                fontWeight: 600,
              }}>
                ⭐ NATIONAL CHAIRMAN
              </div>
            )}
          </div>

          {/* Bio (if available) */}
          {bio && (
            <div style={{
              padding: '0 25px',
              marginBottom: '15px',
              textAlign: 'center',
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.4,
                fontStyle: 'italic',
              }}>
                "{bio.substring(0, 80)}..."
              </p>
            </div>
          )}

          {/* Bottom Section with QR */}
          <div style={{
            marginTop: 'auto',
            padding: '15px 20px',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ color: 'white', fontSize: '0.65rem' }}>
              <p style={{ margin: '0 0 3px 0', fontWeight: 600 }}>NIGERIAN POLICE</p>
              <p style={{ margin: '0 0 3px 0' }}>AMBASSADORS EXPOLS</p>
              <p style={{ margin: 0, opacity: 0.7 }}>National Board Member</p>
            </div>
            <QRCodeCanvas
              value={qrData}
              size={60}
              level="H"
              includeMargin={false}
              fgColor="#ffffff"
              bgColor="transparent"
            />
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div style={{
          width: '340px',
          height: '540px',
          background: '#ffffff',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid #003366',
        }}>
          {/* Gold accent bar at top */}
          <div style={{
            height: '8px',
            background: 'linear-gradient(90deg, #f4b400 0%, #fbbf24 100%)',
            width: '100%',
          }} />

          {/* Back Content */}
          <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ 
              color: '#003366', 
              margin: '0 0 15px 0',
              fontSize: '1.1rem',
              textAlign: 'center',
              borderBottom: '2px solid #f4b400',
              paddingBottom: '10px',
            }}>
              BOARD MEMBER CREDENTIAL
            </h3>

            <p style={{
              color: '#374151',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              margin: '0 0 20px 0',
              textAlign: 'center',
            }}>
              This is to certify that <strong>{name}</strong> is a duly appointed member of the Board of Directors of the Nigerian Police Ambassadors Expols (NPAE), holding the position of <strong style={{ color: '#003366' }}>{role}</strong>.
            </p>

            {/* Contact/Social Info */}
            <div style={{
              background: '#f8f9fc',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#666' }}>
                <strong>Organization:</strong> NPAE National Body
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#666' }}>
                <strong>Position:</strong> {role}
              </p>
              {linkedin && (
                <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#666' }}>
                  <strong>LinkedIn:</strong> {linkedin}
                </p>
              )}
              {twitter && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
                  <strong>Twitter:</strong> {twitter}
                </p>
              )}
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <QRCodeCanvas
                value={qrData}
                size={100}
                level="H"
                includeMargin={false}
                fgColor="#003366"
              />
              <p style={{ fontSize: '0.65rem', color: '#666', marginTop: '8px' }}>
                Scan to verify credentials
              </p>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '15px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: '0 0 5px 0' }}>
                If found, please return to NPAE National Headquarters
              </p>
              <p style={{ fontSize: '0.6rem', color: '#9ca3af', margin: 0 }}>
                © {new Date().getFullYear()} Nigerian Police Ambassadors Expols
              </p>
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
          Download Board Member ID Card PDF
        </button>
      </div>
    </div>
  );
}