"use client";
import './validate.css';
import { useState, useEffect } from 'react';
import { validateMember } from '@/app/actions';

export default function ValidatePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    type: 'success' | 'error' | null, 
    message: string,
    memberType?: 'alumni' | 'ambassador',
    data?: any 
  }>({ type: null, message: '' });

  // Typewriter State for Hero
  const [typingText, setTypingText] = useState("");
  const fullText = "Validate Membership";

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

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') {
      setResult({ type: 'error', message: '⚠️ Please enter an Email, Admission Number, or Phone Number.' });
      return;
    }

    setLoading(true);
    setResult({ type: null, message: '' });

    const validationResult = await validateMember(searchQuery.trim());

    if (validationResult.success && validationResult.data) {
      const memberType = validationResult.memberType === 'alumni' || validationResult.memberType === 'ambassador'
        ? validationResult.memberType
        : undefined;

      setResult({
        type: 'success',
        memberType,
        message: memberType === 'alumni'
          ? '✅ Valid Alumni Member Found!'
          : memberType === 'ambassador'
            ? '✅ Valid Ambassador Found!'
            : '✅ Valid Member Found!',
        data: validationResult.data
      });
    } else {
      setResult({ type: 'error', message: validationResult.message || 'An error occurred while validating the member.' });
    }

    setLoading(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-small">
        <div className="container">
          <div className="hero-content">
            <h1>
              {typingText}
              <span className="typewriter-cursor">&nbsp;</span>
            </h1>
            <p>Verify the authenticity of an EX-POLS Kano Base member.</p>
          </div>
        </div>
      </section>

      {/* Validation Section */}
      <section className="validate-section">
        <div className="container">
          <div className="validate-card">
            <div className="validate-icon">️</div>
            <h2>Verify Member Status</h2>
            <p className="subtitle">Enter the member's Email, Admission Number, or Phone Number to verify their registration.</p>
            
            <form className="validate-form" onSubmit={handleValidate}>
              <div className="form-group">
                <label>Search By</label>
                <input 
                  type="text" 
                  placeholder="Email, Admission Number, Phone, or Full Name" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="validate-btn" disabled={loading}>
                {loading ? '🔍 Validating...' : 'Validate Member'}
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <button className="qr-btn">
               Scan QR Code
            </button>

            {/* Result Message */}
            {result.type && (
              <div className={`result-message ${result.type}`}>
                <p style={{ fontWeight: 600, marginBottom: '15px', textAlign: 'center' }}>{result.message}</p>
                
                {result.type === 'success' && result.data && (
                  <div className="member-details">
                    {/* Passport Photo */}
                    {result.data.passportPhoto && (
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img 
                          src={result.data.passportPhoto} 
                          alt="Passport" 
                          style={{ 
                            width: '120px', 
                            height: '120px', 
                            borderRadius: '50%', 
                            objectFit: 'cover',
                            border: '4px solid #003366',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }} 
                        />
                      </div>
                    )}
                    
                    {/* 👇 ALUMNI DETAILS (Email & Phone Hidden) */}
                    {result.memberType === 'alumni' && (
                      <>
                        <div className="detail-item"><strong>Full Name:</strong> {result.data.fullName}</div>
                        <div className="detail-item"><strong>Admission Number:</strong> {result.data.admissionNumber}</div>
                        <div className="detail-item"><strong>School Attended:</strong> {result.data.schoolAttended}</div>
                        <div className="detail-item"><strong>Graduation Year:</strong> {result.data.graduationYear}</div>
                        <div className="detail-item">
                          <strong>Status:</strong> 
                          <span style={{ 
                            marginLeft: '10px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                            background: result.data.isVerified ? '#d1fae5' : '#fef3c7',
                            color: result.data.isVerified ? '#065f46' : '#92400e'
                          }}>
                            {result.data.isVerified ? '✓ Verified Alumni' : '⏳ Pending Verification'}
                          </span>
                        </div>
                      </>
                    )}

                    {/* 👇 AMBASSADOR DETAILS (Email & Phone Hidden) */}
                    {result.memberType === 'ambassador' && (
                      <>
                        <div className="detail-item"><strong>Full Name:</strong> {result.data.fullName}</div>
                        <div className="detail-item"><strong>Profession:</strong> {result.data.profession}</div>
                        {result.data.organization && <div className="detail-item"><strong>Organization:</strong> {result.data.organization}</div>}
                        <div className="detail-item"><strong>Ambassador Type:</strong> {result.data.ambassadorType}</div>
                        <div className="detail-item">
                          <strong>Status:</strong> 
                          <span style={{ 
                            marginLeft: '10px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                            background: result.data.isApproved ? '#d1fae5' : '#fef3c7',
                            color: result.data.isApproved ? '#065f46' : '#92400e'
                          }}>
                            {result.data.isApproved ? '✓ Approved Ambassador' : '⏳ Pending Approval'}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Registered Date (Shown for both) */}
                    <div className="detail-item">
                      <strong>Registered:</strong> {new Date(result.data.registeredDate).toLocaleDateString('en-NG', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}