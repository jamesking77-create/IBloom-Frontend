// screens/user/EventBookingPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft, Calendar, User, Eye, Check, ShoppingCart, Sparkles, Menu, X
} from 'lucide-react';

import {
  selectCartItems,
  selectCartTotal,
  selectSelectedDates,
  selectCustomerInfo,
  selectCartStep,
  selectCartLoading,
  selectCartError,
  selectOrderMode,
  selectCartItemCount,
  setSelectedDates,
  setCustomerInfo,
  setStep,
  nextStep,
  prevStep,
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  forceResetCart,
  setOrderMode,
  formatPrice
} from '../../store/slices/cart-slice';

import {
  createBookingFromCart,
  selectCreatingBooking,
  selectBookingCreated,
  selectLastCreatedBookingId,
  resetBookingCreation
} from '../../store/slices/booking-slice';

import DateSelectionStep from '../../components/users/dateSelectionStep.jsx';
import CustomerDetailsStep from '../../components/users/customerDetailsStep.jsx';
import BookingPreviewStep from '../../components/users/bookingPreviewStep.jsx';


const EventBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedItem, category, fromBooking } = location.state || {};

  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const selectedDates = useSelector(selectSelectedDates);
  const customerInfo = useSelector(selectCustomerInfo);
  const currentStep = useSelector(selectCartStep);
  const cartLoading = useSelector(selectCartLoading);
  const cartError = useSelector(selectCartError);
  const cartItemCount = useSelector(selectCartItemCount);
  const creatingBooking = useSelector(selectCreatingBooking);
  const bookingCreated = useSelector(selectBookingCreated);
  const lastCreatedBookingId = useSelector(selectLastCreatedBookingId);

  const [localError, setLocalError] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const steps = [
    { id: 1, title: 'Date & Time', icon: Calendar, description: 'Choose when', shortTitle: 'Date' },
    { id: 2, title: 'Your Details', icon: User, description: 'Tell us about you', shortTitle: 'Details' },
    { id: 3, title: 'Review & Book', icon: Eye, description: 'Confirm everything', shortTitle: 'Review' }
  ];

  // Function to scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // FIXED: Better initialization logic that handles returning from item selection
  useEffect(() => {
    console.log('EventBookingPage initialized');
    console.log('selectedItem:', selectedItem);
    console.log('cartItems:', cartItems);
    console.log('cartItemCount:', cartItemCount);
    console.log('fromBooking:', fromBooking);
    
    // Set order mode first
    dispatch(setOrderMode('booking'));
    
    // Only add selectedItem if we have one AND we're not returning from booking flow
    if (selectedItem && !fromBooking) {
      console.log('Adding selectedItem to cart (new booking)');
      dispatch(addToCart({ 
        item: selectedItem, 
        dates: selectedDates,
        allowDuplicates: false
      }));
    }
    // If we have selectedItem and we're returning from booking, add it to existing cart
    else if (selectedItem && fromBooking) {
      console.log('Adding selectedItem to existing cart (returning from booking)');
      dispatch(addToCart({ 
        item: selectedItem, 
        dates: selectedDates,
        allowDuplicates: false
      }));
    }
    
    setInitialized(true);
  }, [selectedItem, fromBooking]);

  // NEW: Scroll to top when step changes
  useEffect(() => {
    if (initialized) {
      scrollToTop();
    }
  }, [currentStep, initialized]);

  // FIXED: Handle booking success
  useEffect(() => {
    if (bookingCreated && lastCreatedBookingId) {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        dispatch(resetBookingCreation());
        dispatch(forceResetCart());
        navigate('/booking-success', { state: { bookingId: lastCreatedBookingId } });
      }, 2000);
    }
  }, [bookingCreated, lastCreatedBookingId, dispatch, navigate]);

  const handleDateChange = (dateData) => {
    console.log('Date changed:', dateData);
    dispatch(setSelectedDates(dateData));
    setLocalError('');
  };

  const handleCustomerInfoChange = (data) => {
    console.log('Customer info changed:', data);
    dispatch(setCustomerInfo(data));
    setLocalError('');
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Check if start date is selected
      if (selectedDates?.multiDay && !selectedDates?.startDate) {
        setLocalError('Please select a start date for your event');
        return;
      }
      
      // For multi-day events, check if end date is selected
      if (selectedDates?.multiDay && !selectedDates?.endDate) {
        setLocalError('Please select an end date for your multi-day event');
        return;
      }
      
      // Check if times are selected
      if (!selectedDates?.startTime || !selectedDates?.endTime) {
        setLocalError('Please select both start and end times for your event');
        return;
      }
      
      // Check if cart has items
      if (cartItems.length === 0) {
        setLocalError('Add at least one item to your cart');
        return;
      }
      
    } 

    setLocalError('');
    dispatch(nextStep());
  };

  const handlePrevious = () => {
    setLocalError('');
    dispatch(prevStep());
  };

  const handleAddMoreItems = () => {
    setFadingOut(true);
    setTimeout(() => {
      navigate('/', { state: { scrollToCategories: true } });
    }, 700);
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleQuantityChange = (itemId, quantity) => {
    console.log('Changing quantity for item:', itemId, 'to:', quantity);
    if (quantity > 0) {
      dispatch(updateQuantity({ itemId, quantity }));
    }
  };

  const handleIncrementQuantity = (itemId) => {
    console.log('Incrementing quantity for item:', itemId);
    dispatch(incrementQuantity(itemId));
  };

  const handleDecrementQuantity = (itemId) => {
    console.log('Decrementing quantity for item:', itemId);
    dispatch(decrementQuantity(itemId));
  };

  const handleSubmitBooking = () => {
    if (cartItems.length === 0) {
      setLocalError('Your cart is empty.');
      return;
    }
    
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
      setLocalError('Please provide your name, email, and phone.');
      return;
    }
    
    if (!selectedDates?.startDate || !selectedDates?.endDate) {
      setLocalError('Select event start and end dates.');
      return;
    }

    dispatch(createBookingFromCart({
      items: cartItems,
      selectedDates,
      customerInfo: { ...customerInfo, location: customerInfo.location || 'TBD' },
      total: cartTotal,
      itemCount: cartItemCount,
      orderMode: 'booking'
    }));
  };

  const handleClearCart = () => {
    console.log('Clearing cart manually');
    dispatch(forceResetCart());
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DateSelectionStep
            onNext={handleNext}
            onAddMoreItems={handleAddMoreItems}
            error={localError}
          />
        );
      case 2:
        return (
          <CustomerDetailsStep
            customerInfo={customerInfo}
            selectedDates={selectedDates}
            onCustomerInfoChange={handleCustomerInfoChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onAddMoreItems={handleAddMoreItems}
            onRemoveItem={handleRemoveItem}
            onIncrementQuantity={handleIncrementQuantity}
            onDecrementQuantity={handleDecrementQuantity}
            cartItems={cartItems}
            cartTotal={cartTotal}
            error={localError}
          />
        );
      case 3:
        return (
          <BookingPreviewStep
            cartItems={cartItems}
            selectedDates={selectedDates}
            customerInfo={customerInfo}
            total={cartTotal}
            onSubmit={handleSubmitBooking}
            onPrevious={handlePrevious}
            onAddMoreItems={handleAddMoreItems}
            onRemoveItem={handleRemoveItem}
            onIncrementQuantity={handleIncrementQuantity}
            onDecrementQuantity={handleDecrementQuantity}
            loading={creatingBooking}
            error={localError || cartError}
          />
        );
      default:
        return null;
    }
  };

  // Show loading while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !selectedItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🛒</div>
            <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-4">
            Start building your perfect event by adding items to your cart.
          </p>
          <button
            onClick={() => navigate('/', { state: { scrollToCategories: true } })}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition hover:scale-105 shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            Browse Categories
          </button>
        </div>
      </div>
    );
  }

  if (showSuccessAnimation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4">
        <div className="text-center">
          <div className="animate-bounce mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Booking Created!</h2>
          <p className="text-gray-600 text-sm sm:text-base">Redirecting you to confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-opacity duration-500 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Mobile Menu Overlay - ONLY SHOW ON FIRST STEP */}
      {showMobileMenu && currentStep === 1 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="bg-white h-full w-80 max-w-[85vw] shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Total Price</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {formatPrice(cartTotal)}
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-2">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-3 rounded-full hover:bg-gray-100 group transition-colors"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Event Booking
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">Create your perfect event experience</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Total Price</div>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {formatPrice(cartTotal)}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-end mt-1">
                <ShoppingCart className="w-4 h-4 mr-1" />
                {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-center">
            <div className="flex items-center flex-1">
              <button
                onClick={() => navigate(-1)}
                className="mr-3 p-2 rounded-full hover:bg-gray-100 group transition-colors"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  Event Booking
                </h1>
                <p className="text-gray-600 text-sm truncate">Create your perfect event</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {formatPrice(cartTotal)}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-end">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {cartItemCount}
                </div>
              </div>
           
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white/60 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Desktop Progress */}
          <div className="hidden md:flex justify-center gap-8 lg:gap-12">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`relative w-12 h-12 lg:w-16 lg:h-16 rounded-full border-3 flex justify-center items-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 border-green-600 text-white'
                        : isActive
                        ? 'bg-blue-500 border-blue-600 text-white animate-pulse'
                        : 'border-gray-300 text-gray-400 bg-white'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5 lg:w-7 lg:h-7" /> : <Icon className="w-5 h-5 lg:w-7 lg:h-7" />}
                    </div>
                    <div className="mt-2 text-sm font-medium text-center">
                      <div className={`transition-colors ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 hidden lg:block">{step.description}</div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-16 lg:w-20 h-1 mx-4 rounded-full transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Progress */}
          <div className="md:hidden flex justify-center gap-4">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`relative w-10 h-10 rounded-full border-2 flex justify-center items-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 border-green-600 text-white'
                        : isActive
                        ? 'bg-blue-500 border-blue-600 text-white animate-pulse'
                        : 'border-gray-300 text-gray-400 bg-white'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="mt-1 text-xs font-medium text-center">
                      <div className={`transition-colors ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.shortTitle}
                      </div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-2 rounded-full transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 animate-fadeIn">
        {renderStep()}
      </div>

      {/* Loading */}
      {(cartLoading || creatingBooking) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center max-w-sm mx-auto w-full">
            <div className="animate-spin h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {creatingBooking ? 'Creating Your Booking...' : 'Loading...'}
            </h3>
            <p className="text-gray-600 text-sm">
              {creatingBooking ? 'Please wait while we process your booking' : 'Please wait'}
            </p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {cartError && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-red-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="font-medium text-sm sm:text-base">{cartError}</p>
        </div>
      )}
    </div>
  );
};

export default EventBookingPage;