import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import notificationManager from "./NotificationManager";


const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  // Data States
  const [dashboard, setDashboard] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  
  // Auth & UI States
  const [userAuth, setUserAuth] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");

  // 1. Initial Auth & Cache Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const [storedUser, cacheDash, cacheDisp, cacheBran, cacheUser, cacheRepo] = await Promise.all([
          AsyncStorage.getItem("userInfo"),
          AsyncStorage.getItem("cache_dashboard"),
          AsyncStorage.getItem("cache_dispatches"),
          AsyncStorage.getItem("cache_branches"),
          AsyncStorage.getItem("cache_users"),
          AsyncStorage.getItem("cache_reports")
        ]);

        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserAuth(parsed);
          api.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
          
          // Hydrate from Cache immediately
          if (cacheDash) setDashboard(JSON.parse(cacheDash));
          if (cacheDisp) setDispatches(JSON.parse(cacheDisp));
          if (cacheBran) setBranches(JSON.parse(cacheBran));
          if (cacheUser) setUsers(JSON.parse(cacheUser));
          if (cacheRepo) setReports(JSON.parse(cacheRepo));
          
          // If we found some cache, we can stop the initial 'boot' loading
          if (cacheDisp || cacheDash) setLoading(false);
        } else {
          // No user, no need to show global loading (will show Login)
          setLoading(false);
        }
      } catch (e) {
        console.error("Auth/Cache init failed", e);
        setLoading(false);
      }
    };
    initAuth();
  },[]);

  // 2. Fetch Data Logic (Background Refresh)
  const loadAll = useCallback(async () => {
    if (!userAuth) return;
    
    try {
      // Only set loading if we don't have cached dispatches (initial boot)
      if (dispatches.length === 0) setLoading(true);
      setError("");

      const[dashboardRes, dispatchRes, branchRes, userRes, reportRes, profileRes] = await Promise.all([
        api.get("/dashboard").catch(() => ({ data: null })),
        api.get("/dispatches").catch(() => ({ data: [] })),
        api.get("/branches").catch(() => ({ data: [] })),
        api.get("/users").catch(() => ({ data: [] })),
        api.get("/reports").catch(() => ({ data: null })),
        api.get("/auth/me").catch(() => ({ data: null }))
      ]);

      if (profileRes.data) {
          const updatedUser = { ...userAuth, ...profileRes.data };
          // Only update if there's a real change to avoid re-render loops
          if (JSON.stringify(updatedUser) !== JSON.stringify(userAuth)) {
              setUserAuth(updatedUser);
              await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));
          }
      }

      setDashboard(dashboardRes.data);
      setDispatches(dispatchRes.data);
      setBranches(branchRes.data);
      setUsers(userRes.data);
      setReports(reportRes.data);

      // Save to Cache
      await Promise.all([
        AsyncStorage.setItem("cache_dashboard", JSON.stringify(dashboardRes.data)),
        AsyncStorage.setItem("cache_dispatches", JSON.stringify(dispatchRes.data)),
        AsyncStorage.setItem("cache_branches", JSON.stringify(branchRes.data)),
        AsyncStorage.setItem("cache_users", JSON.stringify(userRes.data)),
        AsyncStorage.setItem("cache_reports", JSON.stringify(reportRes.data))
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Network synchronization in progress...");
    } finally {
      setLoading(false);
    }
  }, [userAuth]);

  useEffect(() => {
    if (userAuth) {
      loadAll();
      // Initialize notifications
      notificationManager.initialize();

      // Background polling every 30 seconds
      const poll = setInterval(() => {
        loadAll();
      }, 30000);

      return () => clearInterval(poll);
    }
  }, [userAuth, loadAll]);

  const setAuthState = async (data) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    await AsyncStorage.setItem("userInfo", JSON.stringify(data));
    setUserAuth(data);
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    await setAuthState(data);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.role === "ADMIN") {
      delete api.defaults.headers.common["Authorization"];
      throw { message: "Admin accounts must use the Admin App.", response: { data: { message: "Use Admin App" } } };
    }
    await setAuthState(data);
  };

  const logout = async () => {
    setUserAuth(null);
    delete api.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("userInfo");
    
    setDashboard(null);
    setDispatches([]);
    setBranches([]);
    setUsers([]);
    setReports(null);
  };

  const createDispatch = useCallback(async (payload) => {
    const { data } = await api.post("/dispatches", payload);
    setDispatches((prev) => [data, ...prev]);
    return data;
  },[]);

  const updateStatus = useCallback(async (id, status) => {
    const { data } = await api.patch(`/dispatches/${id}/status`, { status });
    setDispatches((prev) => prev.map((d) => (d._id === id ? data : d)));
    // Also trigger a full refresh to update dashboard counts
    await loadAll();
    return data;
  },[]);

  const value = useMemo(
    () => ({
      userAuth, 
      login,    
      setAuthState,
      logout, 
      loading,
      error,
      dashboard,
      dispatches,
      branches,
      users,
      reports,
      refresh: loadAll,
      signup,
      createDispatch,
      updateStatus
    }),[userAuth, loading, error, dashboard, dispatches, branches, users, reports, loadAll, signup, createDispatch, updateStatus]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
};
