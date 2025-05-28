import { useState, useEffect } from 'react';
import './App.css';
import Login from './screens/admin/auth/login';
import { Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './screens/admin/auth/forgotPassword';
import ResetPassword from './screens/admin/auth/resetPassword';
import DashboardLayout from './screens/admin/dashboard/dashboardLayout';
import Profile from './screens/admin/dashboard/profile';
import { Provider } from 'react-redux';
import store from './store';
import { useSelector } from 'react-redux';
import DashboardHome from './screens/admin/dashboard/dashboardHome';
import Bookings from './screens/admin/dashboard/bookings';
import OrdersManagement from './screens/admin/dashboard/orderManagement';

// PrivateRoute component to handle authentication
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};


const AppWrapper = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="orders" element={<OrdersManagement />} />
        </Route>
        
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}

export default AppWrapper;