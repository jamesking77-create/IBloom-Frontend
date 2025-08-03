// src/hooks/useRealtimeBookings.js
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectToBookingUpdates,
  disconnectFromBookingUpdates,
  selectWsConnected,
  selectWsConnecting,
  selectRealtimeUpdatesEnabled,
  selectNewBookingNotification,
  selectHasUnreadBookings,
  selectUnreadBookingsCount,
  clearNewBookingNotification,
  markBookingAsRead,
  markAllBookingsAsRead,
} from '../store/slices/booking-slice';

/**
 * Custom hook for managing real-time booking updates via WebSocket
 * Use this in your admin components to automatically connect to booking updates
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoConnect - Whether to auto-connect on mount (default: true)
 * @param {boolean} options.autoDisconnect - Whether to auto-disconnect on unmount (default: true)
 * @param {function} options.onNewBooking - Callback when new booking is received
 * @param {function} options.onConnect - Callback when WebSocket connects
 * @param {function} options.onDisconnect - Callback when WebSocket disconnects
 * @param {function} options.onError - Callback when WebSocket error occurs
 * 
 * @returns {Object} Hook return object
 */
export const useRealtimeBookings = (options = {}) => {
  const {
    autoConnect = true,
    autoDisconnect = true,
    onNewBooking,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const dispatch = useDispatch();
  
  // WebSocket connection state
  const isConnected = useSelector(selectWsConnected);
  const isConnecting = useSelector(selectWsConnecting);
  const realtimeEnabled = useSelector(selectRealtimeUpdatesEnabled);
  
  // Notification state
  const newBookingNotification = useSelector(selectNewBookingNotification);
  const hasUnreadBookings = useSelector(selectHasUnreadBookings);
  const unreadCount = useSelector(selectUnreadBookingsCount);

  // Connect to WebSocket
  const connect = useCallback(() => {
    console.log('🔌 Connecting to real-time booking updates...');
    dispatch(connectToBookingUpdates());
  }, [dispatch]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from real-time booking updates...');
    dispatch(disconnectFromBookingUpdates());
  }, [dispatch]);

  // Clear new booking notification
  const clearNotification = useCallback(() => {
    dispatch(clearNewBookingNotification());
  }, [dispatch]);

  // Mark specific booking as read
  const markAsRead = useCallback((bookingId) => {
    dispatch(markBookingAsRead(bookingId));
  }, [dispatch]);

  // Mark all bookings as read
  const markAllAsRead = useCallback(() => {
    dispatch(markAllBookingsAsRead());
  }, [dispatch]);

  // Show browser notification for new bookings
  const showBrowserNotification = useCallback((booking) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const customerName = booking.customer?.personalInfo?.name || 
                          booking.customerName || 
                          'Unknown Customer';
      
      const eventType = booking.customer?.eventDetails?.eventType || 
                       booking.eventType || 
                       'Event';

      new Notification('New Booking Received! 🎉', {
        body: `${customerName} has booked a ${eventType}`,
        icon: '/favicon.ico', // Adjust path as needed
        badge: '/favicon.ico',
        tag: 'new-booking',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Booking'
          }
        ]
      });
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('📢 Notification permission:', permission);
      return permission === 'granted';
    }
    return false;
  }, []);

  // Handle new booking notifications
  useEffect(() => {
    if (newBookingNotification && onNewBooking) {
      console.log('🆕 New booking notification received:', newBookingNotification);
      onNewBooking(newBookingNotification.booking);
      
      // Show browser notification
      showBrowserNotification(newBookingNotification.booking);
    }
  }, [newBookingNotification, onNewBooking, showBrowserNotification]);

  // Handle connection state changes
  useEffect(() => {
    if (isConnected && onConnect) {
      console.log('✅ WebSocket connected');
      onConnect();
    }
  }, [isConnected, onConnect]);

  useEffect(() => {
    if (!isConnected && !isConnecting && realtimeEnabled && onDisconnect) {
      console.log('❌ WebSocket disconnected');
      onDisconnect();
    }
  }, [isConnected, isConnecting, realtimeEnabled, onDisconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !isConnected && !isConnecting) {
      console.log('🚀 Auto-connecting to real-time booking updates...');
      connect();
      
      // Request notification permission
      requestNotificationPermission();
    }
  }, [autoConnect, isConnected, isConnecting, connect, requestNotificationPermission]);

  // Auto-disconnect on unmount
  useEffect(() => {
    return () => {
      if (autoDisconnect && isConnected) {
        console.log('🧹 Auto-disconnecting from real-time booking updates...');
        disconnect();
      }
    };
  }, [autoDisconnect, isConnected, disconnect]);

  // Return hook interface
  return {
    // Connection state
    isConnected,
    isConnecting,
    realtimeEnabled,
    
    // Notification state
    newBookingNotification,
    hasUnreadBookings,
    unreadCount,
    
    // Actions
    connect,
    disconnect,
    clearNotification,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
    
    // Connection status helpers
    canConnect: !isConnected && !isConnecting,
    canDisconnect: isConnected,
    connectionStatus: isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected',
  };
};

/**
 * Hook for simple real-time booking notifications
 * Simplified version that just shows toast notifications for new bookings
 */
export const useBookingNotifications = (showToast) => {
  const { newBookingNotification, clearNotification, markAsRead } = useRealtimeBookings({
    autoConnect: true,
    autoDisconnect: true,
    onNewBooking: (booking) => {
      if (showToast) {
        const customerName = booking.customer?.personalInfo?.name || 
                            booking.customerName || 
                            'Unknown Customer';
        
        const eventType = booking.customer?.eventDetails?.eventType || 
                         booking.eventType || 
                         'Event';

        showToast({
          type: 'success',
          title: 'New Booking Received! 🎉',
          message: `${customerName} has booked a ${eventType}`,
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              // You can add navigation logic here
              markAsRead(booking._id || booking.id);
              clearNotification();
            }
          }
        });
      }
    }
  });

  return {
    newBookingNotification,
    clearNotification,
    markAsRead,
  };
};

export default useRealtimeBookings;