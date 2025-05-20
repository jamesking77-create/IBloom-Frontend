import { useState, useEffect } from 'react';
import './App.css';
import Login from './screens/admin/auth/login';
import { Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './screens/admin/auth/forgotPassword';
import ResetPassword from './screens/admin/auth/resetPassword';
import DashboardLayout from './screens/admin/dashboard/dashboardLayout';
import Profile from './screens/admin/dashboard/profile';
import DashboardHome from './components/admin/dashboard/dashboardHome';
import { Provider } from 'react-redux';
import store from './store';
import { useSelector } from 'react-redux';

// PrivateRoute component to handle authentication
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// App wrapper to use Redux
const AppWrapper = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

// Main App content that can access Redux store
function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
   
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </>
  );
}

export default AppWrapper;