
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock Authentication State Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('mashal_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('mashal_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mashal_user');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <HashRouter>
      <Layout user={user} logout={logout}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/auth" element={<AuthPage onAuth={login} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
          <Route path="/workspace" element={user ? <Workspace user={user} /> : <Navigate to="/auth" />} />
          <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminPanel /> : <Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
