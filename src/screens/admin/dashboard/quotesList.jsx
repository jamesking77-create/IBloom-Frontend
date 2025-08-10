import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Eye, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  RefreshCw, 
  Edit, 
  Package, 
  Clock, 
  MapPin,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Tag,
  Hash,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  Reply,
  Trash2,
  MoreVertical,
  Bell,
  Loader2,
  Menu,
  X,
  ArrowLeft,
  Send,
  DollarSign,
  Save
} from 'lucide-react';

import { QuoteDetails } from '../../../components/quotes/quoteDetails';


// Redux imports
import { 
  fetchQuotes, 
  updateQuoteStatus, 
  markQuoteAsViewed,
  deleteQuote,
  createQuoteResponse,
  updateQuoteResponse,
  sendQuoteResponse,
  addCommunication,
  setFilters,
  clearFilters,
  setWebSocketConnected,
  setWebSocketError,
  handleNewQuoteNotification,
  handleQuoteStatusUpdate,
  handleQuoteDeletion,
  selectQuotes,
  selectQuotesLoading,
  selectQuotesError,
  selectQuotesUpdating,
  selectQuotesDeleting,
  selectQuotesResponding,
  selectQuotesSending,
  selectQuotesFilters,
  selectFilteredQuotes,
  selectQuotesSummary,
  selectWebSocketConnected,
  selectWebSocketError
} from '../../../store/slices/quote-slice';

