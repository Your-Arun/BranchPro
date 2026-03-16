import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";

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

  // 1. Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userInfo");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserAuth(parsed);
          api.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error("Auth init failed", e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  },[]);

  // 2. Fetch Data Logic
  const loadAll = useCallback(async () => {
    if (!userAuth) return;
    
    try {
      setLoading(true);
      setError("");

      const[dashboardRes, dispatchRes, branchRes, userRes, reportRes] = await Promise.all([
        api.get("/dashboard").catch(() => ({ data: null })),
        api.get("/dispatches").catch(() => ({ data: [] })),
        api.get("/branches").catch(() => ({ data: [] })),
        api.get("/users").catch(() => ({ data: [] })),
        api.get("/reports").catch(() => ({ data: null }))
      ]);

      setDashboard(dashboardRes.data);
      setDispatches(dispatchRes.data);
      setBranches(branchRes.data);
      setUsers(userRes.data);
      setReports(reportRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [userAuth]);

  useEffect(() => {
    if (userAuth) {
      loadAll();
    }
  }, [userAuth, loadAll]);

  const setAuthState = async (data) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    await AsyncStorage.setItem("userInfo", JSON.stringify(data));
    setUserAuth(data);
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
      createDispatch,
      updateStatus
    }),[userAuth, loading, error, dashboard, dispatches, branches, users, reports, loadAll, createDispatch, updateStatus]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
};
