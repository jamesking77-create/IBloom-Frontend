import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Activity,  // Changed from Bell to Activity
  Search, 
  Menu, 
  X, 
  User, 
  Calendar, 
  ShoppingCart, 
  Mail, 
  Star, 
  LogOut,
  Layers,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Package,
  Bell
} from 'lucide-react';
import logoimg from "../../../assets/Screenshot 2025-05-09 144927.png";
import { logoutUser } from '../../../store/slices/auth-slice';
import { fetchProfile } from '../../../store/slices/profile-slice';
import { 
  fetchBookings, 
  selectBookings, 
  selectNewBookingNotifications,
  selectUnreadNotificationCount,
  markNotificationAsRead,
  clearNotifications 
} from '../../../store/slices/booking-slice';

// Import global notification context
import { useGlobalNotificationContext } from '../../../components/globalNotificationProvider';

const DashboardHeader = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const dispatch = useDispatch();
  
  const { userData } = useSelector((state) => state.profile);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const bookings = useSelector(selectBookings);
  const newBookingNotifications = useSelector(selectNewBookingNotifications);
  const unreadNotificationCount = useSelector(selectUnreadNotificationCount);
  
  // Get global notification context for clear all functionality
  const { clearAllNotifications: clearGlobalNotifications } = useGlobalNotificationContext();
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
      dispatch(fetchBookings());
    }
  }, [dispatch, isAuthenticated]);
  
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

  // Generate notifications from real booking data
  const generateBookingNotifications = () => {
    const notifications = [...newBookingNotifications];
    
    // Add recent bookings as notifications
    if (bookings && bookings.length > 0) {
      const recentBookings = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.createdAt || booking.bookingDate);
          const now = new Date();
          const hoursDiff = (now - bookingDate) / (1000 * 60 * 60);
          return hoursDiff <= 72; // Last 3 days
        })
        .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
        .slice(0, 5); // Show max 5 recent bookings

      recentBookings.forEach((booking, index) => {
        const bookingDate = new Date(booking.createdAt || booking.bookingDate);
        const now = new Date();
        const hoursDiff = Math.floor((now - bookingDate) / (1000 * 60 * 60));
        
        let timeText = '';
        if (hoursDiff < 1) {
          timeText = 'Just now';
        } else if (hoursDiff < 24) {
          timeText = `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`;
        } else {
          const daysDiff = Math.floor(hoursDiff / 24);
          timeText = `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`;
        }

        const customerName = booking.customer?.personalInfo?.name || booking.customerName || 'Unknown Customer';
        const eventType = booking.customer?.eventDetails?.eventType || booking.eventType || 'Event';
        const amount = booking.pricing?.formatted?.total || booking.amount || '₦0';

        notifications.push({
          id: `booking-${booking._id || booking.bookingId || index}`,
          type: 'booking',
          title: 'New Booking Request',
          text: `${customerName} requested ${eventType}`,
          subtext: `Amount: ${amount}`,
          time: timeText,
          isUnread: hoursDiff <= 2, // Mark as unread if within 2 hours
          status: booking.status,
          bookingId: booking._id || booking.bookingId || booking.id
        });
      });
    }

    // Add system notifications
    if (userData?.name) {
      notifications.unshift({
        id: 'welcome',
        type: 'system',
        title: 'Welcome Back!',
        text: `Hello ${userData.name}`,
        subtext: 'Ready to manage your bookings',
        time: 'Just now',
        isUnread: false,
        status: 'info'
      });
    }

    return notifications.slice(0, 10); // Show max 10 notifications
  };

  const allNotifications = generateBookingNotifications();
  const totalUnreadCount = unreadNotificationCount + allNotifications.filter(n => n.isUnread).length;
  
  const getNotificationIcon = (type, status) => {
    switch (type) {
      case 'booking':
        if (status === 'confirmed') return <CheckCircle size={16} className="text-green-500" />;
        if (status === 'cancelled') return <XCircle size={16} className="text-red-500" />;
        return <Calendar size={16} className="text-blue-500" />;
      case 'system':
        return <Bell size={16} className="text-emerald-500" />;
      case 'new_booking':
        return <Package size={16} className="text-purple-500" />;
      case 'status_update':
        return <Clock size={16} className="text-orange-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const handleMarkAsRead = (notificationId) => {
    if (notificationId.startsWith('notif_')) {
      dispatch(markNotificationAsRead(notificationId));
    }
  };

  const handleClearAll = () => {
    // Clear both local notifications and global notifications
    dispatch(clearNotifications());
    clearGlobalNotifications();
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
      <div className="px-3 sm:px-4 md:px-6 py-3 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 lg:hidden"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu size={20} className="text-gray-700" />
          </button>
          
          {/* Logo */}
          <div className="h-8 sm:h-10 w-auto">
            <img 
              src={logoimg} 
              alt="Dashboard Logo"
              className="h-full w-auto"
            />
          </div>
          
          {/* Desktop Title */}
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </div>
        
        {/* Center Section - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md lg:max-w-lg xl:max-w-xl mx-4 lg:mx-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={18} className={`transition-colors duration-200 ${
                isSearchFocused ? 'text-emerald-500' : 'text-gray-400'
              }`} />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Search bookings, orders, customers..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Mobile Search Button */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
            <Search size={20} className="text-gray-600" />
          </button>
          
          {/* Notifications - Changed icon and fixed positioning */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
              aria-label="Activity Monitor"
              title="Live Activity Monitor"
            >
              <Activity size={20} />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                  </span>
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping"></span>
                </span>
              )}
            </button>
            
            {/* FIXED NOTIFICATION DROPDOWN - Better positioning to prevent cutoff */}
            {isNotificationsOpen && (
              <>
                {/* Backdrop for mobile */}
                <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsNotificationsOpen(false)}></div>
                
                {/* Notification Panel - FIXED: Move dropdown more to the right */}
                <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden transform translate-x-8">
                  {/* Header */}
                  <div className="py-3 px-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900">Live Activity</h3>
                        {totalUnreadCount > 0 && (
                          <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                            {totalUnreadCount} new
                          </span>
                        )}
                      </div>
                      {allNotifications.length > 0 && (
                        <button 
                          onClick={handleClearAll}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {allNotifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <Activity size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-500 mb-1">No activity yet</p>
                        <p className="text-xs text-gray-400">You'll see booking updates and system alerts here</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {allNotifications.map(notification => (
                          <div 
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                              notification.isUnread ? 'bg-emerald-50/50' : ''
                            }`}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type, notification.status)}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                      {notification.title || notification.text}
                                    </p>
                                    {notification.subtext && (
                                      <p className="text-xs text-gray-600 mb-1">
                                        {notification.subtext}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      {notification.time}
                                    </p>
                                  </div>
                                  {notification.isUnread && (
                                    <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  {allNotifications.length > 0 && (
                    <div className="py-2 px-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                          View all activity
                        </button>
                        <span className="text-xs text-gray-500">
                          {allNotifications.length} total
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 sm:space-x-3 p-1.5 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
              aria-label="Profile menu"
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-emerald-200">
                <img 
                  src={userData?.avatar || '/api/placeholder/150/150'}
                  alt={userData?.name || 'Profile'} 
                  className="h-full w-full object-cover"
                />
              </div>
              {!isMobile && (
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              )}
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData?.email || 'user@example.com'}
                  </p>
                </div>
                
                <div className="py-2">
                  <a 
                    href="/dashboard/profile" 
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <User size={16} className="mr-3 text-gray-500" /> 
                    View Profile
                  </a>
                  <a 
                    href="/dashboard/settings" 
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Settings size={16} className="mr-3 text-gray-500" /> 
                    Settings
                  </a>
                  <hr className="my-2 border-gray-100" />
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={16} className="mr-3" /> 
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-3 sm:px-4 pb-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="Search..."
          />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;