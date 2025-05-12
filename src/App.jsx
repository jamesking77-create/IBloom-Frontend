import { useState } from 'react'
import './App.css'
import Login from './screens/admin/auth/login'
import { Routes, Route } from 'react-router-dom';
import ForgotPassword from './screens/admin/auth/forgotPassword';
import ResetPassword from './screens/admin/auth/resetPassword';
import DashboardLayout from './screens/admin/dashboard/dashboardLayout';
import Profile from './screens/admin/dashboard/profile';
import DashboardHome from './components/admin/dashboard/dashboardHome';

function App() {

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />


        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
