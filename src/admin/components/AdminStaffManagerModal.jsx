import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Users, 
  Clock, 
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { createAdminCredentials, fetchAdminTeam, revokeAdminInvitation } from '../services/adminDataService';

export default function AdminStaffManagerModal({ isOpen, onClose }) {
  const { adminUser, role, isSuperAdmin } = useAdminAuth();

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'team'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Team list
  const [teamLoading, setTeamLoading] = useState(false);
  const [activeStaff, setActiveStaff] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const loadTeam = async () => {
    if (!isSuperAdmin) return;
    setTeamLoading(true);
    const res = await fetchAdminTeam(role);
    setTeamLoading(false);
    if (res.success) {
      setActiveStaff(res.activeStaff || []);
      setInvitations(res.invitations || []);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      loadTeam();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setStatusMessage({ type: 'error', text: 'Permission denied. Only Super Admin can create admin credentials.' });
      return;
    }

    if (!email || !password) {
      setStatusMessage({ type: 'error', text: 'Email and password are required.' });
      return;
    }
    if (password.length < 8) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const res = await createAdminCredentials({
      email,
      password,
      fullName,
      phone,
      creatorId: adminUser?.id,
      role
    });

    setLoading(false);

    if (res.success) {
      setStatusMessage({ 
        type: 'success', 
        text: res.message || `Admin credentials created for ${email}. A verification email has been sent. The admin role will be activated when the user confirms their email.` 
      });
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      loadTeam();
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to create admin credentials.' });
    }
  };

  const handleRevoke = async (invitationId, inviteEmail) => {
    if (!window.confirm(`Revoke pending admin authorization for ${inviteEmail}?`)) return;
    const res = await revokeAdminInvitation(invitationId, role);
    if (res.success) {
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      setStatusMessage({ type: 'success', text: `Authorization for ${inviteEmail} was revoked.` });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to revoke invitation.' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #F97316 0%, #16A34A 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Admin Access &amp; Staff Management
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Super Admin Authorized Credential Issuance
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', padding: '0 24px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              color: activeTab === 'create' ? '#F97316' : '#64748B',
              borderBottom: activeTab === 'create' ? '2px solid #F97316' : '2px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <UserPlus size={16} />
            <span>Create New Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              color: activeTab === 'team' ? '#16A34A' : '#64748B',
              borderBottom: activeTab === 'team' ? '2px solid #16A34A' : '2px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={16} />
            <span>Active Staff &amp; Pending ({activeStaff.length + invitations.filter(i => i.status === 'pending').length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '22px 24px', maxHeight: '72vh', overflowY: 'auto' }}>
          {statusMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: statusMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${statusMessage.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
              color: statusMessage.type === 'success' ? '#15803D' : '#B91C1C',
              fontSize: '0.85rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: '1.5'
            }}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Security Guidance Box */}
              <div style={{
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                borderRadius: '10px',
                padding: '14px 16px',
                fontSize: '0.82rem',
                color: '#9A3412',
                lineHeight: '1.55'
              }}>
                <strong>Verification Security Protocol:</strong>
                <div style={{ marginTop: '4px' }}>
                  When you submit this form, credentials are created and an official email confirmation is sent to the new admin. The account will <strong>only receive the "admin" role in the database profile once the user verifies their email</strong> by clicking the confirmation link.
                </div>
              </div>

              {/* Full Name */}
              <div className="form-field">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                  Admin Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="form-field">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                  Official Admin Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="admin@apnadigitalservice.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem' }}
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  The confirmation link will be delivered directly to this inbox.
                </span>
              </div>

              {/* Password */}
              <div className="form-field">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                  Initial Password * (minimum 8 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Phone (Optional) */}
              <div className="form-field">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                  Admin Contact Phone (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="admin-btn"
                style={{
                  background: 'linear-gradient(90deg, #F97316 0%, #16A34A 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  padding: '12px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.94rem',
                  marginTop: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? <Loader2 size={18} className="spinner" /> : <UserPlus size={18} />}
                <span>{loading ? 'Creating Credentials & Sending Email...' : 'Create Admin Credentials & Send Verification'}</span>
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                  Active platform staff and pending email authorizations
                </span>
                <button
                  type="button"
                  onClick={loadTeam}
                  className="admin-btn admin-btn-secondary"
                  style={{ height: '34px', padding: '0 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={13} className={teamLoading ? 'spinner' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* 1. Pending Invitations */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} style={{ color: '#EA580C' }} />
                  <span>Pending Email Verifications ({invitations.filter(i => i.status === 'pending').length})</span>
                </h4>

                {invitations.filter(i => i.status === 'pending').length === 0 ? (
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.82rem', color: '#64748B', textAlign: 'center' }}>
                    No pending admin invitations. All invited staff are verified.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {invitations.filter(i => i.status === 'pending').map(inv => (
                      <div 
                        key={inv.id} 
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #FED7AA',
                          background: '#FFF7ED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#9A3412' }}>{inv.email}</div>
                          <div style={{ fontSize: '0.74rem', color: '#7C2D12' }}>
                            {inv.full_name ? `${inv.full_name} • ` : ''}Sent on {new Date(inv.created_at).toLocaleDateString('en-IN')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309', fontWeight: 700 }}>
                            Awaiting Email Click
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRevoke(inv.id, inv.email)}
                            title="Revoke invitation"
                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Active Staff */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} style={{ color: '#16A34A' }} />
                  <span>Verified Platform Staff ({activeStaff.length})</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeStaff.map(staff => (
                    <div 
                      key={staff.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                          {staff.full_name || staff.email}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                          {staff.email} {staff.phone ? `• ${staff.phone}` : ''}
                        </div>
                      </div>

                      <span 
                        style={{
                          fontSize: '0.72rem',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: staff.role === 'super_admin' ? '#FEF3C7' : '#F0F9FF',
                          color: staff.role === 'super_admin' ? '#92400E' : '#0369A1',
                          border: `1px solid ${staff.role === 'super_admin' ? '#FDE68A' : '#BAE6FD'}`
                        }}
                      >
                        {staff.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="admin-btn admin-btn-secondary" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

