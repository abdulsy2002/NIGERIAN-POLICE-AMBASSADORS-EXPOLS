"use client";

import { useState, useEffect } from 'react';
import { getAllAdmins, addNewAdmin, deleteAdmin } from '@/app/actions';
import AdminNavbar from '@/components/AdminNavbar';

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'state_admin',
    stateBase: ''
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    const result: any = await getAllAdmins();
    if (result.success) {
      setAdmins(result.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const form = new FormData();
    form.append('fullName', formData.fullName);
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('role', formData.role);
    if (formData.stateBase) {
      form.append('stateBase', formData.stateBase);
    }

    const result: any = await addNewAdmin(form);

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      setShowForm(false);
      setFormData({ fullName: '', email: '', password: '', role: 'state_admin', stateBase: '' });
      loadAdmins();
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  const handleDelete = async (adminId: string) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      const result: any = await deleteAdmin(adminId);
      if (result.success) {
        setMessage('✅ Admin deleted successfully!');
        loadAdmins();
      } else {
        setMessage(`❌ ${result.error}`);
      }
    }
  };

  // All Nigerian States
  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
  ];

  return (
    <div className="admin-dashboard">
      <AdminNavbar activeTab="manage-admins" setActiveTab={() => {}} data={{ alumni: [], ambassadors: [], reunions: [], messages: [] }} galleryImages={[]} boardMembers={[]} />
      
      <div className="admin-content-wrapper">
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#003366' }}>👥 Manage Admins</h2>
            <button 
              onClick={() => setShowForm(!showForm)}
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
              {showForm ? 'Cancel' : '+ Create New Admin'}
            </button>
          </div>

          {message && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
              color: message.includes('✅') ? '#065f46' : '#991b1b',
              fontWeight: 600
            }}>
              {message}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} style={{
              background: '#f8f9fc',
              padding: '30px',
              borderRadius: '12px',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: '#003366', marginBottom: '20px' }}>Create New Admin Account</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Temporary Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                  The admin will be required to change this password on first login.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                >
                  <option value="state_admin">State Base Admin</option>
                  <option value="national_admin">National Admin</option>
                </select>
              </div>

              {formData.role === 'state_admin' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>State Base *</label>
                  <select
                    value={formData.stateBase}
                    onChange={(e) => setFormData({ ...formData, stateBase: e.target.value })}
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

              <button
                type="submit"
                style={{
                  padding: '14px 28px',
                  background: '#003366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Create Admin
              </button>
            </form>
          )}

          {loading ? (
            <p>Loading admins...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fc', borderBottom: '2px solid #003366' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Full Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>State Base</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>{admin.fullName || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{admin.email}</td>
                      <td style={{ padding: '12px' }}>
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
                      <td style={{ padding: '12px' }}>{admin.stateBase || '-'}</td>
                      <td style={{ padding: '12px' }}>{new Date(admin.createdAt).toLocaleDateString('en-NG')}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}