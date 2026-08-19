import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../../store/slices/auth-slice";
import logoimg from "../../../assets/b94e8c2c-c599-4ea6-8277-01d92a9a6290.png";
import { notifyError, notifyPromise } from "../../../utils/toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // Extract resetToken from URL
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!newPassword || !confirmPassword) {
      notifyError("Please provide both password and confirm password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordsMatch(false);
      notifyError("Passwords do not match");
      return;
    }

    try {
      const promise = dispatch(
        resetPassword({ token, password: newPassword, confirmPassword }),
      ).unwrap();
      await notifyPromise(promise, {
        pending: "Resetting password...",
        success: "Password reset successful!",
        error: (err) => err || "Failed to reset password",
      });

      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      // Error is already handled by notifyPromise, so we don't need to do anything here
      console.log("Password reset failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-bloom-charcoal px-4 py-12">
      <div className="blob blob-a absolute top-0 -left-16 w-80 h-80 bg-bloom-green/30" />
      <div className="blob blob-b absolute bottom-0 -right-16 w-96 h-96 bg-bloom-rose/20" />
      <div className="blob blob-c absolute top-1/2 left-1/2 w-56 h-56 bg-bloom-gold/10" />

      <div className="relative w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white">
        <div className="flex justify-center mb-8">
          <img src={logoimg} alt="Logo" className="h-20 w-auto" />
        </div>

        <div>
          <div className="mb-6">
            <label
              htmlFor="newPassword"
              className="block text-sm text-left font-medium text-gray-700 mb-2"
            >
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
                disabled={loading}
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
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-left font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-4 py-3 rounded-md border text-lg font-semibold border-gray-300 focus:outline-none focus:ring-2 ${
                  !passwordsMatch
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-[#468E36]"
                }`}
                placeholder="Confirm your password"
                disabled={loading}
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
              <p className="text-red-500 text-sm mt-1">
                Passwords do not match
              </p>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-[#468E36] hover:bg-[#2C5D22] text-white font-medium py-3 px-4 rounded-md transition duration-300"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/forgotPassword"
            className="text-md font-semibold text-[#A61A5A] hover:text-[#468E36]"
          >
            Back
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
