import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  ShoppingCart,
  Mail,
  Star,
  LogOut,
  ChevronRight,
  Layers,
  X,
  Home,
  Quote,
  ChevronLeft,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoimg from "../../../assets/Screenshot 2025-05-09 144927.png";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../store/slices/auth-slice";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../../../store/slices/profile-slice";

const Sidebar = ({ isOpen, isMobile, toggleSidebar }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { userData, loading } = useSelector((state) => state.profile);

  useEffect(() => {
    if (!userData?.name) {
      dispatch(fetchProfile());
    }
  }, [dispatch, userData]);

  // Handle smooth sidebar animations
  useEffect(() => {
    if (isMobile) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMobile]);

  const menuItems = [
    {
      icon: <Home size={20} />,
      label: "Home",
      path: "home",
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      path: "profile",
    },
    {
      icon: <Calendar size={20} />,
      label: "Bookings",
      path: "bookings",
    },
    {
      icon: <ShoppingCart size={20} />,
      label: "Orders",
      path: "orders",
    },
    {
      icon: <Mail size={20} />,
      label: "Mailer",
      path: "mailer",
    },
    {
      icon: <Layers size={20} />,
      label: "Categories",
      path: "categories",
    },
    {
      icon: <Quote size={20} />,
      label: "Quotes",
      path: "quotes",
    },
  ];

  const showLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  // Enhanced menu click handler with smooth close
  const handleMenuClick = (e) => {
    if (isMobile) {
      // Add a small delay to show the selection animation before closing
      setTimeout(() => {
        toggleSidebar();
      }, 150);
    }
  };

  // Handle overlay click with smooth close
  const handleOverlayClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const defaultAvatar = "/api/placeholder/160/160";

  // Don't render sidebar on mobile when closed and not animating
  if (isMobile && !isOpen && !isAnimating) {
    return null;
  }

  return (
    <>
      {/* Enhanced Mobile Overlay with smooth fade */}
      {isMobile && (
        <div
          className={`
            fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ease-in-out
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Enhanced Sidebar with improved animations */}
      <aside
        className={`
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-out ${
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-95'
              }`
            : `relative transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-16' : 'w-64'
              }`
          }
          h-screen bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-xl
          flex flex-col will-change-transform
        `}
        style={{ 
          width: isMobile ? '280px' : undefined,
          transform: isMobile && !isOpen ? 'translateX(-100%)' : undefined
        }}
      >
        {/* Enhanced Close Button for Mobile */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className={`
              absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 z-10
              transition-all duration-200 transform hover:scale-110 active:scale-95
              ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
            `}
            style={{
              transitionDelay: isOpen ? '150ms' : '0ms'
            }}
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}

        {/* Enhanced Collapse Button for Desktop */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft 
              size={16} 
              className={`text-gray-600 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
            />
          </button>
        )}

        {/* Sidebar Content with staggered animations */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Profile Section */}
          <div className={`
            px-4 py-6 border-b border-gray-200/50 transition-all duration-300
            ${isCollapsed && !isMobile ? 'px-2' : ''}
            ${isMobile && isOpen ? 'animate-slideInDown' : ''}
          `}>
            <div className={`
              flex flex-col items-center space-y-3 transition-all duration-300
              ${isCollapsed && !isMobile ? 'space-y-2' : ''}
            `}>
              <div className={`
                rounded-full overflow-hidden border-3 border-emerald-500/20 shadow-lg
                transition-all duration-300 transform hover:scale-105
                ${isCollapsed && !isMobile ? 'h-10 w-10' : 'h-16 w-16'}
              `}>
                <img
                  src={userData?.avatar || defaultAvatar}
                  alt="Profile"
                  className="h-full w-full object-cover transition-all duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = logoimg;
                  }}
                />
              </div>
              
              {(!isCollapsed || isMobile) && (
                <div className={`
                  text-center transition-all duration-300 transform
                  ${isCollapsed && !isMobile ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
                `}>
                  <h2 className="font-semibold text-gray-900 text-sm transition-all duration-200">
                    {loading ? "Loading..." : userData?.name || "User"}
                  </h2>
                  <p className="text-xs text-emerald-600 font-medium">Admin</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Navigation with staggered animations */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => {
              const isActive = location.pathname.includes(item.path);

              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={handleMenuClick}
                  className={`
                    group flex items-center px-3 py-3 rounded-xl 
                    transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                    ${isActive
                      ? "bg-emerald-500/10 text-emerald-700 shadow-sm scale-[1.02]"
                      : "text-gray-700 hover:bg-gray-100/70 hover:text-gray-900"
                    }
                    ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}
                    ${isMobile && isOpen ? `animate-slideInLeft` : ''}
                  `}
                  style={{
                    animationDelay: isMobile && isOpen ? `${index * 50}ms` : '0ms'
                  }}
                  title={isCollapsed && !isMobile ? item.label : ''}
                >
                  <span
                    className={`
                      flex-shrink-0 transition-all duration-300
                      ${isActive ? "text-emerald-600 scale-110" : "text-gray-500 group-hover:text-gray-700 group-hover:scale-110"}
                      ${isCollapsed && !isMobile ? '' : 'mr-3'}
                    `}
                  >
                    {item.icon}
                  </span>
                  
                  {(!isCollapsed || isMobile) && (
                    <span className={`
                      font-medium text-sm transition-all duration-300
                      ${isCollapsed && !isMobile ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
                    `}>
                      {item.label}
                    </span>
                  )}
                  
                  {isActive && (!isCollapsed || isMobile) && (
                    <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Enhanced Logout Section */}
          <div className={`
            p-3 border-t border-gray-200/50 transition-all duration-300
            ${isCollapsed && !isMobile ? 'px-2' : ''}
            ${isMobile && isOpen ? 'animate-slideInUp' : ''}
          `}>
            <button
              onClick={showLogoutConfirmation}
              className={`
                group flex items-center w-full px-3 py-3 text-red-600 rounded-xl 
                hover:bg-red-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}
              `}
              title={isCollapsed && !isMobile ? 'Logout' : ''}
            >
              <LogOut 
                size={20} 
                className={`
                  flex-shrink-0 transition-all duration-300 group-hover:scale-110
                  ${isCollapsed && !isMobile ? '' : 'mr-3'}
                `} 
              />
              {(!isCollapsed || isMobile) && (
                <span className={`
                  font-medium text-sm transition-all duration-300
                  ${isCollapsed && !isMobile ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
                `}>
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Enhanced Logout Modal with smooth animations */}
      {showLogoutModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={closeLogoutModal}
          />

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md mx-4 animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Logout
                </h3>
                <button
                  onClick={closeLogoutModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to logout? You'll need to sign in again to access your dashboard.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeLogoutModal}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add custom animations via CSS */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out forwards;
        }

        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;