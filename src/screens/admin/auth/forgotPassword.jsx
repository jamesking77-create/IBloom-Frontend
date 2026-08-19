import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../store/slices/auth-slice";
import { validateEmail } from "../../../utils/validateEmail";
import logoimg from "../../../assets/b94e8c2c-c599-4ea6-8277-01d92a9a6290.png";
import { notifyError, notifyPromise } from "../../../utils/toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Email is required");
      notifyError("Please enter your email address");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      notifyError("Invalid email format");
      return;
    }

    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(forgotPassword(trimmedEmail));

      if (forgotPassword.fulfilled.match(resultAction)) {
        // navigate("/resetPassword");
      } else {
        notifyError(
          resultAction.payload || "Failed to send verification email",
        );
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      notifyError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };
  //   try {

  //     await notifyPromise(
  //       async () => {
  //         await new Promise(resolve => setTimeout(resolve, 1500));
  //         return { success: true };
  //       },
  //       'Sending verification email...',
  //       `Verification email sent to ${trimmedEmail}`,
  //       'Failed to send verification email'
  //     );

  //     navigate('/resetPassword');
  //   } catch (error) {
  //     console.error('Error sending verification email:', error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-bloom-charcoal px-4 py-12">
      <div className="blob blob-a absolute top-0 -left-16 w-80 h-80 bg-bloom-green/30" />
      <div className="blob blob-b absolute bottom-0 -right-16 w-96 h-96 bg-bloom-rose/20" />
      <div className="blob blob-c absolute top-1/2 left-1/2 w-56 h-56 bg-bloom-gold/10" />

      <div className="relative w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white">
        <div className="flex justify-center mb-8">
          <img src={logoimg} alt="Logo" className="h-20 w-auto" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm text-left font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-md border text-lg font-semibold border-gray-300 focus:outline-none focus:ring-2 ${
                emailError
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-[#468E36]"
              }`}
              placeholder="Enter your email"
            />
            {emailError && (
              <p className="mt-1 text-left text-sm text-red-600">
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#468E36] hover:bg-[#2C5D22] text-white font-medium py-3 px-4 rounded-md transition duration-300 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Sending..." : "Verify"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-md font-semibold text-[#A61A5A] hover:text-[#468E36]"
          >
            Back
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
