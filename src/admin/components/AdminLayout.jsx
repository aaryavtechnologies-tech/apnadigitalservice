import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Eye, 
  Crown, 
  LogOut, 
  ExternalLink, 
  Lock, 
  Layers, 
  FileText,
  UserCheck
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

export default function AdminLayout({ children }) {
  const { adminUser, role, isSuperAdmin, isViewOnly, adminSignOut, switchDemoRole } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await adminSignOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      {/* 1. Distinctive Role Indicator Banner */}
      {isSuperAdmin ? (
        <div className="admin-role-banner super-admin">
          <div className="admin-banner-left">
            <span className="admin-role-pill super">
              <Crown size={14} /> Super Admin
            </span>
            <span>
              <strong>Full Control Active:</strong> You have full write permissions to update status, upload verified documents to Cloudinary, edit operator notes, and manage applications.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#FCD34D' }}>Testing Role Switch:</span>
            <button 
              className="admin-btn admin-btn-secondary" 
              style={{ padding: '3px 10px', fontSize: '0.76rem', background: 'rgba(255,255,255,0.1)' }}
              onClick={() => switchDemoRole('admin')}
              title="Switch role to Admin to test View-Only lockdown"
            >
              <Eye size={12} /> Test as View-Only Admin
            </button>
          </div>
        </div>
      ) : isViewOnly ? (
        <div className="admin-role-banner view-only">
          <div className="admin-banner-left">
            <span className="admin-role-pill view">
              <Eye size={14} /> Admin (View Only)
            </span>
            <span>
              <strong>View-Only Mode Enforced:</strong> All status updates, document uploads, and deletions are strictly disabled. To modify applications, log in with Super Admin credentials.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#7DD3FC' }}>Testing Role Switch:</span>
            <button 
              className="admin-btn admin-btn-secondary" 
              style={{ padding: '3px 10px', fontSize: '0.76rem', background: 'rgba(255,255,255,0.1)' }}
              onClick={() => switchDemoRole('super_admin')}
              title="Switch role to Super Admin to test full write access"
            >
              <Crown size={12} /> Test as Super Admin
            </button>
          </div>
        </div>
      ) : null}

      {/* 2. Admin Header Bar */}
      <header className="admin-header">
        <div className="admin-brand">
          <img src="/logo.png" alt="Apna Digital Service Logo" className="admin-brand-logo" />
          <div>
            <div className="admin-brand-title">
              APNA DIGITAL SERVICE
              <span className="admin-brand-tag">ADMIN PORTAL</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              Unified Verification Queue & Operations
            </div>
          </div>
        </div>

        <div className="admin-header-actions">
          {/* Quick link to main customer site */}
          <Link 
            to="/" 
            className="admin-btn admin-btn-secondary"
            title="Open customer-facing website"
            target="_blank"
          >
            <ExternalLink size={15} />
            <span>Customer Site</span>
          </Link>

          {/* User Profile Pill */}
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {adminUser?.fullName ? adminUser.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                {adminUser?.fullName || 'Operator'}
              </div>
              <div style={{ fontSize: '0.72rem', color: isSuperAdmin ? '#F59E0B' : '#38BDF8' }}>
                {isSuperAdmin ? '👑 Super Admin' : '👁️ View-Only Admin'}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button 
            className="admin-btn admin-btn-secondary" 
            onClick={handleSignOut}
            title="Log out from Admin Portal"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* 3. Main Workspace Slot */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
