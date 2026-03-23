import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout, dispatches, updateProfile } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      await updateProfile(payload);
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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
      <p className="subtitle" style={{ marginBottom: '32px' }}>Manage your account settings and data</p>

      {error && <div className="card" style={{ marginBottom: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>{error}</div>}
      {success && <div className="card" style={{ marginBottom: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid var(--success)' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '32px' }}>
        {/* Sidebar Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: 'rgba(78, 141, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px', border: '2px solid var(--primary)' }}>
            {user?.fullName?.[0]}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{user?.fullName}</h2>
          <div style={{ padding: '4px 12px', borderRadius: '12px', backgroundColor: 'var(--bg-soft)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', marginBottom: '24px', textTransform: 'uppercase' }}>
            {user?.role}
          </div>
          
          <button style={{ backgroundColor: 'var(--danger)', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', width: '100%', border: 'none', cursor: 'pointer' }} onClick={logout}>
            Logout from Portal
          </button>
        </div>

        {/* Details Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Personal Details Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 'bold', letterSpacing: '1px', margin: 0 }}>PERSONAL DETAILS</h3>
              <button 
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '12px' }}
                onClick={() => {
                  if (editing) {
                    setFormData({ fullName: user?.fullName || "", email: user?.email || "", phone: user?.phone || "", password: "" });
                  }
                  setEditing(!editing);
                }}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="e.g. +1 234 567 890"
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Update Password (Optional)</label>
                  <input 
                    type="password" 
                    placeholder="Leave blank to keep current"
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '8px' }}>
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Email Address</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>{user?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Phone</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>{user?.phone || "Not set"}</div>
                </div>
              </div>
            )}
          </div>

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

