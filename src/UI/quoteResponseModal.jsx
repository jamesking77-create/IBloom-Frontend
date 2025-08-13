// components/quotes/QuoteResponseModal.js - Complete Quote Response Modal
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  DollarSign,
  Package,
  Plus,
  Minus,
  Calculator,
  Send,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Edit3,
  Save,
  Eye
} from 'lucide-react';

import {
  createQuoteResponse,
  updateQuoteResponse,
  sendQuoteResponse,
  selectQuotesResponding,
  selectQuotesSending,
  selectQuotesResponseError,
  selectQuotesSendError,
  selectQuotesResponseSuccess,
  selectQuotesSendSuccess,
  clearError,
  clearSuccess
} from '../store/slices/quote-slice';

const QuoteResponseModal = ({ quote, isOpen, onClose }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const isResponding = useSelector(selectQuotesResponding);
  const isSending = useSelector(selectQuotesSending);
  const responseError = useSelector(selectQuotesResponseError);
  const sendError = useSelector(selectQuotesSendError);
  const responseSuccess = useSelector(selectQuotesResponseSuccess);
  const sendSuccess = useSelector(selectQuotesSendSuccess);

  // Local state
  const [step, setStep] = useState(1); // 1: Edit Items & Pricing, 2: Review & Send
  const [items, setItems] = useState([]);
  const [responseData, setResponseData] = useState({
    message: '',
    discount: 0,
    tax: 0,
    deliveryFee: 0,
    setupFee: 0,
    terms: '',
    validUntil: ''
  });
  const [editingItem, setEditingItem] = useState(null);
  const [sendOptions, setSendOptions] = useState({
    includeTerms: true,
    customMessage: '',
    generatePDF: true
  });
  const [showPreview, setShowPreview] = useState(false);

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && quote) {
      // Initialize items with pricing
      const initialItems = quote.items?.map(item => ({
        ...item,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0
      })) || [];
      
      setItems(initialItems);
      
      // Initialize response data
      const initialResponseData = {
        message: quote.response?.message || `Thank you for your inquiry about ${quote.categoryName}. We have prepared a competitive quote for your ${quote.customer.eventType || 'event'}.`,
        discount: quote.response?.discount || 0,
        tax: quote.response?.tax || 0,
        deliveryFee: quote.response?.deliveryFee || 0,
        setupFee: quote.response?.setupFee || 0,
        terms: quote.response?.terms || 'Payment required 48 hours before event. Setup and delivery included. Prices valid for 30 days.',
        validUntil: quote.response?.validUntil ? 
          new Date(quote.response.validUntil).toISOString().split('T')[0] : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      };
      
      setResponseData(initialResponseData);
      setStep(quote.response ? 2 : 1); // If response exists, go to review step
    }
  }, [isOpen, quote]);

  // Handle success states
  useEffect(() => {
    if (responseSuccess) {
      setStep(2); // Move to review step after creating response
      dispatch(clearSuccess());
    }
  }, [responseSuccess, dispatch]);

  useEffect(() => {
    if (sendSuccess) {
      onClose(); // Close modal after successful send
      dispatch(clearSuccess());
    }
  }, [sendSuccess, onClose, dispatch]);

  // Clear errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearError());
      dispatch(clearSuccess());
    }
  }, [isOpen, dispatch]);

  const handleItemPriceChange = (itemId, field, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: parseFloat(value) || 0 };
          if (field === 'unitPrice' || field === 'quantity') {
            updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const discountAmount = responseData.discount || 0;
    const taxAmount = responseData.tax || 0;
    const deliveryAmount = responseData.deliveryFee || 0;
    const setupAmount = responseData.setupFee || 0;
    
    const finalTotal = subtotal - discountAmount + taxAmount + deliveryAmount + setupAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      deliveryAmount,
      setupAmount,
      finalTotal
    };
  };

  const handleCreateResponse = async () => {
    const totals = calculateTotals();
    
    const responsePayload = {
      message: responseData.message,
      items: items,
      subtotal: totals.subtotal,
      discount: totals.discountAmount,
      tax: totals.taxAmount,
      deliveryFee: totals.deliveryAmount,
      setupFee: totals.setupAmount,
      finalTotal: totals.finalTotal,
      validUntil: responseData.validUntil,
      terms: responseData.terms
    };

    try {
      await dispatch(createQuoteResponse({
        quoteId: quote.quoteId,
        responseData: responsePayload
      })).unwrap();
    } catch (error) {
      console.error('Failed to create quote response:', error);
    }
  };

  const handleSendResponse = async () => {
    try {
      await dispatch(sendQuoteResponse({
        quoteId: quote.quoteId,
        sendOptions: sendOptions
      })).unwrap();
    } catch (error) {
      console.error('Failed to send quote response:', error);
    }
  };

  const getContactMethodDisplay = () => {
    const method = quote.customer?.preferredContact || 'phone';
    const icons = {
      phone: <Phone className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      whatsapp: <MessageSquare className="w-4 h-4" />
    };
    
    return {
      icon: icons[method],
      label: method.charAt(0).toUpperCase() + method.slice(1),
      value: method === 'email' ? quote.customer.email : quote.customer.phone
    };
  };

  if (!isOpen || !quote) return null;

  const totals = calculateTotals();
  const contactMethod = getContactMethodDisplay();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quote Response</h2>
              <p className="text-emerald-100 mt-1">
                {quote.quoteId} • {quote.customer.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center mt-4 space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-white' : 'text-emerald-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? 'bg-white text-emerald-600' : 'bg-emerald-500'
              }`}>
                1
              </div>
              <span className="font-medium">Price Items</span>
            </div>
            <div className="flex-1 h-0.5 bg-emerald-300"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-white' : 'text-emerald-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-white text-emerald-600' : 'bg-emerald-500'
              }`}>
                2
              </div>
              <span className="font-medium">Review & Send</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Display */}
          {(responseError || sendError) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="font-medium text-red-800 text-sm">Error</h3>
              </div>
              <p className="text-red-700 text-sm mt-1">{responseError || sendError}</p>
              <button
                onClick={() => dispatch(clearError())}
                className="text-red-600 hover:text-red-800 text-sm underline mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {/* Items Pricing Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-emerald-600" />
                  Items & Pricing
                </h3>
                
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Item Image & Info */}
                        <div className="lg:col-span-4 flex items-center space-x-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleItemPriceChange(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleItemPriceChange(item.id, 'quantity', item.quantity + 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="lg:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (₦)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemPriceChange(item.id, 'unitPrice', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="lg:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Total Price</label>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                            <span className="text-sm font-bold text-emerald-800">
                              ₦{item.totalPrice?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Costs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                  Additional Costs
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (₦)</label>
                    <input
                      type="number"
                      value={responseData.discount}
                      onChange={(e) => setResponseData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax (₦)</label>
                    <input
                      type="number"
                      value={responseData.tax}
                      onChange={(e) => setResponseData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee (₦)</label>
                    <input
                      type="number"
                      value={responseData.deliveryFee}
                      onChange={(e) => setResponseData(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Setup Fee (₦)</label>
                    <input
                      type="number"
                      value={responseData.setupFee}
                      onChange={(e) => setResponseData(prev => ({ ...prev, setupFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Quote Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Message</label>
                <textarea
                  value={responseData.message}
                  onChange={(e) => setResponseData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Enter your message to the customer..."
                />
              </div>

              {/* Terms & Valid Until */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                  <textarea
                    value={responseData.terms}
                    onChange={(e) => setResponseData(prev => ({ ...prev, terms: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Enter terms and conditions..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={responseData.validUntil}
                      onChange={(e) => setResponseData(prev => ({ ...prev, validUntil: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border border-emerald-200">
                <h4 className="font-semibold text-gray-800 mb-4">Pricing Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₦{totals.subtotal.toLocaleString()}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-₦{totals.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">₦{totals.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.deliveryAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">₦{totals.deliveryAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.setupAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup:</span>
                      <span className="font-medium">₦{totals.setupAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-emerald-800">
                      <span>Total:</span>
                      <span>₦{totals.finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Quote Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                  Quote Summary
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {quote.customer.name}</p>
                      <p><strong>Email:</strong> {quote.customer.email}</p>
                      <p><strong>Phone:</strong> {quote.customer.phone}</p>
                      {quote.customer.eventType && (
                        <p><strong>Event:</strong> {quote.customer.eventType}</p>
                      )}
                      {quote.customer.eventDate && (
                        <p><strong>Date:</strong> {new Date(quote.customer.eventDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Contact Preference</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      {contactMethod.icon}
                      <span className="font-medium">{contactMethod.label}:</span>
                      <span>{contactMethod.value}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Send Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Send className="w-5 h-5 mr-2 text-blue-600" />
                  Send Options
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message (Optional)
                    </label>
                    <textarea
                      value={sendOptions.customMessage}
                      onChange={(e) => setSendOptions(prev => ({ ...prev, customMessage: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Add a personal message for this customer..."
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendOptions.includeTerms}
                        onChange={(e) => setSendOptions(prev => ({ ...prev, includeTerms: e.target.checked }))}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include terms and conditions</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendOptions.generatePDF}
                        onChange={(e) => setSendOptions(prev => ({ ...prev, generatePDF: e.target.checked }))}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Generate PDF attachment</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact Method Warning */}
              {quote.customer.preferredContact !== 'email' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800 text-sm">Manual Contact Required</h4>
                      <p className="text-amber-700 text-sm mt-1">
                        Customer prefers {contactMethod.label.toLowerCase()} contact. You'll need to manually reach out at{' '}
                        <strong>{contactMethod.value}</strong> after creating the quote.
                      </p>
                      <p className="text-amber-600 text-xs mt-2">
                        Best time to contact: {quote.customer.contactTime || 'anytime'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Pricing Display */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border border-emerald-200">
                <h4 className="font-semibold text-gray-800 mb-4">Final Quote</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({items.length}):</span>
                    <span className="font-medium">₦{totals.subtotal.toLocaleString()}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-₦{totals.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">₦{totals.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.deliveryAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">₦{totals.deliveryAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.setupAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup:</span>
                      <span className="font-medium">₦{totals.setupAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold text-emerald-800">
                      <span>Total:</span>
                      <span>₦{totals.finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-emerald-700">
                    <strong>Valid until:</strong> {responseData.validUntil ? 
                      new Date(responseData.validUntil).toLocaleDateString() : 
                      'Not specified'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={isResponding || isSending}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isResponding || isSending}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              {step === 1 && (
                <button
                  onClick={handleCreateResponse}
                  disabled={isResponding || items.some(item => !item.unitPrice)}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:cursor-not-allowed"
                >
                  {isResponding ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Response
                    </>
                  )}
                </button>
              )}
              
              {step === 2 && (
                <button
                  onClick={handleSendResponse}
                  disabled={isSending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Quote
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteResponseModal;