import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw, 
  Phone, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  Eye, 
  X,
  MessageCircle
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { fetchContactInquiries, updateInquiryStatus, deleteInquiry } from '../services/adminDataService';

const STATUS_CONFIG = {
  New: { label: 'New', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  Contacted: { label: 'Contacted', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  'In Progress': { label: 'In Progress', color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF' },
  Resolved: { label: 'Resolved', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' }
};

export default function AdminInquiriesManager() {
  const { role, isSuperAdmin } = useAdminAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [topicFilter, setTopicFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const loadInquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchContactInquiries();
      setInquiries(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (inquiryId, newStatus) => {
    setUpdatingId(inquiryId);
    setActionNotice(null);
    const res = await updateInquiryStatus(inquiryId, newStatus, role);
    setUpdatingId(null);
    if (res.success) {
      setInquiries(prev => prev.map(item => item.id === inquiryId ? { ...item, status: newStatus } : item));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
      setActionNotice({ type: 'success', text: `Status updated to "${newStatus}".` });
      setTimeout(() => setActionNotice(null), 3000);
    } else {
      setActionNotice({ type: 'error', text: res.error || 'Failed to update status.' });
    }
  };

  const handleDelete = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    const res = await deleteInquiry(inquiryId, role);
    if (res.success) {
      setInquiries(prev => prev.filter(item => item.id !== inquiryId));
      if (selectedInquiry?.id === inquiryId) setSelectedInquiry(null);
      setActionNotice({ type: 'success', text: 'Inquiry deleted successfully.' });
      setTimeout(() => setActionNotice(null), 3000);
    } else {
      setActionNotice({ type: 'error', text: res.error || 'Failed to delete inquiry.' });
    }
  };

  // Derive unique topics
  const uniqueTopics = useMemo(() => {
    const set = new Set();
    inquiries.forEach(i => { if (i.topic) set.add(i.topic); });
    return Array.from(set);
  }, [inquiries]);

  // Filtered inquiries
  const filtered = useMemo(() => {
    return inquiries.filter(item => {
      const matchesSearch = 
        !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.topic && item.topic.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesTopic = topicFilter === 'ALL' || item.topic === topicFilter;
      return matchesSearch && matchesStatus && matchesTopic;
    });
  }, [inquiries, searchTerm, statusFilter, topicFilter]);

  // Stats
  const counts = useMemo(() => {
    return {
      total: inquiries.length,
      newCount: inquiries.filter(i => (i.status || 'New') === 'New').length,
      contacted: inquiries.filter(i => i.status === 'Contacted').length,
      resolved: inquiries.filter(i => i.status === 'Resolved').length
    };
  }, [inquiries]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Banner & Action Notice */}
      {actionNotice && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: actionNotice.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${actionNotice.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: actionNotice.type === 'success' ? '#15803D' : '#B91C1C',
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {actionNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '8px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#B91C1C',
          fontSize: '0.88rem'
        }}>
          <strong>Database Notice:</strong> {error}
        </div>
      )}

      {/* 2. Key Metrics Row */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#F97316' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{counts.total}</div>
            <div className="admin-stat-label">Total Inquiries</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#EA580C' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{counts.newCount}</div>
            <div className="admin-stat-label">New / Pending</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284C7' }}>
            <Phone size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{counts.contacted}</div>
            <div className="admin-stat-label">Contacted</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#16A34A' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{counts.resolved}</div>
            <div className="admin-stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* 3. Search, Filter & Refresh Bar */}
      <div 
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search by customer name, phone, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
              style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.86rem' }}
            />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
            style={{ height: '40px', fontSize: '0.86rem' }}
          >
            <option value="ALL">All Statuses ({inquiries.length})</option>
            <option value="New">New ({counts.newCount})</option>
            <option value="Contacted">Contacted ({counts.contacted})</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved ({counts.resolved})</option>
          </select>

          {uniqueTopics.length > 0 && (
            <select 
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="admin-select"
              style={{ height: '40px', fontSize: '0.86rem', maxWidth: '200px' }}
            >
              <option value="ALL">All Topics</option>
              {uniqueTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>

        <button 
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={loadInquiries}
          disabled={loading}
          style={{ height: '40px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={15} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4. Contact Inquiries Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>Date & Time</th>
              <th>Customer Name</th>
              <th>Phone / WhatsApp</th>
              <th>Topic</th>
              <th>Message Preview</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', width: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <RefreshCw size={24} className="spinner" style={{ margin: '0 auto 8px' }} />
                  <div>Loading contact inquiries from database...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                  <div style={{ display: 'inline-flex', padding: '12px', background: '#F1F5F9', borderRadius: '50%', marginBottom: '10px' }}>
                    <MessageSquare size={26} style={{ color: '#94A3B8' }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0F172A', marginBottom: '4px' }}>
                    No customer inquiries found
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#64748B' }}>
                    {searchTerm || statusFilter !== 'ALL' || topicFilter !== 'ALL'
                      ? 'Try clearing the search query or changing filters.'
                      : 'Website inquiries submitted by visitors on the Contact page will appear here instantly.'}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.New;
                const cleanPhone = (item.phone || '').replace(/\D/g, '').slice(-10);
                const whatsappUrl = cleanPhone 
                  ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${item.name}, thank you for contacting Apna Digital Service regarding "${item.topic}". How can we assist you today?`)}` 
                  : null;

                return (
                  <tr key={item.id} style={{ transition: 'background 0.15s ease' }}>
                    {/* Date */}
                    <td style={{ fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </div>
                      <div style={{ fontSize: '0.74rem' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    {/* Customer Name */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                        {item.name || 'Anonymous Visitor'}
                      </div>
                    </td>

                    {/* Phone & WhatsApp Link */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.88rem', color: '#0F172A' }}>
                          {item.phone || '—'}
                        </span>
                        {whatsappUrl && (
                          <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              background: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #BBF7D0'
                            }}
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Topic */}
                    <td>
                      <span 
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#334155'
                        }}
                      >
                        {item.topic || 'General Inquiry'}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td style={{ maxWidth: '300px' }}>
                      <div 
                        style={{ 
                          fontSize: '0.84rem', 
                          color: '#334155', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedInquiry(item)}
                        title="Click to view full inquiry"
                      >
                        {item.message}
                      </div>
                    </td>

                    {/* Status Pill & Switcher */}
                    <td>
                      <select 
                        value={item.status || 'New'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        disabled={updatingId === item.id}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          border: `1px solid ${cfg.border}`,
                          background: cfg.bg,
                          color: cfg.color,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          type="button"
                          className="admin-action-btn"
                          onClick={() => setSelectedInquiry(item)}
                          title="View Inquiry Details"
                          style={{
                            padding: '6px 10px',
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#0F172A'
                          }}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {isSuperAdmin && (
                          <button 
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Delete Inquiry"
                            style={{
                              padding: '6px 8px',
                              background: '#FEE2E2',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              color: '#B91C1C',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Detail Inspection Modal */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div 
            className="modal-dialog" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}
          >
            <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.1)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    Customer Contact Inquiry
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                    Received on {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString('en-IN') : '—'}
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setSelectedInquiry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B' }}>Applicant Name</div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{selectedInquiry.name}</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B' }}>WhatsApp Mobile</div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{selectedInquiry.phone}</div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B' }}>Inquiry Topic</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{selectedInquiry.topic}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                  Complete Message Details
                </div>
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Update Control */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Update Processing Status:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['New', 'Contacted', 'In Progress', 'Resolved'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedInquiry.id, st)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: selectedInquiry.status === st ? `2px solid ${STATUS_CONFIG[st].color}` : '1px solid #CBD5E1',
                        background: selectedInquiry.status === st ? STATUS_CONFIG[st].bg : '#FFFFFF',
                        color: selectedInquiry.status === st ? STATUS_CONFIG[st].color : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedInquiry.phone && (
                <a
                  href={`https://wa.me/91${selectedInquiry.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${selectedInquiry.name}, this is Apna Digital Service regarding your inquiry: "${selectedInquiry.topic}".`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn"
                  style={{
                    background: '#16A34A',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    padding: '8px 14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none'
                  }}
                >
                  <MessageCircle size={15} />
                  <span>Connect via WhatsApp</span>
                </a>
              )}
              <button 
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedInquiry(null)}
                style={{ marginLeft: 'auto' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

