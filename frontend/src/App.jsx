import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import Toast from './components/feedback/Toast';

function App() {
  return (
    <>
      <Routes>
        {/* Public auth screens */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected workspace paths */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Toast notifier */}
      <Toast />
    </>
  );
}

export default App;
