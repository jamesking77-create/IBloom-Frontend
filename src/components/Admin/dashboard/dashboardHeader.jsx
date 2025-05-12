import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  User, 
  Calendar, 
  ShoppingCart, 
  Mail, 
  Star, 
  LogOut,
  Layers
} from 'lucide-react';
import logoimg from "../../../assets/Screenshot 2025-05-09 144927.png"
const DashboardHeader = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  

  const logoUrl = "../../../assets/Screenshot 2025-05-09 144927.png";
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Sample notifications - replace with your actual data
  const notifications = [
    { id: 1, text: 'New booking request', time: '5 minutes ago', isUnread: true },
    { id: 2, text: 'Order #1234 completed', time: '1 hour ago', isUnread: true },
    { id: 3, text: 'New review received', time: '2 hours ago', isUnread: false },
  ];
  
  // Mobile menu items
  const mobileMenuItems = [
    { icon: <User size={18} />, label: 'Profile', link: '/dashboard/profile' },
    { icon: <Calendar size={18} />, label: 'Bookings', link: '/dashboard/bookings' },
    { icon: <ShoppingCart size={18} />, label: 'Orders', link: '/dashboard/orders' },
    { icon: <Mail size={18} />, label: 'Mailer', link: '/dashboard/mailer' },
    { icon: <Star size={18} />, label: 'Ratings', link: '/dashboard/ratings' },
    { icon: <Layers size={18} />, label: 'Categories', link: '/dashboard/categories' },
    { icon: <LogOut size={18} />, label: 'Logout', link: '/logout', isLogout: true }
  ];
  
  // This function should ideally be passed from parent component to keep logout consistent
  const handleLogout = () => {
    // This would typically display the same modal as in sidebar
    // For now we just log
    console.log('Logging out from header');
  };

  return (
    <header className="bg-white border border-gray-200 rounded-lg shadow-sm mx-2 mt-2">
      <div className="px-4 py-3 flex items-center justify-between">
   
        <div className="flex items-center">
          {/* Only show toggle button on mobile */}
          {/* {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="p-2 mr-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#468E36]"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )} */}
          
          <div className="h-10 w-auto">
            {/* Replace with your actual logo */}
            <img 
              src={logoimg} 
              alt="Dashboard Logo"
              className="h-full w-auto"
            />
          </div>
        </div>
        
        {/* Center section with search bar */}
        <div className={`hidden md:flex items-center flex-1 max-w-xl mx-4  `}>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="search"
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#468E36]"
              placeholder="Search..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>
        
        {/* Right section with notifications and profile */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          {isMobile && (
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          
          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications.some(n => n.isUnread) && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
            
            {/* Notification dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-2 px-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-4 px-4 text-sm text-center text-gray-500">No notifications</p>
                  ) : (
                    <div>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${notification.isUnread ? 'bg-blue-50' : ''}`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="py-2 px-4 border-t border-gray-200">
                  <a href="#" className="text-xs font-medium text-[#468E36] hover:text-[#2C5D22]">
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center focus:outline-none"
              aria-label="Profile"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-gray-200">
                {/* Replace with actual profile image */}
                <img 
                  src={logoimg}
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
            
            {/* Profile dropdown menu (desktop) */}
            {/* {isProfileOpen && !isMobile && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <a href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User size={16} className="mr-2" /> Profile
                  </a>
                  <a href="/dashboard/bookings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Calendar size={16} className="mr-2" /> Bookings
                  </a>
                  <a href="/dashboard/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <ShoppingCart size={16} className="mr-2" /> Orders
                  </a>
                  <a href="/dashboard/mailer" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Mail size={16} className="mr-2" /> Mailer
                  </a>
                  <a href="/dashboard/ratings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Star size={16} className="mr-2" /> Ratings
                  </a>
                  <a href="/dashboard/categories" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Layers size={16} className="mr-2" /> Categories
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </button>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
      
      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#468E36]"
            placeholder="Search..."
          />
        </div>
      </div>
      
      {isMobile && isMobileMenuOpen && (
        <div className="md:hidden px-2 pb-3 pt-2 border-t border-gray-200">
          {mobileMenuItems.map((item, index) => (
            <a
              key={index}
              href={item.link}
              onClick={(e) => {
                if (item.isLogout) {
                  e.preventDefault();
                  handleLogout();
                }
              }}
              className={`flex items-center px-4 py-3 mb-1 rounded-md hover:bg-gray-100 
                ${item.isLogout ? 'text-red-600' : 'text-gray-700'}`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;