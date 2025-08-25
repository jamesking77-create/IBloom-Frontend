// utils/hooks/useWebSocket.js - UNIFIED WEBSOCKET HOOK FOR ALL MODULES
import { useEffect, useState, useRef, useCallback } from 'react';

const useWebSocket = ({
  enabled = true,
  modules = [], // Array of modules to subscribe to: ['bookings', 'orders', 'quotes']
  onMessage = null, // Generic message handler
  onConnected = null,
  onDisconnected = null,
  onError = null,
  // Module-specific handlers
  onBookingsMessage = null,
  onOrdersMessage = null,
  onQuotesMessage = null
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [clientId, setClientId] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [subscribedModules, setSubscribedModules] = useState(new Set());

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const baseUrl = import.meta.env.VITE_SERVER_BASEURL || 'http://localhost:5000/';
    return baseUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/websocket';
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('📥 WebSocket message received:', message.type, message.module || 'no-module');

      // Call generic message handler first
      if (onMessage) {
        onMessage(message);
      }

      switch (message.type) {
        case 'connection_established':
          console.log('✅ Connection established with server');
          setClientId(message.clientId);
          setIsConnected(true);
          setConnectionState('connected');
          setReconnectAttempts(0);
          
          // Subscribe to requested modules
          modules.forEach(module => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'subscribe',
                module: module
              }));
            }
          });
          
          if (onConnected) onConnected();
          break;

        case 'subscription_confirmed':
          console.log(`📻 Subscription confirmed for module: ${message.module}`);
          setSubscribedModules(prev => new Set(prev).add(message.module));
          break;

        case 'identification_confirmed':
          console.log('👤 Client identification confirmed');
          break;

        case 'pong':
          console.log('🏓 Pong received from server');
          break;

        case 'error':
          console.error('❌ Server error:', message.message);
          if (onError) onError(new Error(message.message));
          break;

        case 'server_shutdown':
          console.warn('🛑 Server is shutting down');
          break;

        // Bookings messages
        case 'new_booking':
        case 'booking_status_update':
        case 'booking_deleted':
          if (onBookingsMessage && message.module === 'bookings') {
            onBookingsMessage(message);
          }
          break;

        // Orders messages  
        case 'new_order':
        case 'order_status_updated':
        case 'order_updated':
        case 'order_deleted':
          if (onOrdersMessage && message.module === 'orders') {
            onOrdersMessage(message);
          }
          break;

        // Quotes messages
        case 'new_quote':
        case 'quote_status_updated':
        case 'quote_deleted':
        case 'quote_response_created':
          if (onQuotesMessage && message.module === 'quotes') {
            onQuotesMessage(message);
          }
          break;

        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
      if (onError) onError(error);
    }
  }, [onMessage, onConnected, onError, onBookingsMessage, onOrdersMessage, onQuotesMessage, modules]);

  // Heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('❌ Error sending ping:', error);
        }
      }
    }, 30000);
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

      const wsUrl = getWebSocketUrl();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connection opened');
        setConnectionState('connected');
        
        // Send identification message
        wsRef.current.send(JSON.stringify({
          type: 'identify',
          clientType: 'admin',
          timestamp: new Date().toISOString()
        }));
        
        startHeartbeat();
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('📵 WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionState('disconnected');
        setSubscribedModules(new Set());
        stopHeartbeat();
        
        if (onDisconnected) onDisconnected();

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts < maxReconnectAttempts) {
          console.log(`🔄 Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          setReconnectAttempts(prev => prev + 1);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * (reconnectAttempts + 1));
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          if (onError) onError(new Error('Failed to reconnect after multiple attempts'));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket connection error:', error);
        setConnectionState('error');
        if (onError) onError(error);
      };

    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setConnectionState('error');
      if (onError) onError(error);
    }
  }, [enabled, handleMessage, reconnectAttempts, getWebSocketUrl, startHeartbeat, stopHeartbeat, onDisconnected, onError]);

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
    setSubscribedModules(new Set());
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
    if (enabled && modules.length > 0) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, modules.length]); // Only depend on essential props

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionState,
    clientId,
    reconnectAttempts,
    subscribedModules: Array.from(subscribedModules),
    connect,
    disconnect,
    reconnect,
  };
};

export default useWebSocket;