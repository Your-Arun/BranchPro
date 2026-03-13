import { useEffect, useMemo, useState } from "react";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [dispatches, setDispatches] = useState([]);

  const [loginForm, setLoginForm] = useState({ email: "alex.rivera@branchflow.pro", password: "Admin@123" });
  const [branchForm, setBranchForm] = useState({ name: "", city: "", address: "", code: "", status: "ACTIVE" });
  const [editingBranchId, setEditingBranchId] = useState("");
  const [userForm, setUserForm] = useState({ fullName: "", email: "", password: "", role: "STAFF", branchId: "" });
  const [editingUserId, setEditingUserId] = useState("");

  const isLoggedIn = Boolean(token && profile?.role === "ADMIN");

  const loadAdminData = async (authToken = token) => {
    const [b, u, d] = await Promise.all([
      request("/admin/branches", { token: authToken }),
      request("/admin/users", { token: authToken }),
      request("/admin/dispatches", { token: authToken })
    ]);
    setBranches(b);
    setUsers(u);
    setDispatches(d);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
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
      setToken(data.token);
      setProfile(data);
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_profile", JSON.stringify(data));
      await loadAdminData(data.token);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    setToken("");
    setProfile(null);
    setBranches([]);
    setUsers([]);
    setDispatches([]);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
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

  const branchOptions = useMemo(() => branches, [branches]);

  if (!isLoggedIn) {
    return (
      <div className="page center">
        <form className="card login" onSubmit={onLogin}>
          <h1>BranchFlow Admin Panel</h1>
          <p>Login with ADMIN account</p>
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((s) => ({ ...s, password: e.target.value }))}
            required
          />
          <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
          {error ? <div className="error">{error}</div> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h2>Welcome, {profile.fullName}</h2>
          <small>Role: {profile.role}</small>
        </div>
        <button onClick={onLogout}>Logout</button>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <section className="grid">
        <div className="card">
          <h3>{editingBranchId ? "Edit Branch" : "Create Branch"}</h3>
          <form onSubmit={onBranchSubmit} className="form">
            <input placeholder="Name" value={branchForm.name} onChange={(e) => setBranchForm((s) => ({ ...s, name: e.target.value }))} required />
            <input placeholder="City" value={branchForm.city} onChange={(e) => setBranchForm((s) => ({ ...s, city: e.target.value }))} required />
            <input placeholder="Address" value={branchForm.address} onChange={(e) => setBranchForm((s) => ({ ...s, address: e.target.value }))} required />
            <input placeholder="Code" value={branchForm.code} onChange={(e) => setBranchForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))} required />
            <select value={branchForm.status} onChange={(e) => setBranchForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <button type="submit">{editingBranchId ? "Update Branch" : "Add Branch"}</button>
          </form>
        </div>

        <div className="card">
          <h3>{editingUserId ? "Edit User" : "Create User"}</h3>
          <form onSubmit={onUserSubmit} className="form">
            <input placeholder="Full name" value={userForm.fullName} onChange={(e) => setUserForm((s) => ({ ...s, fullName: e.target.value }))} required />
            <input placeholder="Email" type="email" value={userForm.email} onChange={(e) => setUserForm((s) => ({ ...s, email: e.target.value }))} required />
            <input placeholder="Password" type="password" value={userForm.password} onChange={(e) => setUserForm((s) => ({ ...s, password: e.target.value }))} required />
            <select value={userForm.role} onChange={(e) => setUserForm((s) => ({ ...s, role: e.target.value }))}>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select value={userForm.branchId} onChange={(e) => setUserForm((s) => ({ ...s, branchId: e.target.value }))} required>
              <option value="">Select Branch</option>
              {branchOptions.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <button type="submit">{editingUserId ? "Update User" : "Create User"}</button>
          </form>
        </div>
      </section>

      <section className="card">
        <h3>Branches</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>City</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b._id}>
                <td>{b.name}</td>
                <td>{b.code}</td>
                <td>{b.city}</td>
                <td>{b.status}</td>
                <td>
                  <button onClick={() => startEditBranch(b)}>Edit</button>
                  <button className="danger" onClick={() => onDeleteBranch(b._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.branchName}</td>
                <td>
                  <button onClick={() => startEditUser(u)}>Edit</button>
                  <button className="danger" onClick={() => onDeleteUser(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Dispatches</h3>
        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((d) => (
              <tr key={d._id}>
                <td>{d.trackingId}</td>
                <td>{d.fromBranch}</td>
                <td>{d.toBranch}</td>
                <td>{d.status}</td>
                <td>{new Date(d.dispatchDate).toLocaleDateString()}</td>
                <td>
                  <button className="danger" onClick={() => onDeleteDispatch(d._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
