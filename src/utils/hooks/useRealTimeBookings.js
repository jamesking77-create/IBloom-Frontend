import { useCallback } from 'react';
import useWebSocket from './useWebSocket';

const useRealtimeBookings = ({
  enabled = true,
  onNewBooking = null,
  onBookingStatusUpdate = null,
  onBookingDeleted = null,
  onConnected = null,
  onDisconnected = null,
  onError = null,
}) => {

  // Handle booking-specific messages
  const handleBookingsMessage = useCallback((message) => {
    console.log('📩 Bookings message received:', message.type, message.data);
    
    switch (message.type) {
      case 'new_booking':
        if (onNewBooking) onNewBooking(message);
        break;
        
      case 'booking_status_update':
        if (onBookingStatusUpdate) onBookingStatusUpdate(message);
        break;
        
      case 'booking_deleted':
        if (onBookingDeleted) onBookingDeleted(message);
        break;
    }
  }, [onNewBooking, onBookingStatusUpdate, onBookingDeleted]);

  return useWebSocket({
    enabled,
    modules: ['bookings'],
    onBookingsMessage: handleBookingsMessage,
    onConnected,
    onDisconnected,
    onError,
  });
};

export default useRealtimeBookings;
