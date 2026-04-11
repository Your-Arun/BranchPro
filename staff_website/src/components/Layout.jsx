import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Download, Send, User, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, dispatches, toasts, setToasts, confirmData, handleConfirm, handleCancel } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header" style={{ paddingBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>Branch<span style={{ color: 'var(--primary)' }}>Flow</span></h2>
            <button 
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
          <p className="subtitle" style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Staff Portal</p>
        </div>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/incoming" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Download size={20} /> Receive 
            {unconfirmedCount > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', marginLeft: 'auto', fontWeight: 'bold' }}>{unconfirmedCount}</span>}
          </NavLink>
          <NavLink to="/dispatch" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Send size={20} /> New Dispatch
          </NavLink>
          <NavLink to="/general-entry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Package size={20} /> General Entry
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <User size={20} /> Profile
          </NavLink>
        </nav>
      </div>

      <div className="main-content">
        <div className="topbar" style={{ 
          backdropFilter: 'blur(10px)', 
          backgroundColor: 'rgba(10, 25, 49, 0.8)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <button 
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{ padding: '10px', backgroundColor: 'var(--bg-soft)', borderRadius: '12px' }}
          >
            <Menu size={22} />
          </button>
          
          <div className="topbar-brand">
            <span style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '-0.5px' }}>Branch<span style={{ color: 'var(--primary)' }}>Flow</span></span>
          </div>

          <div className="flex items-center gap-4">
            <div className="topbar-username" style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '800', fontSize: '14px', lineHeight: 1.1 }}>{user?.fullName}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{user?.branch?.name || "Staff"}</div>
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff', 
              fontWeight: '900', 
              fontSize: '16px', 
              flexShrink: 0,
              boxShadow: '0 4px 12px var(--primary-glow)'
            }}>
              {user?.fullName?.[0]}
            </div>
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>

        {/* Toasts */}
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column-reverse', gap: '8px', zIndex: 9999, width: 'calc(100% - 40px)', maxWidth: '400px' }}>
          {toasts.map(t => (
            <div 
              key={t.id} 
              className="glass"
              style={{ 
                backgroundColor: t.type === 'error' ? 'rgba(255, 71, 87, 0.95)' : 'rgba(16, 185, 129, 0.95)', 
                color: '#fff', 
                padding: '16px 20px', 
                borderRadius: '16px', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideUp 0.3s ease-out'
              }}
            >
              <div style={{ flex: 1, fontWeight: '600' }}>{t.message}</div>
              <button 
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                style={{ background: 'transparent', color: '#fff', opacity: 0.7 }}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Confirmation Modal */}
        {confirmData && (
          <div style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            backdropFilter: 'blur(4px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{ 
              backgroundColor: 'var(--card)', 
              padding: '32px', 
              borderRadius: '24px', 
              maxWidth: '440px', 
              width: '100%', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>{confirmData.title}</h3>
              <p style={{ margin: '0 0 32px 0', color: 'var(--muted)', lineHeight: '1.6', fontSize: '15px' }}>{confirmData.message}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleCancel}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '14px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  className="btn-primary"
                  style={{ flex: 1, backgroundColor: 'var(--danger)', padding: '14px' }}
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
