import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  ShoppingCart, 
  Mail, 
  Star, 
  LogOut,
  ChevronRight,
  Layers,
  X
} from 'lucide-react';
import logoimg from "../../../assets/Screenshot 2025-05-09 144927.png"
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, isMobile, toggleSidebar }) => {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Menu items configuration
  const menuItems = [
    {
      icon: <User size={20} />,
      label: 'Profile',
      path: '/profile',
    },
    {
      icon: <Calendar size={20} />,
      label: 'Bookings',
      path: '/dashboard/bookings',
    },
    {
      icon: <ShoppingCart size={20} />,
      label: 'Orders',
      path: '/dashboard/orders',
    },
    {
      icon: <Mail size={20} />,
      label: 'Mailer',
      path: '/dashboard/mailer',
    },
    {
      icon: <Star size={20} />,
      label: 'Ratings',
      path: '/dashboard/ratings',
    },
    {
      icon: <Layers size={20} />,
      label: 'Categories',
      path: '/dashboard/categories',
    }
  ];

  // Show logout confirmation modal
  const showLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };
  
  // Handle logout
  const handleLogout = () => {
    // Implement your logout logic here
    console.log('Logging out');
    setShowLogoutModal(false);
  };
  
  // Close logout modal
  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  // If mobile and sidebar closed, don't render
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <div className=''>
      {/* Overlay for mobile - closes sidebar when clicking outside */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar - Always visible on web view using position relative instead of transform */}
      <aside 
        className={`
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'} 
          ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'} 
          w-64 h-screen transition-transform duration-300 ease-in-out
          bg-white border-r border-gray-200 rounded-tr-lg rounded-br-lg shadow-sm
          flex flex-col
        `}
      >
        {/* Mobile close button - top right corner */}
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
                src={logoimg} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="font-medium text-gray-900">John Doe</h2>
            <p className="text-sm text-gray-500">Administrator</p>
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
                    ${isActive 
                      ? 'bg-[#468E36]/10 text-[#468E36] font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className={`mr-3 ${isActive ? 'text-[#468E36]' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Logout button moved up to nav section in web view */}
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
        
        {/* Logout button at bottom only for mobile view */}
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <>
          {/* Modal Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
            onClick={closeLogoutModal}
          />
          
          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-80 max-w-sm">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
                <button 
                  onClick={closeLogoutModal}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-5">
                <p className="text-gray-700">Are you sure you want to logout?</p>
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