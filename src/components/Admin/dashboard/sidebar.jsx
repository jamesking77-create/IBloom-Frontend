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


  const { userData, loading } = useSelector((state) => state.profile);

 
  useEffect(() => {
    if (!userData?.name) {
      dispatch(fetchProfile());
    }
  }, [dispatch, userData]);

 
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


  if (isMobile && !isOpen) {
    return null;
  }

  
  const defaultAvatar = "/api/placeholder/160/160"; 

  return (
    <div className="">

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60  z-20"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

   
      <aside
        className={`
          ${
            isMobile
              ? isOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          } 
          ${isMobile ? "fixed inset-y-0 left-0 z-30" : "relative"} 
          w-64 h-screen transition-transform duration-300 ease-in-out
          bg-white border-r border-gray-200 rounded-tr-lg rounded-br-lg shadow-sm
          flex flex-col
        `}
      >

        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <ChevronRight size={20} />
          </button>
        )}
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4 px-3">
          <div className="flex flex-col items-center px-4 mb-8">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#468E36] mb-2">
              <img
                src={userData?.avatar || defaultAvatar}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = logoimg; 
                }}
              />
            </div>
        
            <h2 className="font-medium text-gray-900">
              {loading ? "Loading..." : userData?.name || "User"}
            </h2>
            <p className="text-sm text-gray-500">Admin</p>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-[#468E36]/10 text-[#468E36] font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <span
                    className={`mr-3 ${
                      isActive ? "text-[#468E36]" : "text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {!isMobile && (
              <button
                onClick={showLogoutConfirmation}
                className="flex items-center w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-4"
              >
                <LogOut size={20} className="mr-3" />
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>


        {isMobile && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={showLogoutConfirmation}
              className="flex items-center w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {showLogoutModal && (
        <>
         
          <div
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center"
            onClick={closeLogoutModal}
          />

          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-80 max-w-sm">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirm Logout
                </h3>
                <button
                  onClick={closeLogoutModal}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-5">
                <p className="text-gray-700">
                  Are you sure you want to logout?
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeLogoutModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
