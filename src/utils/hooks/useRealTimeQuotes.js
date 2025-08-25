import { useCallback } from 'react';
import useWebSocket from './useWebSocket';

const useRealTimeQuotes = ({
  enabled = true,
  onNewQuote = null,
  onQuoteStatusUpdate = null,
  onQuoteDeleted = null,
  onQuoteResponseCreated = null,
  onConnected = null,
  onDisconnected = null,
  onError = null,
}) => {

  // Handle quote-specific messages
  const handleQuotesMessage = useCallback((message) => {
    console.log('💰 Quotes message received:', message.type, message.data);
    
    switch (message.type) {
      case 'new_quote':
        if (onNewQuote) onNewQuote(message);
        break;
        
      case 'quote_status_updated':
        if (onQuoteStatusUpdate) onQuoteStatusUpdate(message);
        break;
        
      case 'quote_deleted':
        if (onQuoteDeleted) onQuoteDeleted(message);
        break;
        
      case 'quote_response_created':
        if (onQuoteResponseCreated) onQuoteResponseCreated(message);
        break;
    }
  }, [onNewQuote, onQuoteStatusUpdate, onQuoteDeleted, onQuoteResponseCreated]);

  return useWebSocket({
    enabled,
    modules: ['quotes'],
    onQuotesMessage: handleQuotesMessage,
    onConnected,
    onDisconnected,
    onError,
  });
};

export default useRealTimeQuotes;