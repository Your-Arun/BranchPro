import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Incoming from './pages/Incoming';
import Dispatch from './pages/Dispatch';
import GeneralEntry from './pages/GeneralEntry';
import Profile from './pages/Profile';
import DispatchDetails from './pages/DispatchDetails';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const NotFoundRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  return <div>Redirecting...</div>;
};

function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isUnauthRoute = location.pathname === '/login' || 
                          location.pathname === '/signup' || 
                          location.pathname === '/forgot-password' || 
                          location.pathname.startsWith('/reset-password');
                          
    if (!user && !isUnauthRoute) {
      navigate('/login', { replace: true });
    }
    // We intentionally don't redirect authenticated users to '/' here to allow deep links 
    // and refreshing on other protected routes.
  }, []);

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
      <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/" />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/incoming" element={<ProtectedRoute><Incoming /></ProtectedRoute>} />
      <Route path="/dispatch" element={<ProtectedRoute><Dispatch /></ProtectedRoute>} />
      <Route path="/dispatch/edit/:id" element={<ProtectedRoute><Dispatch /></ProtectedRoute>} />
      <Route path="/details/:id" element={<ProtectedRoute><DispatchDetails /></ProtectedRoute>} />
      <Route path="/general-entry" element={<ProtectedRoute><GeneralEntry /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
