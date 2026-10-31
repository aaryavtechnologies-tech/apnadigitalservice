import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function RequireAdmin({ children }) {
  const { loading, isAdmin } = useAdminAuth();
  if (loading) return <p role="status" style={{ padding: 32 }}>Checking account access…</p>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}
