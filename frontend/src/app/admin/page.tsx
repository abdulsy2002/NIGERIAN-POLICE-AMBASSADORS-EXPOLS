"use client";

import { useState, useEffect, useRef } from 'react';
import {
  getAdminData, approveUser, deleteRecord, sendBroadcast, getBroadcasts, getAllSupportTickets,
  uploadGalleryImage, getGalleryImages, updateGalleryImage,
  getBoardMembers, saveBoardMember, deleteBoardMember,
  getReunionSettings, updateReunionSettings, getUserDetails, getAuditLogs,
  getAllAdmins, addNewAdmin, deleteAdmin,
  getAdminSession,
  respondToTicket,
  updateTicketStatus,
  getAllPayments,
  getPaymentSettings,
  updatePaymentSettings,
  getAdminProfileRequests,
  processAdminProfileRequest
} from '@/app/actions';
import Link from 'next/link';
import IDCard from '@/components/IDCard';
import './admin.css';
import AdminNavbar from '@/components/AdminNavbar';
import DetailViewer from '@/components/DetailViewer';
import ConfirmAction from '@/components/ConfirmAction';
import DataTable from '@/components/DataTable';
import BoardMemberIDCard from '@/components/BoardMemberIDCars';

type ActiveTab = 'overview' | 'alumni' | 'ambassadors' | 'reunion' | 'messages' | 'broadcast' | 'gallery' | 'leadership' | 'reunion-settings' | 'audit-logs' | 'manage-admins' | 'support' | 'payments' | 'payment-settings' | 'profile-requests';

function normalizeToCardProps(member: any, type: 'alumni' | 'ambassador'): any {
  return {
    memberType: type,
    fullName: member.fullName || 'Unknown',
    identityNumber: member.identityNumber || 'PENDING',
    passportPhoto: member.passportPhoto || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2RkZCIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjMwIiBmaWxsPSIjOTk5Ii8+PHBhdGggZD0iTTMwIDEyMCBRNzUgOTAgMTIwIDEyMCIgZmlsbD0iIzk5OSIvPjwvc3ZnPg==',
    chapterCode: member.stateBaseCode || 'NAT',
    schoolOrOrg: member.schoolAttended || member.organization || 'NPAE',
  };
}

