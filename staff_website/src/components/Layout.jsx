import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Download, Send, User, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, dispatches, toasts, setToasts, confirmData, handleConfirm, handleCancel } = useAuth();
  
  const unconfirmedCount = React.useMemo(() => {
    if (!user || user.role === "ADMIN") return 0;
    const branchIdStr = String(user.branch?._id || user.branchId);
    return dispatches.filter(d => 
      String(d.toBranchId) === branchIdStr && 
      (d.status !== "RECEIVED" && d.status !== "FAILED" && d.status !== "COMPLETED")
    ).length;
  }, [dispatches, user]);

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="title" style={{ fontSize: '24px' }}>BranchFlow <span style={{ color: 'var(--primary)' }}>Pro</span></h2>
          <p className="subtitle">Staff Portal</p>
        </div>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/incoming" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Download size={20} /> Receive 
            {unconfirmedCount > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', marginLeft: 'auto' }}>{unconfirmedCount}</span>}
          </NavLink>
          <NavLink to="/dispatch" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Send size={20} /> Create Dispatch
          </NavLink>
          <NavLink to="/general-entry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} /> General Entry
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <User size={20} /> Profile
          </NavLink>
        </nav>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div></div>
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: 'bold' }}>{user?.fullName}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--bg)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
              {user?.fullName?.[0]}
            </div>
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>

        {/* Toasts */}
        <div style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 9999 }}>
          {toasts.map(t => (
            <div 
              key={t.id} 
              style={{ 
                backgroundColor: t.type === 'error' ? 'var(--danger)' : 'var(--success)', 
                color: '#fff', 
                padding: '12px 16px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: '240px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        {confirmData && (
          <div style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 10000 
          }}>
            <div style={{ 
              backgroundColor: 'var(--card)', 
              padding: '24px', 
              borderRadius: '12px', 
              maxWidth: '400px', 
              width: '90%', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)' 
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>{confirmData.title}</h3>
              <p style={{ margin: '0 0 20px 0', color: 'var(--muted)' }}>{confirmData.message}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleCancel}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)', 
                    backgroundColor: 'transparent', 
                    color: 'var(--text)', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--danger)', 
                    color: '#fff', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
