// utils/hooks/useRealTimeOrders.js
import { useCallback } from 'react';
import useWebSocket from './useWebSocket';


const useRealTimeOrders = ({
  enabled = true,
  onNewOrder = null,
  onOrderStatusUpdate = null,
  onOrderDeleted = null,
  onConnected = null,
  onDisconnected = null,
  onError = null,
}) => {
  
  // Handle order-specific messages
  const handleOrdersMessage = useCallback((message) => {
    console.log('📦 Orders message received:', message.type, message.data);
    
    switch (message.type) {
      case 'new_order':
        if (onNewOrder) onNewOrder(message);
        break;
        
      case 'order_status_updated':
      case 'order_updated':
        if (onOrderStatusUpdate) onOrderStatusUpdate(message);
        break;
        
      case 'order_deleted':
        if (onOrderDeleted) onOrderDeleted(message);
        break;
        
      default:
        console.log('❓ Unhandled order message type:', message.type);
    }
  }, [onNewOrder, onOrderStatusUpdate, onOrderDeleted]);

  return useWebSocket({
    enabled,
    modules: ['orders'],
    onOrdersMessage: handleOrdersMessage,
    onConnected,
    onDisconnected,
    onError,
  });
};

export default useRealTimeOrders;