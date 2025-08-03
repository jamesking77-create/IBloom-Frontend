// useRealtimeBooking.js - FIXED VERSION
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
  const [connectionState, setConnectionState] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // FIXED: Proper WebSocket URL construction
  const getWebSocketUrl = useCallback(() => {
    // Get base URL from environment
    const baseUrl = import.meta.env.VITE_SERVER_BASEURL;
    
    if (!baseUrl) {
      console.error('❌ VITE_SERVER_BASEURL not configured');
      throw new Error('WebSocket URL not configured');
    }

    console.log('🔗 Base URL from env:', baseUrl);

    let wsUrl;
    
    // FIXED: Better URL construction logic
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      // Local development - use ws://
      wsUrl = baseUrl.replace(/^https?:\/\//, 'ws://');
    } else {
      // Production - use wss:// (secure WebSocket)
      wsUrl = baseUrl.replace(/^https?:\/\//, 'wss://');
    }
    
    // Remove trailing slash and add WebSocket path
    wsUrl = wsUrl.replace(/\/$/, '') + '/websocket';
    
    console.log('🔗 Constructed WebSocket URL:', wsUrl);
    return wsUrl;
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
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        try {
          wsRef.current.close(1000, 'Component cleanup');
        } catch (error) {
          console.warn('⚠️ Error during cleanup:', error);
        }
      }
      wsRef.current = null;
    }
  }, []);

  // Send message to WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          clientTimestamp: new Date().toISOString()
        };
        wsRef.current.send(JSON.stringify(messageWithTimestamp));
        console.log('📤 WebSocket message sent:', message.type);
        return true;
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
        setConnectionError(error.message);
        return false;
      }
    } else {
      const state = wsRef.current ? wsRef.current.readyState : 'null';
      console.warn(`⚠️ WebSocket not connected (state: ${state}), cannot send message:`, message.type);
      return false;
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('📥 WebSocket message received:', message.type, message);
      
      setLastMessage(message);
      setConnectionError(null); // Clear any previous errors

      switch (message.type) {
        case 'connection_established':
          setClientId(message.clientId);
          setConnectionState('connected');
          setReconnectAttempts(0);
          console.log('✅ WebSocket connected with client ID:', message.clientId);
          
          // IMPORTANT: Wait a bit before sending identify message
          setTimeout(() => {
            // Identify client
            sendMessage({
              type: 'identify',
              clientType: clientType,
              userId: userId
            });
            
            // Subscribe to booking updates
            setTimeout(() => {
              sendMessage({
                type: 'subscribe_booking_updates'
              });
            }, 100);
          }, 100);
          
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
          setConnectionError(message.message);
          if (onError) onError(new Error(message.message));
          break;

        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
      setConnectionError('Failed to parse server message');
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
      } else {
        console.warn('⚠️ Heartbeat: WebSocket not open, clearing interval');
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      }
    }, 30000); // Ping every 30 seconds
  }, [sendMessage]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled) {
      console.log('🔇 WebSocket disabled');
      return;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('✅ WebSocket already connected/connecting');
      return;
    }

    console.log('🔌 Connecting to WebSocket...');
    setConnectionState('connecting');
    setConnectionError(null);

    try {
      const wsUrl = getWebSocketUrl();
      console.log('🔗 Attempting WebSocket connection to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
          console.error('❌ WebSocket connection timeout');
          wsRef.current.close();
          setConnectionState('error');
          setConnectionError('Connection timeout');
        }
      }, 10000); // 10 second timeout

      wsRef.current.onopen = (event) => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connection opened');
        setupHeartbeat();
        // Don't set connected state here - wait for connection_established message
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('📵 WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        setConnectionState('disconnected');
        setClientId(null);
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        if (onDisconnected) onDisconnected(event);

        // Auto-reconnect logic
        if (autoReconnect && event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
          console.log(`🔄 Attempting to reconnect in ${delay}ms... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          setConnectionState('error');
          setConnectionError('Max reconnection attempts reached');
        }
      };

      wsRef.current.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ WebSocket error:', error);
        setConnectionState('error');
        setConnectionError('WebSocket connection error');
        if (onError) onError(error);
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionState('error');
      setConnectionError(error.message);
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
    setConnectionError(null);
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
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        connect();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanup();
      };
    }

    return cleanup;
  }, [enabled]); // Only reconnect if enabled changes

  // Reset reconnect attempts when connection is successful
  useEffect(() => {
    if (connectionState === 'connected') {
      setReconnectAttempts(0);
      setConnectionError(null);
    }
  }, [connectionState]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 WebSocket Hook State:', {
      connectionState,
      clientId,
      reconnectAttempts,
      enabled,
      error: connectionError
    });
  }, [connectionState, clientId, reconnectAttempts, enabled, connectionError]);

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
    connectionError,
    
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
      enabled,
      error: connectionError,
      wsUrl: (() => {
        try {
          return getWebSocketUrl();
        } catch (e) {
          return 'Error constructing URL';
        }
      })()
    }
  };
};

export default useRealtimeBooking;