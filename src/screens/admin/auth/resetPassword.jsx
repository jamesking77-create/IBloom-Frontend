import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import logoimg from "../../../assets/Screenshot 2025-05-09 144927.png";
import { 
    notifySuccess, 
    notifyError, 
    notifyInfo,
    notifyPromise 
  } from '../../../utils/toastify';


const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const checkPasswordsMatch = (newPwd, confirmPwd) => {
    if (confirmPwd.length > 0) {
      return newPwd === confirmPwd;
    }
    return true; 
  };


  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordsMatch(checkPasswordsMatch(newPassword, value));
  };


  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    if (confirmPassword.length > 0) {
      setPasswordsMatch(checkPasswordsMatch(value, confirmPassword));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
  
    if (newPassword === confirmPassword && newPassword.length > 0) {
      notifySuccess("Password reset successful!");
      navigate('/login');
    } else {
      setPasswordsMatch(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#DDFFD5]">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white">
        <div className="flex justify-center mb-8">
          <img src={logoimg} alt="Logo" />
        </div>
        
        <div>          
         
          <div className="mb-6">
            <label htmlFor="newPassword" className="block text-sm text-left font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="w-full px-4 py-3 rounded-md border text-lg font-semibold border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#468E36]"
                placeholder="Enter new password"
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm text-left font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-4 py-3 rounded-md border text-lg font-semibold border-gray-300 focus:outline-none focus:ring-2 ${
                  !passwordsMatch ? "border-red-500 focus:ring-red-500" : "focus:ring-[#468E36]"
                }`}
                placeholder="Confirm your password"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full bg-[#468E36] hover:bg-[#2C5D22] text-white font-medium py-3 px-4 rounded-md transition duration-300"
          >
            Reset Password
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/forgotPassword" className="text-md font-semibold text-[#A61A5A] hover:text-[#468E36]">
            Back
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;