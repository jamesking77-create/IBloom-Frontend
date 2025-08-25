// // utils/webSocketManager.js - UNIFIED WEBSOCKET MANAGER
// class WebSocketManager {
//   constructor() {
//     this.ws = null;
//     this.subscribers = new Map();
//     this.reconnectAttempts = 0;
//     this.maxReconnectAttempts = 5;
//     this.reconnectDelay = 3000;
//     this.heartbeatInterval = null;
//     this.connectionState = 'disconnected';
//     this.clientId = null;
//     this.subscribedModules = new Set();
//     this.pendingSubscriptions = new Set();
//   }

//   // Get WebSocket URL
//   getWebSocketUrl() {
//     const baseUrl = import.meta.env.VITE_SERVER_BASEURL || 'http://localhost:5000/';
//     return baseUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/websocket';
//   }

//   // Connect to WebSocket server
//   connect() {
//     if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
//       console.log('WebSocket already connected or connecting');
//       return;
//     }

//     try {
//       console.log('🔌 Connecting to WebSocket...');
//       this.connectionState = 'connecting';
//       this.notifySubscribers('connectionState', 'connecting');

//       const wsUrl = this.getWebSocketUrl();
//       this.ws = new WebSocket(wsUrl);

//       this.ws.onopen = this.handleOpen.bind(this);
//       this.ws.onmessage = this.handleMessage.bind(this);
//       this.ws.onclose = this.handleClose.bind(this);
//       this.ws.onerror = this.handleError.bind(this);

//     } catch (error) {
//       console.error('❌ WebSocket connection error:', error);
//       this.connectionState = 'error';
//       this.notifySubscribers('error', error);
//     }
//   }

//   // Handle WebSocket open
//   handleOpen() {
//     console.log('✅ WebSocket connected');
//     this.connectionState = 'connected';
//     this.reconnectAttempts = 0;
    
//     // Start heartbeat
//     this.startHeartbeat();
    
//     // Send identification
//     this.send({
//       type: 'identify',
//       clientType: 'admin',
//       timestamp: new Date().toISOString()
//     });

//     this.notifySubscribers('connected');
//   }

//   // Handle incoming messages
//   handleMessage(event) {
//     try {
//       const message = JSON.parse(event.data);
//       console.log('📥 WebSocket message received:', message.type, message.module || 'no-module');

//       switch (message.type) {
//         case 'connection_established':
//           this.clientId = message.clientId;
//           console.log('🆔 Client ID assigned:', this.clientId);
          
//           // Subscribe to all pending modules
//           this.subscribeToPendingModules();
//           break;

//         case 'subscription_confirmed':
//           console.log(`📻 Subscription confirmed for: ${message.module}`);
//           this.subscribedModules.add(message.module);
//           this.pendingSubscriptions.delete(message.module);
//           break;

//         case 'identification_confirmed':
//           console.log('👤 Client identified as:', message.clientType);
//           break;

//         case 'pong':
//           console.log('🏓 Heartbeat pong received');
//           break;

//         // Booking messages
//         case 'new_booking':
//           this.notifyModuleSubscribers('bookings', message);
//           break;

//         case 'booking_status_update':
//           this.notifyModuleSubscribers('bookings', message);
//           break;

//         case 'booking_deleted':
//           this.notifyModuleSubscribers('bookings', message);
//           break;

//         // Quote messages  
//         case 'new_quote':
//           this.notifyModuleSubscribers('quotes', message);
//           break;

//         case 'quote_status_updated':
//           this.notifyModuleSubscribers('quotes', message);
//           break;

//         case 'quote_deleted':
//           this.notifyModuleSubscribers('quotes', message);
//           break;

//         case 'quote_response_created':
//           this.notifyModuleSubscribers('quotes', message);
//           break;

//         // Order messages
//         case 'new_order':
//           this.notifyModuleSubscribers('orders', message);
//           break;

