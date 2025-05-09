import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import logoimg from "../../../assets/Screenshot 2025-05-09 144927.png"
import { 
    notifySuccess, 
    notifyError, 
    notifyInfo,
    notifyPromise 
  } from '../../../utils/toastify';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    notifyInfo("Email sent successfully")
   navigate('/resetPassword')
  
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#DDFFD5]">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white">
        <div className="flex justify-center mb-8">
        <img src={logoimg} alt="" />
        </div>
        
        <div>
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm text-left font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="Email"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-md border text-lg font-semibold border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#468E36]"
              placeholder="Verify Your Email"
            />
          </div>
          
        
          
          <button
            onClick={handleSubmit}
            className="w-full bg-[#468E36] hover:bg-[#2C5D22] text-white font-medium py-3 px-4 rounded-md transition duration-300"
          >
            Verify
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-sm  text-[#A61A5A] hover:text-[#468E36]">
            Back
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;