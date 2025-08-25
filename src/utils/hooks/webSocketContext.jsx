// utils/context/WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [clientId, setClientId] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [subscribedModules, setSubscribedModules] = useState(new Set());

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const messageHandlersRef = useRef(new Map()); // Store message handlers
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const baseUrl = import.meta.env.VITE_SERVER_BASEURL || 'http://localhost:5000/';
    return baseUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/websocket';
  }, []);

  // Register message handler for a specific module
  const registerMessageHandler = useCallback((module, handler) => {
    console.log(`📝 Registering message handler for module: ${module}`);
    messageHandlersRef.current.set(module, handler);
    
    // Subscribe to the module if WebSocket is connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !subscribedModules.has(module)) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        module: module
      }));
    }
  }, [subscribedModules]);

  // Unregister message handler
  const unregisterMessageHandler = useCallback((module) => {
    console.log(`📝 Unregistering message handler for module: ${module}`);
    messageHandlersRef.current.delete(module);
    
    // Unsubscribe from the module if no handlers left
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && subscribedModules.has(module)) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        module: module
      }));
    }
  }, [subscribedModules]);

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
          setReconnectAttempts(0);
          
          // Subscribe to all modules that have handlers
          messageHandlersRef.current.forEach((handler, module) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'subscribe',
                module: module
              }));
            }
          });
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
          break;

        case 'server_shutdown':
          console.warn('🛑 Server is shutting down');
          break;

        // Handle module-specific messages
        case 'new_booking':
        case 'booking_status_update':
        case 'booking_deleted':
          if (message.module === 'bookings') {
            const handler = messageHandlersRef.current.get('bookings');
            if (handler) handler(message);
          }
          break;

        case 'new_order':
        case 'order_status_updated':
        case 'order_updated':
        case 'order_deleted':
          if (message.module === 'orders') {
            const handler = messageHandlersRef.current.get('orders');
            if (handler) handler(message);
          }
          break;

        case 'new_quote':
        case 'quote_status_updated':
        case 'quote_deleted':
        case 'quote_response_created':
          if (message.module === 'quotes') {
            const handler = messageHandlersRef.current.get('quotes');
            if (handler) handler(message);
          }
          break;

        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }, []);

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

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts < maxReconnectAttempts) {
          console.log(`🔄 Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          setReconnectAttempts(prev => prev + 1);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * (reconnectAttempts + 1));
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket connection error:', error);
        setConnectionState('error');
      };

    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setConnectionState('error');
    }
  }, [handleMessage, reconnectAttempts, getWebSocketUrl, startHeartbeat, stopHeartbeat]);

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

  // Initialize connection when handlers are registered
  useEffect(() => {
    if (messageHandlersRef.current.size > 0 && connectionState === 'disconnected') {
      connect();
    }
  }, [connect, connectionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value = {
    isConnected,
    connectionState,
    clientId,
    reconnectAttempts,
    subscribedModules: Array.from(subscribedModules),
    registerMessageHandler,
    unregisterMessageHandler,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};