import { useState, useEffect } from "react";
import "./App.css";
import Login from "./screens/admin/auth/login";
import { Routes, Route, Navigate } from "react-router-dom";
import ForgotPassword from "./screens/admin/auth/forgotPassword";
import ResetPassword from "./screens/admin/auth/resetPassword";
import DashboardLayout from "./screens/admin/dashboard/dashboardLayout";
import Profile from "./screens/admin/dashboard/profile";
import { Provider } from "react-redux";
import store from "./store";
import { useSelector, useDispatch } from "react-redux";
import DashboardHome from "./screens/admin/dashboard/dashboardHome";
import Bookings from "./screens/admin/dashboard/bookings";
import OrdersManagement from "./screens/admin/dashboard/orderManagement";
import MailerScreen from "./screens/admin/dashboard/mailer";
import CategoriesScreen from "./screens/admin/dashboard/categoriesScreen";
import UserLayout from "./screens/users/userLayout";
import HomePage from "./screens/users/homepage";
import { QuotesList } from "./screens/admin/dashboard/quotesList";
import CategoriesPage from "./screens/users/categoriesPage";
import EventBookingPage from "./screens/users/eventBookingPage";
import AboutPage from "./components/users/aboutUsPage";
import GalleryPage from "./components/users/galleryPage";
import ContactPage from "./components/users/contactPage";
import FaqPage from "./components/users/faqPage";
import OrderProcessPage from "./screens/users/orderProcessPage";
import WarehouseInfoPage from "./screens/users/warehouseInfoPage";
import SmartCategoriesScreen from "./screens/users/smartCategoryScreen";
import QuoteCategoriesScreen from "./screens/users/quoteCategoriesScreen";
import QuoteCategoryItemsScreen from "./screens/users/quoteCategoryItemsScreen";
import QuoteSuccessScreen from "./screens/users/quoteSuccessScreen";
import CustomerInfoForm from "./components/users/customerInfoForm";
import { get } from "./utils/api";
import { WebSocketProvider } from './utils/hooks/webSocketContext';

const useKeepAlive = () => {
  useEffect(() => {
    const keepAlive = async () => {
      try {
        console.log("🏓 Sending keep-alive ping...");
        const response = await get("/api/keep-alive");
        console.log("✅ Keep-alive response:", response.data.message);
        console.log(
          "📊 Server uptime:",
          Math.floor(response.data.uptime / 60),
          "minutes"
        );
        console.log("🕐 Timestamp:", response.data.timestamp);
      } catch (error) {
        console.error("❌ Keep-alive ping failed:", error.message);
      }
    };

    // Send initial ping immediately when app loads
    keepAlive();

    // Set up interval to ping every 5 minutes (300,000 milliseconds)
    const interval = setInterval(keepAlive, 5 * 60 * 1000);

    console.log("🎯 Keep-alive system initialized - pinging every 5 minutes");

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
      console.log("🛑 Keep-alive interval cleared");
    };
  }, []);
};

