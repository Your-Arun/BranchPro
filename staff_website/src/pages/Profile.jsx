import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout, dispatches } = useAuth();
  const [exporting, setExporting] = useState(false);

  const exportExcel = () => {
    setExporting(true);
    try {
      const csvHeader = "Tracking ID,From Branch,To Branch,Status,Category,Courier,Dispatch Date,Notes\n";
      const csvRows = (dispatches || []).map(d => {
        const escapeCsv = (str) => `"${String(str || "").replace(/"/g, '""')}"`;
        return [
          escapeCsv(d.trackingId),
          escapeCsv(d.fromBranch),
          escapeCsv(d.toBranch),
          escapeCsv(d.status),
          escapeCsv(d.category),
          escapeCsv(d.courierName),
          escapeCsv(new Date(d.dispatchDate || d.createdAt).toLocaleDateString()),
          escapeCsv(d.description)
        ].join(",");
      }).join("\n");
      
      const fileString = csvHeader + csvRows;
      const fileName = user?.role === "ADMIN" 
        ? "Total_Company_Dispatches.csv" 
        : `Branch_${user?.branch?.code || 'Dispatches'}.csv`;

      // Create a Blob and trigger a download locally in browser
      const blob = new Blob([fileString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      alert("Error exporting Excel");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h1 className="title">Profile</h1>
      <p className="subtitle" style={{ marginBottom: '32px' }}>Manage your account setting and data</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '32px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: 'rgba(78, 141, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px', border: '2px solid var(--primary)' }}>
            {user?.fullName?.[0]}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{user?.fullName}</h2>
          <div style={{ padding: '4px 12px', borderRadius: '12px', backgroundColor: 'var(--bg-soft)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', marginBottom: '24px', textTransform: 'uppercase' }}>
            {user?.role}
          </div>
          
          <button style={{ backgroundColor: 'var(--danger)', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', width: '100%' }} onClick={logout}>
            Logout from Portal
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px' }}>ASSIGNED LOCATION</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Branch Name</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user?.branch?.name || "No branch assigned"}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Branch Code</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user?.branch?.code || "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px' }}>DATA EXPORT</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>Download a complete record of all shipments related to your branch in CSV/Excel format.</p>
            <button className="btn-primary" onClick={exportExcel} disabled={exporting}>
              {exporting ? 'Generating...' : `Export ${user?.role === 'ADMIN' ? 'Total' : 'Branch'} Excel Report`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