export default function AdminDashboard() {
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [profileRequests, setProfileRequests] = useState<any[]>([]);
  const [profileRequestsLoading, setProfileRequestsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [viewDetails, setViewDetails] = useState<any>(null);
  const [viewType, setViewType] = useState<'alumni' | 'ambassador' | 'reunion' | 'message'>('alumni');
  const [showIDCard, setShowIDCard] = useState<any>(null);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [selectedBaseFilter, setSelectedBaseFilter] = useState<string>('all');

  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [broadcastForm, setBroadcastForm] = useState({ subject: '', message: '', sentTo: 'all', targetBaseCode: '' });
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'General' });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<string>('');
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryMessage, setGalleryMessage] = useState('');

  const [editingImage, setEditingImage] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'General' });
  const [editLoading, setEditLoading] = useState(false);

  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [leadershipForm, setLeadershipForm] = useState({
    name: '', role: '', bio: '', photoUrl: '', isFeatured: false, linkedin: '', twitter: ''
  });
  const [showBoardMemberIDCard, setShowBoardMemberIDCard] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [leadershipMessage, setLeadershipMessage] = useState('');

  const [reunionSettings, setReunionSettings] = useState<any>(null);
  const [reunionSettingsMessage, setReunionSettingsMessage] = useState('');
  const [reunionSettingsLoading, setReunionSettingsLoading] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [paymentSettingsMessage, setPaymentSettingsMessage] = useState('');
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [admins, setAdmins] = useState<any[]>([]);
  const [adminRole, setAdminRole] = useState('');
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'state_admin',
    stateBase: ''
  });

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
  ];

  useEffect(() => {
    fetchData();
    const getSession = async () => {
      const res: any = await getAdminSession();
      if (res) {
        setAdminRole(res.role);
      }
    };
    getSession();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const result: any = await getAdminData();
    if (result && result.success) {
      setData({
        alumni: Array.isArray(result.alumni) ? result.alumni : [],
        ambassadors: Array.isArray(result.ambassadors) ? result.ambassadors : [],
        reunions: Array.isArray(result.reunions) ? result.reunions : [],
        messages: Array.isArray(result.messages) ? result.messages : []
      });
    } else {
      setData({ alumni: [], ambassadors: [], reunions: [], messages: [] });
    }
    setLoading(false);
  };

  const loadSupportTickets = async () => {
    setSupportLoading(true);
    const result: any = await getAllSupportTickets();
    if (result.success) {
      setSupportTickets(result.data);
    }
    setSupportLoading(false);
  };

  const loadTabData = async (tab: ActiveTab) => {
    if (tab === 'broadcast' && broadcasts.length === 0) {
      const result: any = await getBroadcasts();
      if (result.success) setBroadcasts(result.data);
    }

    if (tab === 'support' && supportTickets.length === 0) {
      await loadSupportTickets();
    }

    if (tab === 'payments' && payments.length === 0) {
      const result: any = await getAllPayments();
      if (result.success) setPayments(result.data);
    }

    if (tab === 'gallery' && galleryImages.length === 0) {
      const result: any = await getGalleryImages();
      if (result.success) setGalleryImages(result.data);
    }

    if (tab === 'leadership' && boardMembers.length === 0) {
      const result: any = await getBoardMembers();
      if (result.success) setBoardMembers(result.data);
    }

    if (tab === 'reunion-settings' && !reunionSettings) {
      const result: any = await getReunionSettings();
      if (result.success) setReunionSettings(result.data);
    }

    if (tab === 'payment-settings' && !paymentSettings) {
      const result: any = await getPaymentSettings();
      if (result.success) setPaymentSettings(result.data);
    }

    if (tab === 'audit-logs') {
      setAuditLoading(true);
      const result: any = await getAuditLogs();
      if (result.success) setAuditLogs(result.data);
      setAuditLoading(false);
    }

    if (tab === 'manage-admins' && admins.length === 0) {
      const result: any = await getAllAdmins();
      if (result.success) {
        setAdmins(result.data);
      }
    }

    if (tab === 'profile-requests' && profileRequests.length === 0) {
      setProfileRequestsLoading(true);
      const result: any = await getAdminProfileRequests();
      if (result.success) {
        setProfileRequests(result.data);
      }
      setProfileRequestsLoading(false);
    }
  };

  const loadAdmins = async () => {
    setAdminsLoading(true);
    const result: any = await getAllAdmins();
    if (result.success) {
      setAdmins(result.data);
    }
    setAdminsLoading(false);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    loadTabData(tab);
  };

  const handleApprove = async (userId: string, userType: 'alumni' | 'ambassador') => {
    const adminEmail = 'admin@npae.gov.ng';
    const result = await approveUser(userId, userType, adminEmail);
    if (result.success) fetchData();
  };

  const handleProcessProfileRequest = async (requestId: string, action: 'approve' | 'reject') => {
    const result = await processAdminProfileRequest(requestId, action);
    if (result.success) {
      // Reload profile requests
      setProfileRequestsLoading(true);
      const refreshResult: any = await getAdminProfileRequests();
      if (refreshResult.success) {
        setProfileRequests(refreshResult.data);
      }
      setProfileRequestsLoading(false);
      
      // Update message temporarily
      setAdminMessage(`Request ${action}d successfully`);
      setTimeout(() => setAdminMessage(''), 3000);
    } else {
      setAdminMessage(`Error: ${result.error}`);
      setTimeout(() => setAdminMessage(''), 3000);
    }
  };

  const handleDelete = async (recordId: string, recordType: 'alumni' | 'ambassador' | 'reunion' | 'message') => {
    const adminEmail = 'admin@npae.gov.ng';
    const result = await deleteRecord(recordId, recordType, adminEmail);
    if (result.success) fetchData();
  };

  const handleViewDetails = async (item: any, type: 'alumni' | 'ambassador' | 'reunion' | 'message') => {
    if (type === 'alumni' || type === 'ambassador') {
      const result = await getUserDetails(item._id, type);
      if (result.success && 'data' in result) {
        setViewDetails(result.data);
      }
    } else {
      setViewDetails(item);
    }
    setViewType(type);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    setEditLoading(true);
    const formData = new FormData();
    formData.append('id', editingImage._id);
    formData.append('title', editForm.title);
    formData.append('description', editForm.description);
    formData.append('category', editForm.category);

    const result = await updateGalleryImage(formData);

    if (result.success) {
      setGalleryMessage('✅ Image updated successfully!');
      setEditingImage(null);
      loadTabData('gallery');
    } else {
      setGalleryMessage('❌ Failed to update image.');
    }

    setEditLoading(false);
    setTimeout(() => setGalleryMessage(''), 3000);
  };

  const getFilteredData = (dataArray: any[] = []) => {
    const safeArray = Array.isArray(dataArray) ? dataArray : [];
    if (selectedBaseFilter === 'all') return safeArray;
    return safeArray.filter(item => item && item.stateBaseCode === selectedBaseFilter);
  };

  const getUniqueBases = () => {
    if (!data) return [];
    const alumni = Array.isArray(data.alumni) ? data.alumni : [];
    const ambassadors = Array.isArray(data.ambassadors) ? data.ambassadors : [];
    const allMembers = [...alumni, ...ambassadors];
    const bases = new Map();

    allMembers.forEach(member => {
      if (!member) return;
      const code = member.stateBaseCode || 'LEGACY';
      const name = member.stateBaseName || 'Legacy Records';
      if (!bases.has(code)) {
        bases.set(code, name);
      }
    });

    return Array.from(bases.entries()).map(([code, name]) => ({ code, name }));
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-content">
          <div className="loading-icon">⏳</div>
          <p className="loading-text">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="error-state">
        <div className="error-content">
          <h2>❌ Failed to load data</h2>
          <button onClick={fetchData} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  const filteredAlumni = getFilteredData(data.alumni);
  const filteredAmbassadors = getFilteredData(data.ambassadors);

  return (
    <div className="admin-dashboard">
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        data={data}
        galleryImages={galleryImages}
        boardMembers={boardMembers}
        adminRole={adminRole}
      />

      <div className="admin-content-wrapper">
        {galleryMessage && (
          <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', background: galleryMessage.includes('✅') ? '#d1fae5' : galleryMessage.includes('❌') ? '#fee2e2' : '#dbeafe', color: galleryMessage.includes('✅') ? '#065f46' : galleryMessage.includes('❌') ? '#991b1b' : '#1e40af', fontWeight: 600, textAlign: 'center' }}>
            {galleryMessage}
          </div>
        )}

        <div className="content-card">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="section-title">📊 National Overview Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card purple"><span className="stat-icon">👥</span><span className="stat-number">{data.alumni.length}</span><span className="stat-label">Alumni Registered</span></div>
                <div className="stat-card pink"><span className="stat-icon">🌟</span><span className="stat-number">{data.ambassadors.length}</span><span className="stat-label">Ambassadors</span></div>
                <div className="stat-card cyan"><span className="stat-icon">🎫</span><span className="stat-number">{data.reunions.length}</span><span className="stat-label">Reunion Tickets</span></div>
                <div className="stat-card green"><span className="stat-icon">✉️</span><span className="stat-number">{data.messages.length}</span><span className="stat-label">Contact Messages</span></div>
              </div>

              <h3 style={{ marginTop: '40px', color: '#003366', marginBottom: '20px' }}>📍 Members by Base</h3>
              <DataTable
                dataSource={getUniqueBases().map(base => {
                  const alumniCount = data.alumni.filter((a: any) => a.stateBaseCode === base.code).length;
                  const ambCount = data.ambassadors.filter((a: any) => a.stateBaseCode === base.code).length;
                  return {
                    key: base.code,
                    name: base.name,
                    code: base.code,
                    alumni: alumniCount,
                    ambassadors: ambCount,
                    total: alumniCount + ambCount
                  };
                })}
                rowKey="key"
                columns={[
                  { title: 'Base Name', dataIndex: 'name', key: 'name' },
                  { title: 'Base Code', dataIndex: 'code', key: 'code', render: (text: string) => <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>{text}</span> },
                  { title: 'Alumni', dataIndex: 'alumni', key: 'alumni' },
                  { title: 'Ambassadors', dataIndex: 'ambassadors', key: 'ambassadors' },
                  { title: 'Total Members', dataIndex: 'total', key: 'total', render: (val: number) => <span style={{ fontWeight: 'bold', color: '#003366' }}>{val}</span> }
                ]}
                emptyText="No base records found"
              />
            </div>
          )}

          {/* Alumni Tab */}
          {activeTab === 'alumni' && (
            <div>
              <h2 className="section-title">👥 Alumni Registrations</h2>

              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontWeight: 600, color: '#003366' }}>Filter by Base:</label>
                <select
                  value={selectedBaseFilter}
                  onChange={(e) => setSelectedBaseFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="all">All Bases</option>
                  {getUniqueBases().map(base => (
                    <option key={base.code} value={base.code}>{base.name}</option>
                  ))}
                </select>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  Showing {filteredAlumni.length} of {data.alumni.length} alumni
                </span>
              </div>

              {filteredAlumni.length === 0 ? <p className="empty-state">No alumni found.</p> : (
                <div className="data-table-container" style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>School Attended</th>
                        <th>State Base</th>
                        <th>Grad Year</th>
                        <th>Identity Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAlumni.map((alumni: any, index: number) => (
                        <tr key={alumni._id || alumni.id || `alumni-${index}`}>
                          <td><strong>{alumni.fullName}</strong></td>
                          <td>{alumni.email}</td>
                          <td>{alumni.phoneNumber}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {alumni.schoolAttended || '-'}
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              background: '#dbeafe',
                              color: '#1e40af',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {alumni.stateBaseCode || 'N/A'}
                            </span>
                          </td>
                          <td>{alumni.yearOfGraduation || '-'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#003366' }}>
                            {alumni.identityNumber || 'Pending'}
                          </td>
                          <td>
                            <span className={`status-badge ${alumni.isVerified ? 'verified' : 'pending'}`}>
                              {alumni.isVerified ? '✓ Verified' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleViewDetails(alumni, 'alumni')} className="btn btn-view btn-small">👁️ View</button>
                              {alumni.identityNumber && (
                                <button onClick={() => setShowIDCard(normalizeToCardProps(alumni, 'alumni'))} className="btn btn-small" style={{ background: '#8b5cf6', color: 'white' }}>🎫 ID</button>
                              )}
                              {!alumni.isVerified && <button onClick={() => handleApprove(alumni._id, 'alumni')} className="btn btn-approve btn-small">✓ Approve</button>}
                              <ConfirmAction message="Archive this alumni record?" description="This action will move the record to the archive." onConfirm={() => handleDelete(alumni._id, 'alumni')}>
                                <button className="btn btn-delete btn-small">🗑️</button>
                              </ConfirmAction>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Ambassadors Tab */}
          {activeTab === 'ambassadors' && (
            <div>
              <h2 className="section-title">🌟 Ambassador Applications</h2>

              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontWeight: 600, color: '#003366' }}>Filter by Base:</label>
                <select
                  value={selectedBaseFilter}
                  onChange={(e) => setSelectedBaseFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="all">All Bases</option>
                  {getUniqueBases().map(base => (
                    <option key={base.code} value={base.code}>{base.name}</option>
                  ))}
                </select>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  Showing {filteredAmbassadors.length} of {data.ambassadors.length} ambassadors
                </span>
              </div>

              {filteredAmbassadors.length === 0 ? <p className="empty-state">No ambassadors found.</p> : (
                <div className="data-table-container" style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Occupation</th>
                        <th>State Base</th>
                        <th>Identity Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAmbassadors.map((amb: any, index: number) => (
                        <tr key={amb._id || amb.id || `amb-${index}`}>
                          <td><strong>{amb.fullName}</strong></td>
                          <td>{amb.email}</td>
                          <td>{amb.phoneNumber}</td>
                          <td>{amb.occupation || '-'}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              background: '#dbeafe',
                              color: '#1e40af',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {amb.stateBaseCode || 'N/A'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#003366' }}>
                            {amb.identityNumber || 'Pending'}
                          </td>
                          <td>
                            <span className={`status-badge ${amb.isApproved ? 'approved' : 'pending'}`}>
                              {amb.isApproved ? '✓ Approved' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleViewDetails(amb, 'ambassador')} className="btn btn-view btn-small">👁️ View</button>
                              {amb.identityNumber && (
                                <button onClick={() => setShowIDCard(normalizeToCardProps(amb, 'ambassador'))} className="btn btn-small" style={{ background: '#8b5cf6', color: 'white' }}>🎫 ID</button>
                              )}
                              {!amb.isApproved && <button onClick={() => handleApprove(amb._id, 'ambassador')} className="btn btn-approve btn-small">✓ Approve</button>}
                              <ConfirmAction message="Archive this ambassador record?" description="This action will move the record to the archive." onConfirm={() => handleDelete(amb._id, 'ambassador')}>
                                <button className="btn btn-delete btn-small">🗑️</button>
                              </ConfirmAction>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit-logs' && (
            <div>
              <h2 className="section-title">🔒 Audit Logs (Activity History)</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Track all admin actions, logins, approvals, and deletions.
              </p>

              {auditLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Loading audit logs...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <p className="empty-state">No audit logs found.</p>
              ) : (
                <div className="data-table-container" style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Admin Email</th>
                        <th>Action</th>
                        <th>Target Type</th>
                        <th>Target ID</th>
                        <th>IP Address</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log: any, index: number) => (
                        <tr key={log._id || log.id || `log-${index}`}>
                          <td style={{ fontSize: '0.85rem' }}>
                            {new Date(log.timestamp).toLocaleString('en-NG', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                          <td style={{ fontWeight: 600 }}>{log.adminEmail}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              background: log.action === 'RATE_LIMIT_HIT' ? '#fee2e2' :
                                log.action.includes('SUCCESS') || log.action.includes('APPROVE') || log.action.includes('CREATED') ? '#d1fae5' :
                                  log.action.includes('FAILED') || log.action.includes('DELETE') ? '#fee2e2' : '#dbeafe',
                              color: log.action === 'RATE_LIMIT_HIT' ? '#991b1b' :
                                log.action.includes('SUCCESS') || log.action.includes('APPROVE') || log.action.includes('CREATED') ? '#065f46' :
                                  log.action.includes('FAILED') || log.action.includes('DELETE') ? '#991b1b' : '#1e40af',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {log.action === 'RATE_LIMIT_HIT' ? '🚨 RATE LIMIT HIT' : log.action}
                            </span>
                          </td>
                          <td>{log.targetType || '-'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {log.targetId ? log.targetId.substring(0, 8) + '...' : '-'}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{log.details?.ipAddress || '-'}</td>
                          <td style={{ fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.action === 'RATE_LIMIT_HIT' ? (
                              <span style={{ color: '#991b1b', fontWeight: 600 }}>
                                Blocked for {log.details?.retryAfterSeconds}s ({log.details?.type})
                              </span>
                            ) : (
                              log.details ? JSON.stringify(log.details).substring(0, 50) : '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Manage Admins Tab */}
          {activeTab === 'manage-admins' && adminRole === 'super_admin' && (
            <div>
              <h2 className="section-title">👥 Manage Admins</h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <p style={{ color: '#666' }}>Create and manage admin accounts for National and State Bases</p>
                <button
                  onClick={() => setShowAdminForm(!showAdminForm)}
                  style={{
                    padding: '12px 24px',
                    background: '#003366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {showAdminForm ? 'Cancel' : '+ Create New Admin'}
                </button>
              </div>

              {adminMessage && (
                <div style={{
                  padding: '15px',
                  marginBottom: '20px',
                  borderRadius: '8px',
                  background: adminMessage.includes('✅') ? '#d1fae5' : '#fee2e2',
                  color: adminMessage.includes('✅') ? '#065f46' : '#991b1b',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {adminMessage}
                </div>
              )}

              {showAdminForm && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setAdminMessage('');
                  setAdminLoading(true);

                  const form = new FormData();
                  form.append('fullName', adminFormData.fullName);
                  form.append('email', adminFormData.email);
                  form.append('password', adminFormData.password);
                  form.append('role', adminFormData.role);
                  if (adminFormData.stateBase) {
                    form.append('stateBase', adminFormData.stateBase);
                  }

                  const result: any = await addNewAdmin(form);

                  if (result.success) {
                    setAdminMessage(`✅ ${result.message}`);
                    setShowAdminForm(false);
                    setAdminFormData({ fullName: '', email: '', password: '', role: 'state_admin', stateBase: '' });
                    loadAdmins();
                  } else {
                    setAdminMessage(`❌ ${result.error}`);
                  }

                  setAdminLoading(false);
                  setTimeout(() => setAdminMessage(''), 5000);
                }} style={{
                  background: '#f8f9fc',
                  padding: '30px',
                  borderRadius: '12px',
                  marginBottom: '30px'
                }}>
                  <h3 style={{ color: '#003366', marginBottom: '20px' }}>Create New Admin Account</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Full Name *</label>
                      <input
                        type="text"
                        value={adminFormData.fullName}
                        onChange={(e) => setAdminFormData({ ...adminFormData, fullName: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address *</label>
                      <input
                        type="email"
                        value={adminFormData.email}
                        onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Temporary Password *</label>
                      <input
                        type="password"
                        value={adminFormData.password}
                        onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                        required
                        minLength={6}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      />
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                        The admin will be required to change this password on first login.
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Role *</label>
                      <select
                        value={adminFormData.role}
                        onChange={(e) => setAdminFormData({ ...adminFormData, role: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      >
                        <option value="state_admin">State Base Admin</option>
                        <option value="national_admin">National Admin</option>
                      </select>
                    </div>

                    {adminFormData.role === 'state_admin' && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>State Base *</label>
                        <select
                          value={adminFormData.stateBase}
                          onChange={(e) => setAdminFormData({ ...adminFormData, stateBase: e.target.value })}
                          required
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        >
                          <option value="">Select State</option>
                          {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    style={{
                      padding: '14px 28px',
                      background: '#003366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      opacity: adminLoading ? 0.7 : 1
                    }}
                  >
                    {adminLoading ? 'Creating...' : 'Create Admin'}
                  </button>
                </form>
              )}

              {adminsLoading ? (
                <p>Loading admins...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>State Base</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin: any, index: number) => (
                        <tr key={admin.id || admin._id || `admin-${index}`}>
                          <td>{admin.fullName || 'N/A'}</td>
                          <td>{admin.email}</td>
                          <td>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              background: admin.role === 'super_admin' ? '#f4b400' : admin.role === 'national_admin' ? '#003366' : '#10b981',
                              color: 'white',
                              fontSize: '0.85rem',
                              fontWeight: 600
                            }}>
                              {admin.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>{admin.stateBase || '-'}</td>
                          <td>{new Date(admin.createdAt).toLocaleDateString('en-NG')}</td>
                          <td>
                            {admin.role !== 'super_admin' ? (
                              <ConfirmAction
                                message="Are you sure you want to delete this admin?"
                                description="They will immediately lose access to the admin panel."
                                align="left"
                                onConfirm={async () => {
                                  const result: any = await deleteAdmin(admin.id);
                                  if (result.success) {
                                    setAdminMessage('✅ Admin deleted successfully!');
                                    loadAdmins();
                                  } else {
                                    setAdminMessage(`❌ ${result.error}`);
                                  }
                                  setTimeout(() => setAdminMessage(''), 5000);
                                }}
                              >
                                <button className="btn btn-delete btn-small">Delete</button>
                              </ConfirmAction>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontStyle: 'italic' }}>Permanent</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reunion Tab */}
          {activeTab === 'reunion' && (
            <div>
              <h2 className="section-title">🎫 Reunion Registrations</h2>
              {data.reunions.length === 0 ? <p className="empty-state">No reunion registrations yet.</p> : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Email</th><th>Phone</th><th>School</th><th>Type</th><th>Payment</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.reunions.map((reg: any, index: number) => (
                        <tr key={reg._id || reg.id || `reg-${index}`}>
                          <td>{reg.fullName}</td>
                          <td>{reg.email}</td>
                          <td>{reg.phone}</td>
                          <td>{reg.school}</td>
                          <td><span className="type-badge reunion">{reg.attendanceType}</span></td>
                          <td>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              background: reg.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7',
                              color: reg.paymentStatus === 'paid' ? '#065f46' : '#92400e'
                            }}>
                              {reg.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleViewDetails(reg, 'reunion')} className="btn btn-view btn-small">👁️ View</button>
                              <ConfirmAction message="Delete this reunion registration?" description="This action cannot be undone." onConfirm={() => handleDelete(reg._id, 'reunion')}>
                                <button className="btn btn-delete btn-small">🗑️ Delete</button>
                              </ConfirmAction>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div>
              <h2 className="section-title">✉️ Contact Messages</h2>
              {data.messages.length === 0 ? <p className="empty-state">No messages yet.</p> : (
                <div className="messages-grid">
                  {data.messages.map((msg: any, idx: number) => (
                    <div key={msg._id || msg.id || `msg-${idx}`} className="message-card">
                      <div className="message-header">
                        <div>
                          <span className="message-author">{msg.name}</span>
                          <span className="message-email">&lt;{msg.email}&gt;</span>
                        </div>
                        <div className="action-buttons">
                          <button onClick={() => handleViewDetails(msg, 'message')} className="btn btn-view btn-small">👁️ View</button>
                          <ConfirmAction message="Delete this message?" description="This action cannot be undone." onConfirm={() => handleDelete(msg._id, 'message')}>
                            <button className="btn btn-delete btn-small">🗑️ Delete</button>
                          </ConfirmAction>
                        </div>
                      </div>
                      {msg.subject && <p className="message-subject">Subject: {msg.subject}</p>}
                      <p className="message-content">{msg.message}</p>
                      <p className="message-date">Received: {new Date(msg.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Broadcast Tab */}
          {activeTab === 'broadcast' && (
            <div>
              <h2 className="section-title">📢 Broadcast Messages</h2>
              <div className="broadcast-form" style={{ marginBottom: '40px', padding: '30px', background: '#f8f9fc', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '20px', color: '#003366' }}>Compose New Broadcast</h3>
                {broadcastMessage && (
                  <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', background: broadcastMessage.includes('✅') ? '#d1fae5' : '#fee2e2', color: broadcastMessage.includes('✅') ? '#065f46' : '#991b1b' }}>
                    {broadcastMessage}
                  </div>
                )}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setBroadcastLoading(true);
                  setBroadcastMessage('');

                  const formData = new FormData();
                  formData.append('subject', broadcastForm.subject);
                  formData.append('message', broadcastForm.message);
                  formData.append('sentTo', broadcastForm.sentTo);
                  formData.append('sentBy', 'Admin');

                  if (broadcastForm.sentTo === 'base' && broadcastForm.targetBaseCode) {
                    formData.append('targetBaseCode', broadcastForm.targetBaseCode);
                  }

                  const result = await sendBroadcast(formData);

                  if (result.success) {
                    setBroadcastMessage(`✅ ${result.message}`);
                    setBroadcastForm({ subject: '', message: '', sentTo: 'all', targetBaseCode: '' });
                    loadTabData('broadcast');
                  } else {
                    setBroadcastMessage('❌ Failed to send broadcast.');
                  }

                  setBroadcastLoading(false);
                  setTimeout(() => setBroadcastMessage(''), 5000);
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Send To:</label>
                    <select
                      value={broadcastForm.sentTo}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, sentTo: e.target.value, targetBaseCode: '' })}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      required
                    >
                      <option value="all">All Members (All Bases)</option>
                      <option value="alumni">All Alumni (All Bases)</option>
                      <option value="ambassadors">All Ambassadors (All Bases)</option>
                      <option value="reunion">Reunion Registrants Only</option>
                      <option value="base">📍 Specific State Base</option>
                    </select>
                  </div>

                  {broadcastForm.sentTo === 'base' && (
                    <div style={{ marginBottom: '20px', padding: '15px', background: '#e0f2fe', borderRadius: '8px', borderLeft: '4px solid #003366' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#003366' }}>Select State Base:</label>
                      <select
                        value={broadcastForm.targetBaseCode}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, targetBaseCode: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #003366' }}
                        required
                      >
                        <option value="">-- Select a Base --</option>
                        <option value="NAT">National Base (All States)</option>
                        {getUniqueBases().map(base => (
                          <option key={base.code} value={base.code}>{base.name} ({base.code})</option>
                        ))}
                      </select>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                        This will send only to alumni and ambassadors registered under this specific base.
                      </p>
                    </div>
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Subject:</label>
                    <input
                      type="text"
                      value={broadcastForm.subject}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                      placeholder="Enter broadcast subject..."
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Message:</label>
                    <textarea
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      placeholder="Write your broadcast message..."
                      rows={6}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
                      required
                    />
                  </div>
                  <button type="submit" disabled={broadcastLoading} className="btn btn-approve" style={{ padding: '14px 28px', opacity: broadcastLoading ? 0.7 : 1 }}>
                    {broadcastLoading ? 'Sending...' : '📢 Send Broadcast'}
                  </button>
                </form>
              </div>

              <h3 style={{ marginBottom: '20px', color: '#003366' }}>📨 Broadcast History</h3>
              {broadcasts.length === 0 ? <p className="empty-state">No broadcasts sent yet.</p> : (
                <div className="messages-grid">
                  {broadcasts.map((broadcast: any, idx: number) => (
                    <div key={broadcast._id || broadcast.id || `broadcast-${idx}`} className="message-card">
                      <div className="message-header">
                        <div>
                          <strong style={{ fontSize: '1.1rem' }}>{broadcast.subject}</strong>
                          <span style={{ marginLeft: '15px', padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                            To: {broadcast.sentTo === 'base' ? `${broadcast.targetBaseName || broadcast.targetBaseCode} Base` : broadcast.sentTo}
                          </span>
                        </div>
                      </div>
                      <p className="message-content" style={{ whiteSpace: 'pre-wrap' }}>{broadcast.message}</p>
                      <p className="message-date">Sent by: {broadcast.sentBy} • {new Date(broadcast.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              <h2 className="section-title">🖼️ Gallery Management</h2>
              <div className="gallery-upload-form" style={{ marginBottom: '40px', padding: '30px', background: '#f8f9fc', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '20px', color: '#003366' }}>Upload New Image</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!imageFile) {
                    setGalleryMessage('❌ Please select an image.');
                    return;
                  }

                  setGalleryLoading(true);
                  setGalleryMessage('');

                  const formData = new FormData();
                  formData.append('title', galleryForm.title);
                  formData.append('description', galleryForm.description);
                  formData.append('category', galleryForm.category);
                  formData.append('image', imageFile);
                  formData.append('uploadedBy', 'Admin');

                  const result = await uploadGalleryImage(formData);

                  if (result.success) {
                    setGalleryMessage('✅ Image uploaded successfully!');
                    setGalleryForm({ title: '', description: '', category: 'General' });
                    setImagePreview('');
                    setImageFile('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    loadTabData('gallery');
                  } else {
                    setGalleryMessage('❌ Failed to upload image.');
                  }

                  setGalleryLoading(false);
                  setTimeout(() => setGalleryMessage(''), 5000);
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Image Title:</label>
                    <input type="text" value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} placeholder="Enter image title..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Category:</label>
                    <select value={galleryForm.category} onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                      <option>General</option><option>Reunion</option><option>Events</option><option>Community Service</option><option>Awards</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Description:</label>
                    <textarea value={galleryForm.description} onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })} placeholder="Enter image description (optional)..." rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Upload Image:</label>
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                          setImageFile(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} style={{ width: '100%', padding: '12px', border: '2px dashed #d1d5db', borderRadius: '8px' }} required />
                    {imagePreview && (
                      <div style={{ marginTop: '15px' }}>
                        <p style={{ marginBottom: '8px', fontWeight: 600 }}>Preview:</p>
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px', border: '2px solid #e5e7eb' }} />
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={galleryLoading} className="btn btn-approve" style={{ padding: '14px 28px', opacity: galleryLoading ? 0.7 : 1 }}>
                    {galleryLoading ? 'Uploading...' : '📸 Upload Image'}
                  </button>
                </form>
              </div>
              <h3 style={{ marginBottom: '20px', color: '#003366' }}>📷 Gallery Images ({galleryImages.length})</h3>
              {galleryImages.length === 0 ? <p className="empty-state">No images uploaded yet.</p> : (
                <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                  {galleryImages.map((img: any, idx: number) => (
                    <div key={img._id || img.id || `img-${idx}`} className="gallery-item" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <img src={img.imageUrl} alt={img.title} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0, color: '#1f2937', fontSize: '1.1rem' }}>{img.title}</h4>
                          <span style={{ padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{img.category}</span>
                        </div>
                        {img.description && <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 10px 0' }}>{img.description}</p>}
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '0 0 15px 0' }}>Uploaded: {new Date(img.createdAt).toLocaleDateString('en-NG')}</p>
                        <div className="action-buttons">
                          <button onClick={() => {
                            setEditingImage(img);
                            setEditForm({ title: img.title, description: img.description || '', category: img.category || 'General' });
                          }} className="btn btn-approve btn-small" style={{ flex: 1 }}>✏️ Edit</button>
                          <ConfirmAction
                            message="Delete this image from gallery?"
                            description="It will be permanently removed from the website."
                            position="top"
                            align="right"
                            onConfirm={async () => {
                              setGalleryMessage('Deleting...');
                              const adminEmail = 'admin@npae.gov.ng';
                              const result = await deleteRecord(img._id, 'gallery', adminEmail);
                              if (result.success) {
                                setGalleryMessage('✅ Image deleted successfully!');
                                loadTabData('gallery');
                              } else {
                                setGalleryMessage('❌ Failed to delete image.');
                              }
                              setTimeout(() => setGalleryMessage(''), 3000);
                            }}
                          >
                            <button className="btn btn-delete btn-small" style={{ flex: 1, width: '100%' }}>🗑️ Delete</button>
                          </ConfirmAction>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Leadership Tab */}
          {activeTab === 'leadership' && (
            <div>
              <h2 className="section-title">🏛️ Board Members Management</h2>

              {leadershipMessage && (
                <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', background: leadershipMessage.includes('✅') ? '#d1fae5' : '#fee2e2', color: leadershipMessage.includes('✅') ? '#065f46' : '#991b1b', textAlign: 'center', fontWeight: 600 }}>
                  {leadershipMessage}
                </div>
              )}

              <div style={{ padding: '30px', background: '#f8f9fc', borderRadius: '12px', marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px', color: '#003366' }}>{editingMember ? '✏️ Edit Member' : '➕ Add New Board Member'}</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData();
                  if (editingMember) formData.append('id', editingMember.id || editingMember._id);
                  formData.append('name', leadershipForm.name);
                  formData.append('role', leadershipForm.role);
                  formData.append('bio', leadershipForm.bio);
                  formData.append('photoUrl', leadershipForm.photoUrl);
                  formData.append('isFeatured', leadershipForm.isFeatured.toString());
                  formData.append('linkedin', leadershipForm.linkedin);
                  formData.append('twitter', leadershipForm.twitter);

                  const result = await saveBoardMember(formData);
                  if (result.success) {
                    setLeadershipMessage('✅ Member saved successfully!');
                    setLeadershipForm({ name: '', role: '', bio: '', photoUrl: '', isFeatured: false, linkedin: '', twitter: '' });
                    setEditingMember(null);
                    loadTabData('leadership');
                  } else {
                    setLeadershipMessage('❌ Failed to save member.');
                  }
                  setTimeout(() => setLeadershipMessage(''), 3000);
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    <input type="text" placeholder="Full Name" value={leadershipForm.name} onChange={(e) => setLeadershipForm({ ...leadershipForm, name: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
                    <input type="text" placeholder="Role/Title" value={leadershipForm.role} onChange={(e) => setLeadershipForm({ ...leadershipForm, role: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
                  </div>
                  <textarea placeholder="Short Bio" value={leadershipForm.bio} onChange={(e) => setLeadershipForm({ ...leadershipForm, bio: e.target.value })} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '15px' }} required />
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Member Photo:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLeadershipForm({ ...leadershipForm, photoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ padding: '12px', border: '2px dashed #d1d5db', borderRadius: '8px', width: '100%', cursor: 'pointer' }}
                      required={!editingMember}
                    />
                    {leadershipForm.photoUrl && (
                      <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <img
                          src={leadershipForm.photoUrl}
                          alt="Preview"
                          style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '3px solid #003366',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={leadershipForm.isFeatured} onChange={(e) => setLeadershipForm({ ...leadershipForm, isFeatured: e.target.checked })} />
                      <span>Featured (Chairman/Larger Card)</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {editingMember && <button type="button" onClick={() => { setEditingMember(null); setLeadershipForm({ name: '', role: '', bio: '', photoUrl: '', isFeatured: false, linkedin: '', twitter: '' }); }} className="btn btn-delete">Cancel</button>}
                    <button type="submit" className="btn btn-approve">{editingMember ? '💾 Update Member' : '➕ Add Member'}</button>
                  </div>
                </form>
              </div>

              <h3 style={{ marginBottom: '20px', color: '#003366' }}>👥 Current Board Members ({boardMembers.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {boardMembers.map((member: any, idx: number) => (
                  <div key={member._id || member.id || `member-${idx}`} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
                    {member.isFeatured && <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#f4b400', color: '#003366', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, zIndex: 10 }}>⭐ Featured</div>}
                    <img src={member.photoUrl} alt={member.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <div style={{ padding: '20px' }}>
                      <h4 style={{ margin: '0 0 5px 0', color: '#003366' }}>{member.name}</h4>
                      <p style={{ margin: '0 0 10px 0', color: '#f4b400', fontWeight: 600, fontSize: '0.9rem' }}>{member.role}</p>
                      <p style={{ margin: '0 0 15px 0', color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>{member.bio.substring(0, 80)}...</p>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button onClick={() => { setEditingMember(member); setLeadershipForm({ name: member.name, role: member.role, bio: member.bio, photoUrl: member.photoUrl, isFeatured: member.isFeatured, linkedin: member.linkedin || '', twitter: member.twitter || '' }); }} className="btn btn-approve btn-small" style={{ flex: 1 }}>✏️ Edit</button>
                        <button
                          onClick={() => setShowBoardMemberIDCard(member)}
                          className="btn btn-small"
                          style={{ flex: 1, background: '#8b5cf6', color: 'white' }}
                        >
                          🎫 ID Card
                        </button>
                      </div>
                      <ConfirmAction
                        message="Delete this member?"
                        description="This action cannot be undone."
                        position="top"
                        onConfirm={async () => {
                          const adminEmail = 'admin@npae.gov.ng';
                          const res = await deleteRecord(member.id || member._id, 'board', adminEmail);
                          if (res.success) loadTabData('leadership');
                        }}
                      >
                        <button className="btn btn-delete btn-small" style={{ width: '100%' }}>🗑️ Delete</button>
                      </ConfirmAction>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reunion Settings Tab */}
          {activeTab === 'reunion-settings' && reunionSettings && (
            <div>
              <h2 className="section-title">⚙️ Reunion Page Settings</h2>

              {reunionSettingsMessage && (
                <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', background: reunionSettingsMessage.includes('✅') ? '#d1fae5' : '#fee2e2', color: reunionSettingsMessage.includes('✅') ? '#065f46' : '#991b1b', textAlign: 'center', fontWeight: 600 }}>
                  {reunionSettingsMessage}
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                setReunionSettingsLoading(true);
                const result = await updateReunionSettings(reunionSettings);
                if (result.success) {
                  setReunionSettingsMessage('✅ Reunion settings updated successfully!');
                } else {
                  setReunionSettingsMessage('❌ Failed to update settings.');
                }
                setReunionSettingsLoading(false);
                setTimeout(() => setReunionSettingsMessage(''), 3000);
              }}>
                <div style={{ padding: '25px', background: '#f8f9fc', borderRadius: '12px', marginBottom: '25px' }}>
                  <h3 style={{ color: '#003366', marginBottom: '15px' }}>🎯 Hero Section</h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <input type="text" placeholder="Badge Text" value={reunionSettings.heroBadge} onChange={(e) => setReunionSettings({ ...reunionSettings, heroBadge: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Hero Title" value={reunionSettings.heroTitle} onChange={(e) => setReunionSettings({ ...reunionSettings, heroTitle: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <textarea placeholder="Hero Description" value={reunionSettings.heroDescription} onChange={(e) => setReunionSettings({ ...reunionSettings, heroDescription: e.target.value })} rows={3} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }} />
                  </div>
                </div>

                <div style={{ padding: '25px', background: '#f8f9fc', borderRadius: '12px', marginBottom: '25px' }}>
                  <h3 style={{ color: '#003366', marginBottom: '15px' }}>📅 Event Details</h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <input type="text" placeholder="Event Title" value={reunionSettings.eventTitle} onChange={(e) => setReunionSettings({ ...reunionSettings, eventTitle: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Event Subtitle" value={reunionSettings.eventSubtitle} onChange={(e) => setReunionSettings({ ...reunionSettings, eventSubtitle: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Event Date" value={reunionSettings.eventDate} onChange={(e) => setReunionSettings({ ...reunionSettings, eventDate: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <textarea placeholder="Event Venue" value={reunionSettings.eventVenue} onChange={(e) => setReunionSettings({ ...reunionSettings, eventVenue: e.target.value })} rows={2} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }} />
                    <input type="text" placeholder="Event Time" value={reunionSettings.eventTime} onChange={(e) => setReunionSettings({ ...reunionSettings, eventTime: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Expected Attendance" value={reunionSettings.expectedAttendance} onChange={(e) => setReunionSettings({ ...reunionSettings, expectedAttendance: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                  </div>
                </div>

                <div style={{ padding: '25px', background: '#f8f9fc', borderRadius: '12px', marginBottom: '25px' }}>
                  <h3 style={{ color: '#003366', marginBottom: '15px' }}>💰 Pricing</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <input type="text" placeholder="Early Bird Price" value={reunionSettings.earlyBirdPrice} onChange={(e) => setReunionSettings({ ...reunionSettings, earlyBirdPrice: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Early Bird Label" value={reunionSettings.earlyBirdLabel} onChange={(e) => setReunionSettings({ ...reunionSettings, earlyBirdLabel: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Regular Price" value={reunionSettings.regularPrice} onChange={(e) => setReunionSettings({ ...reunionSettings, regularPrice: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Regular Label" value={reunionSettings.regularLabel} onChange={(e) => setReunionSettings({ ...reunionSettings, regularLabel: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                  </div>
                </div>

                <button type="submit" disabled={reunionSettingsLoading} className="btn btn-approve" style={{ padding: '14px 28px', opacity: reunionSettingsLoading ? 0.7 : 1 }}>
                  {reunionSettingsLoading ? 'Saving...' : '💾 Save All Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 'support' && (
            <div>
              <h2 className="section-title">🎫 Support Tickets</h2>

              {supportLoading ? (
                <p>Loading tickets...</p>
              ) : supportTickets.length === 0 ? (
                <p className="empty-state">No support tickets yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>User</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportTickets.map((ticket: any, index: number) => (
                        <tr key={ticket._id || ticket.id || `ticket-${index}`}>
                          <td><strong>{ticket.subject}</strong></td>
                          <td>{ticket.userName}<br /><small style={{ color: '#666' }}>{ticket.userEmail}</small></td>
                          <td>{ticket.category}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: ticket.priority === 'urgent' ? '#fee2e2' : ticket.priority === 'high' ? '#fef3c7' : '#dbeafe',
                              color: ticket.priority === 'urgent' ? '#991b1b' : ticket.priority === 'high' ? '#92400e' : '#1e40af',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {ticket.priority.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: ticket.status === 'open' ? '#dbeafe' : ticket.status === 'in-progress' ? '#fef3c7' : ticket.status === 'resolved' ? '#d1fae5' : '#f3f4f6',
                              color: ticket.status === 'open' ? '#1e40af' : ticket.status === 'in-progress' ? '#92400e' : ticket.status === 'resolved' ? '#065f46' : '#374151',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {ticket.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="btn btn-view btn-small"
                            >
                              View & Respond
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <h2 className="section-title">💳 Payments & Transactions</h2>
              {payments.length === 0 ? (
                <p className="empty-state">No payments recorded yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member Info</th>
                        <th>Purpose</th>
                        <th>Amount</th>
                        <th>Reference</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment: any, index: number) => (
                        <tr key={payment._id || payment.id || `payment-${index}`}>
                          <td>
                            <strong>{payment.fullName}</strong><br />
                            <small style={{ color: '#666' }}>{payment.email} | {payment.expolIdNumber || 'No ID'}</small>
                          </td>
                          <td>
                            <span style={{ textTransform: 'capitalize' }}>
                              {payment.purpose === 'other' ? payment.customReason : payment.purpose}
                            </span>
                          </td>
                          <td>
                            <strong>₦{payment.amount.toLocaleString()}</strong>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {payment.paystackReference}
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: payment.status === 'success' ? '#d1fae5' : payment.status === 'pending' ? '#fef3c7' : '#fee2e2',
                              color: payment.status === 'success' ? '#065f46' : payment.status === 'pending' ? '#92400e' : '#991b1b',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {payment.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{new Date(payment.createdAt).toLocaleDateString('en-NG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payment Settings Tab */}
          {activeTab === 'payment-settings' && paymentSettings && (
            <div>
              <h2 className="section-title">⚙️ Payment Settings</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Manage payment purposes, amounts, and availability for users.
              </p>

              {paymentSettingsMessage && (
                <div style={{
                  padding: '15px',
                  marginBottom: '20px',
                  borderRadius: '8px',
                  background: paymentSettingsMessage.includes('✅') ? '#d1fae5' : '#fee2e2',
                  color: paymentSettingsMessage.includes('✅') ? '#065f46' : '#991b1b',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {paymentSettingsMessage}
                </div>
              )}

              <div style={{ background: '#f8f9fc', padding: '30px', borderRadius: '12px', marginBottom: '30px' }}>
                <h3 style={{ color: '#003366', marginBottom: '20px' }}>💳 Payment Purposes</h3>

                <div style={{ marginBottom: '20px' }}>
                  <button
                    onClick={() => {
                      const newPurpose = {
                        value: `purpose-${Date.now()}`,
                        label: 'New Purpose',
                        amount: 0,
                        enabled: true,
                        order: paymentSettings.purposes.length + 1
                      };
                      setPaymentSettings({
                        ...paymentSettings,
                        purposes: [...paymentSettings.purposes, newPurpose]
                      });
                    }}
                    style={{
                      padding: '10px 20px',
                      background: '#003366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    + Add New Purpose
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {paymentSettings.purposes.map((purpose: any, index: number) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr auto auto',
                      gap: '15px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                          Value (ID)
                        </label>
                        <input
                          type="text"
                          value={purpose.value}
                          onChange={(e) => {
                            const updated = [...paymentSettings.purposes];
                            updated[index].value = e.target.value;
                            setPaymentSettings({ ...paymentSettings, purposes: updated });
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          placeholder="e.g., reunion"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                          Display Label
                        </label>
                        <input
                          type="text"
                          value={purpose.label}
                          onChange={(e) => {
                            const updated = [...paymentSettings.purposes];
                            updated[index].label = e.target.value;
                            setPaymentSettings({ ...paymentSettings, purposes: updated });
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          placeholder="e.g., Reunion Registration Fee"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                          Amount (₦)
                        </label>
                        <input
                          type="number"
                          value={purpose.amount}
                          onChange={(e) => {
                            const updated = [...paymentSettings.purposes];
                            updated[index].amount = parseFloat(e.target.value) || 0;
                            setPaymentSettings({ ...paymentSettings, purposes: updated });
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          min="0"
                          step="100"
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={purpose.enabled}
                            onChange={(e) => {
                              const updated = [...paymentSettings.purposes];
                              updated[index].enabled = e.target.checked;
                              setPaymentSettings({ ...paymentSettings, purposes: updated });
                            }}
                          />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enabled</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => {
                            if (index > 0) {
                              const updated = [...paymentSettings.purposes];
                              [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
                              updated.forEach((p, i) => p.order = i + 1);
                              setPaymentSettings({ ...paymentSettings, purposes: updated });
                            }
                          }}
                          disabled={index === 0}
                          style={{
                            padding: '8px 12px',
                            background: index === 0 ? '#e5e7eb' : '#003366',
                            color: index === 0 ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: index === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => {
                            if (index < paymentSettings.purposes.length - 1) {
                              const updated = [...paymentSettings.purposes];
                              [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                              updated.forEach((p, i) => p.order = i + 1);
                              setPaymentSettings({ ...paymentSettings, purposes: updated });
                            }
                          }}
                          disabled={index === paymentSettings.purposes.length - 1}
                          style={{
                            padding: '8px 12px',
                            background: index === paymentSettings.purposes.length - 1 ? '#e5e7eb' : '#003366',
                            color: index === paymentSettings.purposes.length - 1 ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: index === paymentSettings.purposes.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ↓
                        </button>
                        <ConfirmAction
                          message="Delete this payment purpose?"
                          description="It will no longer appear in the payment form."
                          position="top"
                          align="right"
                          onConfirm={() => {
                            const updated = paymentSettings.purposes.filter((_: any, i: number) => i !== index);
                            updated.forEach((p: any, i: number) => p.order = i + 1);
                            setPaymentSettings({ ...paymentSettings, purposes: updated });
                          }}
                        >
                          <button
                            style={{
                              padding: '8px 12px',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </ConfirmAction>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={async () => {
                      setPaymentSettingsLoading(true);
                      setPaymentSettingsMessage('');

                      const result: any = await updatePaymentSettings(paymentSettings.purposes);

                      if (result.success) {
                        setPaymentSettingsMessage('✅ Payment settings updated successfully!');
                      } else {
                        setPaymentSettingsMessage('❌ ' + result.error);
                      }

                      setPaymentSettingsLoading(false);
                      setTimeout(() => setPaymentSettingsMessage(''), 5000);
                    }}
                    disabled={paymentSettingsLoading}
                    style={{
                      padding: '14px 28px',
                      background: '#003366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      opacity: paymentSettingsLoading ? 0.7 : 1
                    }}
                  >
                    {paymentSettingsLoading ? 'Saving...' : '💾 Save All Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'profile-requests' && (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>🔄 Profile Update Requests</h2>
            <button onClick={() => loadTabData('profile-requests')} className="btn">
              ↻ Refresh
            </button>
          </div>

          {adminMessage && (
            <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', background: adminMessage.includes('Error') ? '#fee2e2' : '#d1fae5', color: adminMessage.includes('Error') ? '#991b1b' : '#065f46' }}>
              {adminMessage}
            </div>
          )}

          {profileRequestsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading requests...</div>
          ) : profileRequests.length === 0 ? (
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
              <h3>All caught up!</h3>
              <p>There are no pending profile update requests.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {profileRequests.map((req) => (
                <div key={req._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f3f4f6', paddingBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{req.userName}</h3>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{req.userEmail} • <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{req.userType}</span></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '0.85rem' }}>Requested on: {new Date(req.createdAt).toLocaleString()}</p>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#fef3c7', color: '#92400e', fontSize: '0.85rem', fontWeight: 600 }}>Pending</span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#4b5563', fontSize: '0.95rem' }}>Requested Changes:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      {Object.entries(req.requestedChanges).map(([key, value]: any) => (
                        <div key={key} style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span style={{ color: '#111827', fontWeight: 500 }}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <ConfirmAction
                      message="Reject profile changes?"
                      description="The user's profile will remain unchanged."
                      onConfirm={() => handleProcessProfileRequest(req._id, 'reject')}
                    >
                      <button className="btn btn-delete">❌ Reject</button>
                    </ConfirmAction>
                    
                    <ConfirmAction
                      message="Approve profile changes?"
                      description="These changes will be permanently applied to the user's profile."
                      onConfirm={() => handleProcessProfileRequest(req._id, 'approve')}
                    >
                      <button className="btn btn-approve">✅ Approve Changes</button>
                    </ConfirmAction>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Details Modal */}
      {viewDetails && (
        <div className="modal-overlay" onClick={() => setViewDetails(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setViewDetails(null)}>&times;</button>

            {viewType === 'alumni' && viewDetails && (
              <div>
                <h2 style={{ color: '#003366', marginBottom: '20px', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>👤 Complete Alumni Profile</h2>

                {viewDetails.passportPhoto && (
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <img src={viewDetails.passportPhoto} alt="Passport" style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #003366', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <DetailViewer
                    title="📋 Personal Information"
                    items={[
                      { label: 'Full Name', value: viewDetails.fullName },
                      { label: 'Other Names', value: viewDetails.otherName || '—' },
                      { label: 'Gender', value: viewDetails.gender },
                      { label: 'Date of Birth', value: viewDetails.dateOfBirth },
                      { label: 'NIN', value: viewDetails.nin, mono: true },
                      { label: 'Email', value: viewDetails.email, mono: true },
                      { label: 'Phone', value: viewDetails.phoneNumber },
                      { label: 'State of Residence', value: viewDetails.stateOfResidence },
                      { label: 'Address', value: viewDetails.residentialAddress, span: 2 },
                    ]}
                  />

                  <DetailViewer
                    title="🎓 Academic Information"
                    items={[
                      { label: 'School Attended', value: viewDetails.schoolAttended, span: 2 },
                      { label: 'Admission Number', value: viewDetails.admissionNumber, mono: true },
                      { label: 'Year of Admission', value: viewDetails.yearOfAdmission },
                      { label: 'Year of Graduation', value: viewDetails.yearOfGraduation },
                      { label: 'House / Hostel', value: viewDetails.houseHostel || '—' },
                      { label: 'Positions Held', value: viewDetails.positionsHeld || '—' },
                    ]}
                  />

                  <DetailViewer
                    title="📍 Base Information"
                    items={[
                      { label: 'State Base', value: viewDetails.stateBaseName || '—' },
                      { label: 'Base Code', value: viewDetails.stateBaseCode, mono: true },
                    ]}
                  />

                  <DetailViewer
                    title="💼 Professional Information"
                    items={[
                      { label: 'Highest Qualification', value: viewDetails.highestQualification || '—' },
                      { label: 'Current Occupation', value: viewDetails.currentOccupation || '—' },
                      { label: 'Alumni Member', value: viewDetails.alumniMember || '—' },
                    ]}
                  />

                  <DetailViewer
                    title={viewDetails.isVerified ? '✅ Account Status' : '⏳ Account Status'}
                    items={[
                      { label: 'Status', value: <span className={`status-badge ${viewDetails.isVerified ? 'verified' : 'pending'}`}>{viewDetails.isVerified ? '✓ Verified' : '⏳ Pending'}</span> },
                      { label: 'Identity Number', value: viewDetails.identityNumber, mono: true, hidden: !viewDetails.identityNumber },
                      { label: 'Registered', value: viewDetails.createdAt ? new Date(viewDetails.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
                    ]}
                  />

                  {viewDetails.ssceCertificate && (
                    <div style={{ background: '#f8f9fc', padding: '20px', borderRadius: '12px' }}>
                      <h3 style={{ color: '#003366', marginBottom: '12px', fontSize: '1rem' }}>📄 SSCE/WAEC Certificate</h3>
                      <div style={{ textAlign: 'center' }}>
                        <img src={viewDetails.ssceCertificate} alt="SSCE Certificate" style={{ maxWidth: '100%', maxHeight: '350px', border: '2px solid #d1d5db', borderRadius: '8px' }} />
                        <p style={{ marginTop: '8px' }}><a href={viewDetails.ssceCertificate} target="_blank" rel="noopener noreferrer" style={{ color: '#003366', fontWeight: 600 }}>📥 View Full Size in New Tab</a></p>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  {!viewDetails.isVerified && (
                    <button onClick={() => { handleApprove(viewDetails._id, 'alumni'); setViewDetails(null); }} className="btn btn-approve" style={{ flex: 1, padding: '12px' }}>✓ Approve &amp; Verify</button>
                  )}
                  {viewDetails.identityNumber && (
                    <button onClick={() => { setShowIDCard(normalizeToCardProps(viewDetails, 'alumni')); setViewDetails(null); }} className="btn" style={{ flex: 1, padding: '12px', background: '#8b5cf6', color: 'white' }}>🎫 View ID Card</button>
                  )}
                  <button onClick={() => setViewDetails(null)} className="btn btn-delete" style={{ flex: 1, padding: '12px' }}>Close</button>
                </div>
              </div>
            )}

            {viewType === 'ambassador' && viewDetails && (
              <div>
                <h2 style={{ color: '#003366', marginBottom: '20px', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>🌟 Complete Ambassador Profile</h2>

                {viewDetails.passportPhoto && (
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <img src={viewDetails.passportPhoto} alt="Passport" style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #003366', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <DetailViewer
                    title="📋 Personal Information"
                    items={[
                      { label: 'Full Name', value: viewDetails.fullName },
                      { label: 'Gender', value: viewDetails.gender },
                      { label: 'Date of Birth', value: viewDetails.dateOfBirth },
                      { label: 'Email', value: viewDetails.email, mono: true },
                      { label: 'Phone', value: viewDetails.phoneNumber },
                      { label: 'State', value: viewDetails.state },
                      { label: 'Address', value: viewDetails.residentialAddress, span: 2 },
                    ]}
                  />

                  <DetailViewer
                    title="📍 Base Information"
                    items={[
                      { label: 'State Base', value: viewDetails.stateBaseName || '—' },
                      { label: 'Base Code', value: viewDetails.stateBaseCode, mono: true },
                    ]}
                  />

                  <DetailViewer
                    title="💼 Professional Information"
                    items={[
                      { label: 'Occupation', value: viewDetails.occupation || '—' },
                      { label: 'Organization', value: viewDetails.organization || '—' },
                      { label: 'Position', value: viewDetails.position || '—' },
                      { label: 'Years of Experience', value: viewDetails.yearsOfExperience ? `${viewDetails.yearsOfExperience} years` : '—' },
                      { label: 'LinkedIn / Website', value: viewDetails.linkedinWebsite ? <a href={viewDetails.linkedinWebsite} target="_blank" rel="noopener noreferrer" style={{ color: '#003366' }}>{viewDetails.linkedinWebsite}</a> : '—', span: 2 },
                    ]}
                  />

                  <DetailViewer
                    title="🎯 Ambassador Details"
                    items={[
                      { label: 'Ambassador Type', value: <span className="type-badge" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>{viewDetails.ambassadorType}</span> },
                      { label: 'Support Commitment', value: viewDetails.supportCommitment || '—' },
                      { label: 'Support Type', value: viewDetails.supportType || '—' },
                      { label: 'Why Ambassador', value: viewDetails.whyAmbassador || '—', span: 2 },
                      { label: 'Message to Students', value: viewDetails.messageToStudents || '—', span: 2 },
                    ]}
                  />

                  <DetailViewer
                    title={viewDetails.isApproved ? '✅ Account Status' : '⏳ Account Status'}
                    items={[
                      { label: 'Status', value: <span className={`status-badge ${viewDetails.isApproved ? 'approved' : 'pending'}`}>{viewDetails.isApproved ? '✓ Approved' : '⏳ Pending'}</span> },
                      { label: 'Identity Number', value: viewDetails.identityNumber, mono: true, hidden: !viewDetails.identityNumber },
                      { label: 'Registered', value: viewDetails.createdAt ? new Date(viewDetails.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
                    ]}
                  />

                  {viewDetails.supportingDocument && (
                    <div style={{ background: '#f8f9fc', padding: '20px', borderRadius: '12px' }}>
                      <h3 style={{ color: '#003366', marginBottom: '12px', fontSize: '1rem' }}>📄 Supporting Document</h3>
                      <div style={{ textAlign: 'center' }}>
                        <img src={viewDetails.supportingDocument} alt="Supporting Document" style={{ maxWidth: '100%', maxHeight: '350px', border: '2px solid #d1d5db', borderRadius: '8px' }} />
                        <p style={{ marginTop: '8px' }}><a href={viewDetails.supportingDocument} target="_blank" rel="noopener noreferrer" style={{ color: '#003366', fontWeight: 600 }}>📥 View Full Size in New Tab</a></p>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  {!viewDetails.isApproved && (
                    <button onClick={() => { handleApprove(viewDetails._id, 'ambassador'); setViewDetails(null); }} className="btn btn-approve" style={{ flex: 1, padding: '12px' }}>✓ Approve Ambassador</button>
                  )}
                  {viewDetails.identityNumber && (
                    <button onClick={() => { setShowIDCard(normalizeToCardProps(viewDetails, 'ambassador')); setViewDetails(null); }} className="btn" style={{ flex: 1, padding: '12px', background: '#8b5cf6', color: 'white' }}>🎫 View ID Card</button>
                  )}
                  <button onClick={() => setViewDetails(null)} className="btn btn-delete" style={{ flex: 1, padding: '12px' }}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {showIDCard && (
        <div className="modal-overlay" onClick={() => setShowIDCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setShowIDCard(null)}>&times;</button>
            <h2 style={{ color: '#003366', marginBottom: '20px', textAlign: 'center' }}>
              🎫 Official NPAE ID Card
            </h2>
            <IDCard
              memberType={showIDCard.memberType}
              fullName={showIDCard.fullName}
              identityNumber={showIDCard.identityNumber}
              passportPhoto={showIDCard.passportPhoto}
              chapterCode={showIDCard.chapterCode}
              schoolOrOrg={showIDCard.schoolOrOrg}
            />
          </div>
        </div>
      )}

      {/* Edit Gallery Image Modal */}
      {editingImage && (
        <div className="modal-overlay" onClick={() => setEditingImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditingImage(null)}>&times;</button>
            <h2 style={{ color: '#003366', marginBottom: '20px' }}>✏️ Edit Image Details</h2>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src={editingImage.imageUrl} alt={editingImage.title} style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Title:</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Category:</label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  <option>General</option><option>Reunion</option><option>Events</option><option>Community Service</option><option>Awards</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Description:</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }} />
              </div>
              <div className="action-buttons">
                <button type="button" onClick={() => setEditingImage(null)} className="btn btn-delete" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={editLoading} className="btn btn-approve" style={{ flex: 1, opacity: editLoading ? 0.7 : 1 }}>
                  {editLoading ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Board Member ID Card Modal */}
      {showBoardMemberIDCard && (
        <div className="modal-overlay" onClick={() => setShowBoardMemberIDCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setShowBoardMemberIDCard(null)}>&times;</button>
            <h2 style={{ color: '#003366', marginBottom: '20px', textAlign: 'center' }}>
              🎫 Board Member ID Card
            </h2>
            <BoardMemberIDCard
              name={showBoardMemberIDCard.name}
              role={showBoardMemberIDCard.role}
              photoUrl={showBoardMemberIDCard.photoUrl}
              isFeatured={showBoardMemberIDCard.isFeatured}
              bio={showBoardMemberIDCard.bio}
              linkedin={showBoardMemberIDCard.linkedin}
              twitter={showBoardMemberIDCard.twitter}
            />
          </div>
        </div>
      )}

      {/* Support Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setSelectedTicket(null)}>&times;</button>

            <h2 style={{ color: '#003366', marginBottom: '20px' }}>🎫 Ticket Details</h2>

            <div style={{ background: '#f8f9fc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#003366' }}>{selectedTicket.subject}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
                From: <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
              </p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '12px', background: '#dbeafe', color: '#1e40af', fontSize: '0.8rem', fontWeight: 600 }}>
                  {selectedTicket.category.toUpperCase()}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontSize: '0.8rem', fontWeight: 600 }}>
                  {selectedTicket.priority.toUpperCase()} PRIORITY
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '12px', background: '#d1fae5', color: '#065f46', fontSize: '0.8rem', fontWeight: 600 }}>
                  {selectedTicket.status.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>{selectedTicket.description}</p>
            </div>

            {selectedTicket.responses && selectedTicket.responses.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#003366', marginBottom: '10px' }}>Previous Responses</h4>
                {selectedTicket.responses.map((response: any, idx: number) => (
                  <div key={idx} style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 600, color: '#003366' }}>
                      {response.adminName} • {new Date(response.createdAt).toLocaleString()}
                    </p>
                    <p style={{ margin: 0, color: '#374151' }}>{response.message}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#f8f9fc', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: '#003366', marginBottom: '15px' }}>Send Response</h4>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type your response..."
                rows={4}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '15px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={async () => {
                    if (!responseMessage.trim()) return;
                    const form = new FormData();
                    form.append('ticketId', selectedTicket._id);
                    form.append('message', responseMessage);
                    const result: any = await respondToTicket(form);
                    if (result.success) {
                      setResponseMessage('');
                      loadSupportTickets();
                      setSelectedTicket(null);
                    }
                  }}
                  className="btn btn-approve"
                >
                  Send Response
                </button>
                <button
                  onClick={async () => {
                    const result: any = await updateTicketStatus(selectedTicket._id, 'resolved');
                    if (result.success) {
                      loadSupportTickets();
                      setSelectedTicket(null);
                    }
                  }}
                  className="btn"
                  style={{ background: '#10b981', color: 'white' }}
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={async () => {
                    const result: any = await updateTicketStatus(selectedTicket._id, 'closed');
                    if (result.success) {
                      loadSupportTickets();
                      setSelectedTicket(null);
                    }
                  }}
                  className="btn btn-delete"
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}