//         case 'order_status_updated':
//         case 'order_updated':
//           this.notifyModuleSubscribers('orders', message);
//           break;

//         case 'order_deleted':
//           this.notifyModuleSubscribers('orders', message);
//           break;

//         case 'error':
//           console.error('❌ Server error:', message.message);
//           this.notifySubscribers('error', new Error(message.message));
//           break;

//         case 'server_shutdown':
//           console.warn('🛑 Server shutting down');
//           break;

//         default:
//           console.log('❓ Unknown message type:', message.type);
//       }
//     } catch (error) {
//       console.error('❌ Error parsing WebSocket message:', error);
//     }
//   }

//   // Handle WebSocket close
//   handleClose(event) {
//     console.log('📵 WebSocket disconnected:', event.code, event.reason);
//     this.connectionState = 'disconnected';
//     this.clientId = null;
//     this.subscribedModules.clear();
    
//     this.stopHeartbeat();
//     this.notifySubscribers('disconnected');

//     // Auto-reconnect if not a clean disconnect
//     if (event.code !== 1000 && event.code !== 1001 && this.reconnectAttempts < this.maxReconnectAttempts) {
//       this.scheduleReconnect();
//     }
//   }

//   // Handle WebSocket error
//   handleError(error) {
//     console.error('❌ WebSocket error:', error);
//     this.notifySubscribers('error', error);
//   }

//   // Schedule reconnection
//   scheduleReconnect() {
//     this.reconnectAttempts++;
//     const delay = this.reconnectDelay * this.reconnectAttempts;
    
//     console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
//     setTimeout(() => {
//       if (this.connectionState !== 'connected') {
//         this.connect();
//       }
//     }, delay);
//   }

//   // Start heartbeat
//   startHeartbeat() {
//     this.stopHeartbeat(); // Clear any existing heartbeat
    
//     this.heartbeatInterval = setInterval(() => {
//       if (this.isConnected()) {
//         this.send({ type: 'ping', timestamp: new Date().toISOString() });
//       }
//     }, 30000);
//   }

//   // Stop heartbeat
//   stopHeartbeat() {
//     if (this.heartbeatInterval) {
//       clearInterval(this.heartbeatInterval);
//       this.heartbeatInterval = null;
//     }
//   }

//   // Send message to server
//   send(message) {
//     if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//       try {
//         this.ws.send(JSON.stringify(message));
//         console.log('📤 Message sent:', message.type);
//       } catch (error) {
//         console.error('❌ Failed to send message:', error);
//       }
//     } else {
//       console.warn('⚠️ Cannot send message - WebSocket not connected');
//     }
//   }

//   // Subscribe to a module
//   subscribeToModule(module) {
//     if (this.subscribedModules.has(module)) {
//       console.log(`Already subscribed to ${module}`);
//       return;
//     }

//     this.pendingSubscriptions.add(module);

//     if (this.isConnected() && this.clientId) {
//       this.send({
//         type: 'subscribe',
//         module: module
//       });
//     } else {
//       console.log(`Queuing subscription to ${module} - will subscribe when connected`);
//     }
//   }

//   // Subscribe to pending modules (called after connection is established)
//   subscribeToPendingModules() {
//     this.pendingSubscriptions.forEach(module => {
//       this.send({
//         type: 'subscribe',
//         module: module
//       });
//     });
//   }

//   // Unsubscribe from a module
//   unsubscribeFromModule(module) {
//     if (this.subscribedModules.has(module)) {
//       this.send({
//         type: 'unsubscribe',
//         module: module
//       });
//       this.subscribedModules.delete(module);
//       this.pendingSubscriptions.delete(module);
//     }
//   }

//   // Subscribe to WebSocket events
//   subscribe(subscriberId, callbacks) {
//     const subscriber = {
//       id: subscriberId,
//       callbacks,
//       modules: new Set()
//     };

//     this.subscribers.set(subscriberId, subscriber);

