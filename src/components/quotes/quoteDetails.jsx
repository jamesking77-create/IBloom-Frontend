import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Package,
  MessageSquare,
  Clock,
  Edit,
  Send,
  Save,
  X,
  Building,
  Users,
  Timer,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Menu
} from 'lucide-react';

import {
  updateQuoteStatus,
  createQuoteResponse,
  updateQuoteResponse,
  sendQuoteResponse,
  addCommunication
} from '../../store/slices/quote-slice';

export const QuoteDetails = ({ quote, onClose }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('details');
  const [editingResponse, setEditingResponse] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [responseData, setResponseData] = useState({
    message: '',
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    deliveryFee: 0,
    setupFee: 0,
    finalTotal: 0,
    validUntil: '',
    terms: ''
  });
  const [newCommunication, setNewCommunication] = useState({
    type: 'note',
    message: ''
  });
  const [showCommunicationForm, setShowCommunicationForm] = useState(false);

  useEffect(() => {
    if (quote) {
      // Initialize response data
      if (quote.response) {
        setResponseData({
          message: quote.response.message || '',
          items: quote.items || [],
          subtotal: quote.response.subtotal || 0,
          discount: quote.response.discount || 0,
          tax: quote.response.tax || 0,
          deliveryFee: quote.response.deliveryFee || 0,
          setupFee: quote.response.setupFee || 0,
          finalTotal: quote.response.finalTotal || 0,
          validUntil: quote.response.validUntil ? 
            new Date(quote.response.validUntil).toISOString().split('T')[0] : '',
          terms: quote.response.terms || ''
        });
      } else {
        // Initialize with quote items
        const items = quote.items?.map(item => ({
          ...item,
          unitPrice: item.unitPrice || 0,
          totalPrice: (item.unitPrice || 0) * (item.quantity || 1)
        })) || [];
        
        setResponseData({
          message: '',
          items,
          subtotal: 0,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          setupFee: 0,
          finalTotal: 0,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          terms: 'Payment terms: 50% deposit required, balance due on delivery.'
        });
      }
    }
  }, [quote]);

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateQuoteStatus({ 
        quoteId: quote.quoteId || quote._id, 
        status: newStatus 
      })).unwrap();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const updateItemPrice = (index, field, value) => {
    const newItems = [...responseData.items];
    newItems[index] = { 
      ...newItems[index], 
      [field]: parseFloat(value) || 0 
    };
    
    if (field === 'unitPrice' || field === 'quantity') {
      newItems[index].totalPrice = (newItems[index].unitPrice || 0) * (newItems[index].quantity || 1);
    }
    
    const subtotal = newItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const finalTotal = subtotal - (responseData.discount || 0) + (responseData.tax || 0) + 
                      (responseData.deliveryFee || 0) + (responseData.setupFee || 0);
    
    setResponseData({ 
      ...responseData, 
      items: newItems,
      subtotal,
      finalTotal
    });
  };

  const updateCostField = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const updatedData = { ...responseData, [field]: numValue };
    
    const finalTotal = updatedData.subtotal - (updatedData.discount || 0) + 
                      (updatedData.tax || 0) + (updatedData.deliveryFee || 0) + 
                      (updatedData.setupFee || 0);
    
    setResponseData({ ...updatedData, finalTotal });
  };

  const handleSaveResponse = async () => {
    try {
      const quoteId = quote.quoteId || quote._id;
      
      if (quote.response) {
        await dispatch(updateQuoteResponse({ quoteId, responseData })).unwrap();
      } else {
        await dispatch(createQuoteResponse({ quoteId, responseData })).unwrap();
      }
      
      setEditingResponse(false);
      alert('Response saved successfully!');
    } catch (error) {
      console.error('Failed to save response:', error);
      alert('Failed to save response. Please try again.');
    }
  };

  const handleSendResponse = async () => {
    try {
      await dispatch(sendQuoteResponse({ 
        quoteId: quote.quoteId || quote._id,
        sendOptions: {
          includeTerms: true,
          customMessage: '',
          generatePDF: true
        }
      })).unwrap();
      
      alert('Quote response sent successfully!');
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Failed to send response. Please try again.');
    }
  };

  const handleAddCommunication = async () => {
    if (!newCommunication.message.trim()) return;
    
    try {
      await dispatch(addCommunication({
        quoteId: quote.quoteId || quote._id,
        communication: newCommunication
      })).unwrap();
      
      setNewCommunication({ type: 'note', message: '' });
      setShowCommunicationForm(false);
      alert('Communication logged successfully!');
    } catch (error) {
      console.error('Failed to add communication:', error);
      alert('Failed to log communication. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'responded': return 'bg-green-100 text-green-800 border-green-200';
      case 'accepted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!quote) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                  Quote #{quote.quoteId}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Status Badge */}
              <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(quote.status)}`}>
                <span className="hidden sm:inline">
                  {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1)}
                </span>
                <span className="sm:hidden">
                  {quote.status?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Menu size={18} />
              </button>
              
              {/* Desktop Status Update */}
              <select
                value={quote.status || 'pending'}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="hidden md:block text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="responded">Responded</option>
                <option value="accepted">Accepted</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          
          {/* Mobile Status Dropdown */}
          {showMobileMenu && (
            <div className="mt-3 md:hidden">
              <select
                value={quote.status || 'pending'}
                onChange={(e) => {
                  handleStatusChange(e.target.value);
                  setShowMobileMenu(false);
                }}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="responded">Responded</option>
                <option value="accepted">Accepted</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-3 sm:px-4 md:px-6">
          <nav className="flex">
            {[
              { id: 'details', label: 'Details', icon: FileText },
              { id: 'response', label: 'Response', icon: Edit },
              { id: 'communications', label: 'Comms', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-4 border-b-2 transition-colors text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={14} className="sm:w-4 sm:h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-6">
        {activeTab === 'details' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-start space-x-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{quote.customer?.name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{quote.customer?.email || 'N/A'}</p>
                    {quote.customer?.email && (
                      <button
                        onClick={() => copyToClipboard(quote.customer.email)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 mt-1"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{quote.customer?.phone || 'N/A'}</p>
                    {quote.customer?.phone && (
                      <button
                        onClick={() => copyToClipboard(quote.customer.phone)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 mt-1"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
                
                {quote.customer?.company && (
                  <div className="flex items-start space-x-3">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Company</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{quote.customer.company}</p>
                    </div>
                  </div>
                )}
                
                {quote.customer?.eventType && (
                  <div className="flex items-start space-x-3">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Event Type</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{quote.customer.eventType}</p>
                    </div>
                  </div>
                )}
                
                {quote.customer?.preferredContact && (
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Preferred Contact</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{quote.customer.preferredContact}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Details */}
            {(quote.customer?.eventDate || quote.customer?.eventLocation || quote.customer?.guestCount) && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Event Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {quote.customer?.eventDate && (
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">Event Date</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {new Date(quote.customer.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {quote.customer?.eventLocation && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">Event Location</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{quote.customer.eventLocation}</p>
                      </div>
                    </div>
                  )}
                  
                  {quote.customer?.guestCount && (
                    <div className="flex items-start space-x-3">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">Guest Count</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{quote.customer.guestCount}</p>
                      </div>
                    </div>
                  )}
                  
                  {quote.customer?.eventDuration && (
                    <div className="flex items-start space-x-3">
                      <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{quote.customer.eventDuration}</p>
                      </div>
                    </div>
                  )}
                  
                  {quote.customer?.venue && (
                    <div className="flex items-start space-x-3">
                      <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">Venue</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{quote.customer.venue}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Requests */}
            {quote.customer?.specialRequests && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Special Requests</h2>
                <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{quote.customer.specialRequests}</p>
              </div>
            )}

            {/* Requested Items */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Requested Items</h2>
              <div className="space-y-3 sm:space-y-4">
                {quote.items?.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto sm:mx-0 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                          <span>Qty: {item.quantity || 1}</span>
                          {item.unitPrice > 0 && (
                            <span>₦{item.unitPrice.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quote Response</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {quote.response && !editingResponse && (
                  <button
                    onClick={handleSendResponse}
                    className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Send size={14} className="mr-2" />
                    Send Response
                  </button>
                )}
                <button
                  onClick={() => setEditingResponse(!editingResponse)}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
                >
                  <Edit size={14} className="mr-2" />
                  {editingResponse ? 'Cancel' : (quote.response ? 'Edit Response' : 'Create Response')}
                </button>
              </div>
            </div>

            {editingResponse ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Response Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Message
                  </label>
                  <textarea
                    value={responseData.message}
                    onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    rows={4}
                    placeholder="Enter your response message to the customer..."
                  />
                </div>

                {/* Items Pricing */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Items & Pricing</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {responseData.items?.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Item Name
                            </label>
                            <p className="text-sm text-gray-900 font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                value={item.quantity || 1}
                                onChange={(e) => updateItemPrice(index, 'quantity', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              Total: ₦{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Costs */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Additional Costs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (₦)
                      </label>
                      <input
                        type="number"
                        value={responseData.discount || 0}
                        onChange={(e) => updateCostField('discount', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
                        value={responseData.tax || 0}
                        onChange={(e) => updateCostField('tax', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
                        value={responseData.deliveryFee || 0}
                        onChange={(e) => updateCostField('deliveryFee', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
                        value={responseData.setupFee || 0}
                        onChange={(e) => updateCostField('setupFee', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Total */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={responseData.validUntil}
                      onChange={(e) => setResponseData({ ...responseData, validUntil: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                      <span className="text-lg font-bold text-gray-900">
                        ₦{responseData.finalTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={responseData.terms}
                    onChange={(e) => setResponseData({ ...responseData, terms: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    rows={3}
                    placeholder="Enter terms and conditions..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setEditingResponse(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveResponse}
                    className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
                  >
                    <Save size={14} className="mr-2" />
                    Save Response
                  </button>
                </div>
              </div>
            ) : quote.response ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Response Message */}
                {quote.response.message && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Response Message</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg whitespace-pre-wrap text-sm sm:text-base">
                      {quote.response.message}
                    </p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Price Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₦{(quote.response.subtotal || 0).toLocaleString()}</span>
                    </div>
                    
                    {quote.response.discount > 0 && (
                      <div className="flex justify-between text-red-600 text-sm sm:text-base">
                        <span>Discount:</span>
                        <span>-₦{quote.response.discount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {quote.response.tax > 0 && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">₦{quote.response.tax.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {quote.response.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span className="font-medium">₦{quote.response.deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {quote.response.setupFee > 0 && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Setup Fee:</span>
                        <span className="font-medium">₦{quote.response.setupFee.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <hr className="border-gray-300" />
                    
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total:</span>
                      <span>₦{(quote.response.finalTotal || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Validity */}
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Valid Until</h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                      {quote.response.validUntil 
                        ? new Date(quote.response.validUntil).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  
                  {quote.response.terms && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Terms & Conditions</h3>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{quote.response.terms}</p>
                    </div>
                  )}
                </div>

                {/* Response Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-green-800 text-sm sm:text-base">
                      Response Created on {new Date(quote.response.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {quote.response.pdfGenerated && (
                    <p className="text-green-700 text-xs sm:text-sm mt-1">PDF version available</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Response Created</h3>
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base px-4">
                  Create a response to provide pricing and details to the customer.
                </p>
                <button
                  onClick={() => setEditingResponse(true)}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors mx-auto text-sm"
                >
                  <Edit size={14} className="mr-2" />
                  Create Response
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'communications' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Communications</h2>
              <button
                onClick={() => setShowCommunicationForm(!showCommunicationForm)}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
              >
                <MessageSquare size={14} className="mr-2" />
                Add Communication
              </button>
            </div>

            {/* Add Communication Form */}
            {showCommunicationForm && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Communication Type
                    </label>
                    <select
                      value={newCommunication.type}
                      onChange={(e) => setNewCommunication({ ...newCommunication, type: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    >
                      <option value="note">Note</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone Call</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={newCommunication.message}
                      onChange={(e) => setNewCommunication({ ...newCommunication, message: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      rows={3}
                      placeholder="Enter communication details..."
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => setShowCommunicationForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCommunication}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
                    >
                      Add Communication
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Communications List */}
            <div className="space-y-3 sm:space-y-4">
              {quote.communications && quote.communications.length > 0 ? (
                quote.communications.map((comm, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          comm.type === 'email' ? 'bg-blue-100 text-blue-800' :
                          comm.type === 'phone' ? 'bg-green-100 text-green-800' :
                          comm.type === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {comm.type}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {new Date(comm.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{comm.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Communications</h3>
                  <p className="text-gray-500 text-sm sm:text-base px-4">
                    No communications have been logged for this quote yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};