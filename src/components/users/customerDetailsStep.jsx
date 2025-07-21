// screens/user/components/CustomerDetailsStep.js
import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  MessageSquare, 
  Calendar, 
  Heart, 
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  BadgeInfo,
  Truck,
  Settings
} from 'lucide-react';

const CustomerDetailsStep = ({ 
  customerInfo, 
  selectedDates, 
  onCustomerInfoChange, 
  onNext, 
  onPrevious, 
  error,
  cartItems,
  cartTotal
}) => {
  const [formData, setFormData] = useState({
    name: customerInfo?.name || '',
    eventType: customerInfo?.eventType || '',
    location: customerInfo?.location || '',
    phone: customerInfo?.phone || '',
    email: customerInfo?.email || '',
    guests: customerInfo?.guests || '',
    specialRequests: customerInfo?.specialRequests || '',
    delivery: customerInfo?.delivery || '',
    installation: customerInfo?.installation || ''
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Update form data when customerInfo changes
  useEffect(() => {
    if (customerInfo) {
      setFormData({
        name: customerInfo.name || '',
        eventType: customerInfo.eventType || '',
        location: customerInfo.location || '',
        phone: customerInfo.phone || '',
        email: customerInfo.email || '',
        guests: customerInfo.guests || '',
        specialRequests: customerInfo.specialRequests || '',
        delivery: customerInfo.delivery || '',
        installation: customerInfo.installation || ''
      });
    }
  }, [customerInfo]);

  const eventTypes = [
    'Wedding',
    'Birthday Party',
    'Corporate Event',
    'Baby Shower',
    'Graduation Party',
    'Anniversary',
    'Conference',
    'Workshop',
    'Seminar',
    'Product Launch',
    'Other'
  ];

  const deliveryOptions = [
    { value: '', label: 'Select delivery option' },
    { value: 'yes', label: 'Yes - Deliver to venue' },
    { value: 'no', label: 'No - Self pickup' }
  ];

  const installationOptions = [
    { value: '', label: 'Select installation option' },
    { value: 'yes', label: 'Yes - Professional setup required' },
    { value: 'no', label: 'No - Self setup' }
  ];

  const handleInputChange = (field, value) => {
    console.log(`Field ${field} changed to:`, value); // Debug log
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    console.log('Validating form with data:', formData); // Debug log
    
    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.delivery.trim()) {
      newErrors.delivery = 'Please select a delivery option';
    }
    
    if (!formData.installation.trim()) {
      newErrors.installation = 'Please select an installation option';
    }
    
    console.log('Validation errors:', newErrors); // Debug log
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('Next button clicked'); // Debug log
    console.log('Current form data:', formData); // Debug log
    
    if (validateForm()) {
      console.log('Form is valid, proceeding to next step'); // Debug log
      // Update the parent component with the form data
      onCustomerInfoChange(formData);
      // Call the next function
      onNext();
    } else {
      console.log('Form validation failed'); // Debug log
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '₦0';
    const numericPrice = parseFloat(price.toString().replace(/[^\d.]/g, ''));
    return `₦${numericPrice.toLocaleString('en-NG')}`;
  };

  const isFieldValid = (field) => {
    return formData[field] && !errors[field];
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Enhanced Event Summary */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-xl p-8 border border-white/20 transform transition-all duration-500 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
            <Calendar className="w-7 h-7 mr-3 text-blue-600" />
            Event Summary
          </h2>
          <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
            <BadgeInfo className="w-5 h-5 text-pink-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">{cartItems.length} items</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-blue-500 mr-3" />
              <h3 className="font-semibold text-gray-800">Date & Time</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Start:</span>
                <span className="ml-2 font-medium text-gray-800">{formatDate(selectedDates.startDate)}</span>
              </div>
              {selectedDates.multiDay && selectedDates.endDate !== selectedDates.startDate && (
                <div>
                  <span className="text-gray-600">End:</span>
                  <span className="ml-2 font-medium text-gray-800">{formatDate(selectedDates.endDate)}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Time:</span>
                <span className="ml-2 font-medium text-gray-800">{selectedDates.startTime} - {selectedDates.endTime}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <BadgeInfo className="w-6 h-6 text-pink-500 mr-3" />
              <h3 className="font-semibold text-gray-800">Services</h3>
            </div>
            <div className="space-y-2 text-sm">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium text-gray-800">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <Star className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="font-semibold text-gray-800">Total</h3>
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatPrice(cartTotal)}</div>
            <div className="text-sm text-gray-600 mt-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Final amount may vary
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information Form */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-8">
          <User className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Customer Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <User className="w-4 h-4 mr-2" />
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.name 
                    ? 'border-red-300 bg-red-50' 
                    : isFieldValid('name')
                    ? 'border-green-300 bg-green-50'
                    : focusedField === 'name'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter customer's full name"
              />
              {isFieldValid('name') && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Star className="w-4 h-4 mr-2" />
              Event Type (Optional)
            </label>
            <div className="relative">
              <select
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                onFocus={() => setFocusedField('eventType')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.eventType 
                    ? 'border-red-300 bg-red-50' 
                    : isFieldValid('eventType')
                    ? 'border-green-300 bg-green-50'
                    : focusedField === 'eventType'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {isFieldValid('eventType') && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.eventType && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.eventType}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 mr-2" />
              Event Location *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.location 
                    ? 'border-red-300 bg-red-50' 
                    : isFieldValid('location')
                    ? 'border-green-300 bg-green-50'
                    : focusedField === 'location'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter event location/address"
              />
              {isFieldValid('location') && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.location && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Phone className="w-4 h-4 mr-2" />
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.phone 
                    ? 'border-red-300 bg-red-50' 
                    : isFieldValid('phone')
                    ? 'border-green-300 bg-green-50'
                    : focusedField === 'phone'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter phone number"
              />
              {isFieldValid('phone') && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 mr-2" />
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.email 
                    ? 'border-red-300 bg-red-50' 
                    : isFieldValid('email')
                    ? 'border-green-300 bg-green-50'
                    : focusedField === 'email'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter email address"
              />
              {isFieldValid('email') && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Number of Guests (Optional)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.guests}
                onChange={(e) => handleInputChange('guests', e.target.value)}
                onFocus={() => setFocusedField('guests')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.guests 
                    ? 'border-red-300 bg-red-50' 
                    : isFieldValid('guests')
                    ? 'border-green-300 bg-green-50'
                    : focusedField === 'guests'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter number of guests"
                min="1"
              />
              {isFieldValid('guests') && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.guests && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.guests}
              </p>
            )}
          </div>

          {/* Delivery Option */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Truck className="w-4 h-4 mr-2" />
              Delivery Required? *
            </label>
            <div className="relative">
              <select
                value={formData.delivery}
                onChange={(e) => handleInputChange('delivery', e.target.value)}
                onFocus={() => setFocusedField('delivery')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.delivery 
                    ? 'border-red-300 bg-red-50' 
                    : isFieldValid('delivery')
                    ? 'border-green-300 bg-green-50'
                    : focusedField === 'delivery'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {deliveryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isFieldValid('delivery') && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.delivery && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.delivery}
              </p>
            )}
          </div>

          {/* Installation Option */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Professional Setup Required? *
            </label>
            <div className="relative">
              <select
                value={formData.installation}
                onChange={(e) => handleInputChange('installation', e.target.value)}
                onFocus={() => setFocusedField('installation')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.installation 
                    ? 'border-red-300 bg-red-50' 
                    : isFieldValid('installation')
                    ? 'border-green-300 bg-green-50'
                    : focusedField === 'installation'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {installationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isFieldValid('installation') && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.installation && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.installation}
              </p>
            )}
          </div>
        </div>

        {/* Special Requests */}
        <div className="mt-6 space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Special Requests (Optional)
          </label>
          <div className="relative">
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              onFocus={() => setFocusedField('specialRequests')}
              onBlur={() => setFocusedField(null)}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                focusedField === 'specialRequests'
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none`}
              placeholder="Any special requests or additional information for your event..."
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-6">
        <button
          onClick={onPrevious}
          className="flex items-center px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        
        <button
          onClick={handleNext}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Continue to Preview
          <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailsStep;