"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminUserProfile, logoutAdmin } from '@/app/actions';
import Link from 'next/link';
import IDCard from '@/components/IDCard';

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIDCard, setShowIDCard] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result: any = await getAdminUserProfile();
    
    if (result.success) {
      setProfile(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc' }}>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#003366', marginBottom: '15px' }}>No Member Profile Found</h2>
          <p style={{ color: '#666', marginBottom: '25px' }}>{error}</p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link href="/register" style={{ padding: '12px 24px', background: '#003366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
              Register as Member
            </Link>
            <button 
              onClick={() => router.push('/admin')}
              style={{ padding: '12px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Back to Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAlumni = profile.userType === 'alumni';
  const isVerified = isAlumni ? profile.isVerified : profile.isApproved;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#003366', marginBottom: '5px' }}>My Profile</h1>
            <p style={{ color: '#666' }}>View your personal member information</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/admin" style={{ padding: '10px 20px', background: '#003366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Admin Panel
            </Link>
            <button 
              onClick={async () => {
                await logoutAdmin();
                router.push('/admin/login');
              }}
              style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Photo */}
            {profile.passportPhoto && (
              <div style={{ flexShrink: 0 }}>
                <img 
                  src={profile.passportPhoto} 
                  alt={profile.fullName}
                  style={{ width: '150px', height: '150px', borderRadius: '12px', objectFit: 'cover', border: '4px solid #003366' }}
                />
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <h2 style={{ color: '#003366', margin: 0 }}>{profile.fullName}</h2>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: isVerified ? '#d1fae5' : '#fef3c7',
                  color: isVerified ? '#065f46' : '#92400e',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {isVerified ? '✓ Verified' : '⏳ Pending'}
                </span>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {isAlumni ? '🎓 Alumni' : '🌟 Ambassador'}
                </span>
              </div>

              {profile.identityNumber && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>Identity Number</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#003366', margin: 0 }}>
                    {profile.identityNumber}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>Email</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{profile.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>Phone</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{profile.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>State Base</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{profile.stateBaseName || 'N/A'}</p>
                </div>
                {isAlumni && (
                  <>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>School</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{profile.schoolAttended || 'N/A'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>Graduation Year</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{profile.yearOfGraduation || 'N/A'}</p>
                    </div>
                  </>
                )}
                {!isAlumni && (
                  <>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>Occupation</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{profile.occupation || 'N/A'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>Ambassador Type</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{profile.ambassadorType || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
         {/* Actions */}
          <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {profile.identityNumber && profile.passportPhoto ? (
              <button 
                onClick={() => setShowIDCard(true)}
                style={{ padding: '12px 24px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                🎫 View ID Card
              </button>
            ) : (
              <div style={{ padding: '12px 24px', background: '#fef3c7', color: '#92400e', borderRadius: '8px', fontWeight: 600 }}>
                ⚠️ ID Card not available. Please complete your profile with a passport photo.
              </div>
            )}
            {!isVerified && (
              <div style={{ padding: '12px 24px', background: '#fef3c7', color: '#92400e', borderRadius: '8px', fontWeight: 600 }}>
                ⏳ Your profile is pending admin approval
              </div>
            )}
          </div>
        </div>

        {/* Admin Info */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#003366', marginBottom: '10px' }}>🔐 Admin Access</h3>
          <p style={{ color: '#666', margin: 0 }}>
            You have administrative privileges in the NPAE system. 
            <Link href="/admin" style={{ color: '#003366', fontWeight: 600, marginLeft: '5px' }}>
              Go to Admin Panel →
            </Link>
          </p>
        </div>
      </div>

      {/* ID Card Modal */}
      {showIDCard && profile.identityNumber && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowIDCard(false)}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '500px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowIDCard(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            <h2 style={{ color: '#003366', textAlign: 'center', marginBottom: '20px' }}>Your NPAE ID Card</h2>
            <IDCard
              memberType={profile.userType}
              fullName={profile.fullName}
              identityNumber={profile.identityNumber}
              passportPhoto={profile.passportPhoto}
              chapterCode={profile.stateBaseCode || 'NAT'}
              schoolOrOrg={isAlumni ? profile.schoolAttended : profile.organization}
            />
          </div>
        </div>
      )}
    </div>
  );
}