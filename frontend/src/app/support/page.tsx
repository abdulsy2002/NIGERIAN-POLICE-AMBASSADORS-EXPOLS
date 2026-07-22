"use client";

import { useState, useEffect } from 'react';
import { submitSupportTicket, getUserTickets } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const result: any = await getUserTickets();
    if (result.success) {
      setTickets(result.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const form = new FormData();
    form.append('subject', formData.subject);
    form.append('category', formData.category);
    form.append('priority', formData.priority);
    form.append('description', formData.description);

    const result: any = await submitSupportTicket(form);

    if (result.success) {
      setMessage('✅ ' + result.message);
      setFormData({ subject: '', category: 'general', priority: 'medium', description: '' });
      setShowForm(false);
      loadTickets();
    } else {
      setMessage('❌ ' + result.error);
    }

    setSubmitting(false);
    setTimeout(() => setMessage(''), 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#003366', marginBottom: '5px' }}>🎫 Support Center</h1>
            <p style={{ color: '#666' }}>Get help with your NPAE account</p>
          </div>
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
            {showForm ? 'Cancel' : '+ New Ticket'}
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

        {/* New Ticket Form */}
        {showForm && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#003366', marginBottom: '20px' }}>Submit Support Request</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="membership">Membership Problem</option>
                    <option value="payment">Payment Issue</option>
                    <option value="id-card">ID Card Issue</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide detailed information about your issue..."
                  required
                  rows={6}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '14px 28px',
                  background: '#003366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#003366', marginBottom: '20px' }}>My Tickets ({tickets.length})</h2>
          
          {tickets.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No support tickets yet. Click "New Ticket" to get help.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {tickets.map((ticket) => (
                <div key={ticket._id} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#003366' }}>{ticket.subject}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                        {ticket.category.toUpperCase()} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: getStatusColor(ticket.status),
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {ticket.status.toUpperCase()}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: getPriorityColor(ticket.priority),
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: '#374151', margin: '10px 0', lineHeight: 1.6 }}>{ticket.description}</p>
                  
                  {ticket.responses && ticket.responses.length > 0 && (
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                        {ticket.responses.length} response(s)
                      </p>
                      {ticket.responses.slice(-1).map((response: any, idx: number) => (
                        <div key={idx} style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                          <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', fontWeight: 600, color: '#003366' }}>
                            {response.adminName} • {new Date(response.createdAt).toLocaleDateString()}
                          </p>
                          <p style={{ margin: 0, color: '#374151' }}>{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}