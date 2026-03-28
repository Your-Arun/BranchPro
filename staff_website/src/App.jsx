import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
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
  
  useEffect(() => {
    // If user is logged in, redirect to home
    if (user) {
      window.location.href = '/';
    } else {
      // If not logged in, redirect to login
      window.location.href = '/login';
    }
  }, [user]);

  return <div>Redirecting...</div>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
      
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
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
