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

  // 1. Initial Auth Check (App start hote hi bas ek baar chalega)
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
        setLoading(false); // Check complete hone ke baad loading false
      }
    };
    initAuth();
  },[]);

  // 2. Fetch Data Logic (Sirf tab fetch hoga jab user logged in ho)
  const loadAll = useCallback(async () => {
    if (!userAuth) return; // Agar login nahi hai toh return kar jao
    
    try {
      setLoading(true);
      setError("");

      const[dashboardRes, dispatchRes, branchRes, userRes, reportRes] = await Promise.all([
        api.get("/dashboard").catch(() => ({ data: null })),
        api.get("/admin/dispatches").catch((e) => api.get("/dispatches")), // fallback to normal if not available
        api.get("/admin/branches").catch((e) => api.get("/branches")),
        api.get("/admin/users").catch((e) => api.get("/users")),
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

  // 3. Automatically fetch data when userAuth changes (Login hone par)
  useEffect(() => {
    if (userAuth) {
      loadAll();
    }
  }, [userAuth, loadAll]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.role !== "ADMIN") {
      throw new Error("Only ADMIN can access Admin Panel");
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    await AsyncStorage.setItem("userInfo", JSON.stringify(data));
    setUserAuth(data); // Ye state update hote hi automatically loadAll trigger ho jayega
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    await AsyncStorage.setItem("userInfo", JSON.stringify(data));
    setUserAuth(data); // State update hote hi automatically loadAll() chal jayega
  };
  const adminCreateUser = useCallback(async (userData) => {
    const { data } = await api.post("/admin/users", userData);
    // Naye user ko list me sabse upar add kar do UI update karne ke liye
    setUsers((prev) => [data, ...prev]);
    return data;
  },[]);

  // 5. Logout Function
  const logout = async () => {
    setUserAuth(null);
    delete api.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("userInfo");
    
    // Clear data so next user doesn't see old data
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
      register,
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
    }),[userAuth, loading, error, dashboard, dispatches, branches, users, reports, loadAll, createDispatch, updateStatus]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
};
