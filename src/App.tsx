/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BubbleBackground from './components/BubbleBackground';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Inspiration from './pages/Inspiration';
import Events from './pages/Events';
import Notifications from './pages/Notifications';
import Nav from './components/Nav';
import Sidebar from './components/Sidebar';
import CreateFAB from './components/CreateFAB';
import PremiumReminder from './components/PremiumReminder';

import AIIdentify from './pages/AIIdentify';
import Leaderboard from './pages/Leaderboard';
import Premium from './pages/Premium';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-bounce text-sea-aqua font-display text-2xl">Diving in...</div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen pt-20 pb-12">
      <BubbleBackground />
      <Nav onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <PremiumReminder />
      <CreateFAB />
      <div className="max-w-5xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/profile/:uid" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/inspiration" element={<PrivateRoute><Inspiration /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/identify" element={<PrivateRoute><AIIdentify /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/premium" element={<PrivateRoute><Premium /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
