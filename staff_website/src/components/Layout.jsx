import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Download, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, dispatches } = useAuth();
  
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
      </div>
    </div>
  );
};

export default Layout;
