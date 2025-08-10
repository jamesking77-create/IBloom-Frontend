// components/users/OrderDateCustomerStep.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Calendar,
  Clock,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertCircle,
  BadgeInfo,
  User,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Truck,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  selectCartItems,
  selectCartTotal,
  selectCartSubtotal,
  selectSelectedDates,
  selectCartItemCount,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  updateQuantity,
  setSelectedDates,
  clearCart,
  formatPrice,
} from "../../store/slices/cart-slice";
import ConfirmModal from "../../UI/confrimModal";
import { notifySuccess } from "../../utils/toastify";

const OrderDateCustomerStep = ({
  customerInfo,
  selectedDates,
  onDateChange,
  onCustomerInfoChange,
  onNext,
  onAddMoreItems,
  onRemoveItem,
  onIncrementQuantity,
  onDecrementQuantity,
  cartItems,
  cartTotal,
  error,
  warehouseInfo,
}) => {
  const dispatch = useDispatch();

  // Get cart data from Redux store
  const cartSubtotal = useSelector(selectCartSubtotal);
  const cartItemCount = useSelector(selectCartItemCount);

  // Local state for date selection
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [quantityInputs, setQuantityInputs] = useState({});
  
  // NEW: Multi-day selection mode toggle
  const [isMultiDay, setIsMultiDay] = useState(true);

  // Local state for customer information
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

  const [focusedField, setFocusedField] = useState(null);

  // Initialize dates and form with Redux state
  useEffect(() => {
    if (selectedDates) {
      setStartDate(selectedDates.startDate || "");
      setEndDate(selectedDates.endDate || "");
      
      // Auto-detect if it's multi-day or single day based on existing selection
      if (selectedDates.startDate && selectedDates.endDate) {
        const start = new Date(selectedDates.startDate);
        const end = new Date(selectedDates.endDate);
        setIsMultiDay(start.getTime() !== end.getTime());
      }
    }
  }, [selectedDates]);

  useEffect(() => {
    if (customerInfo) {
      setFormData({
        name: customerInfo.name || "",
        eventType: customerInfo.eventType || "",
        location: customerInfo.location || "",
        phone: customerInfo.phone || "",
        email: customerInfo.email || "",
        guests: customerInfo.guests || "",
        specialRequests: customerInfo.specialRequests || "",
        delivery: customerInfo.delivery || "",
        installation: customerInfo.installation || "",
      });
    }
  }, [customerInfo]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();

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
    "Personal Use",
    "Other",
  ];

  const deliveryOptions = [
    { value: "", label: "Select delivery option" },
    { value: "yes", label: "Yes - Deliver to location" },
    { value: "no", label: "No - Self pickup from warehouse" },
  ];

  const installationOptions = [
    { value: "", label: "Select setup option" },
    { value: "yes", label: "Yes - Professional setup required" },
    { value: "no", label: "No - Self setup" },
  ];

  // Helper function to safely get numeric price
  const getNumericPrice = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[₦\s,]/g, '')) || 0;
    }
    return parseFloat(price) || 0;
  };

  // Date handling functions
  const handleMonthChange = (direction) => {
    setIsAnimating(true);
    setTimeout(() => {
      if (direction === "next") {
        setCurrentMonth(
          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
        );
      } else {
        setCurrentMonth(
          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
        );
      }
      setIsAnimating(false);
    }, 150);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isStartSelected = startDate === dateString;
      const isEndSelected = endDate === dateString;
      
      // For range calculation, handle both single and multi-day
      let isInRange = false;
      if (startDate && endDate && isMultiDay) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        isInRange = date >= start && date <= end && !isStartSelected && !isEndSelected;
      }

      days.push({
        day,
        date,
        isToday,
        isPast,
        isStartSelected,
        isEndSelected,
        isInRange,
        dateString,
      });
    }

    return days;
  };

  // NEW: Improved date click handler for both single and multi-day
  const handleDateClick = (dateString) => {
    console.log('📅 Date clicked:', dateString, 'Mode:', isMultiDay ? 'Multi-day' : 'Single-day');
    
    if (isMultiDay) {
      // Multi-day selection logic
      if (!startDate || (startDate && endDate)) {
        // Starting fresh selection
        setStartDate(dateString);
        setEndDate("");
        console.log('📅 Multi-day: Set start date:', dateString);
      } else if (startDate && !endDate) {
        // Selecting end date
        if (new Date(dateString) >= new Date(startDate)) {
          setEndDate(dateString);
          console.log('📅 Multi-day: Set end date:', dateString);
        } else {
          // Selected date is before start date, so make it the new start date
          setStartDate(dateString);
          setEndDate("");
          console.log('📅 Multi-day: Reset to new start date:', dateString);
        }
      }
    } else {
      // Single-day selection logic
      setStartDate(dateString);
      setEndDate(dateString); // Same as start date for single day
      console.log('📅 Single-day: Set date:', dateString);
    }
    
    // Clear date errors when user selects dates
    if (errors.startDate || errors.endDate) {
      setErrors(prev => ({
        ...prev,
        startDate: "",
        endDate: "",
        dateRange: ""
      }));
    }
  };

  // NEW: Toggle between single and multi-day mode
  const handleModeToggle = () => {
    const newMode = !isMultiDay;
    setIsMultiDay(newMode);
    
    if (!newMode && startDate && !endDate) {
      // Switching to single-day mode with only start date selected
      setEndDate(startDate);
    } else if (!newMode && startDate && endDate && startDate !== endDate) {
      // Switching to single-day mode with range selected - keep start date
      setEndDate(startDate);
    }
    
    console.log('🔄 Mode switched to:', newMode ? 'Multi-day' : 'Single-day');
    
    // Clear any date-related errors
    setErrors(prev => ({
      ...prev,
      startDate: "",
      endDate: "",
      dateRange: ""
    }));
  };

  // Customer info handling
  const handleInputChange = useCallback((field, value) => {
    console.log(`📝 Field ${field} changed to:`, value);

    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
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

  // Cart operations
  const handleRemoveItem = (cartId) => {
    setConfirmModal({ type: "remove", id: cartId });
  };

  const handleIncrementQuantity = (cartId) => {
    setQuantityInputs(prev => {
      const newState = { ...prev };
      delete newState[cartId];
      return newState;
    });
    dispatch(incrementQuantity(cartId));
  };

  const handleDecrementQuantity = (cartId) => {
    setQuantityInputs(prev => {
      const newState = { ...prev };
      delete newState[cartId];
      return newState;
    });
    dispatch(decrementQuantity(cartId));
  };

  const handleQuantityInputChange = (cartId, newQuantity) => {
    const rawValue = newQuantity.toString().trim();
    
    if (rawValue === '') {
      setQuantityInputs(prev => ({ ...prev, [cartId]: '' }));
      return;
    }
    
    const quantity = parseInt(rawValue);
    
    if (isNaN(quantity)) {
      return;
    }
    
    if (quantity < 1) {
      setQuantityInputs(prev => ({ ...prev, [cartId]: '1' }));
      dispatch(updateQuantity({ itemId: cartId, quantity: 1 }));
      return;
    }
    
    if (quantity > 999) {
      setQuantityInputs(prev => ({ ...prev, [cartId]: '999' }));
      dispatch(updateQuantity({ itemId: cartId, quantity: 999 }));
      return;
    }
    
    setQuantityInputs(prev => ({ ...prev, [cartId]: quantity.toString() }));
    dispatch(updateQuantity({ itemId: cartId, quantity }));
  };

  const handleQuantityInputFocus = (cartId, currentQuantity) => {
    setQuantityInputs(prev => ({ ...prev, [cartId]: currentQuantity.toString() }));
  };

  const handleQuantityInputBlur = (cartId, currentQuantity) => {
    const inputValue = quantityInputs[cartId];
    
    if (!inputValue || inputValue === '' || isNaN(parseInt(inputValue))) {
      setQuantityInputs(prev => ({ ...prev, [cartId]: currentQuantity.toString() }));
    }
  };

  const handleClearCart = () => {
    setConfirmModal({ type: "clear" });
  };

  // Validation and form submission
  const validateForm = () => {
    const newErrors = {};

    // Date validation - improved for both modes
    if (!startDate) {
      newErrors.startDate = isMultiDay 
        ? "Please select a start date" 
        : "Please select a date";
    }

    if (isMultiDay && !endDate) {
      newErrors.endDate = "Please select an end date";
    }

    if (isMultiDay && startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.dateRange = "End date must be after start date";
    }

    // Customer info validation
    if (!formData.name?.trim()) {
      newErrors.name = "Customer name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.delivery?.trim()) {
      newErrors.delivery = "Please select a delivery option";
    }

    if (!formData.installation?.trim()) {
      newErrors.installation = "Please select a setup option";
    }

    if (cartItems.length === 0) {
      newErrors.cart = "Please add at least one item to your cart";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Update dates in Redux - improved for both modes
      const dateData = {
        startDate,
        endDate: isMultiDay ? endDate : startDate, // For single day, end date = start date
        multiDay: isMultiDay,
      };
      
      console.log('📅 Dispatching date data:', dateData);
      onDateChange(dateData);
      
      onNext();
    }
  };

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

  // NEW: Calculate duration for display
  const calculateDuration = useCallback(() => {
    if (!startDate) return 0;
    
    if (!isMultiDay) return 1;
    
    if (!endDate) return 1;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate, isMultiDay]);

  const isFieldValid = useCallback((field) => {
    return formData[field] && !errors[field];
  }, [formData, errors]);

  const handleFocus = useCallback((field) => {
    setFocusedField(field);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = generateCalendarDays();
  const duration = calculateDuration();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hide number input spinners */}
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Warehouse Info Summary */}
      {warehouseInfo && (
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Pickup Location: {warehouseInfo.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="font-medium text-gray-800">{warehouseInfo.address}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-gray-600 mb-1">Operating Hours</p>
              <p className="font-medium text-gray-800">{warehouseInfo.operatingHours?.weekdays}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cart Summary */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/30">
        
        {/* Cart Header */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
            <div className="relative mr-2 sm:mr-3">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-600" />
              {cartItemCount > 0 && (
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {cartItemCount}
                  </span>
                </div>
              )}
            </div>
            <span className="text-sm sm:text-base lg:text-lg">
              Your Order ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
            </span>
          </h2>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onAddMoreItems}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center group text-xs sm:text-sm md:text-base"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden xs:inline">Add More Items</span>
              <span className="xs:hidden">Add Items</span>
            </button>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center group"
                title="Clear Cart"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        {cartItems.length > 0 && (
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {cartItems.map((item) => (
              <div
                key={item.cartId}
                className="bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Item Image */}
                  <div className="flex-shrink-0 w-full sm:w-20 md:w-24 lg:w-28">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop'}
                      alt={item.name}
                      className="w-full h-32 sm:h-20 md:h-24 lg:h-28 object-cover rounded-lg sm:rounded-xl"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop';
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-green-600 mt-2">
                          {formatPrice(item.price)} per day
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="flex items-center bg-white border border-gray-300 rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleDecrementQuantity(item.cartId)}
                            className="px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 border-r border-gray-200"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={quantityInputs[item.cartId] !== undefined 
                              ? quantityInputs[item.cartId] 
                              : item.quantity
                            }
                            onChange={(e) => handleQuantityInputChange(item.cartId, e.target.value)}
                            onFocus={() => handleQuantityInputFocus(item.cartId, item.quantity)}
                            onBlur={() => handleQuantityInputBlur(item.cartId, item.quantity)}
                            className="w-12 sm:w-16 text-center py-1 sm:py-2 text-sm sm:text-base font-semibold text-gray-800 border-0 focus:outline-none focus:ring-0"
                          />
                          <button
                            onClick={() => handleIncrementQuantity(item.cartId)}
                            className="px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 border-l border-gray-200"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.cartId)}
                          className="p-1 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 group"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">
                          Subtotal ({item.quantity} item{item.quantity !== 1 ? 's' : ''}):
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-gray-800">
                          {formatPrice(getNumericPrice(item.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Total */}
        {cartItems.length > 0 && (
          <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
                  Subtotal (per day):
                </span>
                <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                  Daily Rate:
                </span>
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Total items: {cartItemCount} • Final cost will depend on rental duration
              </p>
            </div>
          </div>
        )}

        {errors.cart && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600 text-sm">{errors.cart}</p>
          </div>
        )}
      </div>

      {/* Date Selection and Customer Details Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        
        {/* Date Selection */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-white/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-0">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600" />
              Rental Period
            </h2>
            
            {/* NEW: Single/Multi-day Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Single Day</span>
              <button
                onClick={handleModeToggle}
                className="relative inline-flex items-center"
              >
                {isMultiDay ? (
                  <ToggleRight className="w-8 h-8 text-blue-600 hover:text-blue-700 transition-colors" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400 hover:text-gray-500 transition-colors" />
                )}
              </button>
              <span className="text-sm font-medium text-gray-700">Multi-day</span>
            </div>
          </div>

          {/* Mode Indicator */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800 font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {isMultiDay 
                ? "Multi-day rental mode: Select start and end dates for your rental period"
                : "Single-day rental mode: Select one date for your rental"
              }
            </p>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => handleMonthChange("prev")}
              disabled={
                currentMonth.getMonth() === currentMonthIndex &&
                currentMonth.getFullYear() === currentYear
              }
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 px-2 sm:px-4">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => handleMonthChange("next")}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Calendar Day Names */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2 sm:py-3"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 2)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            className={`grid grid-cols-7 gap-1 sm:gap-2 transition-all duration-300 ${
              isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <button
                    onClick={() => !day.isPast && handleDateClick(day.dateString)}
                    disabled={day.isPast}
                    className={`w-full h-full rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      day.isPast
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : day.isStartSelected
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110"
                        : day.isEndSelected
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-110"
                        : day.isInRange
                        ? "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800"
                        : day.isToday
                        ? "bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-2 border-orange-400"
                        : "hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 text-gray-700"
                    }`}
                  >
                    {day.day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Date Errors */}
          {(errors.startDate || errors.endDate || errors.dateRange) && (
            <div className="mt-4 space-y-2">
              {errors.startDate && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-600 text-sm">{errors.startDate}</p>
                </div>
              )}
              {errors.endDate && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-600 text-sm">{errors.endDate}</p>
                </div>
              )}
              {errors.dateRange && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-600 text-sm">{errors.dateRange}</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Date Summary */}
          {startDate && (
            <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-200">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-800 mb-2 sm:mb-3 md:mb-4 flex items-center">
                <BadgeInfo className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500" />
                Selected Rental Period:
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                {isMultiDay ? (
                  <>
                    <p className="text-blue-700">
                      <span className="font-medium">Start Date:</span> {formatDate(startDate)}
                    </p>
                    {endDate && (
                      <p className="text-blue-700">
                        <span className="font-medium">End Date:</span> {formatDate(endDate)}
                      </p>
                    )}
                    <p className="text-blue-700">
                      <span className="font-medium">Duration:</span> {duration} day{duration !== 1 ? "s" : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-blue-700">
                      <span className="font-medium">Rental Date:</span> {formatDate(startDate)}
                    </p>
                    <p className="text-blue-700">
                      <span className="font-medium">Duration:</span> 1 day
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-white/30">
          <div className="flex items-center mb-6 sm:mb-8">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Customer Information
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
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
                  placeholder="Enter your full name"
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
                  onChange={(e) => handleInputChange("installation", e.target.value)}
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

            {/* Event Type (Optional) */}
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
                    focusedField === "eventType"
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
              </div>
            </div>

            {/* Location Field (if delivery is required) */}
            {formData.delivery === "yes" && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 mr-2" />
                  Delivery Address *
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
                    placeholder="Enter delivery address"
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
            )}

            {/* Special Requests */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Special Requests (Optional)
              </label>
              <div className="relative">
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  onFocus={() => handleFocus("specialRequests")}
                  onBlur={handleBlur}
                  rows={3}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                    focusedField === "specialRequests"
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none`}
                  placeholder="Any special requests or additional information..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-600 text-center font-medium text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center lg:justify-end pt-4 sm:pt-6">
        <button
          onClick={handleNext}
          disabled={
            !startDate || 
            (isMultiDay && !endDate) || 
            !formData.name || 
            !formData.email || 
            !formData.phone || 
            !formData.delivery || 
            !formData.installation || 
            cartItems.length === 0 || 
            (formData.delivery === "yes" && !formData.location)
          }
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base md:text-lg disabled:cursor-not-allowed w-full sm:w-auto max-w-md sm:max-w-none"
        >
          <span className="relative z-10 flex items-center justify-center">
            <span>Continue to Order Review</span>
            {cartItems.length > 0 && (
              <span className="ml-2 text-xs sm:text-sm opacity-80 hidden sm:inline">
                ({cartItemCount} items)
              </span>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          title={
            confirmModal.type === "clear"
              ? "Clear Entire Cart?"
              : "Remove This Item?"
          }
          message={
            confirmModal.type === "clear"
              ? "Are you sure you want to remove all items from your cart?"
              : "Are you sure you want to remove this item from your cart?"
          }
          onConfirm={() => {
            if (confirmModal.type === "clear") {
              dispatch(clearCart());
              notifySuccess("All Items Deleted Successfully!");
            } else {
              dispatch(removeFromCart(confirmModal.id));
              notifySuccess("Item Deleted Successfully!");
            }
            setConfirmModal(null);
          }}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};

export default OrderDateCustomerStep;