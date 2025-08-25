// components/GlobalNotificationDisplay.js - Updated position to avoid topnav overlap
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellOff, 
  Calendar, 
  Package, 
  DollarSign, 
  Trash2,
  MoreVertical,
  Check,
  CheckCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useGlobalNotificationContext } from './globalNotificationProvider';

const GlobalNotificationDisplay = () => {
  const {
    notifications,
    unreadCounts,
    isConnected,
    connectionState,
    clearNotification,
    clearAllNotifications,
    clearModuleNotifications,
    markAsRead,
    requestNotificationPermission
  } = useGlobalNotificationContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // Show badge when there are unread notifications
  useEffect(() => {
    setShowBadge(unreadCounts.total > 0);
  }, [unreadCounts.total]);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotifications(false);
    }, 10000); // Auto-hide after 10 seconds

    return () => clearTimeout(timer);
  }, [notifications]);

  const getModuleIcon = (module) => {
    switch (module) {
      case 'bookings': return <Calendar size={16} />;
      case 'orders': return <Package size={16} />;
      case 'quotes': return <DollarSign size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Button - Moved to avoid topnav overlap */}
      <div className="fixed top-20 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
              isConnected 
                ? 'bg-white hover:bg-gray-50 text-gray-700' 
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
          >
            {isConnected ? <Bell size={24} /> : <BellOff size={24} />}
          </button>
          
          {/* Connection Status Indicator */}
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          
          {/* Notification Badge */}
          {showBadge && unreadCounts.total > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium animate-pulse">
              {unreadCounts.total > 99 ? '99+' : unreadCounts.total}
            </div>
          )}
        </div>
      </div>

      {/* Notification Panel - Adjusted position */}
      {showNotifications && (
        <div className="fixed top-20 right-4 z-40 w-96 max-w-sm">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Wifi size={16} className="text-green-600" />
                      <span className="font-medium text-gray-900">Live Notifications</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={16} className="text-red-600" />
                      <span className="font-medium text-red-600">
                        {connectionState === 'connecting' ? 'Connecting...' : 'Offline'}
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* Unread Counts */}
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-green-600">
                  📅 {unreadCounts.bookings}
                </span>
                <span className="text-blue-600">
                  📦 {unreadCounts.orders}
                </span>
                <span className="text-purple-600">
                  💰 {unreadCounts.quotes}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                >
                  <CheckCheck size={12} />
                  Clear All
                </button>
                <button
                  onClick={requestNotificationPermission}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                >
                  <Bell size={12} />
                  Enable Browser Notifications
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 20).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getTypeColor(notification.type)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-1">
                            {getModuleIcon(notification.module)}
                            <span>{notification.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications for New Items */}
      <div className="fixed top-36 right-4 z-50 space-y-2">
        {notifications.slice(0, 3).map((notification) => (
          !notification.shown && notification.priority === 'high' && (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 ${getTypeColor(notification.type)} bg-white max-w-sm animate-slide-in`}
              onAnimationEnd={() => {
                // Mark as shown after animation
                notification.shown = true;
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span>{notification.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {notification.title}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => clearNotification(notification.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default GlobalNotificationDisplay;