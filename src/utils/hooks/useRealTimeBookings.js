// hooks/useRealTimeBookings.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  addBookingRealTime,
  updateBookingRealTime,
  updateBookingPaymentRealTime,
  showNotification,
  setRealTimeConnection,
} from '../../store/slices/booking-slice';

export const useRealTimeBookings = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let eventSource = null;

    const initializeEventSource = () => {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        eventSource = new EventSource('/api/bookings/events');
        
        eventSource.onopen = () => {
          console.log('✅ Real-time connection established');
          dispatch(setRealTimeConnection(true));
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📡 Real-time event received:', data.type);
            
            switch (data.type) {
              case 'NEW_BOOKING':
                dispatch(addBookingRealTime(data.booking));
                dispatch(showNotification({
                  type: 'success',
                  title: 'New Booking Received! 🎉',
                  message: `${data.booking.customer?.personalInfo?.name || 'Customer'} booked ${data.booking.customer?.eventDetails?.eventType || 'an event'}`,
                  bookingId: data.booking.bookingId,
                }));
                
                // Play notification sound if available
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('New Booking!', {
                    body: `New booking from ${data.booking.customer?.personalInfo?.name || 'Customer'}`,
                    icon: '/favicon.ico',
                  });
                }
                break;
                
              case 'BOOKING_UPDATED':
                dispatch(updateBookingRealTime(data.booking));
                dispatch(showNotification({
                  type: 'info',
                  title: 'Booking Updated',
                  message: `Booking ${data.booking.bookingId} status changed to ${data.booking.status}`,
                  bookingId: data.booking.bookingId,
                }));
                break;
                
              case 'PAYMENT_RECEIVED':
                dispatch(updateBookingPaymentRealTime({
                  bookingId: data.bookingId,
                  paymentStatus: data.paymentStatus,
                  amountPaid: data.amountPaid,
                }));
                dispatch(showNotification({
                  type: 'success',
                  title: 'Payment Received! 💰',
                  message: `Payment of ₦${data.amountPaid.toLocaleString()} received for booking ${data.bookingId}`,
                  bookingId: data.bookingId,
                }));
                break;
                
              default:
                console.log('Unknown event type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing real-time event:', error);
          }
        };
        
        eventSource.onerror = (error) => {
          console.error('❌ EventSource error:', error);
          dispatch(setRealTimeConnection(false));
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSource.readyState === EventSource.CLOSED) {
              console.log('🔄 Attempting to reconnect...');
              initializeEventSource();
            }
          }, 5000);
        };
      } else {
        console.warn('EventSource not supported in this browser');
      }
    };

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialize connection
    initializeEventSource();

    // Cleanup function
    return () => {
      if (eventSource) {
        console.log('🔌 Closing real-time connection');
        eventSource.close();
        dispatch(setRealTimeConnection(false));
      }
    };
  }, [dispatch]);
};

// Backend Server-Sent Events endpoint example (Node.js/Express)
/*
// /api/bookings/events - SSE endpoint for real-time updates
app.get('/api/bookings/events', (req, res) => {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection confirmation
  res.write('data: {"type": "CONNECTED", "message": "Real-time updates active"}\n\n');

  // Store client connection for broadcasting
  const clientId = Date.now();
  clients.set(clientId, res);

  // Handle client disconnect
  req.on('close', () => {
    clients.delete(clientId);
  });

  req.on('aborted', () => {
    clients.delete(clientId);
  });
});

// /api/bookings/notify - Endpoint to trigger notifications
app.post('/api/bookings/notify', (req, res) => {
  const { type, booking, bookingId, paymentStatus, amountPaid } = req.body;
  
  const eventData = {
    type,
    booking,
    bookingId,
    paymentStatus,
    amountPaid,
    timestamp: new Date().toISOString()
  };

  // Broadcast to all connected admin clients
  clients.forEach((client) => {
    try {
      client.write(`data: ${JSON.stringify(eventData)}\n\n`);
    } catch (error) {
      console.error('Error sending SSE message:', error);
    }
  });

  res.json({ success: true, messagesSent: clients.size });
});

// Example: After saving a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Save booking to database
    const savedBooking = await saveBookingToDatabase(bookingData);
    
    // Broadcast new booking to admin dashboard
    const eventData = {
      type: 'NEW_BOOKING',
      booking: savedBooking,
      timestamp: new Date().toISOString()
    };
    
    clients.forEach((client) => {
      try {
        client.write(`data: ${JSON.stringify(eventData)}\n\n`);
      } catch (error) {
        console.error('Error sending SSE message:', error);
      }
    });
    
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/