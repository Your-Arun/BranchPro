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
  const [toasts, setToasts] = useState([]);
  const [confirmData, setConfirmData] = useState(null);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);



  const confirm = useCallback((title, message, onConfirm) => {
    setConfirmData({ title, message, onConfirm });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmData?.onConfirm) {
      try {
        await confirmData.onConfirm();
      } catch (err) {
        console.error("Confirmation action failed:", err);
      }
    }
    setConfirmData(null);
  }, [confirmData]);

  const handleCancel = useCallback(() => {
    setConfirmData(null);
  }, []);

  const authRef = useRef(user);
  const logoutRef = useRef();

  useEffect(() => {
    authRef.current = user;
    if (user?.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setDashboard(null);
    setDispatches([]);
    setBranches([]);
  }, []);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (logoutRef.current) logoutRef.current();
          toast("Session expired or user not found. Please log in again.", "error");
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [toast]);

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

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (email, otp, password) => {
    const { data } = await api.post(`/auth/reset-password`, { email, otp, password });
    return data;
  };


  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (user) {
          logout();
          toast("You have been logged out due to inactivity", "info");
        }
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer, true));

    resetTimer(); // Initial setup

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer, true));
    };
  }, [user, logout, toast]);

  const createDispatch = async (payload) => {
    const { data } = await api.post("/dispatches", payload);
    setDispatches((prev) => [data, ...prev]);
    return data;
  };

  const updateStatus = async (id, status) => {
    const { data } = await api.patch(`/dispatches/${id}/status`, { status });
    setDispatches((prev) => prev.map((d) => (d._id === id ? data : d)));
    // Don't wait for loadAll to complete, just trigger it
    loadAll();
    return data;
  };

  const updateDispatch = async (id, payload) => {
    const { data } = await api.patch(`/dispatches/${id}`, payload);
    setDispatches((prev) => prev.map((d) => (d._id === id ? data : d)));
    // Don't wait for loadAll to complete, just trigger it
    loadAll();
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
      user, login, signup, logout, loading, error, dashboard, dispatches, branches, refresh: loadAll, createDispatch, updateStatus, updateDispatch, updateProfile, api,
      forgotPassword, resetPassword,
      toasts, confirmData, toast, confirm, setToasts, setConfirmData, handleConfirm, handleCancel
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