export const QuotesList = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const quotes = useSelector(selectFilteredQuotes);
  const allQuotes = useSelector(selectQuotes);
  const loading = useSelector(selectQuotesLoading);
  const error = useSelector(selectQuotesError);
  const updating = useSelector(selectQuotesUpdating);
  const deleting = useSelector(selectQuotesDeleting);
  const responding = useSelector(selectQuotesResponding);
  const sending = useSelector(selectQuotesSending);
  const filters = useSelector(selectQuotesFilters);
  const summary = useSelector(selectQuotesSummary);
  const wsConnected = useSelector(selectWebSocketConnected);
  const wsError = useSelector(selectWebSocketError);
  
  // Local state
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseQuote, setResponseQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [editingResponse, setEditingResponse] = useState({});
  const [viewMode, setViewMode] = useState('cards');
  const [expandedQuote, setExpandedQuote] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // WebSocket connection
  const [ws, setWs] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsHost = import.meta.env.VITE_WS_HOST || 'localhost:5000';
        const wsUrl = `ws://${wsHost}/websocket`;
        
        console.log('🔌 Connecting to Quote WebSocket:', wsUrl);
        
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          console.log('✅ Quote WebSocket connected');
          dispatch(setWebSocketConnected(true));
          
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          if (token) {
            socket.send(JSON.stringify({
              type: 'authenticate',
              token: token,
              module: 'quotes'
            }));
          }
        };
        
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('📥 WebSocket message:', message);
            
            if (message.module === 'quotes' || message.type?.startsWith('quote_')) {
              switch (message.type) {
                case 'quote_created':
                case 'new_quote':
                  console.log('🆕 New quote received:', message.data);
                  dispatch(handleNewQuoteNotification(message.data));
                  addNotification({
                    type: 'new_quote',
                    title: 'New Quote Request',
                    message: `${message.data.customer?.name || 'Customer'} requested a quote for ${message.data.categoryName}`,
                    timestamp: new Date(),
                    data: message.data
                  });
                  dispatch(fetchQuotes(filters));
                  break;
                  
                case 'quote_status_updated':
                  console.log('🔄 Quote status updated:', message.data);
                  dispatch(handleQuoteStatusUpdate(message.data));
                  break;
                  
                case 'quote_deleted':
                  console.log('🗑️ Quote deleted:', message.data);
                  dispatch(handleQuoteDeletion(message.data.quoteId));
                  break;
                  
                case 'quote_response_created':
                  console.log('📝 Quote response created:', message.data);
                  dispatch(fetchQuotes(filters));
                  break;
                  
                case 'authentication_success':
                  console.log('✅ WebSocket authenticated for quotes');
                  break;
              }
            }
          } catch (err) {
            console.error('❌ Error parsing WebSocket message:', err);
          }
        };
        
        socket.onclose = (event) => {
          console.log('📵 WebSocket disconnected:', event.code, event.reason);
          dispatch(setWebSocketConnected(false));
          
          if (event.code !== 1000) {
            setTimeout(() => {
              console.log('🔄 Attempting to reconnect WebSocket...');
              connectWebSocket();
            }, 3000);
          }
        };
        
        socket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          dispatch(setWebSocketError('WebSocket connection failed'));
        };
        
        setWs(socket);
        
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        dispatch(setWebSocketError('Failed to connect to real-time updates'));
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        console.log('🔌 Closing WebSocket connection');
        ws.close(1000, 'Component unmounting');
      }
    };
  }, []);

  // Add notification helper
  const addNotification = useCallback((notification) => {
    const notificationWithId = { ...notification, id: Date.now() };
    setNotifications(prev => [notificationWithId, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationWithId.id));
    }, 5000);
  }, []);

  // Fetch quotes on component mount and when filters change
  useEffect(() => {
    console.log('📊 Fetching quotes...');
    dispatch(fetchQuotes(filters));
  }, [dispatch, filters]);

  const handleViewQuote = async (quote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
    setShowMobileMenu(false);
    
    if (!quote.viewedByAdmin) {
      try {
        await dispatch(markQuoteAsViewed(quote.quoteId || quote._id)).unwrap();
      } catch (error) {
        console.error('Failed to mark quote as viewed:', error);
      }
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedQuote(null);
  };

  const handleCreateResponse = (quote) => {
    setResponseQuote(quote);
    setEditingResponse({
      message: '',
      items: quote.items?.map(item => ({
        ...item,
        unitPrice: item.unitPrice || 0,
        totalPrice: (item.unitPrice || 0) * (item.quantity || 1)
      })) || [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      deliveryFee: 0,
      setupFee: 0,
      finalTotal: 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      terms: 'Payment terms: 50% deposit required, balance due on delivery.'
    });
    setShowResponseModal(true);
    setShowActionMenu(null);
  };

  const handleSaveResponse = async () => {
    if (!responseQuote) return;
    
    try {
      // Calculate totals
      const itemsTotal = editingResponse.items?.reduce((sum, item) => 
        sum + ((item.unitPrice || 0) * (item.quantity || 1)), 0) || 0;
      
      const subtotal = itemsTotal;
      const discount = parseFloat(editingResponse.discount) || 0;
      const tax = parseFloat(editingResponse.tax) || 0;
      const deliveryFee = parseFloat(editingResponse.deliveryFee) || 0;
      const setupFee = parseFloat(editingResponse.setupFee) || 0;
      const finalTotal = subtotal - discount + tax + deliveryFee + setupFee;

      const responseData = {
        ...editingResponse,
        subtotal,
        finalTotal,
        items: editingResponse.items
      };

      if (responseQuote.response) {
        await dispatch(updateQuoteResponse({ 
          quoteId: responseQuote.quoteId || responseQuote._id, 
          responseData 
        })).unwrap();
      } else {
        await dispatch(createQuoteResponse({ 
          quoteId: responseQuote.quoteId || responseQuote._id, 
          responseData 
        })).unwrap();
      }

      setShowResponseModal(false);
      setResponseQuote(null);
      setEditingResponse({});
      
      // Refresh quotes to get updated data
      dispatch(fetchQuotes(filters));
      
      addNotification({
        type: 'success',
        title: 'Response Saved',
        message: 'Quote response has been saved successfully.',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to save response:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save quote response. Please try again.',
        timestamp: new Date()
      });
    }
  };

  const handleSendResponse = async (quote) => {
    try {
      await dispatch(sendQuoteResponse({ 
        quoteId: quote.quoteId || quote._id,
        sendOptions: {
          includeTerms: true,
          customMessage: '',
          generatePDF: true
        }
      })).unwrap();
      
      addNotification({
        type: 'success',
        title: 'Response Sent',
        message: `Quote response sent to ${quote.customer?.email || 'customer'}`,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to send response:', error);
      addNotification({
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send quote response. Please try again.',
        timestamp: new Date()
      });
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh requested');
    dispatch(fetchQuotes(filters));
  };

  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      await dispatch(updateQuoteStatus({ quoteId, status: newStatus })).unwrap();
      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Quote status changed to ${newStatus}`,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update status. Please try again.',
        timestamp: new Date()
      });
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      try {
        await dispatch(deleteQuote(quoteId)).unwrap();
        setShowActionMenu(null);
        setShowMobileMenu(false);
        
        addNotification({
          type: 'success',
          title: 'Quote Deleted',
          message: 'Quote has been deleted successfully.',
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Failed to delete quote:', error);
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete quote. Please try again.',
          timestamp: new Date()
        });
      }
    }
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setShowMobileFilters(false);
  };

  const toggleExpanded = (quoteId) => {
    setExpandedQuote(expandedQuote === quoteId ? null : quoteId);
  };

  const calculateResponseTotal = (items = [], discount = 0, tax = 0, deliveryFee = 0, setupFee = 0) => {
    const subtotal = items.reduce((sum, item) => 
      sum + ((item.unitPrice || 0) * (item.quantity || 1)), 0);
    return subtotal - discount + tax + deliveryFee + setupFee;
  };

  const StatusDropdown = ({ quote }) => {
    const statuses = ['pending', 'reviewed', 'responded', 'accepted', 'cancelled', 'expired'];
    const quoteId = quote.quoteId || quote._id;
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'reviewed': return 'bg-blue-100 text-blue-800';
        case 'responded': return 'bg-green-100 text-green-800';
        case 'accepted': return 'bg-emerald-100 text-emerald-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'expired': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status || 'pending')}`}>
          {quote.status || 'pending'}
        </span>
        <select
          value={quote.status || 'pending'}
          onChange={(e) => handleStatusChange(quoteId, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={updating}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const ActionMenu = ({ quote, isMobile = false }) => {
    const menuId = quote.quoteId || quote._id;
    const isOpen = showActionMenu === menuId;
    const hasResponse = !!quote.response;

    if (isMobile) {
      return (
        <div className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg mt-3">
          <button
            onClick={() => handleViewQuote(quote)}
            className="flex items-center text-sm text-gray-700 hover:text-emerald-600 transition-colors"
          >
            <Eye size={16} className="mr-2" />
            View Details
          </button>
          
          <button
            onClick={() => handleCreateResponse(quote)}
            className="flex items-center text-sm text-gray-700 hover:text-emerald-600 transition-colors"
            disabled={quote.status === 'cancelled'}
          >
            <Edit size={16} className="mr-2" />
            {hasResponse ? 'Edit Response' : 'Create Response'}
          </button>
          
          {hasResponse && (
            <button
              onClick={() => handleSendResponse(quote)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              disabled={sending}
            >
              <Send size={16} className="mr-2" />
              Send Response
            </button>
          )}
          
          <button
            onClick={() => handleDeleteQuote(quote.quoteId || quote._id)}
            className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
            disabled={deleting}
          >
            <Trash2 size={16} className="mr-2" />
            Delete Quote
          </button>
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={() => setShowActionMenu(isOpen ? null : menuId)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreVertical size={16} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
            <button
              onClick={() => handleViewQuote(quote)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <Eye size={14} className="mr-2" />
              View Details
            </button>
            
            <button
              onClick={() => handleCreateResponse(quote)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
              disabled={quote.status === 'cancelled'}
            >
              <Edit size={14} className="mr-2" />
              {hasResponse ? 'Edit Response' : 'Create Response'}
            </button>
            
            {hasResponse && (
              <button
                onClick={() => handleSendResponse(quote)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 flex items-center"
                disabled={sending}
              >
                <Send size={14} className="mr-2" />
                Send Response
              </button>
            )}
            
            <hr className="my-1" />
            
            <button
              onClick={() => handleDeleteQuote(quote.quoteId || quote._id)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center"
              disabled={deleting}
            >
              <Trash2 size={14} className="mr-2" />
              Delete Quote
            </button>
          </div>
        )}
      </div>
    );
  };

  const QuoteCard = ({ quote }) => {
    const isExpanded = expandedQuote === (quote.quoteId || quote._id);
    const hasResponse = !!quote.response;
    
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg ${
        !quote.viewedByAdmin ? 'ring-2 ring-emerald-200' : ''
      }`}>
        {/* Card Header */}
        <div className="p-3 md:p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                    #{quote.quoteId || 'N/A'}
                  </h3>
                  {!quote.viewedByAdmin && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-500 truncate">
                  {quote.customer?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-400 truncate md:hidden">
                  {quote.customer?.email || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Desktop Action Menu */}
            <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
              <StatusDropdown quote={quote} />
              <ActionMenu quote={quote} />
            </div>
          </div>
          
          {/* Mobile Status */}
          <div className="md:hidden mt-3">
            <StatusDropdown quote={quote} />
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3 md:p-4">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="hidden md:flex items-center text-sm text-gray-600">
              <Mail size={14} className="mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{quote.customer?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={14} className="mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{quote.customer?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Package size={14} className="mr-2 text-gray-400 flex-shrink-0" />
              <span>{quote.items?.length || 0} items</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-2 text-gray-400 flex-shrink-0" />
              <span>{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          {/* Category & Event Type */}
          {(quote.categoryName || quote.customer?.eventType) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
              {quote.categoryName && (
                <div className="flex items-center text-sm text-gray-600">
                  <Tag size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{quote.categoryName}</span>
                </div>
              )}
              {quote.customer?.eventType && (
                <div className="flex items-center text-sm text-gray-600">
                  <FileText size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{quote.customer.eventType}</span>
                </div>
              )}
            </div>
          )}

          {/* Response Status */}
          {hasResponse && (
            <div className="mb-3 md:mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-800">Response Created</span>
                </div>
                <span className="text-sm font-bold text-green-800">
                  ₦{quote.response.finalTotal?.toLocaleString() || '0'}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Valid until: {quote.response.validUntil ? 
                  new Date(quote.response.validUntil).toLocaleDateString() : 
                  'Not specified'
                }
              </p>
            </div>
          )}

          {/* Expandable Section */}
          {(quote.customer?.eventDate || quote.customer?.eventLocation || quote.customer?.specialRequests) && (
            <div className="mb-3 md:mb-4">
              <button
                onClick={() => toggleExpanded(quote.quoteId || quote._id)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors mb-2"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="ml-1">{isExpanded ? 'Less Details' : 'More Details'}</span>
              </button>

              {isExpanded && (
                <div className="space-y-2 md:space-y-3 p-3 bg-gray-50 rounded-lg">
                  {quote.customer?.eventDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                      <span>Event Date: {new Date(quote.customer.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {quote.customer?.eventLocation && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin size={14} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{quote.customer.eventLocation}</span>
                    </div>
                  )}
                  {quote.customer?.guestCount && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                      <span>Guests: {quote.customer.guestCount}</span>
                    </div>
                  )}
                  {quote.customer?.specialRequests && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MessageSquare size={14} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{quote.customer.specialRequests}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    {quote.customer?.preferredContact === 'email' && <Mail size={14} className="mr-2 text-gray-400" />}
                    {quote.customer?.preferredContact === 'phone' && <Phone size={14} className="mr-2 text-gray-400" />}
                    {quote.customer?.preferredContact === 'whatsapp' && <MessageSquare size={14} className="mr-2 text-gray-400" />}
                    <span>Prefers: {quote.customer?.preferredContact || 'phone'} contact</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock size={12} className="flex-shrink-0" />
              <span>
                {quote.updatedAt 
                  ? `Updated ${new Date(quote.updatedAt).toLocaleDateString()}`
                  : `Created ${quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}`
                }
              </span>
            </div>
            
            {/* Mobile Actions */}
            <div className="md:hidden">
              <ActionMenu quote={quote} isMobile={true} />
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {!hasResponse ? (
                <button
                  onClick={() => handleCreateResponse(quote)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                  disabled={quote.status === 'cancelled'}
                >
                  <Edit size={14} className="mr-1" />
                  Create Response
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCreateResponse(quote)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit Response
                  </button>
                  <button
                    onClick={() => handleSendResponse(quote)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    disabled={sending}
                  >
                    <Send size={14} className="mr-1" />
                    Send
                  </button>
                </div>
              )}
              
              <button
                onClick={() => handleViewQuote(quote)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Eye size={14} className="mr-1" />
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Quote Response Modal Component
  const QuoteResponseModalComponent = () => {
    if (!showResponseModal || !responseQuote) return null;

    const updateItemPrice = (index, field, value) => {
      const newItems = [...editingResponse.items];
      newItems[index] = { 
        ...newItems[index], 
        [field]: parseFloat(value) || 0 
      };
      
      if (field === 'unitPrice' || field === 'quantity') {
        newItems[index].totalPrice = (newItems[index].unitPrice || 0) * (newItems[index].quantity || 1);
      }
      
      setEditingResponse({ 
        ...editingResponse, 
        items: newItems,
        subtotal: newItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
      });
    };

    const total = calculateResponseTotal(
      editingResponse.items,
      editingResponse.discount,
      editingResponse.tax,
      editingResponse.deliveryFee,
      editingResponse.setupFee
    );

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {responseQuote.response ? 'Edit Quote Response' : 'Create Quote Response'}
              </h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Quote #{responseQuote.quoteId} - {responseQuote.customer?.name}
            </p>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Response Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Message
              </label>
              <textarea
                value={editingResponse.message || ''}
                onChange={(e) => setEditingResponse({ ...editingResponse, message: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Enter your response message to the customer..."
              />
            </div>

            {/* Items Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items & Pricing</h3>
              <div className="space-y-4">
                {editingResponse.items?.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name
                        </label>
                        <p className="text-sm text-gray-900">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => updateItemPrice(index, 'quantity', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price (₦)
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice || 0}
                          onChange={(e) => updateItemPrice(index, 'unitPrice', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        Total: ₦{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Costs */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Costs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (₦)
                  </label>
                  <input
                    type="number"
                    value={editingResponse.discount || 0}
                    onChange={(e) => setEditingResponse({ ...editingResponse, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax (₦)
                  </label>
                  <input
                    type="number"
                    value={editingResponse.tax || 0}
                    onChange={(e) => setEditingResponse({ ...editingResponse, tax: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Fee (₦)
                  </label>
                  <input
                    type="number"
                    value={editingResponse.deliveryFee || 0}
                    onChange={(e) => setEditingResponse({ ...editingResponse, deliveryFee: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setup Fee (₦)
                  </label>
                  <input
                    type="number"
                    value={editingResponse.setupFee || 0}
                    onChange={(e) => setEditingResponse({ ...editingResponse, setupFee: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Valid Until & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={editingResponse.validUntil || ''}
                  onChange={(e) => setEditingResponse({ ...editingResponse, validUntil: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                  <span className="text-lg font-bold text-gray-900">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={editingResponse.terms || ''}
                onChange={(e) => setEditingResponse({ ...editingResponse, terms: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Enter terms and conditions..."
              />
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowResponseModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={responding}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveResponse}
              disabled={responding}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {responding ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  Save Response
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If viewing details, show the QuoteDetails component
  if (showDetails && selectedQuote) {
    return (
      <QuoteDetails 
        quote={selectedQuote} 
        onClose={handleCloseDetails} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white border rounded-lg shadow-lg p-3 max-w-sm animate-slide-in ${
                notification.type === 'error' ? 'border-red-200' : 
                notification.type === 'success' ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start">
                <Bell className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
                  notification.type === 'error' ? 'text-red-500' : 
                  notification.type === 'success' ? 'text-green-500' : 'text-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{notification.title}</h4>
                  <p className="text-gray-600 text-xs mt-1 break-words">{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-gray-800">Quotes</h1>
            <div className="flex items-center space-x-1">
              {wsConnected ? (
                <div className="flex items-center text-green-600">
                  <Wifi size={14} />
                  <span className="ml-1 text-xs">Live</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff size={14} />
                  <span className="ml-1 text-xs">Offline</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20} />
            </button>
          </div>
        </div>
        
        {/* Mobile Stats Row */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Total: {summary.total}</span>
          <span>Pending: {summary.pending}</span>
          <span>Responded: {summary.responded}</span>
          <span>Unviewed: {summary.unviewed}</span>
        </div>
      </div>

      {/* Mobile Filters Dropdown */}
      {showMobileFilters && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search quotes..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="responded">Responded</option>
              <option value="accepted">Accepted</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              placeholder="From date"
            />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              placeholder="To date"
            />
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quote Requests</h1>
            <div className="flex items-center space-x-4">
              <p className="text-gray-600">Manage and view all customer quote requests</p>
              
              {/* WebSocket Status */}
              <div className="flex items-center space-x-1">
                {wsConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi size={16} />
                    <span className="ml-1 text-xs">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff size={16} />
                    <span className="ml-1 text-xs">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm"
            >
              <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Desktop Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed</p>
                <p className="text-2xl font-bold text-blue-600">{summary.reviewed}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Responded</p>
                <p className="text-2xl font-bold text-green-600">{summary.responded}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Reply className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Accepted</p>
                <p className="text-2xl font-bold text-emerald-600">{summary.accepted}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unviewed</p>
                <p className="text-2xl font-bold text-purple-600">{summary.unviewed}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, quote ID, category..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
            
            {/* Filters and View Toggle */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="responded">Responded</option>
                    <option value="accepted">Accepted</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
                
                {Object.values(filters).some(v => v && v !== 'all') && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center px-3 py-1.5 rounded-md transition-all ${
                    viewMode === 'cards' 
                      ? 'bg-white shadow-sm text-emerald-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid size={16} className="mr-1" />
                  <span className="text-sm">Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-3 py-1.5 rounded-md transition-all ${
                    viewMode === 'table' 
                      ? 'bg-white shadow-sm text-emerald-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List size={16} className="mr-1" />
                  <span className="text-sm">Table</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 pb-4 md:px-6 md:pb-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && quotes.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-800 text-sm md:text-base">Unable to Load Quotes</h3>
            <p className="text-red-700 text-sm mt-1">
              {error}. Please try refreshing.
            </p>
          </div>
        )}

        {/* WebSocket Error */}
        {wsError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" />
              <h3 className="font-medium text-amber-800 text-sm">Real-time Updates Unavailable</h3>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              {wsError}. You may need to refresh manually to see new quotes.
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && quotes.length > 0 && (
          <>
            {/* Mobile: Always show cards */}
            <div className="md:hidden">
              <div className="grid grid-cols-1 gap-4">
                {quotes.map((quote) => (
                  <QuoteCard key={quote._id || quote.id || quote.quoteId} quote={quote} />
                ))}
              </div>
            </div>

            {/* Desktop: Show based on viewMode */}
            <div className="hidden md:block">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {quotes.map((quote) => (
                    <QuoteCard key={quote._id || quote.id || quote.quoteId} quote={quote} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quote ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {quotes.map((quote) => (
                          <tr key={quote._id || quote.id || quote.quoteId} className={`hover:bg-gray-50 ${
                            !quote.viewedByAdmin ? 'bg-emerald-50' : ''
                          }`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                                  <Hash className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-medium text-gray-900">
                                    #{quote.quoteId || 'N/A'}
                                  </div>
                                  {!quote.viewedByAdmin && (
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{quote.customer?.name || 'Anonymous'}</div>
                              <div className="text-sm text-gray-500">{quote.customer?.email || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{quote.categoryName}</div>
                              <div className="text-sm text-gray-500">{quote.items?.length || 0} items</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusDropdown quote={quote} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {!quote.response ? (
                                  <button
                                    onClick={() => handleCreateResponse(quote)}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                                    disabled={quote.status === 'cancelled'}
                                  >
                                    <Edit size={14} className="mr-1" />
                                    Create Response
                                  </button>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleCreateResponse(quote)}
                                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
                                    >
                                      <Edit size={14} className="mr-1" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleSendResponse(quote)}
                                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                      disabled={sending}
                                    >
                                      <Send size={14} className="mr-1" />
                                      Send
                                    </button>
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => handleViewQuote(quote)}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                  <Eye size={16} className="mr-1" />
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Results Summary */}
            {quotes.length > 0 && (
              <div className="mt-4 md:mt-6 text-sm text-gray-600 text-center">
                Showing {quotes.length} of {allQuotes.length || 0} quotes
                {filters.search && ` matching "${filters.search}"`}
                {filters.status && filters.status !== 'all' && ` with status "${filters.status}"`}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && quotes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FileText size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No quotes found
            </h3>
            <p className="text-gray-500 mb-4 text-sm md:text-base">
              {filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo
                ? 'Try adjusting your search or filter criteria.'
                : 'No quote requests have been submitted yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Quote Response Modal */}
      <QuoteResponseModalComponent />

      {/* Loading Overlays */}
      {updating && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center mx-4">
            <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-700 text-sm md:text-base">Updating status...</p>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center mx-4">
            <Loader2 className="animate-spin h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-gray-700 text-sm md:text-base">Deleting quote...</p>
          </div>
        </div>
      )}

      {sending && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center mx-4">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 text-sm md:text-base">Sending response...</p>
          </div>
        </div>
      )}

      {/* Click outside to close action menus */}
      {showActionMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowActionMenu(null)}
        ></div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        /* Mobile responsive improvements */
        @media (max-width: 768px) {
          .truncate {
            max-width: 150px;
          }
        }

        /* Touch-friendly tap targets */
        @media (max-width: 1024px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
          
          button:not(.p-2):not(.p-3) {
            padding: 12px 16px;
          }
        }

        /* Smooth scrolling */
        .overflow-x-auto {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        /* Hide scrollbar on mobile */
        @media (max-width: 768px) {
          .overflow-x-auto::-webkit-scrollbar {
            height: 2px;
          }
          
          .overflow-x-auto::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 1px;
          }
        }

        /* Better focus states for accessibility */
        button:focus,
        input:focus,
        select:focus {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }

        /* Loading animation improvements */
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};