import { useState } from 'react'
import './App.css'
import Login from './components/admin/auth/login'
import { Routes, Route } from 'react-router-dom';
import ForgotPassword from './components/admin/auth/forgotPassword';
import ResetPassword from './components/admin/auth/resetPassword';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword/>} />
      </Routes>
    </>
  )
}

export default App
