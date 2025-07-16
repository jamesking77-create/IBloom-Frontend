import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import logoimg from "../../../assets/Screenshot 2025-05-09 144927.png";
import { logoutUser } from '../../../store/slices/auth-slice';
import { fetchProfile } from '../../../store/slices/profile-slice';
import { addNotification } from '../../../store/slices/notification-slice';
import { 
  toggleProfileDropdown, 
  toggleNotificationsDropdown, 
  closeAllDropdowns,
  toggleSidebar
} from '../../../store/slices/ui-slice';

const DashboardHeader = () => {
  const dispatch = useDispatch();
  
  // Get state from Redux
  const { userData } = useSelector((state) => state.profile);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { 
    isSidebarOpen, 
    isMobile, 
    isProfileOpen, 
    isNotificationsOpen 
  } = useSelector((state) => state.ui);
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  
  // Fetch profile data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        if (isProfileOpen) {
          dispatch(closeAllDropdowns());
        }
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        if (isNotificationsOpen) {
          dispatch(closeAllDropdowns());
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch, isProfileOpen, isNotificationsOpen]);
  
  // Using activity data from the profile for notifications
  // This would typically come from a dedicated notifications slice
  // but for this example we're using the profile data
  const joinDate = userData.joinDate || 'January 2023';
  
  // Create "fake" notifications based on specializations and categories
  // In a real app, you'd have a dedicated notifications system
  const generateNotifications = () => {
    let notifications = [];
    
    // Add a notification about join date
    notifications.push({
      id: 1,
      text: `Account created`,
      time: joinDate,
      isUnread: false
    });
    
    // Add notifications based on specializations
    if (userData.specialize && userData?.specialize?.length > 0) {
      userData?.specialize.forEach((specialization, index) => {
        notifications.push({
          id: index + 2,
          text: `Added ${specialization} specialization`,
          time: '2 days ago',
          isUnread: index === 0 // Mark first one as unread for demo
        });
      });
    }
    
    // Add notifications based on categories
    if (userData.categories && userData?.categories?.length > 0) {
      userData?.categories.forEach((category, index) => {
        notifications.push({
          id: index + userData.specialize.length + 2,
          text: `Added ${category.name} category`,
          time: '3 days ago',
          isUnread: false
        });
      });
    }
    
    return notifications;
  };
  
  const notifications = generateNotifications();
  
  const mobileMenuItems = [
    { icon: <User size={18} />, label: 'Profile', link: '/dashboard/profile' },
    { icon: <Calendar size={18} />, label: 'Bookings', link: '/dashboard/bookings' },
    { icon: <ShoppingCart size={18} />, label: 'Orders', link: '/dashboard/orders' },
    { icon: <Mail size={18} />, label: 'Mailer', link: '/dashboard/mailer' },
    { icon: <Star size={18} />, label: 'Ratings', link: '/dashboard/ratings' },
    { icon: <Layers size={18} />, label: 'Categories', link: '/dashboard/categories' },
    { icon: <LogOut size={18} />, label: 'Logout', link: '/logout', isLogout: true }
  ];
  
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  
  const handleToggleProfile = () => {
    dispatch(toggleProfileDropdown());
  };
  
  const handleToggleNotifications = () => {
    dispatch(toggleNotificationsDropdown());
  };
  
  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="bg-white border border-gray-200 rounded-lg shadow-sm mx-2 mt-2">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={handleToggleSidebar} 
              className="p-2 mr-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#468E36]"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          
          <div className="h-10 w-auto">
            <img 
              src={logoimg} 
              alt="Dashboard Logo"
              className="h-full w-auto"
            />
          </div>
        </div>
        
        {/* Center section with search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
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
        
        <div className="flex items-center space-x-4">
          {isMobile && (
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          
        
          <div ref={notificationRef} className="relative">
            <button
              onClick={handleToggleNotifications}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications.some(n => n.isUnread) && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-2 px-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Activity & Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-4 px-4 text-sm text-center text-gray-500">No activity to show</p>
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
                  <a href="/dashboard/profile" className="text-xs font-medium text-[#468E36] hover:text-[#2C5D22]">
                    View profile
                  </a>
                </div>
              </div>
            )}
          </div>
          
      
          <div ref={profileRef} className="relative">
            <button
              onClick={handleToggleProfile}
              className="flex items-center focus:outline-none"
              aria-label="Profile"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-gray-200">
              
                <img 
                  src={userData?.avatar || '/api/placeholder/150/150'}
                  alt={userData.name || 'Profile'} 
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{userData.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{userData.email || 'user@example.com'}</p>
                </div>
                <div className="py-1">
                  <a href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User size={16} className="mr-2" /> Profile
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      

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
      
      {/* Mobile menu */}
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