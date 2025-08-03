// screens/user/components/DateSelectionStep.js
import React, { useState, useEffect } from "react";
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
  Heart,
  AlertCircle,
  BadgeInfo,
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
  setSelectedDates,
  clearCart,
  formatPrice,
} from "../../store/slices/cart-slice";
import ConfirmModal from "../../UI/confrimModal";
import { notifySuccess } from "../../utils/toastify";

const DateSelectionStep = ({ onNext, onAddMoreItems, error }) => {
  const dispatch = useDispatch();

  // Get cart data from Redux store
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const cartSubtotal = useSelector(selectCartSubtotal);
  const selectedDates = useSelector(selectSelectedDates);
  const cartItemCount = useSelector(selectCartItemCount);

  // Local state for form handling
  const [selectedDate, setSelectedDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Initialize form with Redux state
  useEffect(() => {
    if (selectedDates) {
      setSelectedDate(selectedDates.startDate || "");
      setEndDate(selectedDates.endDate || "");
      setStartTime(selectedDates.startTime || "09:00");
      setEndTime(selectedDates.endTime || "17:00");
      setIsMultiDay(selectedDates.multiDay || false);
    }
  }, [selectedDates]);

  // Debug cart items
  useEffect(() => {
    console.log("Cart items in DateSelectionStep:", cartItems);
    console.log("Cart total:", cartTotal);
    console.log("Cart subtotal:", cartSubtotal);
    console.log("Cart item count:", cartItemCount);
  }, [cartItems, cartTotal, cartSubtotal, cartItemCount]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();

  // Handle cart operations using Redux actions
  const handleRemoveItem = (cartId) => {
    setConfirmModal({ type: "remove", id: cartId });
  };

  const handleIncrementQuantity = (cartId) => {
    console.log("Incrementing quantity for cartId:", cartId);
    dispatch(incrementQuantity(cartId));
  };

  const handleDecrementQuantity = (cartId) => {
    console.log("Decrementing quantity for cartId:", cartId);
    dispatch(decrementQuantity(cartId));
  };

  const handleClearCart = () => {
    setConfirmModal({ type: "clear" });
  };

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

  // Generate calendar days with enhanced logic
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
    // FIX: Use local date without timezone conversion
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;
    
    // FIX: Use proper local date string format
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const isSelected = selectedDate === dateString;
    const isEndDateSelected = endDate === dateString;
    const isInRange =
      selectedDate &&
      endDate &&
      date >= new Date(selectedDate) &&
      date <= new Date(endDate);

    days.push({
      day,
      date,
      isToday,
      isPast,
      isSelected,
      isEndDateSelected,
      isInRange,
      dateString, // Use the properly formatted local date string
    });
  }

  return days;
};
const handleDateClick = (dateString) => {
  console.log('📅 Date clicked:', dateString, 'Multi-day:', isMultiDay);
  
  if (isMultiDay) {
    if (!selectedDate || (selectedDate && endDate)) {
      // Starting fresh selection
      setSelectedDate(dateString);
      setEndDate("");
      console.log('📅 Set start date:', dateString);
    } else if (selectedDate && !endDate) {
      // Selecting end date
      if (new Date(dateString) >= new Date(selectedDate)) {
        setEndDate(dateString);
        console.log('📅 Set end date:', dateString);
      } else {
        // Selected date is before start date, so make it the new start date
        setSelectedDate(dateString);
        setEndDate("");
        console.log('📅 Reset to new start date:', dateString);
      }
    }
  } else {
    // Single day event
    setSelectedDate(dateString);
    setEndDate(dateString); // For single day, end date = start date
    console.log('📅 Set single day date:', dateString);
  }
};

const validateForm = () => {
  const newErrors = {};

  if (!selectedDate) {
    newErrors.date = "Please select a start date";
  }

  if (isMultiDay && !endDate) {
    newErrors.endDate = "Please select an end date";
  }

  if (!startTime) {
    newErrors.startTime = "Please select a start time";
  }

  if (!endTime) {
    newErrors.endTime = "Please select an end time";
  }

  if (startTime && endTime && startTime >= endTime) {
    newErrors.timeRange = "End time must be after start time";
  }

  if (cartItems.length === 0) {
    newErrors.cart = "Please add at least one item to your cart";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleNext = () => {
  if (validateForm()) {
    // FIX: Properly format the dates before dispatching
    const dateData = {
      startDate: selectedDate,
      endDate: isMultiDay ? endDate : selectedDate, // Ensure endDate is set for single day
      startTime,
      endTime,
      multiDay: isMultiDay,
    };
    
    console.log('📅 Dispatching date data:', dateData);
    
    // Update Redux store with selected dates
    dispatch(setSelectedDates(dateData));
    onNext();
  }
};

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-4 sm:space-y-8 animate-fadeIn px-2 sm:px-0">
      {/* Enhanced Cart Summary - Mobile Optimized */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-white/20 transform transition-all duration-500 hover:shadow-2xl">
        {/* Mobile Cart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
            <div className="relative mr-2 sm:mr-3">
              <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />
              {cartItemCount > 0 && (
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {cartItemCount}
                  </span>
                </div>
              )}
            </div>
            <span className="text-sm sm:text-base">
              Your Cart ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
            </span>
          </h2>
          
          {/* Mobile Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onAddMoreItems}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center group text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add More Items
            </button>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center group"
                title="Clear Cart"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">
              Add some items to get started with your event booking
            </p>
            <button
              onClick={onAddMoreItems}
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Browse Items
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {cartItems.map((item, index) => {
              const cartId = item.cartId || item.id || `cart-${index}`;
              const itemName = item.itemName || item.name || "Unknown Item";
              const itemPrice = item.price || 0;
              const itemQuantity = item.quantity || 1;
              const itemImage =
                item.image ||
                item.imageUrl ||
                "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop";
              const itemDuration = item.duration || 1;
              const orderMode = item.orderMode || "booking";

              return (
                <div
                  key={cartId}
                  className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-6 transition-all duration-300 hover:shadow-lg border border-gray-100"
                >
                  {/* Mobile Cart Item Layout */}
                  <div className="flex items-start space-x-3 sm:space-x-0 sm:items-center sm:justify-between">
                    {/* Item Image and Info */}
                    <div className="flex items-start sm:items-center flex-1 space-x-3 sm:space-x-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover sm:mr-6 shadow-md"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop";
                          }}
                        />
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Star className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-lg mb-1 truncate">
                          {itemName}
                        </h3>
                        <p className="text-green-600 font-bold text-base sm:text-xl">
                          {formatPrice(itemPrice)}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                          Duration: {itemDuration} {orderMode === "booking" ? "hour(s)" : "day(s)"}
                        </p>
                        
                        {/* Mobile Quantity Controls */}
                        <div className="flex items-center justify-between mt-2 sm:mt-2">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleDecrementQuantity(cartId)}
                              className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="mx-2 sm:mx-4 font-semibold text-gray-700 min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base">
                              {itemQuantity}
                            </span>
                            <button
                              onClick={() => handleIncrementQuantity(cartId)}
                              className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600 text-xs sm:text-sm">
                              = {formatPrice(itemPrice * itemQuantity)}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(cartId)}
                              className="p-1 sm:p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                              title="Remove from cart"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile Cart Total */}
        {cartItems.length > 0 && (
          <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-medium text-gray-700">
                  Subtotal:
                </span>
                <span className="text-lg sm:text-xl font-semibold text-gray-800">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg sm:text-xl font-semibold text-gray-800">
                  Total (Tax Included):
                </span>
                <span className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Total items: {cartItemCount} • Total value: {formatPrice(cartTotal)}
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

      {/* Date and Time Selection - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Date Selection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-white/20 transform transition-all duration-500 hover:shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <Calendar className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
              Select Date
            </h2>
            <div className="flex items-center space-x-2 sm:space-x-6 bg-gray-100 rounded-xl sm:rounded-2xl p-1 sm:p-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="dateType"
                  checked={!isMultiDay}
                  onChange={() => {
                    setIsMultiDay(false);
                    setEndDate("");
                  }}
                  className="sr-only"
                />
                <div
                  className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base ${
                    !isMultiDay
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Single Day
                </div>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="dateType"
                  checked={isMultiDay}
                  onChange={() => setIsMultiDay(true)}
                  className="sr-only"
                />
                <div
                  className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base ${
                    isMultiDay
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Multi Day
                </div>
              </label>
            </div>
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
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h3 className="text-base sm:text-xl font-bold text-gray-800 px-2 sm:px-4">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => handleMonthChange("next")}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Calendar Grid - Mobile Optimized */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2 sm:py-3"
              >
                {day}
              </div>
            ))}
          </div>

          <div
            className={`grid grid-cols-7 gap-1 sm:gap-2 transition-all duration-300 ${
              isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <button
                    onClick={() =>
                      !day.isPast && handleDateClick(day.dateString)
                    }
                    disabled={day.isPast}
                    className={`w-full h-full rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      day.isPast
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : day.isSelected
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110"
                        : day.isEndDateSelected
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

          {errors.date && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-600 text-sm">{errors.date}</p>
            </div>
          )}
          {errors.endDate && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-600 text-sm">{errors.endDate}</p>
            </div>
          )}
        </div>

        {/* Time Selection - Mobile Optimized */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-white/20 transform transition-all duration-500 hover:shadow-2xl">
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-8 flex items-center">
            <Clock className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-purple-600" />
            Select Time
          </h2>

          <div className="space-y-4 sm:space-y-8">
            {/* Start Time */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Start Time
              </label>
              <label className="relative block cursor-pointer">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg font-medium pr-10 sm:pr-12"
                />
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover:text-blue-500 transition-colors duration-300" />
              </label>
              {errors.startTime && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <p className="text-red-600 text-sm">{errors.startTime}</p>
                </div>
              )}
            </div>

            {/* End Time */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                End Time
              </label>
              <label className="relative block cursor-pointer">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-base sm:text-lg font-medium pr-10 sm:pr-12"
                />
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover:text-purple-500 transition-colors duration-300" />
              </label>
              {errors.endTime && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <p className="text-red-600 text-sm">{errors.endTime}</p>
                </div>
              )}
            </div>

            {/* Time Range Error */}
            {errors.timeRange && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-600 text-sm">{errors.timeRange}</p>
              </div>
            )}
          </div>

          {/* Selected Date Summary - Mobile Optimized */}
          {selectedDate && (
            <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-200">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2 sm:mb-4 flex items-center">
                <BadgeInfo className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500" />
                Selected Date(s):
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <p className="text-blue-700">
                  <span className="font-medium">Start:</span>{" "}
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {isMultiDay && endDate && (
                  <p className="text-blue-700">
                    <span className="font-medium">End:</span>{" "}
                    {new Date(endDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {startTime && endTime && (
                  <p className="text-blue-700">
                    <span className="font-medium">Time:</span> {startTime} - {endTime}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-shake flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-600 text-center font-medium text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Enhanced Continue Button - Mobile Optimized */}
      <div className="flex justify-center sm:justify-end">
        <button
          onClick={handleNext}
          disabled={
            !selectedDate || !startTime || !endTime || cartItems.length === 0
          }
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-base sm:text-lg disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <span className="relative z-10">
            Continue to Customer Details
            {cartItems.length > 0 && (
              <span className="ml-2 text-sm opacity-80 hidden sm:inline">
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

export default DateSelectionStep;