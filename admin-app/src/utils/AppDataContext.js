import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import { registerForPushNotificationsAsync } from "./NotificationService";


const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  // Data States
  const [company, setCompany] = useState(null);
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
        const [storedUser, cacheComp, cacheDash, cacheDisp, cacheBran, cacheUser, cacheRepo] = await Promise.all([
          AsyncStorage.getItem("userInfo"),
          AsyncStorage.getItem("cache_company"),
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
          if (cacheComp) setCompany(JSON.parse(cacheComp));
          if (cacheDash) setDashboard(JSON.parse(cacheDash));
          if (cacheDisp) setDispatches(JSON.parse(cacheDisp));
          if (cacheBran) setBranches(JSON.parse(cacheBran));
          if (cacheUser) setUsers(JSON.parse(cacheUser));
          if (cacheRepo) setReports(JSON.parse(cacheRepo));

          // If cache exists, stop initial global loading spinner
          if (cacheDash || cacheBran) setLoading(false);
        } else {
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
      // Background load: only show spinner if we have NO branches cached
      if (branches.length === 0) setLoading(true);
      setError("");

      // Fetch company first
      let freshCompany = null;
      try {
          const compRes = await api.get("/admin/company");
          freshCompany = compRes.data;
          setCompany(freshCompany);
      } catch (e) {
          if (e.response?.status === 404) setCompany(null);
          else throw e;
      }

      const[dashboardRes, dispatchRes, branchRes, userRes, reportRes] = await Promise.all([
        api.get("/dashboard").catch(() => ({ data: null })),
        api.get("/admin/dispatches").catch(() => api.get("/dispatches")),
        api.get("/admin/branches").catch(() => api.get("/branches")),
        api.get("/admin/users").catch(() => api.get("/users")),
        api.get("/reports").catch(() => ({ data: null }))
      ]);

      setDashboard(dashboardRes.data);
      setDispatches(dispatchRes.data);
      setBranches(branchRes.data);
      setUsers(userRes.data);
      setReports(reportRes.data);

      // Save everything to Cache
      await Promise.all([
        AsyncStorage.setItem("cache_company", JSON.stringify(freshCompany)),
        AsyncStorage.setItem("cache_dashboard", JSON.stringify(dashboardRes.data)),
        AsyncStorage.setItem("cache_dispatches", JSON.stringify(dispatchRes.data)),
        AsyncStorage.setItem("cache_branches", JSON.stringify(branchRes.data)),
        AsyncStorage.setItem("cache_users", JSON.stringify(userRes.data)),
        AsyncStorage.setItem("cache_reports", JSON.stringify(reportRes.data))
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Refreshing data...");
    } finally {
      setLoading(false);
    }
  }, [userAuth]);

  useEffect(() => {
    if (userAuth) {
      loadAll();
      registerForPushNotificationsAsync();
    }
  }, [userAuth, loadAll]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.role !== "ADMIN") {
      // Clear any token that was set
      delete api.defaults.headers.common["Authorization"];
      throw { message: "This app is for Admins only. Please use the Staff App to log in.", response: { data: { message: "Admin access only" } } };
    }
    await setAuthState(data);
  };

  const setAuthState = async (data) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    await AsyncStorage.setItem("userInfo", JSON.stringify(data));
    setUserAuth(data);
  };

  const setupCompany = async (companyData) => {
    const { data } = await api.post("/admin/company", companyData);
    setCompany(data);
    await loadAll();
    return data;
  };

  const logout = async () => {
    setUserAuth(null);
    setCompany(null);
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
    return data;
  },[]);

  const adminCreateUser = useCallback(async (userData) => {
    const { data } = await api.post("/admin/users", userData);
    setUsers((prev) => [data, ...prev]);
    return data;
  },[]);

  const value = useMemo(
    () => ({
      userAuth, 
      company,
      login,    
      setAuthState,
      setupCompany,
      logout, 
      loading,
      error,
      dashboard,
      dispatches,
      branches,
      users,
      reports,
      refresh: loadAll,
      createDispatch,
      updateStatus,
      adminCreateUser
    }),[userAuth, company, loading, error, dashboard, dispatches, branches, users, reports, loadAll, createDispatch, updateStatus]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
};