//     // Auto-connect if not connected
//     if (this.connectionState === 'disconnected') {
//       this.connect();
//     }

//     // Return unsubscribe function
//     return () => {
//       this.unsubscribe(subscriberId);
//     };
//   }

//   // Unsubscribe from WebSocket events
//   unsubscribe(subscriberId) {
//     const subscriber = this.subscribers.get(subscriberId);
//     if (subscriber) {
//       // Unsubscribe from modules this subscriber was using
//       subscriber.modules.forEach(module => {
//         // Check if any other subscribers are using this module
//         const otherSubscribersUsingModule = Array.from(this.subscribers.values())
//           .some(sub => sub.id !== subscriberId && sub.modules.has(module));
        
//         if (!otherSubscribersUsingModule) {
//           this.unsubscribeFromModule(module);
//         }
//       });

//       this.subscribers.delete(subscriberId);
//     }

//     // Disconnect if no subscribers
//     if (this.subscribers.size === 0) {
//       this.disconnect();
//     }
//   }

//   // Add module subscription for a subscriber
//   addModuleSubscription(subscriberId, module) {
//     const subscriber = this.subscribers.get(subscriberId);
//     if (subscriber) {
//       subscriber.modules.add(module);
//       this.subscribeToModule(module);
//     }
//   }

//   // Remove module subscription for a subscriber
//   removeModuleSubscription(subscriberId, module) {
//     const subscriber = this.subscribers.get(subscriberId);
//     if (subscriber) {
//       subscriber.modules.delete(module);
      
//       // Check if any other subscribers are using this module
//       const otherSubscribersUsingModule = Array.from(this.subscribers.values())
//         .some(sub => sub.id !== subscriberId && sub.modules.has(module));
      
//       if (!otherSubscribersUsingModule) {
//         this.unsubscribeFromModule(module);
//       }
//     }
//   }

//   // Notify all subscribers of general events
//   notifySubscribers(event, data = null) {
//     this.subscribers.forEach(subscriber => {
//       const callback = subscriber.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`];
//       if (callback) {
//         try {
//           callback(data);
//         } catch (error) {
//           console.error(`❌ Error in subscriber callback for ${event}:`, error);
//         }
//       }
//     });
//   }

//   // Notify subscribers interested in specific module messages
//   notifyModuleSubscribers(module, message) {
//     this.subscribers.forEach(subscriber => {
//       if (subscriber.modules.has(module)) {
//         const callbackName = `on${module.charAt(0).toUpperCase() + module.slice(1)}Message`;
//         const callback = subscriber.callbacks[callbackName];
        
//         if (callback) {
//           try {
//             callback(message);
//           } catch (error) {
//             console.error(`❌ Error in module subscriber callback for ${module}:`, error);
//           }
//         }
//       }
//     });
//   }

//   // Utility methods
//   isConnected() {
//     return this.ws && this.ws.readyState === WebSocket.OPEN;
//   }

//   getConnectionState() {
//     return this.connectionState;
//   }

//   getClientId() {
//     return this.clientId;
//   }

//   getSubscribedModules() {
//     return Array.from(this.subscribedModules);
//   }

//   // Manual reconnect
//   reconnect() {
//     console.log('🔄 Manual reconnect requested');
//     this.reconnectAttempts = 0;
//     this.disconnect();
//     setTimeout(() => this.connect(), 1000);
//   }

//   // Disconnect WebSocket
//   disconnect() {
//     console.log('📵 Disconnecting WebSocket...');
    
//     this.stopHeartbeat();
    
//     if (this.ws) {
//       this.ws.close(1000, 'Manual disconnect');
//       this.ws = null;
//     }
    
//     this.connectionState = 'disconnected';
//     this.clientId = null;
//     this.subscribedModules.clear();
//     this.pendingSubscriptions.clear();
//   }
// }

// // Create singleton instance
// const webSocketManager = new WebSocketManager();

// export default webSocketManager;