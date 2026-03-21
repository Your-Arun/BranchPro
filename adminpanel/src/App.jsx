import { useEffect, useMemo, useState } from "react";
const logo = "/logo.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, { method = "GET", token, body } = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [profile, setProfile] = useState(() => {
    const raw = localStorage.getItem("admin_profile");
    return raw ? JSON.parse(raw) : null;
  });
  const [company, setCompany] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [dispatches, setDispatches] = useState([]);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [companyForm, setCompanyForm] = useState({ name: "", phone: "", email: "" });
  const [branchForm, setBranchForm] = useState({ name: "", city: "", address: "", code: "", status: "ACTIVE" });
  const [editingBranchId, setEditingBranchId] = useState("");
  const [userForm, setUserForm] = useState({ fullName: "", email: "", password: "", role: "STAFF", branchId: "" });
  const [editingUserId, setEditingUserId] = useState("");

  const isLoggedIn = Boolean(token && profile?.role === "ADMIN");
  const [isFetchingData, setIsFetchingData] = useState(isLoggedIn); // Start true if already logged in

  const loadAdminData = async (authToken = token) => {
    try {
        setIsFetchingData(true);
        const comp = await request("/admin/company", { token: authToken });
        setCompany(comp);
        
        if (comp) {
            const [b, u, d] = await Promise.all([
                request("/admin/branches", { token: authToken }),
                request("/admin/users", { token: authToken }),
                request("/admin/dispatches", { token: authToken })
            ]);
            setBranches(b);
            setUsers(u);
            setDispatches(d);
        }
    } catch (e) {
        if (e.message.includes("Company not found")) {
            setCompany(null);
        } else {
            setError(e.message);
        }
    } finally {
        setIsFetchingData(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
        setIsFetchingData(false);
        return;
    }
    loadAdminData().catch((e) => setError(e.message));
  }, [isLoggedIn]);

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const data = await request("/auth/login", { method: "POST", body: loginForm });
      if (data.role !== "ADMIN") {
        throw new Error("Only ADMIN can access admin panel");
      }
      saveSession(data);
      await loadAdminData(data.token);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const data = await request("/auth/admin-signup", { method: "POST", body: signupForm });
      saveSession(data);
      setIsRegistering(false);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = (data) => {
    setToken(data.token);
    setProfile(data);
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_profile", JSON.stringify(data));
  };

  const onLogout = () => {
    setToken("");
    setProfile(null);
    setCompany(null);
    setBranches([]);
    setUsers([]);
    setDispatches([]);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
  };

  const onCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const data = await request("/admin/company", { method: "POST", token, body: companyForm });
      setCompany(data);
      await loadAdminData();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const onBranchSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      if (editingBranchId) {
        await request(`/admin/branches/${editingBranchId}`, { method: "PUT", token, body: branchForm });
      } else {
        await request("/admin/branches", { method: "POST", token, body: branchForm });
      }
      setBranchForm({ name: "", city: "", address: "", code: "", status: "ACTIVE" });
      setEditingBranchId("");
      await loadAdminData();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const startEditBranch = (branch) => {
    setEditingBranchId(branch._id);
    setBranchForm({
      name: branch.name,
      city: branch.city,
      address: branch.address,
      code: branch.code,
      status: branch.status
    });
  };

  const onDeleteBranch = async (id) => {
    if (!window.confirm("Delete this branch?")) return;
    try {
      setError("");
      await request(`/admin/branches/${id}`, { method: "DELETE", token });
      await loadAdminData();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const onUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      if (editingUserId) {
        await request(`/admin/users/${editingUserId}`, { method: "PUT", token, body: userForm });
      } else {
        await request("/admin/users", { method: "POST", token, body: userForm });
      }
      setUserForm({ fullName: "", email: "", password: "", role: "STAFF", branchId: branches[0]?._id || "" });
      setEditingUserId("");
      await loadAdminData();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const startEditUser = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role,
      branchId: user.branchId || ""
    });
  };

  const onDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      setError("");
      await request(`/admin/users/${id}`, { method: "DELETE", token });
      await loadAdminData();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const downloadCSV = (data, filename, columns) => {
    if (!data || data.length === 0) return alert("No data to export");
    const headers = columns.map(col => col.label).join(",");
    const rows = data.map(item => 
      columns.map(col => {
        let val = col.key.split('.').reduce((o, i) => o?.[i], item) || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDeleteDispatch = async (id) => {
    if (!window.confirm("Delete this dispatch?")) return;
    try {
      setError("");
      await request(`/admin/dispatches/${id}`, { method: "DELETE", token });
      await loadAdminData();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const [showAuthPass, setShowAuthPass] = useState(false);
  const [showUserFormPass, setShowUserFormPass] = useState(false);

  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  const branchOptions = useMemo(() => branches, [branches]);

  const stats = useMemo(() => ({
    branches: branches.length,
    users: users.length,
    dispatches: dispatches.length
  }), [branches, users, dispatches]);

  if (!isLoggedIn) {
    return (
      <div className="center">
        <div className="login-box">
          <div className="logo-container">
            <img src={logo} alt="BranchFlow" />
          </div>
          {isRegistering ? (
            <form className="form" onSubmit={onSignup}>
              <h1>Admin Signup</h1>
              <p>Create your central administration account</p>
              <input placeholder="Full Name" value={signupForm.fullName} onChange={(e) => setSignupForm(s => ({ ...s, fullName: e.target.value }))} required />
              <input type="email" placeholder="Email" value={signupForm.email} onChange={(e) => setSignupForm(s => ({ ...s, email: e.target.value }))} required />
              <div className="pass-group">
                <input type={showAuthPass ? "text" : "password"} placeholder="Password" value={signupForm.password} onChange={(e) => setSignupForm(s => ({ ...s, password: e.target.value }))} required />
                <div className="pass-toggle" onClick={() => setShowAuthPass(!showAuthPass)}>
                  <i data-lucide={showAuthPass ? "eye-off" : "eye"} style={{ width: '20px' }}></i>
                </div>
              </div>
              <input placeholder="Phone" value={signupForm.phone} onChange={(e) => setSignupForm(s => ({ ...s, phone: e.target.value }))} />
              <button type="submit" disabled={loading}>
                {loading ? <div className="loading-dots"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div> : "Sign Up"}
              </button>
              <button type="button" className="secondary" style={{ marginTop: '8px', width: '100%', border: 'none', background: 'transparent', textDecoration: 'underline' }} onClick={() => setIsRegistering(false)}>
                Already have an account? Login
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={onLogin}>
              <h1>BranchFlow Admin</h1>
              <p>Centralized Logistics Management</p>
              <input type="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm(s => ({ ...s, email: e.target.value }))} required />
              <div className="pass-group">
                <input type={showAuthPass ? "text" : "password"} placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm(s => ({ ...s, password: e.target.value }))} required />
                <div className="pass-toggle" onClick={() => setShowAuthPass(!showAuthPass)}>
                  <i data-lucide={showAuthPass ? "eye-off" : "eye"} style={{ width: '20px' }}></i>
                </div>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? <div className="loading-dots"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div> : "Login"}
              </button>
              <button type="button" className="secondary" style={{ marginTop: '8px', width: '100%', border: 'none', background: 'transparent', textDecoration: 'underline' }} onClick={() => setIsRegistering(true)}>
                New Admin? Create Account
              </button>
            </form>
          )}
          {error ? <div className="error" style={{ marginTop: '20px' }}>{error}</div> : null}
        </div>
      </div>
    );
  }

  if (isFetchingData) {
      return (
          <div className="center">
              <div className="login-box">
                  <div className="logo-container" style={{ animation: 'pulse 2s infinite' }}>
                    <img src={logo} alt="Loading" />
                  </div>
                  <h2>Syncing Ecosystem...</h2>
                  <div className="loading-dots" style={{ marginTop: '16px' }}>
                    <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                  </div>
              </div>
          </div>
      );
  }

  if (!company) {
    return (
      <div className="center">
        <div className="login-box">
          <div className="logo-container">
            <img src={logo} alt="Setup" />
          </div>
          <form className="form" onSubmit={onCompanySubmit}>
            <h1>Welcome, {profile.fullName}</h1>
            <p>Complete your company setup to start managing logistics.</p>
            <input placeholder="Company Name" value={companyForm.name} onChange={(e) => setCompanyForm(s => ({ ...s, name: e.target.value }))} required />
            <input placeholder="Company Email" type="email" value={companyForm.email} onChange={(e) => setCompanyForm(s => ({ ...s, email: e.target.value }))} required />
            <input placeholder="Company Phone" value={companyForm.phone} onChange={(e) => setCompanyForm(s => ({ ...s, phone: e.target.value }))} required />
            <button type="submit" disabled={loading}>
              {loading ? "Syncing..." : "Launch Dashboard"}
            </button>
            <button type="button" className="secondary" onClick={onLogout}>Logout</button>
            {error ? <div className="error" style={{ marginTop: '20px' }}>{error}</div> : null}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand-title" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
            <i data-lucide="shield-check" style={{ color: 'white' }}></i>
          </div>
          <div>
            <h2>{company.name}</h2>
            <small><i data-lucide="user" style={{ width: '12px', verticalAlign: 'middle', marginRight: '4px' }}></i> {profile.fullName} (Admin)</small>
          </div>
        </div>
        <button className="danger" onClick={onLogout} style={{ padding: '10px 20px', borderRadius: '12px' }}>
          <i data-lucide="log-out" style={{ width: '18px' }}></i> Logout
        </button>
      </header>

      {error ? <div className="error" style={{ marginBottom: "20px" }}>{error}</div> : null}

      {/* Dashboard Stats */}
      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-icon"><i data-lucide="map-pin"></i></div>
          <div className="stat-info">
            <h4>Active Branches</h4>
            <div className="stat-value">{stats.branches}</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><i data-lucide="users"></i></div>
          <div className="stat-info">
            <h4>Staff Members</h4>
            <div className="stat-value">{stats.users}</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><i data-lucide="truck"></i></div>
          <div className="stat-info">
            <h4>Total Shipments</h4>
            <div className="stat-value">{stats.dispatches}</div>
          </div>
        </div>
      </div>

      <section className="grid">
        <div className="card">
          <h3>
            <i data-lucide={editingBranchId ? "edit-3" : "plus-circle"} style={{ color: 'var(--primary)' }}></i>
            {editingBranchId ? "Modify Branch" : "Establish Branch"}
          </h3>
          <form onSubmit={onBranchSubmit} className="form">
            <input placeholder="Branch Name" value={branchForm.name} onChange={(e) => setBranchForm((s) => ({ ...s, name: e.target.value }))} required />
            <input placeholder="City" value={branchForm.city} onChange={(e) => setBranchForm((s) => ({ ...s, city: e.target.value }))} required />
            <input placeholder="Full Address" value={branchForm.address} onChange={(e) => setBranchForm((s) => ({ ...s, address: e.target.value }))} required />
            <input placeholder="System Code (e.g. NYC01)" value={branchForm.code} onChange={(e) => setBranchForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))} required />
            <select value={branchForm.status} onChange={(e) => setBranchForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="ACTIVE">System Status: ACTIVE</option>
              <option value="INACTIVE">System Status: INACTIVE</option>
            </select>
            <button type="submit">
              <i data-lucide="check"></i> {editingBranchId ? "Sync Changes" : "Confirm Branch"}
            </button>
            {editingBranchId && <button type="button" className="secondary" onClick={() => { setEditingBranchId(""); setBranchForm({ name: "", city: "", address: "", code: "", status: "ACTIVE" }); }}>Cancel Edit</button>}
          </form>
        </div>

        <div className="card">
          <h3>
            <i data-lucide={editingUserId ? "user-cog" : "user-plus"} style={{ color: 'var(--success)' }}></i>
            {editingUserId ? "Modify User" : "Provision User"}
          </h3>
          <form onSubmit={onUserSubmit} className="form">
            <input placeholder="Full Name" value={userForm.fullName} onChange={(e) => setUserForm((s) => ({ ...s, fullName: e.target.value }))} required />
            <input placeholder="Email Address" type="email" value={userForm.email} onChange={(e) => setUserForm((s) => ({ ...s, email: e.target.value }))} required />
            <div className="pass-group">
              <input placeholder={editingUserId ? "New Password (Leave blank to keep)" : "Password"} type={showUserFormPass ? "text" : "password"} value={userForm.password} onChange={(e) => setUserForm((s) => ({ ...s, password: e.target.value }))} required={!editingUserId} />
              <div className="pass-toggle" onClick={() => setShowUserFormPass(!showUserFormPass)}>
                <i data-lucide={showUserFormPass ? "eye-off" : "eye"} style={{ width: '20px' }}></i>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select value={userForm.role} onChange={(e) => setUserForm((s) => ({ ...s, role: e.target.value }))}>
                <option value="STAFF">Role: STAFF</option>
                <option value="ADMIN">Role: ADMIN</option>
              </select>
              <select value={userForm.branchId} onChange={(e) => setUserForm((s) => ({ ...s, branchId: e.target.value }))} required>
                <option value="">Map to Branch</option>
                {branchOptions.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
              <i data-lucide="save"></i> {editingUserId ? "Commit Changes" : "Confirm User"}
            </button>
            {editingUserId && <button type="button" className="secondary" onClick={() => { setEditingUserId(""); setUserForm({ fullName: "", email: "", password: "", role: "STAFF", branchId: "" }); }}>Cancel Edit</button>}
          </form>
        </div>
      </section>

      <section className="card table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '20px' }}>
          <h3><i data-lucide="list" style={{ color: 'var(--primary)' }}></i> Branch Registry</h3>
          <button className="secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => downloadCSV(branches, "Branches", [
            { label: "Name", key: "name" },
            { label: "Code", key: "code" },
            { label: "Key", key: "registrationKey" },
            { label: "City", key: "city" },
            { label: "Status", key: "status" }
          ])}>
            <i data-lucide="sheet" style={{ width: '16px' }}></i> Export Excel
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Branch Identity</th>
                <th>System Code</th>
                <th>Join Token (Secure)</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontWeight: '600' }}>{b.name}</td>
                  <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>{b.code}</code></td>
                  <td>
                    <span style={{ color: '#818cf8', fontWeight: '700', letterSpacing: '1px' }}>{b.registrationKey}</span>
                  </td>
                  <td><i data-lucide="map" style={{ width: '14px', verticalAlign: 'middle', marginRight: '6px', opacity: 0.6 }}></i> {b.city}</td>
                  <td>
                    <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="secondary" onClick={() => startEditBranch(b)} title="Edit">
                      <i data-lucide="edit-2" style={{ width: '16px' }}></i>
                    </button>
                    <button className="danger" onClick={() => onDeleteBranch(b._id)} title="Remove">
                      <i data-lucide="trash-2" style={{ width: '16px' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No branches established yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card table-card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '20px' }}>
          <h3><i data-lucide="users-round" style={{ color: '#10b981' }}></i> User Personnel</h3>
          <button className="secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => downloadCSV(users, "Users", [
            { label: "FullName", key: "fullName" },
            { label: "Email", key: "email" },
            { label: "Role", key: "role" },
            { label: "Branch", key: "branchId.name" }
          ])}>
            <i data-lucide="file-spreadsheet" style={{ width: '16px' }}></i> Export Excel
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email Contact</th>
                <th>Access Level</th>
                <th>Assigned Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: '500' }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      background: u.role === 'ADMIN' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: u.role === 'ADMIN' ? '#818cf8' : 'inherit',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.branchId?.name || <em style={{ opacity: 0.5 }}>Unassigned</em>}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="secondary" onClick={() => startEditUser(u)} title="Edit">
                      <i data-lucide="edit-2" style={{ width: '16px' }}></i>
                    </button>
                    <button className="danger" onClick={() => onDeleteUser(u._id)} title="Remove">
                      <i data-lucide="trash-2" style={{ width: '16px' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card table-card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '20px' }}>
          <h3><i data-lucide="history" style={{ color: '#f59e0b' }}></i> Transit History</h3>
          <button className="secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => downloadCSV(dispatches, "TransitLogs", [
            { label: "TrackingID", key: "trackingId" },
            { label: "Source", key: "fromBranch" },
            { label: "Destination", key: "toBranch" },
            { label: "Status", key: "status" },
            { label: "Date", key: "dispatchDate" }
          ])}>
            <i data-lucide="table" style={{ width: '16px' }}></i> Export Excel
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tracking Identity</th>
                <th>Source Origin</th>
                <th>Destination</th>
                <th>Current Status</th>
                <th>Dispatch Timestamp</th>
                <th>Management</th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map((d) => (
                <tr key={d._id}>
                  <td><code style={{ fontWeight: '700', color: '#f59e0b' }}>#{d.trackingId}</code></td>
                  <td>{d.fromBranch}</td>
                  <td>{d.toBranch}</td>
                  <td>
                    <span style={{ 
                      color: d.status === 'Received' ? '#10b981' : '#f59e0b',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td>{new Date(d.dispatchDate).toLocaleDateString()}</td>
                  <td>
                    <button className="danger" onClick={() => onDeleteDispatch(d._id)} title="Delete Record">
                      <i data-lucide="trash-2" style={{ width: '16px' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
              {dispatches.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transit records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
