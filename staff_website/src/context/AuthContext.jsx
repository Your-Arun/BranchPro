import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: "https://branchpro.onrender.com/api",
  timeout: 40000,
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  const authRef = useRef(user);
  useEffect(() => {
    authRef.current = user;
    if (user?.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [user]);

  const loadAll = useCallback(async () => {
    if (!authRef.current) return;
    try {
      setError("");
      const [dashRes, dispRes, branRes] = await Promise.all([
        api.get("/dashboard").catch(() => ({ data: null })),
        api.get("/dispatches").catch(() => ({ data: [] })),
        api.get("/branches").catch(() => ({ data: [] }))
      ]);
      setDashboard(dashRes.data);
      setDispatches(dispRes.data);
      setBranches(branRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Network Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAll();
      const poll = setInterval(() => loadAll(), 20000);
      return () => clearInterval(poll);
    } else {
      setLoading(false);
    }
  }, [!!user, loadAll]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.role === 'ADMIN') {
      throw new Error("Admins should use the Admin Panel.");
    }
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
  };

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setDashboard(null);
    setDispatches([]);
    setBranches([]);
  };

  const createDispatch = async (payload) => {
    const { data } = await api.post("/dispatches", payload);
    setDispatches((prev) => [data, ...prev]);
    return data;
  };

  const updateStatus = async (id, status) => {
    const { data } = await api.patch(`/dispatches/${id}/status`, { status });
    setDispatches((prev) => prev.map((d) => (d._id === id ? data : d)));
    await loadAll();
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/me", payload);
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user, login, signup, logout, loading, error, dashboard, dispatches, branches, refresh: loadAll, createDispatch, updateStatus, updateProfile, api
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