// Inactivity Modal Component
const InactivityModal = ({ isOpen, countdown, onStayLoggedIn, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Session Timeout Warning
          </h3>
          <p className="text-gray-600 mb-4">
            You have been inactive for a while. You will be logged out in:
          </p>
          <div className="text-3xl font-bold text-red-500 mb-6">
            {Math.floor(countdown / 60)}:
            {(countdown % 60).toString().padStart(2, "0")}
          </div>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={onStayLoggedIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Stay Logged In
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Private Route Component
const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        // Check if we have basic auth data
        if (!isAuthenticated || !token) {
          setIsValid(false);
          setIsValidating(false);
          return;
        }

        // Validate token with backend
        const response = await fetch("/api/auth/validate", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          // Update user data if needed
          if (!user || user.id !== userData.id) {
            dispatch({ type: "AUTH_UPDATE_USER", payload: userData });
          }
          setIsValid(true);
        } else {
          // Token is invalid, clear auth state
          dispatch({ type: "AUTH_LOGOUT" });
          setIsValid(false);
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        // On network error, if we have a token, assume valid for offline use
        // But in production, you might want to be more strict
        setIsValid(isAuthenticated && token);
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, [isAuthenticated, token, user, dispatch]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isValid ? children : <Navigate to="/login" replace />;
};

// Inactivity Tracker Hook - Only for Dashboard
const useInactivityTracker = (isDashboard = false) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown

  const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000; // 2 minutes warning in milliseconds

  useEffect(() => {
    // Only run inactivity tracker for dashboard and when authenticated
    if (!isAuthenticated || !isDashboard) return;

    let inactivityTimer;
    let warningTimer;
    let countdownTimer;

    const resetTimers = () => {
      // Clear existing timers
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);

      // Hide modal if it's showing
      setShowModal(false);

      // Set new timers
      inactivityTimer = setTimeout(() => {
        // Force logout after total inactivity time + warning time
        dispatch({ type: "AUTH_LOGOUT" });
        setShowModal(false);
      }, INACTIVITY_TIME + WARNING_TIME);

      warningTimer = setTimeout(() => {
        // Show warning modal
        setShowModal(true);
        setCountdown(120); // Reset countdown to 2 minutes

        // Start countdown
        countdownTimer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              dispatch({ type: "AUTH_LOGOUT" });
              setShowModal(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_TIME);
    };

    const handleActivity = () => {
      resetTimers();
    };

    const handleStayLoggedIn = () => {
      setShowModal(false);
      if (countdownTimer) clearInterval(countdownTimer);
      resetTimers();
    };

    const handleLogout = () => {
      dispatch({ type: "AUTH_LOGOUT" });
      setShowModal(false);
    };

    // Activity events to track
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timers
    resetTimers();

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [isAuthenticated, isDashboard, dispatch]);

  const handleStayLoggedIn = () => {
    setShowModal(false);
    setCountdown(120);
  };

  const handleLogout = () => {
    dispatch({ type: "AUTH_LOGOUT" });
    setShowModal(false);
  };

  return {
    showModal,
    countdown,
    handleStayLoggedIn,
    handleLogout,
  };
};

// Dashboard Wrapper Component with Inactivity Tracking
const DashboardWrapper = ({ children }) => {
  const inactivity = useInactivityTracker(true); // Enable inactivity tracking for dashboard

  return (
    <>
      {children}
      {/* Inactivity Modal - Only shows for dashboard */}
      <InactivityModal
        isOpen={inactivity.showModal}
        countdown={inactivity.countdown}
        onStayLoggedIn={inactivity.handleStayLoggedIn}
        onLogout={inactivity.handleLogout}
      />
    </>
  );
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
      <WebSocketProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/resetPassword/:token" element={<ResetPassword />} />

          {/* Admin Dashboard Routes - WITH Enhanced Security and Inactivity Tracking */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardWrapper>
                  <DashboardLayout />
                </DashboardWrapper>
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="home" element={<DashboardHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="mailer" element={<MailerScreen />} />
            <Route path="categories" element={<CategoriesScreen />} />
            <Route path="quotes" element={<QuotesList />} />
          </Route>

          {/* User/Public Routes - NO Authentication Required */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="category/:categoryId" element={<CategoriesPage />} />
            <Route path="eventbooking" element={<EventBookingPage />} />
            <Route path="warehouseinfo" element={<WarehouseInfoPage />} />
            <Route path="orderprocess" element={<OrderProcessPage />} />
            <Route path="smartcategory" element={<SmartCategoriesScreen />} />

            {/* Quote System Routes - More Specific Paths */}
            <Route path="request-quote" element={<QuoteCategoriesScreen />} />
            <Route
              path="request-quote/category/:categoryId"
              element={<QuoteCategoryItemsScreen />}
            />
            <Route
              path="quote-submission-success"
              element={<QuoteSuccessScreen />}
            />
            <Route path="quote-customer-info" element={<CustomerInfoForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WebSocketProvider>
    </>
  );
}

export default AppWrapper;
