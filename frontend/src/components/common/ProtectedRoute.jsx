import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { loadCurrentUser } from '../../redux/slices/authSlice';
import LoadingSpinner from '../feedback/LoadingSpinner';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user, loading } = useSelector((state) => state.auth);
  const { isSidebarOpen } = useSelector((state) => state.ui);

  useEffect(() => {
    if (token && !user) {
      dispatch(loadCurrentUser());
    }
  }, [token, user, dispatch]);

  if (token && loading && !user) {
    return <LoadingSpinner fullScreen />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main
          className={`flex-grow p-6 md:p-8 mt-16 transition-all duration-150 min-h-[calc(100vh-64px)]
            ${isSidebarOpen ? 'md:pl-[260px]' : 'md:pl-20'}
          `}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
