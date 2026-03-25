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
  const [dispatchForm, setDispatchForm] = useState({ trackingId: "", toBranchId: "", category: "", courierName: "", status: "SENT", priority: "MEDIUM" });
  const [editingDispatchId, setEditingDispatchId] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDispatches, setSelectedDispatches] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmData, setConfirmData] = useState(null);

  const toast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const confirm = (title, message, onConfirm) => {
    setConfirmData({ title, message, onConfirm });
  };

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
      toast("Infrastructure initialized successfully!");
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
      await loadAdminData();
      toast(editingBranchId ? "Branch synchronized" : "Branch established successfully");
      setBranchForm({ name: "", city: "", address: "", code: "", status: "ACTIVE" });
      setEditingBranchId("");
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDeleteBranch = async (id) => {
    confirm("Delete Branch", "Are you sure you want to decommission this branch? This action cannot be reversed.", async () => {
      try {
        setError("");
        await request(`/admin/branches/${id}`, { method: "DELETE", token });
        setBranches((prev) => prev.filter((b) => b._id !== id));
        setSelectedBranches((prev) => prev.filter((bid) => bid !== id));
        toast("Branch decommissioned", "error");
      } catch (e2) {
        setError(e2.message);
      }
    });
  };

  const onBulkDeleteBranches = async () => {
    confirm("Bulk Delete Branches", `Are you sure you want to remove ${selectedBranches.length} selected branches?`, async () => {
      try {
        setError("");
        setLoading(true);
        await request("/admin/branches/bulk", { method: "DELETE", token, body: { ids: selectedBranches } });
        setBranches((prev) => prev.filter((b) => !selectedBranches.includes(b._id)));
        setSelectedBranches([]);
        toast(`${selectedBranches.length} branches removed`, "error");
      } catch (e2) {
        setError(e2.message);
      } finally {
        setLoading(false);
      }
    });
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
      toast(editingUserId ? "User profile updated" : "User provisioned successfully");
    } catch (e2) {
      setError(e2.message);
    }
  };

  const startEditUser = (user) => {
    setEditingUserId(user._id);
    // Handle populated branchId object from the users list
    const bId = user.branchId?._id || user.branchId || "";
    setUserForm({
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role,
      branchId: bId
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDeleteUser = async (id) => {
    confirm("Remove User", "Are you sure you want to remove this user from the system?", async () => {
      try {
        setError("");
        await request(`/admin/users/${id}`, { method: "DELETE", token });
        setUsers((prev) => prev.filter((u) => u._id !== id));
        setSelectedUsers((prev) => prev.filter((uid) => uid !== id));
        toast("User personnel removed", "error");
      } catch (e2) {
        setError(e2.message);
      }
    });
  };

  const onBulkDeleteUsers = async () => {
    confirm("Bulk Remove Users", `Are you sure you want to remove ${selectedUsers.length} selected users?`, async () => {
      try {
        setError("");
        setLoading(true);
        await request("/admin/users/bulk", { method: "DELETE", token, body: { ids: selectedUsers } });
        setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u._id)));
        setSelectedUsers([]);
        toast(`${selectedUsers.length} users removed`, "error");
      } catch (e2) {
        setError(e2.message);
      } finally {
        setLoading(false);
      }
    });
  };

  const downloadCSV = (data, filename, columns) => {
    if (!data || data.length === 0) return toast("No metrics to export", "error");
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
    confirm("Clear Transit Record", "Are you sure you want to remove this shipment from history?", async () => {
      try {
        setError("");
        await request(`/admin/dispatches/${id}`, { method: "DELETE", token });
        setDispatches((prev) => prev.filter((d) => d._id !== id));
        setSelectedDispatches((prev) => prev.filter((did) => did !== id));
        toast("Transit history record cleared", "error");
      } catch (e2) {
        setError(e2.message);
      }
    });
  };
  
  const onBulkDeleteDispatches = async () => {
    confirm("Bulk Clear History", `Are you sure you want to clear ${selectedDispatches.length} transit history records?`, async () => {
      try {
        setError("");
        setLoading(true);
        await request("/admin/dispatches/bulk", { method: "DELETE", token, body: { ids: selectedDispatches } });
        setDispatches((prev) => prev.filter((d) => !selectedDispatches.includes(d._id)));
        setSelectedDispatches([]);
        toast(`${selectedDispatches.length} transit records cleared`, "error");
      } catch (e2) {
        setError(e2.message);
      } finally {
        setLoading(false);
      }
    });
  };
  
  const onDispatchSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await request(`/admin/dispatches/${editingDispatchId}`, { method: "PUT", token, body: dispatchForm });
      setEditingDispatchId("");
      setDispatchForm({ trackingId: "", toBranchId: "", category: "", courierName: "", status: "SENT", priority: "MEDIUM" });
      await loadAdminData();
      toast("Transit history record synchronized");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditDispatch = (dispatch) => {
    setEditingDispatchId(dispatch._id);
    setDispatchForm({
      trackingId: dispatch.trackingId,
      toBranchId: dispatch.toBranchId,
      category: dispatch.category,
      courierName: dispatch.courierName,
      status: dispatch.status,
      priority: dispatch.priority || "MEDIUM"
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className={`card ${editingBranchId ? 'edit-mode-active' : ''}`}>
          <h3>
            <i data-lucide={editingBranchId ? "edit-3" : "plus-circle"} style={{ color: editingBranchId ? '#f59e0b' : 'var(--primary)' }}></i>
            {editingBranchId ? `Edit Branch: ${branchForm.name}` : "Establish Branch"}
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

        <div className={`card ${editingUserId ? 'edit-mode-active' : ''}`}>
          <h3>
            <i data-lucide={editingUserId ? "user-cog" : "user-plus"} style={{ color: editingUserId ? '#f59e0b' : 'var(--success)' }}></i>
            {editingUserId ? `Edit User: ${userForm.fullName}` : "Provision User"}
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
      
      {editingDispatchId && (
        <div className="card" style={{ marginTop: '32px', border: '1px solid #f59e0b22', background: 'rgba(245, 158, 11, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>
              <i data-lucide="truck" style={{ color: '#f59e0b' }}></i>
              Modify Transit Record: <code style={{ color: '#f59e0b' }}>#{dispatchForm.trackingId}</code>
            </h3>
            <button className="secondary" onClick={() => setEditingDispatchId("")} style={{ padding: '8px 16px' }}>Cancel Edit</button>
          </div>
          <form onSubmit={onDispatchSubmit} className="form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Category</label>
              <input placeholder="Category" value={dispatchForm.category} onChange={(e) => setDispatchForm((s) => ({ ...s, category: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Courier / Porter</label>
              <input placeholder="Courier Name" value={dispatchForm.courierName} onChange={(e) => setDispatchForm((s) => ({ ...s, courierName: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Destination Branch</label>
              <select value={dispatchForm.toBranchId} onChange={(e) => setDispatchForm((s) => ({ ...s, toBranchId: e.target.value }))} required>
                {branchOptions.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Override Status</label>
              <select value={dispatchForm.status} onChange={(e) => setDispatchForm((s) => ({ ...s, status: e.target.value }))} style={{ border: '1px solid #f59e0b44' }}>
                <option value="SENT">SENT (Initial State)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (Dispatched)</option>
                <option value="WAITING_RECEIPT">WAITING_RECEIPT (Arrived at Dest)</option>
                <option value="RECEIVED">RECEIVED (Completed)</option>
                <option value="PENDING">PENDING (Delayed)</option>
                <option value="OVERDUE">OVERDUE (System Flagged)</option>
                <option value="FAILED">FAILED (Rejected/Lost)</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'black', fontWeight: 'bold' }}>
                <i data-lucide="save"></i> Update Transit History Record
              </button>
            </div>
          </form>
        </div>
      )}


      <section className="card table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h3><i data-lucide="list" style={{ color: 'var(--primary)' }}></i> Branch Registry</h3>
            {selectedBranches.length > 0 && (
              <button className="danger" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={onBulkDeleteBranches}>
                <i data-lucide="trash-2" style={{ width: '14px' }}></i> Delete ({selectedBranches.length})
              </button>
            )}
          </div>
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
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={branches.length > 0 && selectedBranches.length === branches.length} 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedBranches(branches.map(b => b._id));
                      else setSelectedBranches([]);
                    }}
                  />
                </th>
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
                <tr key={b._id} className={selectedBranches.includes(b._id) ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedBranches.includes(b._id)} 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBranches(prev => [...prev, b._id]);
                        else setSelectedBranches(prev => prev.filter(id => id !== b._id));
                      }}
                    />
                  </td>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h3><i data-lucide="users-round" style={{ color: '#10b981' }}></i> User Personnel</h3>
            {selectedUsers.length > 0 && (
              <button className="danger" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={onBulkDeleteUsers}>
                <i data-lucide="trash-2" style={{ width: '14px' }}></i> Delete ({selectedUsers.length})
              </button>
            )}
          </div>
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
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={users.length > 0 && selectedUsers.length === users.length} 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedUsers(users.map(u => u._id));
                      else setSelectedUsers([]);
                    }}
                  />
                </th>
                <th>Member Name</th>
                <th>Email Contact</th>
                <th>Access Level</th>
                <th>Assigned Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className={selectedUsers.includes(u._id) ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(u._id)} 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers(prev => [...prev, u._id]);
                        else setSelectedUsers(prev => prev.filter(id => id !== u._id));
                      }}
                    />
                  </td>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h3><i data-lucide="history" style={{ color: '#f59e0b' }}></i> Transit History</h3>
            {selectedDispatches.length > 0 && (
              <button className="danger" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={onBulkDeleteDispatches}>
                <i data-lucide="trash-2" style={{ width: '14px' }}></i> Delete ({selectedDispatches.length})
              </button>
            )}
          </div>
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
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={dispatches.length > 0 && selectedDispatches.length === dispatches.length} 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedDispatches(dispatches.map(d => d._id));
                      else setSelectedDispatches([]);
                    }}
                  />
                </th>
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
                <tr key={d._id} className={selectedDispatches.includes(d._id) ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedDispatches.includes(d._id)} 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDispatches(prev => [...prev, d._id]);
                        else setSelectedDispatches(prev => prev.filter(id => id !== d._id));
                      }}
                    />
                  </td>
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
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="secondary" onClick={() => startEditDispatch(d)} title="Edit Shipment">
                      <i data-lucide="edit-2" style={{ width: '16px' }}></i>
                    </button>
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

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <i data-lucide={t.type === 'success' ? 'check-circle' : 'alert-circle'} style={{ width: '18px' }}></i>
            {t.message}
          </div>
        ))}
      </div>

      {confirmData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3><i data-lucide="help-circle" style={{ color: 'var(--warning)' }}></i> {confirmData.title}</h3>
            <p>{confirmData.message}</p>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setConfirmData(null)}>Dismiss</button>
              <button className="danger" onClick={() => { confirmData.onConfirm(); setConfirmData(null); }}>
                Proceed Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
