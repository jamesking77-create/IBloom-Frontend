// screens/user/components/DateSelectionStep.js - ENHANCED WITH UNIVERSAL IMAGE SUPPORT
// Optimized for all screen sizes: mobile (320px+), tablet, desktop, and large screens
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
  updateQuantity,
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
  const [quantityInputs, setQuantityInputs] = useState({}); // Track individual quantity inputs

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

  // ENHANCED: Function to get all available images for an item
  const getItemImages = (item) => {
    const availableImages = [];
    
    console.log('🖼️ Getting images for item:', {
      name: item.name || item.itemName,
      hasImage: !!item.image,
      hasImagesObject: !!(item.images && typeof item.images === 'object'),
      hasImagesArray: !!(item.images && Array.isArray(item.images)),
      hasImage1: !!item.image1,
      itemImages: item.images
    });
    
    // Priority 1: Handle new structure (item.images object) FIRST for new items
    if (item.images && typeof item.images === 'object') {
      if (item.images.image1) {
        availableImages.push(item.images.image1);
        console.log('✅ Added images.image1:', item.images.image1);
      }
      if (item.images.image2) {
        availableImages.push(item.images.image2);
        console.log('✅ Added images.image2:', item.images.image2);
      }
      if (item.images.image3) {
        availableImages.push(item.images.image3);
        console.log('✅ Added images.image3:', item.images.image3);
      }
    }
    
    // Priority 2: Handle old structure (direct image1, image2, image3 fields)
    if (item.image1 && !availableImages.includes(item.image1)) {
      availableImages.push(item.image1);
      console.log('✅ Added image1:', item.image1);
    }
    if (item.image2 && !availableImages.includes(item.image2)) {
      availableImages.push(item.image2);
      console.log('✅ Added image2:', item.image2);
    }
    if (item.image3 && !availableImages.includes(item.image3)) {
      availableImages.push(item.image3);
      console.log('✅ Added image3:', item.image3);
    }
    
    // Priority 3: Check single image (for backward compatibility with truly old items)
    if (item.image && !availableImages.includes(item.image)) {
      availableImages.push(item.image);
      console.log('✅ Added single image:', item.image);
    }
    
    // Priority 4: Handle array structure (item.images as array)
    if (item.images && Array.isArray(item.images)) {
      item.images.forEach((img, index) => {
        if (img && !availableImages.includes(img)) {
          availableImages.push(img);
          console.log(`✅ Added array image ${index + 1}:`, img);
        }
      });
    }
    
    // Priority 5: Check other legacy fields
    if (item.imageUrl && !availableImages.includes(item.imageUrl)) {
      availableImages.push(item.imageUrl);
      console.log('✅ Added imageUrl:', item.imageUrl);
    }
    
    // Return at least one image (fallback)
    if (availableImages.length === 0) {
      availableImages.push("https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop");
      console.log('⚠️ Using fallback image');
    }
    
    console.log('🖼️ Final images array:', availableImages);
    return availableImages;
  };

  // Helper function to get primary image (for fallback compatibility)
  const getItemImage = (item) => {
    const images = getItemImages(item);
    return images[0]; // Just return the first image from our comprehensive list
  };

  // FIXED: Helper function to safely get numeric price
  const getNumericPrice = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[₦\s,]/g, '')) || 0;
    }
    return parseFloat(price) || 0;
  };

  // ENHANCED: Cart Item Component with Image Carousel
  const CartItemComponent = ({ item, index }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const cartId = item.cartId || item.id || `cart-${index}`;
    const itemName = item.itemName || item.name || "Unknown Item";
    const itemPrice = getNumericPrice(item.price);
    const itemQuantity = item.quantity || 1;
    const itemDuration = item.duration || 1;
    const orderMode = item.orderMode || "booking";
    
    // Get all available images
    const availableImages = getItemImages(item);
    const hasMultipleImages = availableImages.length > 1;
    
    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
    };
    
    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
    };

    console.log('🛒 Rendering cart item:', {
      name: itemName,
      originalPrice: item.price,
      processedPrice: itemPrice,
      quantity: itemQuantity,
      imageCount: availableImages.length,
      hasMultiple: hasMultipleImages
    });

    return (
      <div className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
        {/* Enhanced Mobile Cart Item Layout */}
        <div className="flex items-start space-x-3">
          
          {/* Enhanced Item Image with Carousel */}
          <div className="relative flex-shrink-0">
            <img
              src={availableImages[currentImageIndex]}
              alt={`${itemName} - Image ${currentImageIndex + 1}`}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover shadow-md transition-all duration-300"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop";
              }}
            />
            
            {/* Image Navigation Arrows - Only show if multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/80"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/80"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </>
            )}
            
            {/* Image Counter - Only show if multiple images */}
            {hasMultipleImages && (
              <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {currentImageIndex + 1}
              </div>
            )}
            
            {/* Image Indicators - Show dots for multiple images */}
            {hasMultipleImages && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {availableImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      idx === currentImageIndex 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Star Badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Star className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
          </div>
          
          {/* Item Info and Controls Container */}
          <div className="flex-1 min-w-0 space-y-3">
            
            {/* Item Details */}
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg mb-1 truncate">
                  {itemName}
                </h3>
                {/* Show image count if multiple images */}
                {hasMultipleImages && (
                  <p className="text-blue-500 text-xs mb-1">
                    {availableImages.length} images available
                  </p>
                )}
                <p className="text-green-600 font-bold text-base sm:text-lg md:text-xl">
                  {formatPrice(itemPrice)}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Duration: {itemDuration} {orderMode === "booking" ? "hour(s)" : "day(s)"}
                </p>
              </div>
              
              {/* Remove Button - Top Right */}
              <button
                onClick={() => handleRemoveItem(cartId)}
                className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                title="Remove from cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quantity Controls and Total - Better Mobile Layout */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              
              {/* Quantity Controls */}
              <div className="flex items-center justify-center sm:justify-start">
                <button
                  onClick={() => handleDecrementQuantity(cartId)}
                  disabled={itemQuantity <= 1}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                
                {/* Quantity Input */}
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={quantityInputs[cartId] !== undefined ? quantityInputs[cartId] : itemQuantity}
                  onChange={(e) => handleQuantityInputChange(cartId, e.target.value)}
                  onFocus={(e) => {
                    handleQuantityInputFocus(cartId, itemQuantity);
                    e.target.select();
                  }}
                  onBlur={() => handleQuantityInputBlur(cartId, itemQuantity)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    }
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                      e.preventDefault();
                    }
                  }}
                  className="mx-3 w-12 sm:w-14 text-center font-semibold text-gray-700 text-sm bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300 py-2"
                  title="Click to edit quantity directly"
                />
                
                <button
                  onClick={() => handleIncrementQuantity(cartId)}
                  className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Item Total - Better Responsive Display */}
              <div className="text-center sm:text-right flex-shrink-0">
                <div className="text-gray-600 text-sm font-medium">
                  <span className="text-gray-500">Total: </span>
                  <span className="text-green-600 font-semibold">
                    {formatPrice(itemPrice * itemQuantity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle cart operations using Redux actions
  const handleRemoveItem = (cartId) => {
    setConfirmModal({ type: "remove", id: cartId });
  };

  const handleIncrementQuantity = (cartId) => {
    console.log("Incrementing quantity for cartId:", cartId);
    // Clear local input state when using buttons
    setQuantityInputs(prev => {
      const newState = { ...prev };
      delete newState[cartId];
      return newState;
    });
    dispatch(incrementQuantity(cartId));
  };

  const handleDecrementQuantity = (cartId) => {
    console.log("Decrementing quantity for cartId:", cartId);
    // Clear local input state when using buttons
    setQuantityInputs(prev => {
      const newState = { ...prev };
      delete newState[cartId];
      return newState;
    });
    dispatch(decrementQuantity(cartId));
  };

  // NEW: Handle direct quantity input with improved validation
  const handleQuantityInputChange = (cartId, newQuantity) => {
    const rawValue = newQuantity.toString().trim();
    
    // Allow empty input temporarily (user is typing)
    if (rawValue === '') {
      setQuantityInputs(prev => ({ ...prev, [cartId]: '' }));
      return;
    }
    
    const quantity = parseInt(rawValue);
    console.log("Direct quantity change for cartId:", cartId, "new quantity:", quantity);
    
    // Validate quantity
    if (isNaN(quantity)) {
      return; // Don't update if not a number
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
    
    // Update local input state and Redux
    setQuantityInputs(prev => ({ ...prev, [cartId]: quantity.toString() }));
    dispatch(updateQuantity({ itemId: cartId, quantity }));
  };

  // Handle quantity input focus
  const handleQuantityInputFocus = (cartId, currentQuantity) => {
    setQuantityInputs(prev => ({ ...prev, [cartId]: currentQuantity.toString() }));
  };

  // Handle quantity input blur
  const handleQuantityInputBlur = (cartId, currentQuantity) => {
    const inputValue = quantityInputs[cartId];
    
    if (!inputValue || inputValue === '' || isNaN(parseInt(inputValue))) {
      // Reset to current quantity if invalid
      setQuantityInputs(prev => ({ ...prev, [cartId]: currentQuantity.toString() }));
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Container with proper responsive padding */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-12 max-w-7xl">
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fadeIn">
          
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

          {/* Enhanced Cart Summary - Fully Responsive */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/30 transform transition-all duration-500 hover:shadow-xl lg:hover:shadow-3xl">
            
            {/* Cart Header - Responsive Layout */}
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
                  Your Cart ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
                </span>
              </h2>
              
              {/* Action Buttons - Responsive */}
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

            {cartItems.length === 0 ? (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base md:text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  Add some items to get started with your event booking
                </p>
                <button
                  onClick={onAddMoreItems}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Browse Items
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item, index) => (
                  <CartItemComponent
                    key={item.cartId || item.id || `cart-${index}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Cart Total - Responsive */}
            {cartItems.length > 0 && (
              <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
                      Subtotal:
                    </span>
                    <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                      Total (Tax Included):
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
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

          {/* Date and Time Selection - Responsive Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            
            {/* Date Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-white/30 transform transition-all duration-500 hover:shadow-xl">
              
              {/* Date Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-0">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600" />
                  Select Date
                </h2>
                
                {/* Date Type Toggle - Responsive */}
                <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 rounded-lg sm:rounded-xl p-1">
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
                      className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base ${
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
                      className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base ${
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

              {/* Calendar Day Names - Responsive */}
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

              {/* Calendar Grid - Enhanced Responsive */}
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

              {/* Date Errors */}
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

            {/* Time Selection - Enhanced Responsive */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-white/30 transform transition-all duration-500 hover:shadow-xl">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 md:mb-8 flex items-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                Select Time
              </h2>

              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {/* Start Time */}
                <div className="group">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">
                    Start Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base md:text-lg font-medium pr-10 sm:pr-12"
                    />
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover:text-blue-500 transition-colors duration-300" />
                  </div>
                  {errors.startTime && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      <p className="text-red-600 text-sm">{errors.startTime}</p>
                    </div>
                  )}
                </div>

                {/* End Time */}
                <div className="group">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">
                    End Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-sm sm:text-base md:text-lg font-medium pr-10 sm:pr-12"
                    />
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover:text-purple-500 transition-colors duration-300" />
                  </div>
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

              {/* Selected Date Summary - Enhanced Responsive */}
              {selectedDate && (
                <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-200">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-800 mb-2 sm:mb-3 md:mb-4 flex items-center">
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

          {/* Enhanced Continue Button - Fully Responsive */}
          <div className="flex justify-center lg:justify-end pt-4 sm:pt-6">
            <button
              onClick={handleNext}
              disabled={
                !selectedDate || !startTime || !endTime || cartItems.length === 0
              }
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base md:text-lg disabled:cursor-not-allowed w-full sm:w-auto max-w-md sm:max-w-none"
            >
              <span className="relative z-10 flex items-center justify-center">
                <span>Continue to Customer Details</span>
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
      </div>
    </div>
  );
};

export default DateSelectionStep;