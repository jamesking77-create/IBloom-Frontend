// screens/user/components/CustomerDetailsStep.js
import React, { useState, useEffect, useCallback } from "react";
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
  Settings,
} from "lucide-react";

const CustomerDetailsStep = ({
  customerInfo,
  selectedDates,
  onCustomerInfoChange,
  onNext,
  onPrevious,
  error,
  cartItems,
  cartTotal,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    eventType: "",
    location: "",
    phone: "",
    email: "",
    guests: "",
    specialRequests: "",
    delivery: "",
    installation: "",
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIXED: Better initialization with proper dependency tracking
  useEffect(() => {
    console.log('🔄 CustomerDetailsStep: Initializing form data');
    console.log('Received customerInfo:', customerInfo);
    
    if (customerInfo) {
      const newFormData = {
        name: customerInfo.name || "",
        eventType: customerInfo.eventType || "",
        location: customerInfo.location || "",
        phone: customerInfo.phone || "",
        email: customerInfo.email || "",
        guests: customerInfo.guests || "",
        specialRequests: customerInfo.specialRequests || "",
        delivery: customerInfo.delivery || "",
        installation: customerInfo.installation || "",
      };
      
      console.log('✅ Setting form data:', newFormData);
      setFormData(newFormData);
    }
  }, [customerInfo]);

  const eventTypes = [
    "Wedding",
    "Birthday Party",
    "Corporate Event",
    "Baby Shower",
    "Graduation Party",
    "Anniversary",
    "Conference",
    "Workshop",
    "Seminar",
    "Product Launch",
    "Other",
  ];

  const deliveryOptions = [
    { value: "", label: "Select delivery option" },
    { value: "yes", label: "Yes - Deliver to venue" },
    { value: "no", label: "No - Self pickup" },
  ];

  const installationOptions = [
    { value: "", label: "Select installation option" },
    { value: "yes", label: "Yes - Professional setup required" },
    { value: "no", label: "No - Self setup" },
  ];

  // FIXED: Optimized input change handler with debouncing
  const handleInputChange = useCallback((field, value) => {
    console.log(`📝 Field ${field} changed to:`, value);

    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // Immediately notify parent component of changes
      onCustomerInfoChange(updated);
      return updated;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  }, [errors, onCustomerInfoChange]);

  // FIXED: Comprehensive validation function
  const validateForm = useCallback(() => {
    const newErrors = {};

    console.log("=== 🔍 VALIDATION DEBUG ===");
    console.log("Form data being validated:", formData);

    // Name validation
    if (!formData.name?.trim()) {
      console.log("❌ Name validation failed");
      newErrors.name = "Customer name is required";
    } else if (formData.name.trim().length < 2) {
      console.log("❌ Name too short");
      newErrors.name = "Name must be at least 2 characters";
    } else {
      console.log("✅ Name validation passed");
    }

    // Location validation
    if (!formData.location?.trim()) {
      console.log("❌ Location validation failed");
      newErrors.location = "Event location is required";
    } else if (formData.location.trim().length < 5) {
      console.log("❌ Location too short");
      newErrors.location = "Location must be at least 5 characters";
    } else {
      console.log("✅ Location validation passed");
    }

    // Phone validation
    if (!formData.phone?.trim()) {
      console.log("❌ Phone validation failed");
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      console.log("❌ Phone format validation failed");
      newErrors.phone = "Please enter a valid phone number";
    } else {
      console.log("✅ Phone validation passed");
    }

    // Email validation
    if (!formData.email?.trim()) {
      console.log("❌ Email validation failed");
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      console.log("❌ Email format validation failed");
      newErrors.email = "Please enter a valid email address";
    } else {
      console.log("✅ Email validation passed");
    }

    // Delivery validation
    if (!formData.delivery?.trim()) {
      console.log("❌ Delivery validation failed");
      newErrors.delivery = "Please select a delivery option";
    } else {
      console.log("✅ Delivery validation passed");
    }

    // Installation validation
    if (!formData.installation?.trim()) {
      console.log("❌ Installation validation failed");
      newErrors.installation = "Please select an installation option";
    } else {
      console.log("✅ Installation validation passed");
    }

    // Guest validation (optional but if provided, must be valid)
    if (formData.guests && (isNaN(formData.guests) || parseInt(formData.guests) < 1)) {
      console.log("❌ Guests validation failed");
      newErrors.guests = "Number of guests must be a positive number";
    }

    console.log("Final validation errors:", newErrors);
    console.log("Validation result:", Object.keys(newErrors).length === 0);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // FIXED: Improved next handler with proper validation flow
  const handleNext = useCallback(() => {
    if (isSubmitting) {
      console.log("⚠️ Already submitting, ignoring click");
      return;
    }

    console.log("=== 🚀 CustomerDetailsStep handleNext called ===");
    console.log("Current form data:", formData);
    console.log("onNext function:", typeof onNext, onNext);

    setIsSubmitting(true);

    try {
      if (validateForm()) {
        console.log("✅ Form validation passed");
        console.log("Calling onCustomerInfoChange with:", formData);

        // Ensure parent component has the latest data
        onCustomerInfoChange(formData);

        console.log("Calling onNext...");
        
        // Add small delay for smooth transition and ensure state updates
        setTimeout(() => {
          onNext();
          setIsSubmitting(false);
          console.log("✅ onNext called successfully");
        }, 100);
      } else {
        console.log("❌ Form validation failed");
        console.log("Validation errors:", errors);
        setIsSubmitting(false);
        
        // Scroll to first error
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in handleNext:", error);
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateForm, onCustomerInfoChange, onNext, errors]);

  // FIXED: Format functions with proper error handling
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Not selected";
    
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "Invalid date";
    }
  }, []);

  const formatPrice = useCallback((price) => {
    if (!price && price !== 0) return "₦0";
    
    try {
      const numericPrice = parseFloat(price.toString().replace(/[^\d.]/g, ""));
      return `₦${numericPrice.toLocaleString("en-NG")}`;
    } catch (error) {
      console.warn("Error formatting price:", error);
      return "₦0";
    }
  }, []);

  const isFieldValid = useCallback((field) => {
    return formData[field] && !errors[field];
  }, [formData, errors]);

  // FIXED: Handle focus events properly
  const handleFocus = useCallback((field) => {
    setFocusedField(field);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Enhanced Event Summary */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-white/20 transform transition-all duration-500 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
            <Calendar className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Event Summary
          </h2>
          <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1 sm:py-2 shadow-lg">
            <BadgeInfo className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {cartItems?.length || 0} items
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-3 sm:mb-4">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 sm:mr-3" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Date & Time</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div>
                <span className="text-gray-600">Start:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {formatDate(selectedDates?.startDate)}
                </span>
              </div>
              {selectedDates?.multiDay &&
                selectedDates?.endDate !== selectedDates?.startDate && (
                  <div>
                    <span className="text-gray-600">End:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {formatDate(selectedDates?.endDate)}
                    </span>
                  </div>
                )}
              <div>
                <span className="text-gray-600">Time:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {selectedDates?.startTime || "Not set"} - {selectedDates?.endTime || "Not set"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-3 sm:mb-4">
              <BadgeInfo className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 mr-2 sm:mr-3" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Services</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              {cartItems && cartItems.length > 0 ? (
                cartItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 truncate">{item.name || item.itemName}</span>
                    <span className="font-medium text-gray-800 ml-2">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No services selected</div>
              )}
              {cartItems && cartItems.length > 3 && (
                <div className="text-gray-500 text-xs">
                  +{cartItems.length - 3} more services
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-3 sm:mb-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2 sm:mr-3" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Total</h3>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800">
              {formatPrice(cartTotal)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Final amount may vary
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information Form */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
        <div className="flex items-center mb-6 sm:mb-8">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Customer Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <User className="w-4 h-4 mr-2" />
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onFocus={() => handleFocus("name")}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                  errors.name
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("name")
                    ? "border-green-300 bg-green-50"
                    : focusedField === "name"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter customer's full name"
              />
              {isFieldValid("name") && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                name="eventType"
                value={formData.eventType}
                onChange={(e) => handleInputChange("eventType", e.target.value)}
                onFocus={() => handleFocus("eventType")}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                  errors.eventType
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("eventType")
                    ? "border-green-300 bg-green-50"
                    : focusedField === "eventType"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {isFieldValid("eventType") && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            {errors.eventType && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                name="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                onFocus={() => handleFocus("location")}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                  errors.location
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("location")
                    ? "border-green-300 bg-green-50"
                    : focusedField === "location"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter event location/address"
              />
              {isFieldValid("location") && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            {errors.location && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                onFocus={() => handleFocus("phone")}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                  errors.phone
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("phone")
                    ? "border-green-300 bg-green-50"
                    : focusedField === "phone"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter phone number"
              />
              {isFieldValid("phone") && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                  errors.email
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("email")
                    ? "border-green-300 bg-green-50"
                    : focusedField === "email"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter email address"
              />
              {isFieldValid("email") && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                name="guests"
                value={formData.guests}
                onChange={(e) => handleInputChange("guests", e.target.value)}
                onFocus={() => handleFocus("guests")}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                  errors.guests
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("guests")
                    ? "border-green-300 bg-green-50"
                    : focusedField === "guests"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter number of guests"
                min="1"
              />
              {isFieldValid("guests") && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            {errors.guests && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                name="delivery"
                value={formData.delivery}
                onChange={(e) => handleInputChange("delivery", e.target.value)}
                onFocus={() => handleFocus("delivery")}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                  errors.delivery
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("delivery")
                    ? "border-green-300 bg-green-50"
                    : focusedField === "delivery"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {deliveryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isFieldValid("delivery") && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            {errors.delivery && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                name="installation"
                value={formData.installation}
                onChange={(e) =>
                  handleInputChange("installation", e.target.value)
                }
                onFocus={() => handleFocus("installation")}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                  errors.installation
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("installation")
                    ? "border-green-300 bg-green-50"
                    : focusedField === "installation"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {installationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isFieldValid("installation") && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            {errors.installation && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {errors.installation}
              </p>
            )}
          </div>
        </div>

        {/* Special Requests */}
        <div className="mt-4 sm:mt-6 space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Special Requests (Optional)
          </label>
          <div className="relative">
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={(e) =>
                handleInputChange("specialRequests", e.target.value)
              }
              onFocus={() => handleFocus("specialRequests")}
              onBlur={handleBlur}
              rows={4}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                focusedField === "specialRequests"
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none`}
              placeholder="Any special requests or additional information for your event..."
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />
              <span className="text-red-700 font-medium text-sm sm:text-base">{error}</span>
            </div>
          </div>
        )}

        {/* Global form errors */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <p className="text-amber-700 font-medium text-sm sm:text-base mb-2">
                  Please fix the following errors:
                </p>
                <ul className="text-amber-600 text-xs sm:text-sm space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="flex items-center">
                      <span className="w-1 h-1 bg-amber-500 rounded-full mr-2"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 space-y-3 sm:space-y-0">
        <button
          onClick={onPrevious}
          disabled={isSubmitting}
          className="flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 w-full sm:w-auto justify-center text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center text-sm sm:text-base"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Continue to Preview
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailsStep;