// userealtimebooking.js - React hook for WebSocket real-time booking notifications
import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

const useRealtimeBooking = (options = {}) => {
  const {
    enabled = true,
    clientType = 'user', // 'admin' or 'user'
    userId = null,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
    onNewBooking = null,
    onBookingStatusUpdate = null,
    onBookingDeleted = null,
    onConnected = null,
    onDisconnected = null,
    onError = null,
  } = options;

  const dispatch = useDispatch();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const [connectionState, setConnectionState] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState(null);
  const [clientId, setClientId] = useState(null);
 
  
  // Get WebSocket URL from environment or construct it
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || 
                 import.meta.env.VITE_SERVER_BASEURL?.replace(/^https?:\/\//, '').replace(/\/$/, '') ||
                 window.location.host;
    
    // Remove http/https prefix if present
    const cleanHost = host.replace(/^https?:\/\//, '');
    
    return `${protocol}//${cleanHost}/ws/bookings`;
  }, []);

  // Clean up function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (wsRef.current) {
      // Remove event listeners to prevent memory leaks
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Component cleanup');
      }
      wsRef.current = null;
    }
  }, []);

  // Send message to WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        console.log('📤 WebSocket message sent:', message.type);
        return true;
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message:', message.type);
      return false;
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('📥 WebSocket message received:', message.type, message);
      
      setLastMessage(message);

      switch (message.type) {
        case 'connection_established':
          setClientId(message.clientId);
          setConnectionState('connected');
          setReconnectAttempts(0);
          console.log('✅ WebSocket connected with client ID:', message.clientId);
          
          // Identify client and subscribe to booking updates
          sendMessage({
            type: 'identify',
            clientType: clientType,
            userId: userId
          });
          
          sendMessage({
            type: 'subscribe_booking_updates'
          });
          
          if (onConnected) onConnected(message);
          break;

        case 'identification_confirmed':
          console.log('👤 Client identified as:', message.clientType);
          break;

        case 'subscription_confirmed':
          console.log('📻 Subscribed to:', message.subscription);
          break;

        case 'new_booking':
          console.log('🔔 New booking notification:', message.data);
          if (onNewBooking) {
            onNewBooking(message.data);
          }
          break;

        case 'booking_status_update':
          console.log('🔄 Booking status update:', message.data);
          if (onBookingStatusUpdate) {
            onBookingStatusUpdate(message.data);
          }
          break;

        case 'booking_deleted':
          console.log('🗑️ Booking deleted:', message.data);
          if (onBookingDeleted) {
            onBookingDeleted(message.data);
          }
          break;

        case 'pong':
          console.log('🏓 Received pong from server');
          break;

        case 'server_shutdown':
          console.log('🛑 Server shutting down:', message.message);
          setConnectionState('disconnected');
          break;

        case 'error':
          console.error('❌ Server error:', message.message);
          if (onError) onError(new Error(message.message));
          break;

        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
      if (onError) onError(error);
    }
  }, [clientType, userId, onNewBooking, onBookingStatusUpdate, onBookingDeleted, onConnected, onError, sendMessage]);

  // Setup heartbeat (ping/pong)
  const setupHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }, [sendMessage]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled) {
      console.log('🔇 WebSocket disabled');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket...');
    setConnectionState('connecting');

    try {
      const wsUrl = getWebSocketUrl();
      console.log('🔗 WebSocket URL:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = (event) => {
        console.log('✅ WebSocket connection opened');
        setupHeartbeat();
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('📵 WebSocket connection closed:', event.code, event.reason);
        setConnectionState('disconnected');
        setClientId(null);
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        if (onDisconnected) onDisconnected(event);

        // Auto-reconnect if enabled and not a clean close
        if (autoReconnect && event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          console.log(`🔄 Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectDelay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          setConnectionState('error');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionState('error');
        if (onError) onError(error);
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionState('error');
      if (onError) onError(error);
    }
  }, [
    enabled, 
    getWebSocketUrl, 
    handleMessage, 
    setupHeartbeat, 
    autoReconnect, 
    reconnectAttempts, 
    maxReconnectAttempts, 
    reconnectDelay, 
    onDisconnected, 
    onError
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('📵 Manually disconnecting WebSocket...');
    cleanup();
    setConnectionState('disconnected');
    setClientId(null);
    setReconnectAttempts(0);
  }, [cleanup]);

  // Manually trigger reconnection
  const reconnect = useCallback(() => {
    console.log('🔄 Manually reconnecting WebSocket...');
    disconnect();
    setTimeout(() => {
      setReconnectAttempts(0);
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Emit booking success (for user side)
  const emitBookingSuccess = useCallback((bookingData) => {
    console.log('🎉 Emitting booking success:', bookingData);
    return sendMessage({
      type: 'booking_completed',
      data: {
        bookingId: bookingData.bookingId || bookingData._id,
        clientType: 'user',
        timestamp: new Date().toISOString()
      }
    });
  }, [sendMessage]);

  // Effect to handle connection
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      cleanup();
    };
  }, [enabled]); // Only reconnect if enabled changes

  // Reset reconnect attempts when connection is successful
  useEffect(() => {
    if (connectionState === 'connected') {
      setReconnectAttempts(0);
    }
  }, [connectionState]);

  // Return hook interface
  return {
    // Connection state
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isDisconnected: connectionState === 'disconnected',
    hasError: connectionState === 'error',
    
    // Connection info
    clientId,
    reconnectAttempts,
    lastMessage,
    
    // Connection control
    connect,
    disconnect,
    reconnect,
    
    // Message functions
    sendMessage,
    emitBookingSuccess,
    
    // Connection stats
    stats: {
      connectionState,
      clientId,
      reconnectAttempts,
      maxReconnectAttempts,
      autoReconnect,
      enabled
    }
  };
};

export default useRealtimeBooking;