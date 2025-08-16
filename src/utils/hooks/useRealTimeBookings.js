// utils/hooks/useRealTimeBookings.js - FIXED VERSION
import { useEffect, useRef, useState, useCallback } from 'react';

const useRealtimeBooking = ({
  enabled = true,
  clientType = 'admin',
  onNewBooking = null,
  onBookingStatusUpdate = null,
  onBookingDeleted = null,
  onConnected = null,
  onDisconnected = null,
  onError = null,
}) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [connectionError, setConnectionError] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;
  const HEARTBEAT_INTERVAL = 30000;

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const baseUrl = import.meta.env.VITE_SERVER_BASEURL || 'http://localhost:5000/';
    const wsUrl = baseUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/websocket';
    console.log('🔌 WebSocket URL:', wsUrl);
    return wsUrl;
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('📥 WebSocket message received:', message.type, message.module || 'no-module');

      switch (message.type) {
        case 'connection_established':
          console.log('✅ Connection established with server');
          setClientId(message.clientId);
          setIsConnected(true);
          setConnectionState('connected');
          setConnectionError(null);
          setReconnectAttempts(0);
          
          // Subscribe to bookings module
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'subscribe',
              module: 'bookings'
            }));
            console.log('📻 Subscribed to bookings module');
          }
          
          if (onConnected) onConnected();
          break;

        case 'subscription_confirmed':
          console.log(`📻 Subscription confirmed for module: ${message.module}`);
          break;

        case 'new_booking':
          console.log('🔔 New booking notification:', message.data);
          if (onNewBooking && message.module === 'bookings') {
            onNewBooking(message.data);
          }
          break;

        case 'booking_status_update':
          console.log('🔄 Booking status update:', message.data);
          if (onBookingStatusUpdate && message.module === 'bookings') {
            onBookingStatusUpdate(message.data);
          }
          break;

        case 'booking_deleted':
          console.log('🗑️ Booking deleted notification:', message.data);
          if (onBookingDeleted && message.module === 'bookings') {
            onBookingDeleted(message.data);
          }
          break;

        case 'identification_confirmed':
          console.log('👤 Client identification confirmed:', message.clientType);
          break;

        case 'pong':
          console.log('🏓 Pong received from server');
          break;

        case 'error':
          console.error('❌ Server error:', message.message);
          setConnectionError(message.message);
          if (onError) onError(new Error(message.message));
          break;

        case 'server_shutdown':
          console.warn('🛑 Server is shutting down');
          setConnectionError('Server is shutting down');
          break;

        default:
          console.log('❓ Unknown message type:', message.type, message);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
      if (onError) onError(error);
    }
  }, [onNewBooking, onBookingStatusUpdate, onBookingDeleted, onConnected, onError]);

  // Heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
          console.log('🏓 Ping sent to server');
        } catch (error) {
          console.error('❌ Error sending ping:', error);
        }
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled) {
      console.log('🚫 WebSocket disabled');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    try {
      console.log('🔌 Attempting to connect to WebSocket...');
      setConnectionState('connecting');
      setConnectionError(null);

      const wsUrl = getWebSocketUrl();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = (event) => {
        console.log('✅ WebSocket connection opened');
        setConnectionState('connected');
        
        // Send identification message
        wsRef.current.send(JSON.stringify({
          type: 'identify',
          clientType: clientType,
          timestamp: new Date().toISOString()
        }));
        
        startHeartbeat();
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('📵 WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionState('disconnected');
        stopHeartbeat();
        
        if (onDisconnected) onDisconnected();

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log(`🔄 Attempting to reconnect... (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          setReconnectAttempts(prev => prev + 1);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL * (reconnectAttempts + 1)); // Exponential backoff
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error('❌ Max reconnection attempts reached');
          setConnectionError('Failed to reconnect after multiple attempts');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket connection error:', error);
        setConnectionError('Connection failed');
        setConnectionState('error');
        if (onError) onError(error);
      };

    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setConnectionError(error.message);
      setConnectionState('error');
      if (onError) onError(error);
    }
  }, [enabled, clientType, handleMessage, reconnectAttempts, getWebSocketUrl, startHeartbeat, stopHeartbeat, onDisconnected, onError]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    console.log('📵 Disconnecting WebSocket...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
    setClientId(null);
    setReconnectAttempts(0);
  }, [stopHeartbeat]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect requested');
    setReconnectAttempts(0);
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Initialize connection
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]); // Only depend on enabled to avoid infinite reconnections

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionState,
    connectionError,
    clientId,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect,
  };
};

export default useRealtimeBooking;