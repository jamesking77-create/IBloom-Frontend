// components/quote/CustomerInfoForm.js - FIXED VERSION for Real Backend Integration
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  ArrowLeft, 
  Send,
  Clock,
  Users,
  Building,
  ShoppingCart,
  Package,
  CheckCircle,
  Quote,
  Plus,
  Minus,
  X,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';

// Import the quote action
import { createQuote } from '../../store/slices/quote-slice';

const CustomerInfoForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get cart data from navigation state
  const { cart = [], cartCount = 0, category = {} } = location.state || {};

  const [formData, setFormData] = useState({
    // Required fields
    name: '',
    email: '',
    phone: '',
    
    // Optional event details
    eventDate: '',
    eventLocation: '',
    eventType: '',
    guestCount: '',
    eventDuration: '',
    
    // Additional info
    specialRequests: '',
    budget: '',
    hearAboutUs: '',
    
    // Contact preferences
    preferredContact: 'phone', // phone, email, whatsapp
    contactTime: 'anytime' // morning, afternoon, evening, anytime
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // If no cart data, redirect back
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/request-quote', { replace: true });
    }
  }, [cart, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare quote data to match backend expected format
      const quoteData = {
        // Customer information (matches backend customer schema)
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: '',
          company: '',
          eventType: formData.eventType,
          eventDate: formData.eventDate,
          eventLocation: formData.eventLocation,
          guestCount: formData.guestCount ? parseInt(formData.guestCount) : null,
          eventDuration: formData.eventDuration,
          venue: '',
          specialRequests: formData.specialRequests,
          budget: formData.budget,
          hearAboutUs: formData.hearAboutUs,
          preferredContact: formData.preferredContact,
          contactTime: formData.contactTime
        },
        
        // Category information
        categoryId: category.id,
        categoryName: category.name,
        
        // Items from cart
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          quantity: item.quantity || 1
        })),
        
        // Admin notes (empty for customer submission)
        adminNotes: ''
      };

      console.log('🎯 Submitting quote request to backend:', quoteData);

      // Dispatch the createQuote action
      const result = await dispatch(createQuote(quoteData)).unwrap();

      console.log('✅ Quote submitted successfully:', result);

      // Navigate to success page
      navigate('/quote-success', { 
        state: { 
          quoteData: result,
          message: 'Your quote request has been submitted successfully!'
        }
      });

    } catch (error) {
      console.error('❌ Error submitting quote:', error);
      
      // Show user-friendly error message
      const errorMessage = error.includes('network') || error.includes('fetch') 
        ? 'Network error. Please check your connection and try again.'
        : error.includes('validation') || error.includes('required')
        ? 'Please check your information and try again.'
        : 'Error submitting quote request. Please try again.';
        
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to items screen
  };

  const eventTypes = [
    'Wedding', 'Birthday Party', 'Corporate Event', 'Conference', 'Trade Show',
    'Baby Shower', 'Anniversary', 'Graduation', 'Holiday Party', 'Other'
  ];

  const contactTimeOptions = [
    { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
    { value: 'evening', label: 'Evening (5 PM - 8 PM)' },
    { value: 'anytime', label: 'Anytime' }
  ];

  if (!cart || cart.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Mobile Header - Fixed */}
      <div className="lg:hidden sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="flex items-center text-emerald-600 hover:text-emerald-700 active:text-emerald-800 transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
          
          <button
            onClick={() => setShowCartSummary(!showCartSummary)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors touch-manipulation"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            <span className="font-medium">{cartCount} items</span>
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showCartSummary ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Mobile Cart Summary Dropdown */}
        {showCartSummary && (
          <div className="border-t bg-white p-4 max-h-80 overflow-y-auto">
            <div className="mb-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 text-sm">{category.name}</h4>
              <p className="text-xs text-emerald-600 mt-1">
                {cartCount} item{cartCount !== 1 ? 's' : ''} selected for custom quote
              </p>
            </div>
            
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-emerald-600 font-medium">Custom pricing</span>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block text-center mb-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Items
            </button>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Complete Your Quote Request
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review your selected items and provide your contact information to receive a personalized quote.
            </p>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Complete Your Quote
            </h1>
            <p className="text-gray-600 text-sm">
              Fill in your details to receive a personalized quote
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Left Side - Cart Items Preview (Desktop Only) */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <ShoppingCart className="w-6 h-6 mr-2 text-emerald-600" />
                  Quote Summary ({cartCount} items)
                </h3>
                
                {/* Category Info */}
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-1">{category.name}</h4>
                  <p className="text-sm text-emerald-600">
                    {cartCount} item{cartCount !== 1 ? 's' : ''} selected for custom quote
                  </p>
                </div>
                
                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-xs text-emerald-600 font-medium">Custom pricing</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-gray-700">Total Items:</span>
                    <span className="font-bold text-gray-900">{cartCount}</span>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-100 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-emerald-700 font-medium text-center">
                      💎 Custom pricing will be provided within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Customer Form */}
            <div className="w-full">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6 lg:p-8">
                
                {/* Required Information */}
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-emerald-600" />
                    Contact Information <span className="text-red-500 ml-1">*</span>
                  </h3>
                  
                  <div className="space-y-4 lg:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-10 pr-4 py-3 lg:py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          } ${focusedField === 'name' ? 'bg-emerald-50/30' : ''}`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-10 pr-4 py-3 lg:py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          } ${focusedField === 'email' ? 'bg-emerald-50/30' : ''}`}
                          placeholder="Enter your email address"
                          autoComplete="email"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-10 pr-4 py-3 lg:py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          } ${focusedField === 'phone' ? 'bg-emerald-50/30' : ''}`}
                          placeholder="Enter your phone number"
                          autoComplete="tel"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Event Details <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                  </h3>
                  
                  <div className="space-y-4 lg:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="date"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Type
                        </label>
                        <select
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base appearance-none bg-white"
                        >
                          <option value="">Select event type</option>
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="eventLocation"
                          value={formData.eventLocation}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                          placeholder="Enter event location or venue"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            name="guestCount"
                            value={formData.guestCount}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                            placeholder="Expected guest count"
                            min="1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Duration
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            name="eventDuration"
                            value={formData.eventDuration}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                            placeholder="e.g., 6 hours, Full day"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                    Additional Information
                  </h3>
                  
                  <div className="space-y-4 lg:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests or Notes
                      </label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base resize-none"
                        placeholder="Any special requirements, setup instructions, or additional information..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Budget Range
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="w-full px-3 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base appearance-none bg-white"
                        >
                          <option value="">Select budget range</option>
                          <option value="under-50k">Under ₦50,000</option>
                          <option value="50k-100k">₦50,000 - ₦100,000</option>
                          <option value="100k-250k">₦100,000 - ₦250,000</option>
                          <option value="250k-500k">₦250,000 - ₦500,000</option>
                          <option value="500k-1m">₦500,000 - ₦1,000,000</option>
                          <option value="over-1m">Over ₦1,000,000</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          How did you hear about us?
                        </label>
                        <select
                          name="hearAboutUs"
                          value={formData.hearAboutUs}
                          onChange={handleInputChange}
                          className="w-full px-3 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base appearance-none bg-white"
                        >
                          <option value="">Select an option</option>
                          <option value="google">Google Search</option>
                          <option value="social-media">Social Media</option>
                          <option value="referral">Friend/Family Referral</option>
                          <option value="previous-customer">Previous Customer</option>
                          <option value="website">Website</option>
                          <option value="advertisement">Advertisement</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Preferences */}
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 lg:mb-6">
                    Contact Preferences
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Preferred Contact Method
                      </label>
                      <div className="space-y-3">
                        {[
                          { value: 'phone', label: 'Phone Call', icon: Phone },
                          { value: 'email', label: 'Email', icon: Mail },
                          { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
                        ].map(option => {
                          const IconComponent = option.icon;
                          return (
                            <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name="preferredContact"
                                value={option.value}
                                checked={formData.preferredContact === option.value}
                                onChange={handleInputChange}
                                className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                              />
                              <IconComponent className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                              <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Best Time to Contact
                      </label>
                      <select
                        name="contactTime"
                        value={formData.contactTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base appearance-none bg-white"
                      >
                        {contactTimeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 lg:pt-6 border-t">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-2xl flex items-center justify-center touch-manipulation min-h-[48px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span className="hidden sm:inline">Submitting Quote Request...</span>
                        <span className="sm:hidden">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        <span className="hidden sm:inline">Submit Quote Request</span>
                        <span className="sm:hidden">Submit Request</span>
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 px-2">
                    By submitting this form, you agree to receive quotes and communications about your event.
                    <br />
                    <span className="font-medium text-emerald-600">No payment required • Free quote service • 24hr response</span>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom Info Cards */}
          <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Quote className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Free Quote Service</h3>
              <p className="text-xs lg:text-sm text-gray-600">
                No hidden fees or charges. Get your custom quote absolutely free.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">24-Hour Response</h3>
              <p className="text-xs lg:text-sm text-gray-600">
                We guarantee a response to all quote requests within 24 hours.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 text-center sm:col-span-1 sm:col-start-2 sm:col-end-3 md:col-start-auto md:col-end-auto">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Expert Support</h3>
              <p className="text-xs lg:text-sm text-gray-600">
                Our experienced team will help you plan the perfect event.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;