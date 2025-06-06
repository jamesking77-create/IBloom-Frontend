// screens/admin/auth/login.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import logoimg from "../../../assets/Screenshot 2025-05-09 144927.png";
import { validateEmail } from '../../../utils/validateEmail';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../../store/slices/auth-slice';
import {
  notifySuccess,
  notifyError,
  notifyInfo,
  notifyPromise
} from '../../../utils/toastify';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

 
  useEffect(() => {
    if (error) {
      notifyError(error);
    }
  }, [error]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (emailError && value.length > 0) {
      setEmailError('');
    }
    
  
    if (error) {
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (passwordError && value.length > 0) {
      setPasswordError('');
    }
    
    // Clear any Redux errors when user types
    if (error) {
      dispatch(clearError());
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!email && !password) {
      notifyError('Please fill in both email and password fields');
      return;
    } else if (!email) {
      notifyError('Please enter your email address');
      return;
    } else if (!password) {
      notifyError('Please enter your password');
      return;
    } else if (!validateEmail(email)) {
      notifyError('Please enter a valid email address');
      return;
    }

    if (isValid) {
      try {
        // Use the loginUser thunk action
        await dispatch(
          loginUser({ email, password })
        ).unwrap();
        
        // If login is successful, navigate will happen via the useEffect above
        // This ensures we only navigate after Redux state has been updated
      } catch (rejectedValue) {
        // Redux will handle displaying the error via the useEffect
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#DDFFD5]">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white">
        <div className="flex justify-center mb-8">
          <img src={logoimg} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm text-left font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-md border text-lg font-semibold border-gray-300 focus:outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-500" : "focus:ring-[#468E36]"
                }`}
              placeholder="Enter your email"
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1 text-left">{emailError}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm text-left font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
                className={`w-full px-4 py-3 rounded-md border text-lg font-semibold border-gray-300 focus:outline-none focus:ring-2 ${passwordError ? "border-red-500 focus:ring-red-500" : "focus:ring-[#468E36]"
                  }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-1 text-left">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#468E36] hover:bg-[#2C5D22] text-white font-medium py-3 px-4 rounded-md transition duration-300 ${loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/forgotPassword" className="text-sm text-[#A61A5A] hover:text-[#468E36]">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;