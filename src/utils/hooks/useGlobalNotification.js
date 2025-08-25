import { useCallback, useState } from 'react';
import useWebSocket from './useWebSocket';

const useGlobalNotifications = ({
  enabled = true,
  onConnected = null,
  onDisconnected = null,
  onError = null,
}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({
    bookings: 0,
    orders: 0,
    quotes: 0,
    total: 0
  });

  // Handle all incoming messages from all modules
  const handleMessage = useCallback((message) => {
    console.log('🔔 Global notification received:', message.type, message.module);
    
    const notificationId = Date.now() + Math.random();
    let notificationData = null;

    // Process different message types
    switch (message.type) {
      // Bookings notifications
      case 'new_booking':
        notificationData = {
          id: notificationId,
          type: 'success',
          module: 'bookings',
          title: 'New Booking Request',
          message: `New booking from ${message.data?.customer?.name || 'Customer'}`,
          data: message.data,
          timestamp: new Date(),
          icon: '📅',
          priority: 'high',
          sound: true
        };
        break;

      case 'booking_status_update':
        notificationData = {
          id: notificationId,
          type: 'info',
          module: 'bookings',
          title: 'Booking Status Updated',
          message: `Booking #${message.data?.bookingId} status changed to ${message.data?.newStatus || message.data?.status}`,
          data: message.data,
          timestamp: new Date(),
          icon: '📋',
          priority: 'medium'
        };
        break;

      case 'booking_deleted':
        notificationData = {
          id: notificationId,
          type: 'warning',
          module: 'bookings',
          title: 'Booking Deleted',
          message: `Booking #${message.data?.bookingId} has been deleted`,
          data: message.data,
          timestamp: new Date(),
          icon: '🗑️',
          priority: 'low'
        };
        break;

      // Orders notifications
      case 'new_order':
        notificationData = {
          id: notificationId,
          type: 'success',
          module: 'orders',
          title: 'New Order Received',
          message: `New order from ${message.data?.customer?.name || 'Customer'} - ₦${message.data?.totalAmount?.toLocaleString() || '0'}`,
          data: message.data,
          timestamp: new Date(),
          icon: '🛒',
          priority: 'high',
          sound: true
        };
        break;

      case 'order_status_updated':
      case 'order_updated':
        notificationData = {
          id: notificationId,
          type: 'info',
          module: 'orders',
          title: 'Order Updated',
          message: `Order #${message.data?.orderId} has been updated`,
          data: message.data,
          timestamp: new Date(),
          icon: '📦',
          priority: 'medium'
        };
        break;

      case 'order_deleted':
        notificationData = {
          id: notificationId,
          type: 'warning',
          module: 'orders',
          title: 'Order Deleted',
          message: `Order #${message.data?.orderId} has been deleted`,
          data: message.data,
          timestamp: new Date(),
          icon: '🗑️',
          priority: 'low'
        };
        break;

      // Quotes notifications
      case 'new_quote':
        notificationData = {
          id: notificationId,
          type: 'success',
          module: 'quotes',
          title: 'New Quote Request',
          message: `Quote request from ${message.data?.customer?.name || 'Customer'} for ${message.data?.categoryName || 'service'}`,
          data: message.data,
          timestamp: new Date(),
          icon: '💰',
          priority: 'high',
          sound: true
        };
        break;

      case 'quote_status_updated':
        notificationData = {
          id: notificationId,
          type: 'info',
          module: 'quotes',
          title: 'Quote Status Updated',
          message: `Quote #${message.data?.quoteId} status changed to ${message.data?.newStatus || message.data?.status}`,
          data: message.data,
          timestamp: new Date(),
          icon: '📄',
          priority: 'medium'
        };
        break;

      case 'quote_response_created':
        notificationData = {
          id: notificationId,
          type: 'info',
          module: 'quotes',
          title: 'Quote Response Created',
          message: `Response created for Quote #${message.data?.quoteId}`,
          data: message.data,
          timestamp: new Date(),
          icon: '✍️',
          priority: 'medium'
        };
        break;

      case 'quote_deleted':
        notificationData = {
          id: notificationId,
          type: 'warning',
          module: 'quotes',
          title: 'Quote Deleted',
          message: `Quote #${message.data?.quoteId} has been deleted`,
          data: message.data,
          timestamp: new Date(),
          icon: '🗑️',
          priority: 'low'
        };
        break;

      default:
        console.log('Unknown message type for global notifications:', message.type);
        return;
    }

    if (notificationData) {
      // Add notification
      setNotifications(prev => [notificationData, ...prev.slice(0, 49)]); // Keep last 50
      
      // Update unread counts
      setUnreadCounts(prev => ({
        ...prev,
        [notificationData.module]: prev[notificationData.module] + 1,
        total: prev.total + 1
      }));

      // Play sound for high priority notifications
      if (notificationData.sound && notificationData.priority === 'high') {
        try {
          // You can replace this with a custom sound file
          const audio = new Audio('/notification-sound.mp3');
          audio.volume = 0.3;
          audio.play().catch(console.error);
        } catch (error) {
          console.log('Could not play notification sound:', error);
        }
      }

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(notificationData.title, {
            body: notificationData.message,
            icon: '/favicon.ico',
            tag: notificationData.module + '_' + notificationData.id,
            requireInteraction: notificationData.priority === 'high'
          });
        } catch (error) {
          console.log('Could not show browser notification:', error);
        }
      }
    }
  }, []);

  // WebSocket connection
  const {
    isConnected,
    connectionState,
    clientId,
    reconnectAttempts,
    subscribedModules,
    connect,
    disconnect,
    reconnect,
  } = useWebSocket({
    enabled,
    modules: ['bookings', 'orders', 'quotes'], // Subscribe to all modules
    onMessage: handleMessage,
    onConnected,
    onDisconnected,
    onError,
  });

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification) {
        setUnreadCounts(prevCounts => ({
          ...prevCounts,
          [notification.module]: Math.max(0, prevCounts[notification.module] - 1),
          total: Math.max(0, prevCounts.total - 1)
        }));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCounts({
      bookings: 0,
      orders: 0,
      quotes: 0,
      total: 0
    });
  }, []);

  // Clear notifications by module
  const clearModuleNotifications = useCallback((module) => {
    setNotifications(prev => {
      const moduleNotifications = prev.filter(n => n.module === module);
      const otherNotifications = prev.filter(n => n.module !== module);
      
      setUnreadCounts(prevCounts => ({
        ...prevCounts,
        [module]: 0,
        total: prevCounts.total - moduleNotifications.length
      }));
      
      return otherNotifications;
    });
  }, []);

  // Mark notification as read (without removing)
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    setUnreadCounts(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1)
    }));
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    // Connection state
    isConnected,
    connectionState,
    clientId,
    reconnectAttempts,
    subscribedModules,
    
    // Connection controls
    connect,
    disconnect,
    reconnect,
    
    // Notifications
    notifications,
    unreadCounts,
    
    // Notification controls
    clearNotification,
    clearAllNotifications,
    clearModuleNotifications,
    markAsRead,
    requestNotificationPermission
  };
};

export default useGlobalNotifications;