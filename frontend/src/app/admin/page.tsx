"use client";

import { useState, useEffect, useRef } from 'react';
import {
  getAdminData, getAdminSummary, approveUser, deleteRecord, sendBroadcast, getBroadcasts, getAllSupportTickets,
  uploadGalleryImage, getGalleryImages, updateGalleryImage, deleteGalleryImage,
  getBoardMembers, saveBoardMember, deleteBoardMember,
  getReunionSettings, updateReunionSettings, getAuditLogs,
  getAllAdmins, addNewAdmin, deleteAdmin,
  getAdminSession,
  getUserDetails,
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
import { STATE_BASE_OPTIONS } from '@/lib/stateBaseCodes';
import { getUploadError, MEMBER_IMAGE_TYPES } from '@/lib/upload-validation';

type ActiveTab = 'overview' | 'alumni' | 'ambassadors' | 'reunion' | 'messages' | 'broadcast' | 'gallery' | 'leadership' | 'reunion-settings' | 'audit-logs' | 'manage-admins' | 'support' | 'payments' | 'payment-settings' | 'profile-requests';

function normalizeToCardProps(member: any, type: 'alumni' | 'ambassador'): any {
  let chapter = 'NAT';
  if (member.stateBaseName) {
    chapter = member.stateBaseName.replace(/\s*base$/i, '').trim().toUpperCase();
  } else if (member.stateBaseCode) {
    chapter = member.stateBaseCode.toUpperCase();
  }
  const year = new Date().getFullYear();
  const defaultId = `NPAE/${chapter}/${year}/0001`;
  return {
    memberType: type,
    fullName: member.fullName || 'Unknown',
    identityNumber: member.identityNumber || defaultId,
    passportPhoto: member.passportPhoto || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2RkZCIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjMwIiBmaWxsPSIjOTk5Ii8+PHBhdGggZD0iTTMwIDEyMCBRNzUgOTAgMTIwIDEyMCIgZmlsbD0iIzk5OSIvPjwvc3ZnPg==',
    chapterCode: chapter,
    stateChapter: chapter,
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
  const [data, setData] = useState<any>({ alumni: [], ambassadors: [], reunions: [], messages: [] });
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResource, setLoadingResource] = useState<string | null>(null);
  const [listPages, setListPages] = useState<Record<string, number>>({});
  const [listPagination, setListPagination] = useState<Record<string, any>>({});

  const [viewDetails, setViewDetails] = useState<any>(null);
  const [viewType, setViewType] = useState<'alumni' | 'ambassador' | 'reunion' | 'message'>('alumni');
  const [showIDCard, setShowIDCard] = useState<any>(null);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditError, setAuditError] = useState('');

  const [selectedBaseFilter, setSelectedBaseFilter] = useState<string>('all');
  const [featureScopeCode, setFeatureScopeCode] = useState<string>('ALL');

  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [broadcastListLoading, setBroadcastListLoading] = useState(false);
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
  const [leadershipSaving, setLeadershipSaving] = useState(false);
  const leadershipFormRef = useRef<HTMLDivElement>(null);
  const leadershipSavingRef = useRef(false);

  const [reunionSettings, setReunionSettings] = useState<any>(null);
  const [reunionSettingsMessage, setReunionSettingsMessage] = useState('');
  const [reunionSettingsLoading, setReunionSettingsLoading] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [paymentSettingsMessage, setPaymentSettingsMessage] = useState('');
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [admins, setAdmins] = useState<any[]>([]);
  const [adminRole, setAdminRole] = useState('');
  const [adminStateBase, setAdminStateBase] = useState('');
  const [adminStateBaseName, setAdminStateBaseName] = useState('');
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STATE_ADMIN',
    stateBase: ''
  });

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara", "Diaspora"
  ];

  useEffect(() => {
    const getSession = async () => {
      const res: any = await getAdminSession();
      if (res) {
        const role = String(res.role || '').toUpperCase();
        setAdminRole(role);
        setAdminStateBase(res.stateBase || '');
        setAdminStateBaseName(res.stateBaseName || '');
        if (role === 'STATE_ADMIN') {
          setFeatureScopeCode(res.stateBase || '');
          setSelectedBaseFilter(res.stateBase || 'all');
          setBroadcastForm(current => ({
            ...current,
            sentTo: 'base',
            targetBaseCode: res.stateBase || '',
          }));
        }
      }
    };
    const loadSummary = async () => {
      const result: any = await getAdminSummary();
      if (result.success) {
        setSummary(result.data);
      } else {
        setAdminMessage(`Error: ${result.message || 'Unable to load admin summary.'}`);
      }
      setLoading(false);
    };
    void getSession();
    void loadSummary();
  }, []);

  const fetchData = async (
    scopeCode?: string,
    resource?: 'alumni' | 'ambassadors' | 'reunions' | 'messages',
    _force = false,
    page?: number,
  ) => {
    if (resource) setLoadingResource(resource);
    else setLoading(true);
    const requestedPage = page || (resource ? listPages[resource] || 1 : 1);
    const result: any = await getAdminData(scopeCode, resource, requestedPage);
    if (result && result.success) {
      if (resource) {
        setData((current: any) => ({
          ...current,
          [resource]: Array.isArray(result[resource]) ? result[resource] : [],
        }));
        setListPagination((current) => ({ ...current, [resource]: result.pagination || { page: requestedPage, totalPages: 1, total: result[resource]?.length || 0 } }));
      } else {
        setData({
          alumni: Array.isArray(result.alumni) ? result.alumni : [],
          ambassadors: Array.isArray(result.ambassadors) ? result.ambassadors : [],
          reunions: Array.isArray(result.reunions) ? result.reunions : [],
          messages: Array.isArray(result.messages) ? result.messages : [],
        });
      }
    } else {
      setAdminMessage(`Error: ${result?.message || `Unable to load ${resource || 'admin records'}.`}`);
    }
    if (resource) setLoadingResource(null);
    else setLoading(false);
  };

  const loadSupportTickets = async (scopeCode = featureScopeCode) => {
    setSupportLoading(true);
    const requestedPage = listPages.support || 1;
    const result: any = await getAllSupportTickets(scopeCode === 'ALL' ? undefined : scopeCode, requestedPage);
    if (result.success) {
      setSupportTickets(result.data);
      setListPagination((current) => ({ ...current, support: result.pagination || { page: requestedPage, totalPages: 1, total: result.data.length } }));
    } else {
      setAdminMessage(`Error: ${result.error || 'Unable to load support tickets.'}`);
    }
    setSupportLoading(false);
  };

  const loadTabData = async (tab: ActiveTab, scopeCode = featureScopeCode) => {
    if (tab === 'broadcast') {
      setBroadcastListLoading(true);
      const requestedPage = listPages.broadcasts || 1;
      const result: any = await getBroadcasts(requestedPage);
      if (result.success) {
        setBroadcasts(result.data);
        setListPagination((current) => ({ ...current, broadcasts: result.pagination }));
      } else {
        setAdminMessage(`Error: ${result.error || 'Unable to load broadcasts.'}`);
      }
      setBroadcastListLoading(false);
    }

    if (tab === 'support') {
      await loadSupportTickets(scopeCode);
    }

    if (tab === 'payments') {
      const requestedPage = listPages.payments || 1;
      const result: any = await getAllPayments(scopeCode === 'ALL' ? undefined : scopeCode, requestedPage);
      if (result.success) {
        setPayments(result.data);
        setListPagination((current) => ({ ...current, payments: result.pagination || { page: requestedPage, totalPages: 1, total: result.data.length } }));
      } else {
        setAdminMessage(`Error: ${result.error || 'Unable to load payments.'}`);
      }
    }

    if (tab === 'gallery') {
      const requestedPage = listPages.gallery || 1;
      const result: any = await getGalleryImages(scopeCode, true, requestedPage);
      if (result.success) {
        setGalleryImages(result.data);
        setListPagination((current) => ({ ...current, gallery: result.pagination || { page: requestedPage, totalPages: 1, total: result.data.length } }));
      } else {
        setAdminMessage(`Error: ${result.error || 'Unable to load gallery images.'}`);
      }
    }

    if (tab === 'leadership') {
      const result: any = await getBoardMembers();
      if (result.success) setBoardMembers(result.data);
    }

    if (tab === 'reunion-settings' && !reunionSettings) {
      const result: any = await getReunionSettings(scopeCode === 'ALL' ? 'NAT' : scopeCode, true);
      if (result.success) setReunionSettings(result.data);
    }

    if (tab === 'payment-settings' && !paymentSettings) {
      const result: any = await getPaymentSettings(scopeCode === 'ALL' ? 'NAT' : scopeCode, true);
      if (result.success) setPaymentSettings(result.data);
    }

    if (tab === 'audit-logs') {
      setAuditLoading(true);
      setAuditError('');
      const result: any = await getAuditLogs();
      if (result.success) {
        setAuditLogs(result.data);
      } else {
        setAuditError(result.error || result.message || 'Failed to fetch audit logs.');
      }
      setAuditLoading(false);
    }

    if (tab === 'manage-admins' && admins.length === 0) {
      const result: any = await getAllAdmins();
      if (result.success) {
        setAdmins(result.data);
      }
    }

    if (tab === 'profile-requests') {
      setProfileRequestsLoading(true);
      const requestedPage = listPages['profile-requests'] || 1;
      const result: any = await getAdminProfileRequests(requestedPage);
      if (result.success) {
        setProfileRequests(result.data);
        setListPagination((current) => ({ ...current, 'profile-requests': result.pagination }));
      } else {
        setAdminMessage(`Error: ${result.error || 'Unable to load profile update requests'}`);
      }
      setProfileRequestsLoading(false);
    }
  };

  const handleFeatureScopeChange = async (scopeCode: string) => {
    setFeatureScopeCode(scopeCode);
    const pageResource = activeTab === 'reunion' ? 'reunions' : activeTab === 'messages' ? 'messages' : activeTab;
    setListPages((current) => ({ ...current, [pageResource]: 1 }));
    const settingsScope = scopeCode === 'ALL' ? 'NAT' : scopeCode;
    if (activeTab === 'reunion' || activeTab === 'messages') {
      await fetchData(scopeCode, activeTab === 'reunion' ? 'reunions' : 'messages', true, 1);
    }
    if (activeTab === 'support') {
      const result: any = await getAllSupportTickets(scopeCode === 'ALL' ? undefined : scopeCode, 1);
      if (result.success) {
        setSupportTickets(result.data);
        setListPagination((current) => ({ ...current, support: result.pagination }));
      } else setAdminMessage(`Error: ${result.error || 'Unable to load support tickets.'}`);
    }
    if (activeTab === 'payments') {
      const result: any = await getAllPayments(scopeCode === 'ALL' ? undefined : scopeCode, 1);
      if (result.success) {
        setPayments(result.data);
        setListPagination((current) => ({ ...current, payments: result.pagination }));
      } else setAdminMessage(`Error: ${result.error || 'Unable to load payments.'}`);
    }
    if (activeTab === 'gallery') {
      const result: any = await getGalleryImages(scopeCode, true, 1);
      if (result.success) {
        setGalleryImages(result.data);
        setListPagination((current) => ({ ...current, gallery: result.pagination }));
      } else setAdminMessage(`Error: ${result.error || 'Unable to load gallery images.'}`);
    }
    if (activeTab === 'reunion-settings') {
      const result: any = await getReunionSettings(settingsScope, true);
      if (result.success) setReunionSettings(result.data);
    }
    if (activeTab === 'payment-settings') {
      const result: any = await getPaymentSettings(settingsScope, true);
      if (result.success) setPaymentSettings(result.data);
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
    const dataResource = tab === 'reunion'
      ? 'reunions'
      : tab === 'alumni' || tab === 'ambassadors' || tab === 'messages'
        ? tab
        : undefined;
    if (dataResource) {
      void fetchData(
        tab === 'reunion' || tab === 'messages'
          ? featureScopeCode
          : tab === 'alumni' || tab === 'ambassadors'
            ? selectedBaseFilter === 'all' ? undefined : selectedBaseFilter
            : undefined,
        dataResource,
      );
    }
    void loadTabData(tab);
  };

  const handleListPageChange = async (resource: string, page: number) => {
    setListPages((current) => ({ ...current, [resource]: page }));
    if (resource === 'alumni' || resource === 'ambassadors' || resource === 'reunions' || resource === 'messages') {
      const scopeCode = resource === 'alumni' || resource === 'ambassadors'
        ? selectedBaseFilter === 'all' ? undefined : selectedBaseFilter
        : featureScopeCode;
      await fetchData(scopeCode, resource, true, page);
      return;
    }
    if (resource === 'support') {
      const result: any = await getAllSupportTickets(featureScopeCode === 'ALL' ? undefined : featureScopeCode, page);
      if (result.success) {
        setSupportTickets(result.data);
        setListPagination((current) => ({ ...current, support: result.pagination }));
      } else setAdminMessage(`Error: ${result.error || 'Unable to load support tickets.'}`);
      return;
    }
    if (resource === 'payments') {
      const result: any = await getAllPayments(featureScopeCode === 'ALL' ? undefined : featureScopeCode, page);
      if (result.success) {
        setPayments(result.data);
        setListPagination((current) => ({ ...current, payments: result.pagination }));
      } else setAdminMessage(`Error: ${result.error || 'Unable to load payments.'}`);
      return;
    }
    if (resource === 'gallery') {
      const result: any = await getGalleryImages(featureScopeCode, true, page);
      if (result.success) {
        setGalleryImages(result.data);
        setListPagination((current) => ({ ...current, gallery: result.pagination }));
      } else setAdminMessage(`Error: ${result.error || 'Unable to load gallery images.'}`);
      return;
    }
    if (resource === 'broadcasts') {
      setBroadcastListLoading(true);
      const result: any = await getBroadcasts(page);
      if (result.success) {
        setBroadcasts(result.data);
        setListPagination((current) => ({ ...current, broadcasts: result.pagination }));
      } else setAdminMessage(`Error: ${result.error || 'Unable to load broadcasts.'}`);
      setBroadcastListLoading(false);
      return;
    }
    if (resource === 'profile-requests') {
      setProfileRequestsLoading(true);
      const result: any = await getAdminProfileRequests(page);
      if (result.success) {
        setProfileRequests(result.data);
        setListPagination((current) => ({ ...current, 'profile-requests': result.pagination }));
      } else setAdminMessage(`Error: ${result.error || 'Unable to load profile update requests.'}`);
      setProfileRequestsLoading(false);
    }
  };

  const handleApprove = async (userId: string, userType: 'alumni' | 'ambassador') => {
    const adminEmail = 'admin@npae.gov.ng';
    const result = await approveUser(userId, userType, adminEmail);
    if (result.success) {
      const resource = userType === 'alumni' ? 'alumni' : 'ambassadors';
      void fetchData(
        selectedBaseFilter === 'all' ? undefined : selectedBaseFilter,
        resource,
        true,
      );
    }
  };

  const handleProcessProfileRequest = async (requestId: string, action: 'approve' | 'reject') => {
    const result = await processAdminProfileRequest(requestId, action);
    if (result.success) {
      setProfileRequestsLoading(true);
      const currentPage = listPages['profile-requests'] || 1;
      let refreshResult: any = await getAdminProfileRequests(currentPage);
      let refreshedPage = currentPage;
      if (refreshResult.success && refreshResult.data.length === 0 && currentPage > 1) {
        refreshedPage = currentPage - 1;
        refreshResult = await getAdminProfileRequests(refreshedPage);
        setListPages((current) => ({ ...current, 'profile-requests': refreshedPage }));
      }
      if (refreshResult.success) {
        setProfileRequests(refreshResult.data);
        setListPagination((current) => ({ ...current, 'profile-requests': refreshResult.pagination }));
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
    if (result.success) {
      const resource = recordType === 'alumni' || recordType === 'ambassador'
        ? recordType === 'alumni' ? 'alumni' : 'ambassadors'
        : recordType === 'reunion' ? 'reunions' : 'messages';
      void fetchData(
        resource === 'reunions' || resource === 'messages'
          ? featureScopeCode
          : resource === 'alumni' || resource === 'ambassadors'
            ? selectedBaseFilter === 'all' ? undefined : selectedBaseFilter
            : undefined,
        resource,
        true,
      );
    }
  };

  const handleEditBoardMember = (member: any) => {
    setEditingMember(member);
    setLeadershipForm({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      photoUrl: member.photoUrl || '',
      isFeatured: !!member.isFeatured,
      linkedin: member.linkedin || '',
      twitter: member.twitter || '',
    });
    requestAnimationFrame(() => {
      leadershipFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      leadershipFormRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    });
  };

  const handleViewDetails = async (item: any, type: 'alumni' | 'ambassador' | 'reunion' | 'message') => {
    if (type === 'alumni' || type === 'ambassador') {
      const result: any = await getUserDetails(item.id, type);
      if (!result.success) {
        setAdminMessage(`Error: ${result.error || 'Unable to load member details.'}`);
        return;
      }
      item = result.data;
    }
    setViewDetails(item);
    setViewType(type);
  };

  const handleViewIDCard = async (member: any, type: 'alumni' | 'ambassador') => {
    const result: any = await getUserDetails(member.id, type);
    if (!result.success) {
      setAdminMessage(`Error: ${result.error || 'Unable to load ID card.'}`);
      return;
    }
    setShowIDCard(normalizeToCardProps(result.data, type));
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

  const getFilteredData = (dataArray: any[] = []) => Array.isArray(dataArray) ? dataArray : [];

  const getUniqueBases = (): Array<{ code: string; name: string }> => {
    if (!data) return [];
    return Array.isArray(summary?.bases)
      ? summary.bases.map((base: any) => ({ code: base.code, name: base.name }))
      : [];
  };

  const activePageResource = activeTab === 'alumni' || activeTab === 'ambassadors' || activeTab === 'messages'
    ? activeTab
    : activeTab === 'reunion' ? 'reunions'
      : activeTab === 'support' || activeTab === 'payments' || activeTab === 'gallery' ? activeTab
        : activeTab === 'broadcast' ? 'broadcasts'
          : activeTab === 'profile-requests' ? 'profile-requests'
            : null;
  const activePagination = activePageResource ? listPagination[activePageResource] : null;
  const activePage = activePageResource ? listPages[activePageResource] || 1 : 1;

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

  const filteredAlumni = getFilteredData(data.alumni);
  const filteredAmbassadors = getFilteredData(data.ambassadors);

  if (!summary) {
    return (
      <div className="error-state">
        <div className="error-content">
          <h2>Unable to load admin overview</h2>
          <button
            onClick={async () => {
              setLoading(true);
              const result: any = await getAdminSummary();
              if (result.success) setSummary(result.data);
              else setAdminMessage(`Error: ${result.message || 'Unable to load admin summary.'}`);
              setLoading(false);
            }}
            className="retry-button"
          >
            Retry
          </button>
          {adminMessage && <p role="alert">{adminMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        galleryImages={galleryImages}
        boardMembers={boardMembers}
        adminRole={adminRole}
        summary={summary}
      />

      <div className="admin-content-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', background: '#f8fafc' }}>
          <label htmlFor="admin-feature-scope" style={{ fontWeight: 700 }}>Chapter features scope</label>
          <select
            id="admin-feature-scope"
            value={adminRole === 'STATE_ADMIN' ? adminStateBase : featureScopeCode}
            onChange={(event) => handleFeatureScopeChange(event.target.value)}
            disabled={adminRole === 'STATE_ADMIN'}
          >
            {adminRole !== 'STATE_ADMIN' && <option value="ALL">All chapters</option>}
            {STATE_BASE_OPTIONS.map(({ name, code }) => <option key={code} value={code}>{name}</option>)}
          </select>
          <span>{adminRole === 'STATE_ADMIN'
            ? `Restricted to ${adminStateBaseName || adminStateBase}`
            : featureScopeCode === 'ALL' && ['reunion-settings', 'payment-settings', 'gallery'].includes(activeTab)
              ? 'Settings and new gallery uploads in this view target National (NAT); choose a chapter to target its data.'
              : 'National administrators can manage chapter data separately.'}</span>
        </div>
        {adminRole === 'STATE_ADMIN' && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', background: '#eff6ff', color: '#1e40af', fontWeight: 600 }}>
            State administrator scope: {adminStateBaseName || adminStateBase}
          </div>
        )}
        {galleryMessage && (
          <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', background: galleryMessage.includes('✅') ? '#d1fae5' : galleryMessage.includes('❌') ? '#fee2e2' : '#dbeafe', color: galleryMessage.includes('✅') ? '#065f46' : galleryMessage.includes('❌') ? '#991b1b' : '#1e40af', fontWeight: 600, textAlign: 'center' }}>
            {galleryMessage}
          </div>
        )}

        <div className="content-card">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="section-title">
                📊 {adminRole === 'STATE_ADMIN' ? 'State' : 'National'} Overview Statistics
              </h2>
              <div className="stats-grid">
                <div className="stat-card purple"><span className="stat-icon">👥</span><span className="stat-number">{summary.alumni}</span><span className="stat-label">Alumni Registered</span></div>
                <div className="stat-card pink"><span className="stat-icon">🌟</span><span className="stat-number">{summary.ambassadors}</span><span className="stat-label">Ambassadors</span></div>
                <div className="stat-card cyan"><span className="stat-icon">🎫</span><span className="stat-number">{summary.reunions}</span><span className="stat-label">Reunion Tickets</span></div>
                <div className="stat-card green"><span className="stat-icon">✉️</span><span className="stat-number">{summary.messages}</span><span className="stat-label">Contact Messages</span></div>
              </div>

              <h3 style={{ marginTop: '40px', color: '#003366', marginBottom: '20px' }}>📍 Members by Base</h3>
              <DataTable
                dataSource={summary.bases.map((base: any) => {
                  const alumniCount = base.alumni;
                  const ambCount = base.ambassadors;
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
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedBaseFilter(code);
                    setListPages((current) => ({ ...current, alumni: 1 }));
                    void fetchData(code === 'all' ? undefined : code, 'alumni', true, 1);
                  }}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="all">All Bases</option>
                  {getUniqueBases().map(base => (
                    <option key={base.code} value={base.code}>{base.name}</option>
                  ))}
                </select>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  Showing {filteredAlumni.length} of {listPagination.alumni?.total ?? filteredAlumni.length} alumni
                </span>
              </div>

              {loadingResource === 'alumni' ? <p className="empty-state">Loading alumni records...</p> : filteredAlumni.length === 0 ? <p className="empty-state">No alumni found.</p> : (
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
                              <button onClick={() => handleViewIDCard(alumni, 'alumni')} className="btn btn-small" style={{ background: '#8b5cf6', color: 'white' }}>🎫 ID</button>
                              {!alumni.isVerified && <button onClick={() => handleApprove(alumni.id, 'alumni')} className="btn btn-approve btn-small">✓ Approve</button>}
                              <ConfirmAction message="Archive this alumni record?" description="This action will move the record to the archive." onConfirm={() => handleDelete(alumni.id, 'alumni')}>
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
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedBaseFilter(code);
                    setListPages((current) => ({ ...current, ambassadors: 1 }));
                    void fetchData(code === 'all' ? undefined : code, 'ambassadors', true, 1);
                  }}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="all">All Bases</option>
                  {getUniqueBases().map(base => (
                    <option key={base.code} value={base.code}>{base.name}</option>
                  ))}
                </select>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  Showing {filteredAmbassadors.length} of {listPagination.ambassadors?.total ?? filteredAmbassadors.length} ambassadors
                </span>
              </div>

              {loadingResource === 'ambassadors' ? <p className="empty-state">Loading ambassador records...</p> : filteredAmbassadors.length === 0 ? <p className="empty-state">No ambassadors found.</p> : (
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
                              <button onClick={() => handleViewIDCard(amb, 'ambassador')} className="btn btn-small" style={{ background: '#8b5cf6', color: 'white' }}>🎫 ID</button>
                              {!amb.isApproved && <button onClick={() => handleApprove(amb.id, 'ambassador')} className="btn btn-approve btn-small">✓ Approve</button>}
                              <ConfirmAction message="Archive this ambassador record?" description="This action will move the record to the archive." onConfirm={() => handleDelete(amb.id, 'ambassador')}>
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


          {/* Manage Admins Tab */}
          {activeTab === 'manage-admins' && adminRole === 'SUPER_ADMIN' && (
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
                    setAdminFormData({ fullName: '', email: '', password: '', role: 'STATE_ADMIN', stateBase: '' });
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
                        <option value="STATE_ADMIN">State Base Admin</option>
                        <option value="NATIONAL_ADMIN">National Admin</option>
                      </select>
                    </div>

                    {adminFormData.role === 'STATE_ADMIN' && (
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
                              background: admin.role === 'SUPER_ADMIN' ? '#f4b400' : admin.role === 'NATIONAL_ADMIN' ? '#003366' : '#10b981',
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
              {loadingResource === 'reunions' ? <p className="empty-state">Loading reunion registrations...</p> : data.reunions.length === 0 ? <p className="empty-state">No reunion registrations yet.</p> : (
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
              {loadingResource === 'messages' ? <p className="empty-state">Loading contact messages...</p> : data.messages.length === 0 ? <p className="empty-state">No messages yet.</p> : (
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
                    setBroadcastForm({
                      subject: '',
                      message: '',
                      sentTo: adminRole === 'STATE_ADMIN' ? 'base' : 'all',
                      targetBaseCode: adminRole === 'STATE_ADMIN' ? adminStateBase : '',
                    });
                    void handleListPageChange('broadcasts', 1);
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
                      disabled={adminRole === 'STATE_ADMIN'}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      required
                    >
                      {adminRole === 'STATE_ADMIN' ? (
                        <option value="base">📍 {adminStateBaseName || adminStateBase}</option>
                      ) : (
                        <>
                          <option value="all">All Members (All Bases)</option>
                          <option value="base">📍 Specific State Base</option>
                        </>
                      )}
                    </select>
                  </div>

                  {broadcastForm.sentTo === 'base' && (
                    <div style={{ marginBottom: '20px', padding: '15px', background: '#e0f2fe', borderRadius: '8px', borderLeft: '4px solid #003366' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#003366' }}>Select State Base:</label>
                      {adminRole === 'STATE_ADMIN' ? (
                        <input type="text" value={adminStateBaseName || adminStateBase} readOnly style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #003366', background: '#f3f4f6' }} />
                      ) : (
                        <select
                          value={broadcastForm.targetBaseCode}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, targetBaseCode: e.target.value })}
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #003366' }}
                          required
                        >
                          <option value="">-- Select a Base --</option>
                          {getUniqueBases().filter(base => base.code !== 'LEGACY' && base.code !== 'NAT').map(base => (
                            <option key={base.code} value={base.code}>{base.name} ({base.code})</option>
                          ))}
                        </select>
                      )}
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
              {broadcastListLoading ? <p className="empty-state">Loading broadcasts...</p> : broadcasts.length === 0 ? <p className="empty-state">No broadcasts sent yet.</p> : (
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
                  formData.append('stateBaseCode', featureScopeCode === 'ALL' ? 'NAT' : featureScopeCode);
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
                    setGalleryMessage(`❌ ${result.error || result.message || 'Failed to upload image.'}`);
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
                    <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const error = getUploadError(file, MEMBER_IMAGE_TYPES, 6 * 1024 * 1024, 'Gallery image');
                        if (error) {
                          setGalleryMessage(`❌ ${error}`);
                          e.target.value = '';
                          return;
                        }
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
                              const result = await deleteGalleryImage(img.id || img._id);
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

              <div ref={leadershipFormRef} style={{ padding: '30px', background: '#f8f9fc', borderRadius: '12px', marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px', color: '#003366' }}>{editingMember ? '✏️ Edit Member' : '➕ Add New Board Member'}</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (leadershipSavingRef.current) return;
                  leadershipSavingRef.current = true;
                  setLeadershipSaving(true);
                  const formData = new FormData();
                  if (editingMember) formData.append('id', editingMember.id || editingMember._id);
                  formData.append('name', leadershipForm.name);
                  formData.append('role', leadershipForm.role);
                  formData.append('bio', leadershipForm.bio);
                  formData.append('photoUrl', leadershipForm.photoUrl);
                  formData.append('isFeatured', leadershipForm.isFeatured.toString());
                  formData.append('linkedin', leadershipForm.linkedin);
                  formData.append('twitter', leadershipForm.twitter);

                  try {
                    const result = await saveBoardMember(formData);
                    if (result.success) {
                      setLeadershipMessage('✅ Member saved successfully!');
                      setLeadershipForm({ name: '', role: '', bio: '', photoUrl: '', isFeatured: false, linkedin: '', twitter: '' });
                      setEditingMember(null);
                      loadTabData('leadership');
                    } else {
                      setLeadershipMessage(`❌ ${result.error || result.message || 'Failed to save member.'}`);
                    }
                    setTimeout(() => setLeadershipMessage(''), 3000);
                  } finally {
                    leadershipSavingRef.current = false;
                    setLeadershipSaving(false);
                  }
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
                    <button type="submit" disabled={leadershipSaving} className="btn btn-approve">
                      {leadershipSaving ? 'Saving...' : editingMember ? '💾 Update Member' : '➕ Add Member'}
                    </button>
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
                        <button type="button" onClick={() => handleEditBoardMember(member)} className="btn btn-approve btn-small" style={{ flex: 1 }}>✏️ Edit</button>
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
                          const res = await deleteBoardMember(member.id || member._id);
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
                const result = await updateReunionSettings(reunionSettings, featureScopeCode === 'ALL' ? 'NAT' : featureScopeCode);
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

                      const result: any = await updatePaymentSettings(paymentSettings.purposes, featureScopeCode === 'ALL' ? 'NAT' : featureScopeCode);

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

          {/* Audit Logs Tab */}
          {activeTab === 'audit-logs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 className="section-title" style={{ margin: 0 }}>📜 System Audit Logs</h2>
                  <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                    Real-time activity log of all admin operations, approvals, and system events.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search logs (email, action)..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.88rem', minWidth: '220px' }}
                  />
                  <button onClick={() => loadTabData('audit-logs')} className="btn btn-small" style={{ background: '#003366', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ↻ Refresh Logs
                  </button>
                </div>
              </div>

              {auditError && (
                <div style={{ padding: '14px', marginBottom: '20px', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚠️ {auditError}</span>
                  <button onClick={() => loadTabData('audit-logs')} className="btn btn-small" style={{ background: '#991b1b', color: 'white' }}>
                    ↻ Retry
                  </button>
                </div>
              )}

              {auditLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⏳</div>
                  <p style={{ color: '#6b7280' }}>Loading audit logs...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ fontSize: '1.1rem', color: '#4b5563', margin: 0 }}>No audit logs recorded yet.</p>
                  <small style={{ color: '#9ca3af' }}>Audit logs will record here when administrative actions are performed.</small>
                </div>
              ) : (
                (() => {
                  const filteredLogs = auditLogs.filter((log: any) => {
                    if (!auditSearch.trim()) return true;
                    const q = auditSearch.toLowerCase();
                    const action = (log.action || '').toLowerCase();
                    const email = (log.actorEmail || log.adminEmail || log.performedBy || '').toLowerCase();
                    const details = typeof log.details === 'object' ? JSON.stringify(log.details).toLowerCase() : String(log.details || '').toLowerCase();
                    return action.includes(q) || email.includes(q) || details.includes(q);
                  });

                  return (
                    <div>
                      <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#6b7280' }}>
                        Showing {filteredLogs.length} of {auditLogs.length} logged events
                      </div>
                      <div className="data-table-container" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                              <th style={{ padding: '12px 14px' }}>Timestamp</th>
                              <th style={{ padding: '12px 14px' }}>Action</th>
                              <th style={{ padding: '12px 14px' }}>Actor</th>
                              <th style={{ padding: '12px 14px' }}>Event Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLogs.map((log: any, index: number) => {
                              const actionStr = String(log.action || 'SYSTEM_ACTION').toUpperCase();
                              const isGreen = actionStr.includes('APPROVE') || actionStr.includes('CREATE') || actionStr.includes('SUCCESS') || actionStr.includes('BOOT');
                              const isRed = actionStr.includes('DELETE') || actionStr.includes('FAIL') || actionStr.includes('REJECT');
                              const isBlue = actionStr.includes('LOGIN') || actionStr.includes('UPDATE') || actionStr.includes('BROADCAST');
                              const badgeBg = isGreen ? '#dcfce7' : isRed ? '#fee2e2' : isBlue ? '#e0f2fe' : '#f3f4f6';
                              const badgeColor = isGreen ? '#15803d' : isRed ? '#b91c1c' : isBlue ? '#0369a1' : '#374151';

                              const timestamp = log.createdAt || log.timestamp;
                              const formattedDate = timestamp
                                ? new Date(timestamp).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
                                : 'Just now';

                              const actor = log.actorEmail || log.adminEmail || log.performedBy || log.userEmail || 'System';

                              return (
                                <tr key={log._id || log.id || `audit-${index}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#4b5563' }}>
                                    {formattedDate}
                                  </td>
                                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                    <span style={{
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      letterSpacing: '0.5px',
                                      background: badgeBg,
                                      color: badgeColor,
                                      display: 'inline-block'
                                    }}>
                                      {actionStr}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#1e293b' }}>
                                    <strong>{actor}</strong>
                                  </td>
                                  <td style={{ padding: '12px 14px', fontSize: '0.85rem' }}>
                                    {log.details && typeof log.details === 'object' ? (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                        {Object.entries(log.details).map(([key, val]) => (
                                          <span key={key} style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: '#f1f5f9',
                                            fontSize: '0.78rem',
                                            color: '#334155'
                                          }}>
                                            <strong style={{ color: '#003366' }}>{key}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span style={{ color: '#6b7280' }}>{log.details ? String(log.details) : '—'}</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()
              )}
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
                <div key={req.id || req._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
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
                      onConfirm={() => handleProcessProfileRequest(req.id || req._id, 'reject')}
                    >
                      <button className="btn btn-delete">❌ Reject</button>
                    </ConfirmAction>
                    
                    <ConfirmAction
                      message="Approve profile changes?"
                      description="These changes will be permanently applied to the user's profile."
                      onConfirm={() => handleProcessProfileRequest(req.id || req._id, 'approve')}
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

      {activePageResource && activePagination?.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '20px' }}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={activePage <= 1 || loadingResource !== null || supportLoading || profileRequestsLoading || broadcastListLoading}
            onClick={() => void handleListPageChange(activePageResource, activePage - 1)}
          >
            Previous
          </button>
          <span>
            Page {activePage} of {activePagination.totalPages} · {activePagination.total} records
          </span>
          <button
            type="button"
            className="btn btn-outline"
            disabled={activePage >= activePagination.totalPages || loadingResource !== null || supportLoading || profileRequestsLoading || broadcastListLoading}
            onClick={() => void handleListPageChange(activePageResource, activePage + 1)}
          >
            Next
          </button>
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
                    <button onClick={() => { handleApprove(viewDetails.id, 'alumni'); setViewDetails(null); }} className="btn btn-approve" style={{ flex: 1, padding: '12px' }}>✓ Approve &amp; Verify</button>
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
                    <button onClick={() => { handleApprove(viewDetails.id, 'ambassador'); setViewDetails(null); }} className="btn btn-approve" style={{ flex: 1, padding: '12px' }}>✓ Approve Ambassador</button>
                  )}
                  {viewDetails.identityNumber && (
                    <button onClick={() => { setShowIDCard(normalizeToCardProps(viewDetails, 'ambassador')); setViewDetails(null); }} className="btn" style={{ flex: 1, padding: '12px', background: '#8b5cf6', color: 'white' }}>🎫 View ID Card</button>
                  )}
                  <button onClick={() => setViewDetails(null)} className="btn btn-delete" style={{ flex: 1, padding: '12px' }}>Close</button>
                </div>
              </div>
            )}

            {viewType === 'reunion' && viewDetails && (
              <div>
                <h2 style={{ color: '#003366', marginBottom: '20px', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>🎫 Reunion Registration Details</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <DetailViewer
                    title="📋 Registration Information"
                    items={[
                      { label: 'Full Name', value: viewDetails.fullName || '—' },
                      { label: 'Email', value: viewDetails.email || '—', mono: true },
                      { label: 'Phone', value: viewDetails.phone || '—' },
                      { label: 'School', value: viewDetails.school || '—' },
                      { label: 'Graduation Year', value: viewDetails.graduationYear ?? '—' },
                      { label: 'Attendance Type', value: viewDetails.attendanceType || '—' },
                      {
                        label: 'Payment Status',
                        value: (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              background: viewDetails.paymentStatus === 'paid' ? '#d1fae5' : viewDetails.paymentStatus === 'failed' ? '#fee2e2' : '#fef3c7',
                              color: viewDetails.paymentStatus === 'paid' ? '#065f46' : viewDetails.paymentStatus === 'failed' ? '#991b1b' : '#92400e',
                            }}
                          >
                            {viewDetails.paymentStatus === 'paid' ? 'Paid' : viewDetails.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                          </span>
                        )
                      },
                      { label: 'Amount Paid', value: viewDetails.amountPaid != null ? `₦${Number(viewDetails.amountPaid).toLocaleString('en-NG')}` : '—' },
                      { label: 'Payment Reference', value: viewDetails.paymentReference || '—', mono: true, hidden: !viewDetails.paymentReference },
                      { label: 'Registered', value: viewDetails.createdAt ? new Date(viewDetails.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
                    ]}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => setViewDetails(null)} className="btn btn-delete" style={{ flex: 1, padding: '12px' }}>Close</button>
                </div>
              </div>
            )}

            {viewType === 'message' && viewDetails && (
              <div>
                <h2 style={{ color: '#003366', marginBottom: '20px', borderBottom: '2px solid #f4b400', paddingBottom: '10px' }}>✉️ Contact Message Details</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <DetailViewer
                    title="📤 Message Information"
                    items={[
                      { label: 'Name', value: viewDetails.name || '—' },
                      { label: 'Email', value: viewDetails.email || '—', mono: true },
                      { label: 'Subject', value: viewDetails.subject || '—' },
                      { label: 'Received', value: viewDetails.createdAt ? new Date(viewDetails.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
                      { label: 'Message', value: viewDetails.message || '—', span: 2 },
                    ]}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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