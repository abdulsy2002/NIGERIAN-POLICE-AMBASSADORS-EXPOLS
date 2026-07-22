"use client";
import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, logoutUser, getUserBroadcasts, getUserReunions, updateCurrentUser } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(true);
  const [reunions, setReunions] = useState<any[]>([]);
  const [reunionsLoading, setReunionsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});
  const [updateMessage, setUpdateMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const result = await getCurrentUser();
    if (result) {
      setUser(result);
      setProfileForm({
        fullName: result.fullName || '',
        email: result.email || '',
        phoneNumber: result.phoneNumber || '',
        residentialAddress: result.residentialAddress || '',
        schoolAttended: result.schoolAttended || '',
        stateBaseCode: result.stateBaseCode || '',
        occupation: result.occupation || '',
        passportPhoto: result.passportPhoto || '',
      });
      fetchBroadcasts(result.stateBaseCode);
      fetchReunions(result.email);
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  const fetchReunions = async (email: string) => {
    setReunionsLoading(true);
    const result :any = await getUserReunions(email);
    if (result.success) {
      setReunions(result.data);
    }
    setReunionsLoading(false);
  };

  const fetchBroadcasts = async (stateBaseCode: string) => {
    setBroadcastsLoading(true);
    const result :any = await getUserBroadcasts(stateBaseCode);
    if (result.success) {
      setBroadcasts(result.data);
    }
    setBroadcastsLoading(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage('');

    const res = await updateCurrentUser(profileForm);
    if (res.success) {
      setUpdateMessage(res.message || 'Profile updated successfully!');
      setIsEditingProfile(false);
      fetchUserData();
    } else {
      setUpdateMessage(`Error: ${res.error}`);
    }
    setIsUpdating(false);
    setTimeout(() => setUpdateMessage(''), 5000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, passportPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc' }}>
        <div style={{ textAlign: 'center', color: 'red' }}>
          <h2>❌ Failed to load user data</h2>
          <button onClick={fetchUserData} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  const isVerified = user.userType === 'alumni' ? user.isVerified : user.isApproved;
  const identityNumber = user.identityNumber;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #003366 0%, #00509e 100%)', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>EX-POLS Kano Base</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>User Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.95rem' }}>Welcome, <strong>{user.fullName}</strong></span>
          <button onClick={handleLogout} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {/* Pending Status Banner */}
        {!isVerified && (
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', padding: '15px 20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>
              <strong>Account Pending Verification</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>Your profile is currently under review by our admin team. You will receive an email once approved.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          {/* Profile Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#003366', margin: 0, fontSize: '1.5rem' }}>👤 My Profile</h2>
              {!isEditingProfile && (
                <button onClick={() => setIsEditingProfile(true)} style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  ✏️ Edit
                </button>
              )}
            </div>

            {updateMessage && (
              <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', background: updateMessage.includes('Error') ? '#fee2e2' : '#d1fae5', color: updateMessage.includes('Error') ? '#991b1b' : '#065f46', fontSize: '0.9rem', textAlign: 'center' }}>
                {updateMessage}
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}>
                    {profileForm.passportPhoto ? (
                      <img src={profileForm.passportPhoto} alt="Passport" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #003366' }} />
                    ) : (
                      <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📷</div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#003366', color: 'white', borderRadius: '50%', padding: '4px', fontSize: '0.7rem' }}>✏️</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Phone Number (Instant)</label>
                    <input type="text" value={profileForm.phoneNumber} onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Residential Address (Instant)</label>
                    <input type="text" value={profileForm.residentialAddress} onChange={e => setProfileForm({...profileForm, residentialAddress: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '4px' }} />
                  </div>
                  {user.userType === 'ambassador' && (
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Occupation (Instant)</label>
                      <input type="text" value={profileForm.occupation} onChange={e => setProfileForm({...profileForm, occupation: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '4px' }} />
                    </div>
                  )}

                  <hr style={{ borderTop: '1px dashed #d1d5db', margin: '10px 0' }} />
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>* Changes below require Admin Approval</p>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Full Name</label>
                    <input type="text" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Email</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '4px' }} />
                  </div>
                  {user.userType === 'alumni' && (
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>School Attended</label>
                      <input type="text" value={profileForm.schoolAttended} onChange={e => setProfileForm({...profileForm, schoolAttended: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '4px' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setIsEditingProfile(false)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button type="submit" disabled={isUpdating} style={{ flex: 1, padding: '10px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      {isUpdating ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  {user.passportPhoto ? (
                    <img src={user.passportPhoto} alt="Passport" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #003366', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  ) : (
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '3rem', color: '#9ca3af' }}>👤</div>
                  )}
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div><strong style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>Full Name</strong><p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#1f2937' }}>{user.fullName}</p></div>
                  <div><strong style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</strong><p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#1f2937' }}>{user.email}</p></div>
                  <div><strong style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>Account Type</strong><p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#1f2937', textTransform: 'capitalize' }}>{user.userType}</p></div>
                  {user.phoneNumber && <div><strong style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>Phone Number</strong><p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#1f2937' }}>{user.phoneNumber}</p></div>}
                  {user.residentialAddress && <div><strong style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>Address</strong><p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#1f2937' }}>{user.residentialAddress}</p></div>}
                  {user.userType === 'alumni' && user.schoolAttended && (
                    <div><strong style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>School</strong><p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#1f2937' }}>{user.schoolAttended}</p></div>
                  )}
                  {user.userType === 'ambassador' && user.occupation && (
                    <div><strong style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>Occupation</strong><p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#1f2937' }}>{user.occupation}</p></div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Identity Section */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#003366', marginTop: 0, marginBottom: '20px', fontSize: '1.5rem' }}>🎫 Identity & Membership</h2>
            
            {identityNumber ? (
              <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem', fontWeight: 600 }}>Your Official Identity Number</p>
                <p style={{ margin: '10px 0 0 0', color: '#003366', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '1px' }}>{identityNumber}</p>
              </div>
            ) : (
              <div style={{ background: '#f3f4f6', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center', color: '#6b7280' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Identity Number Pending</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>You will receive your ID number once your account is verified by an admin.</p>
              </div>
            )}

            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Membership Status</span>
                <span style={{ 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: 700,
                  background: isVerified ? '#d1fae5' : '#fef3c7',
                  color: isVerified ? '#065f46' : '#92400e'
                }}>
                  {isVerified ? '✓ Active' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reunion Registrations Section */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ color: '#003366', marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎫 My Reunion Registrations
          </h2>

          {reunionsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              <p>Loading registrations...</p>
            </div>
          ) : reunions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#6b7280', background: '#f9fafb', borderRadius: '12px' }}>
              <p>You haven't registered for any reunions yet.</p>
              <a href="/reunion" style={{ display: 'inline-block', marginTop: '10px', color: '#003366', fontWeight: 'bold' }}>Register Now &rarr;</a>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {reunions.map((reg) => (
                <div key={reg._id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px',
                  border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', background: '#f9fafb'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '1.1rem' }}>{reg.attendanceType}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                      Registered on {new Date(reg.createdAt).toLocaleDateString('en-NG')}
                    </p>
                    {reg.paymentReference && (
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        Ref: {reg.paymentReference}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      display: 'inline-block', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                      background: reg.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7',
                      color: reg.paymentStatus === 'paid' ? '#065f46' : '#92400e'
                    }}>
                      Payment: {reg.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                    </div>
                    {reg.amountPaid && (
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#1f2937' }}>
                        ₦{(reg.amountPaid).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Broadcast Messages Section */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#003366', marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📢 Announcements & Updates
            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              {broadcasts.length}
            </span>
          </h2>

          {broadcastsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
              <p>Loading announcements...</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '5px' }}>No announcements yet</p>
              <p style={{ fontSize: '0.9rem' }}>Check back later for updates from the admin team.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {broadcasts.map((broadcast) => (
                <div key={broadcast._id} style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '20px',
                  background: '#f9fafb',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#003366', fontSize: '1.2rem', fontWeight: 700, flex: 1 }}>
                      {broadcast.subject}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: '#dbeafe', 
                        color: '#1e40af', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 600 
                      }}>
                        To: {broadcast.sentTo}
                      </span>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: '#f3f4f6', 
                        color: '#4b5563', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 600 
                      }}>
                        {new Date(broadcast.createdAt).toLocaleDateString('en-NG', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    color: '#374151', 
                    lineHeight: 1.7, 
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.95rem'
                  }}>
                    {broadcast.message}
                  </div>

                  <div style={{ 
                    marginTop: '15px', 
                    paddingTop: '15px', 
                    borderTop: '1px solid #e5e7eb',
                    fontSize: '0.85rem',
                    color: '#6b7280'
                  }}>
                    Sent by: <strong>{broadcast.sentBy}</strong> • {new Date(broadcast.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}