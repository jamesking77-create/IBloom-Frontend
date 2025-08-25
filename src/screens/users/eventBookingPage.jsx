// screens/user/EventBookingPage.js - FIXED VERSION
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Check,
  ShoppingCart,
  Sparkles,
  Menu,
  X,
  Mail,
  MessageCircle,
  Heart,
} from "lucide-react";

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
  formatPrice,
  clearCartFromLocalStorage,
} from "../../store/slices/cart-slice";

import {
  createBookingFromCart,
  selectCreatingBooking,
  selectBookingCreated,
  selectLastCreatedBookingId,
  resetBookingCreation,
} from "../../store/slices/booking-slice";

import DateSelectionStep from "../../components/users/dateSelectionStep.jsx";
import CustomerDetailsStep from "../../components/users/customerDetailsStep.jsx";
import BookingPreviewStep from "../../components/users/bookingPreviewStep.jsx";

const EventBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedItem, category, fromBooking } = location.state || {};

  // Redux selectors
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

  // Local state
  const [localError, setLocalError] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Refs for timeout management
  const redirectTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);

  const steps = [
    {
      id: 1,
      title: "Date & Time",
      icon: Calendar,
      description: "Choose when",
      shortTitle: "Date",
    },
    {
      id: 2,
      title: "Your Details",
      icon: User,
      description: "Tell us about you",
      shortTitle: "Details",
    },
    {
      id: 3,
      title: "Review & Book",
      icon: Eye,
      description: "Confirm everything",
      shortTitle: "Review",
    },
  ];

  // Smooth scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Cleanup function for timeouts
  const clearAllTimeouts = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  // FIXED: Enhanced navigation function with comprehensive cart clearing
  const navigateToHome = useCallback(() => {
    console.log("🏠 Starting navigation to home...");

    try {
      // Clear all timeouts first
      clearAllTimeouts();

      // ENHANCED: Comprehensive cart clearing before navigation
      const finalClearCart = async () => {
        console.log("🗑️ Final cart clearing before navigation...");

        try {
          // Clear Redux state first
          dispatch(forceResetCart());

          // Wait for Redux state to update
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Clear ALL cart-related storage items
          const cartKeys = [
            "eventPlatform_cart",
            "cart",
            "cartData",
            "booking_cart",
            "event_cart",
            "redux-persist",
          ];

          cartKeys.forEach((key) => {
            try {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
            } catch (error) {
              console.warn(`Failed to remove ${key}:`, error);
            }
          });

          // Clear any keys that contain 'cart' (case insensitive)
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.toLowerCase().includes("cart")) {
              console.log("🗑️ Removing cart-related key:", key);
              localStorage.removeItem(key);
            }
          }

          // Also check sessionStorage
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key && key.toLowerCase().includes("cart")) {
              console.log("🗑️ Removing cart-related sessionStorage key:", key);
              sessionStorage.removeItem(key);
            }
          }

          console.log("✅ Final cart clearing completed");

          // Verify clearing
          const remainingCart = localStorage.getItem("eventPlatform_cart");
          if (remainingCart) {
            console.warn(
              "⚠️ Cart still exists after clearing, forcing removal"
            );
            localStorage.clear(); // Nuclear option
          }
        } catch (error) {
          console.error("❌ Error in final cart clearing:", error);
          // Nuclear option - clear all localStorage
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {
            console.error("❌ Failed to clear storage:", e);
          }
        }
      };

      // Perform final cart clearing
      finalClearCart();

      // Reset booking state to prevent conflicts
      dispatch(resetBookingCreation());

      // Store admin notification
      if (lastCreatedBookingId) {
        localStorage.setItem("newBookingCreated", "true");
        localStorage.setItem("newBookingId", lastCreatedBookingId);
      }

      // Reset all local state
      setShowSuccessAnimation(false);
      setLocalError("");
      setIsNavigating(false);
      setInitialized(false);

      // Navigate with proper delay to ensure state updates
      setTimeout(() => {
        console.log("🚀 Navigating to home page...");
        navigate("/", {
          replace: true,
          state: {
            fromBookingSuccess: true,
            clearCart: true,
            timestamp: Date.now(), // Add timestamp to ensure fresh state
          },
        });
        console.log("✅ Navigation completed successfully");
      }, 200);
    } catch (error) {
      console.error("❌ Error during navigation:", error);
      // Fallback to force reload which will definitely clear everything
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.error("Failed to clear storage in fallback");
      }
      window.location.replace("/");
    }
  }, [clearAllTimeouts, dispatch, lastCreatedBookingId, navigate]);

  // Better initialization with proper dependency handling
  useEffect(() => {
    if (initialized) return;

    console.log("🔄 EventBookingPage initializing...");
    console.log("selectedItem:", selectedItem);
    console.log("cartItems:", cartItems);
    console.log("cartItemCount:", cartItemCount);
    console.log("fromBooking:", fromBooking);

    // Set order mode first
    dispatch(setOrderMode("booking"));

    // Only add selectedItem if we have one AND we're not returning from booking flow
    if (selectedItem && !fromBooking) {
      console.log("✅ Adding selectedItem to cart (new booking)");
      dispatch(
        addToCart({
          item: selectedItem,
          dates: selectedDates,
          allowDuplicates: false,
        })
      );
    }
    // If we have selectedItem and we're returning from booking, add it to existing cart
    else if (selectedItem && fromBooking) {
      console.log(
        "✅ Adding selectedItem to existing cart (returning from booking)"
      );
      dispatch(
        addToCart({
          item: selectedItem,
          dates: selectedDates,
          allowDuplicates: false,
        })
      );
    }

    setInitialized(true);
    console.log("✅ EventBookingPage initialized");
  }, [selectedItem, fromBooking, initialized, dispatch, selectedDates]);

  // Better step change handling with debouncing
  useEffect(() => {
    if (!initialized) return;

    const scrollTimeout = setTimeout(() => {
      scrollToTop();
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [currentStep, initialized, scrollToTop]);

  // FIXED: Enhanced booking success handling with proper cart clearing
  useEffect(() => {
    console.log("🔄 Booking success useEffect triggered");
    console.log("bookingCreated:", bookingCreated);
    console.log("lastCreatedBookingId:", lastCreatedBookingId);
    console.log("showSuccessAnimation:", showSuccessAnimation);

    if (bookingCreated && lastCreatedBookingId && !showSuccessAnimation) {
      console.log("✅ Booking created successfully:", lastCreatedBookingId);
      console.log("🎉 Starting success animation sequence...");

      // CRITICAL FIX: Reset booking state IMMEDIATELY to prevent multiple runs
      dispatch(resetBookingCreation());

      // ENHANCED: Async cart clearing with proper error handling
      const clearCartAsync = async () => {
        try {
          console.log("🗑️ Starting async cart clearing...");

          // Clear Redux state first
          dispatch(forceResetCart());

          // Wait for Redux to update
          await new Promise((resolve) => setTimeout(resolve, 150));

          // Clear localStorage with comprehensive approach
          const cartKeys = [
            "eventPlatform_cart",
            "cart",
            "cartData",
            "booking_cart",
            "event_cart",
          ];

          cartKeys.forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });

          // Also clear any other cart-related keys
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.toLowerCase().includes("cart")) {
              localStorage.removeItem(key);
            }
          }

          console.log("✅ Cart and localStorage cleared successfully");

          // Verify the cart is actually cleared
          const checkCart = localStorage.getItem("eventPlatform_cart");
          if (checkCart) {
            console.warn("⚠️ Cart still exists, performing nuclear clear");
            localStorage.clear();
          }

          // Now show success animation
          setShowSuccessAnimation(true);
        } catch (error) {
          console.error("❌ Error clearing cart:", error);
          // Still show success animation even if clearing fails
          setShowSuccessAnimation(true);
        }
      };

      // Clear any existing timeouts
      clearAllTimeouts();

      // Scroll to top immediately
      scrollToTop();

      // Clear cart and show animation
      clearCartAsync();

      console.log("⏰ Setting up 3-second navigation timeout...");

      // Create a timeout for navigation
      redirectTimeoutRef.current = setTimeout(() => {
        console.log("🚀 3 seconds elapsed, navigating to home...");
        navigateToHome();
      }, 3000);

      // Safety timeout - force navigation after 5 seconds
      safetyTimeoutRef.current = setTimeout(() => {
        console.log("⚠️ Safety timeout: forcing navigation after 5 seconds");
        navigateToHome();
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (showSuccessAnimation) {
        console.log("🧹 Cleaning up booking success useEffect");
        clearAllTimeouts();
      }
    };
  }, [
    bookingCreated,
    lastCreatedBookingId,
    showSuccessAnimation,
    clearAllTimeouts,
    scrollToTop,
    navigateToHome,
    dispatch,
  ]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting...");
      clearAllTimeouts();

      // Store admin notification if we're in success state
      if (showSuccessAnimation && lastCreatedBookingId) {
        localStorage.setItem("newBookingCreated", "true");
        localStorage.setItem("newBookingId", lastCreatedBookingId);
      }
    };
  }, [clearAllTimeouts, showSuccessAnimation, lastCreatedBookingId]);

  // Debug cart state changes
  useEffect(() => {
    console.log("🛒 Cart state debug:", {
      items: cartItems?.length || 0,
      total: cartTotal,
      step: currentStep,
      showingSuccess: showSuccessAnimation,
      timestamp: new Date().toISOString(),
    });
  }, [cartItems, cartTotal, currentStep, showSuccessAnimation]);

  // Optimized handlers with proper validation
  const handleDateChange = useCallback(
    (dateData) => {
      console.log("📅 Date changed:", dateData);
      dispatch(setSelectedDates(dateData));
      setLocalError("");
    },
    [dispatch]
  );

  const handleCustomerInfoChange = useCallback(
    (data) => {
      console.log("👤 Customer info changed:", data);
      dispatch(setCustomerInfo(data));
      setLocalError("");
    },
    [dispatch]
  );

  // Improved handleNext with better validation and state management
  const handleNext = useCallback(() => {
    if (isNavigating) return;

    console.log("=== 🚀 EventBookingPage handleNext called ===");
    console.log("Current step:", currentStep);
    console.log("Cart items:", cartItems.length);
    console.log("Selected dates:", selectedDates);
    console.log("Customer info:", customerInfo);

    setIsNavigating(true);
    setLocalError("");

    try {
      // Step 1 validation - Date and Cart
      if (currentStep === 1) {
        console.log("🔍 Validating step 1...");

        if (!cartItems || cartItems.length === 0) {
          setLocalError("Add at least one item to your cart");
          setIsNavigating(false);
          return;
        }

        if (selectedDates?.multiDay && !selectedDates?.endDate) {
          setLocalError("Please select an end date for your multi-day event");
          setIsNavigating(false);
          return;
        }

        if (!selectedDates?.startTime || !selectedDates?.endTime) {
          setLocalError(
            "Please select both start and end times for your event"
          );
          setIsNavigating(false);
          return;
        }

        console.log("✅ Step 1 validation passed");
      }
      // Step 2 validation - Customer Details
      else if (currentStep === 2) {
        console.log("🔍 Validating step 2...");

        if (!customerInfo?.name?.trim()) {
          setLocalError("Please provide your name.");
          setIsNavigating(false);
          return;
        }

        if (!customerInfo?.email?.trim()) {
          setLocalError("Please provide your email address.");
          setIsNavigating(false);
          return;
        }

        if (!customerInfo?.phone?.trim()) {
          setLocalError("Please provide your phone number.");
          setIsNavigating(false);
          return;
        }

        if (!customerInfo?.location?.trim()) {
          setLocalError("Please provide the event location.");
          setIsNavigating(false);
          return;
        }

        if (!customerInfo?.delivery) {
          setLocalError("Please select a delivery option.");
          setIsNavigating(false);
          return;
        }

        if (!customerInfo?.installation) {
          setLocalError("Please select an installation option.");
          setIsNavigating(false);
          return;
        }

        console.log("✅ Step 2 validation passed");
      }

      console.log("✅ All validations passed, moving to next step...");

      setTimeout(() => {
        dispatch(nextStep());
        setIsNavigating(false);
        console.log("✅ nextStep() dispatched successfully");
      }, 100);
    } catch (error) {
      console.error("❌ Error in handleNext:", error);
      setLocalError("An error occurred. Please try again.");
      setIsNavigating(false);
    }
  }, [
    currentStep,
    cartItems,
    selectedDates,
    customerInfo,
    isNavigating,
    dispatch,
  ]);

  const handlePrevious = useCallback(() => {
    if (isNavigating) return;

    setIsNavigating(true);
    setLocalError("");

    setTimeout(() => {
      dispatch(prevStep());
      setIsNavigating(false);
    }, 100);
  }, [isNavigating, dispatch]);

  const handleAddMoreItems = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      navigate("/", { state: { scrollToCategories: true } });
    }, 700);
  }, [navigate]);

  const handleRemoveItem = useCallback(
    (itemId) => {
      dispatch(removeFromCart(itemId));
    },
    [dispatch]
  );

  const handleQuantityChange = useCallback(
    (itemId, quantity) => {
      console.log("Changing quantity for item:", itemId, "to:", quantity);
      if (quantity > 0) {
        dispatch(updateQuantity({ itemId, quantity }));
      }
    },
    [dispatch]
  );

  const handleIncrementQuantity = useCallback(
    (itemId) => {
      console.log("Incrementing quantity for item:", itemId);
      dispatch(incrementQuantity(itemId));
    },
    [dispatch]
  );

  const handleDecrementQuantity = useCallback(
    (itemId) => {
      console.log("Decrementing quantity for item:", itemId);
      dispatch(decrementQuantity(itemId));
    },
    [dispatch]
  );

  // Improved booking submission
  const handleSubmitBooking = useCallback(
    async (bookingData) => {
      console.log("🚀 handleSubmitBooking called with:", bookingData);

      try {
        // Clear any existing timeouts
        clearAllTimeouts();

        // Scroll to top when booking is confirmed
        scrollToTop();

        // Reset any error states
        setLocalError("");

        // Dispatch the Redux action that makes the API call
        const result = await dispatch(createBookingFromCart(bookingData));

        console.log("📝 Booking creation result:", result);

        return result;
      } catch (error) {
        console.error("❌ Error in handleSubmitBooking:", error);
        setLocalError("Failed to create booking. Please try again.");
        throw error;
      }
    },
    [dispatch, scrollToTop, clearAllTimeouts]
  );

  const handleClearCart = useCallback(() => {
    console.log("🗑️ Clearing cart manually");
    dispatch(forceResetCart());
  }, [dispatch]);

  // Optimized step rendering with error boundaries
  const renderStep = useCallback(() => {
    try {
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
              onEditDates={() => dispatch(setStep(1))}
              onEditCustomerInfo={() => dispatch(setStep(2))}
            />
          );
        default:
          return null;
      }
    } catch (error) {
      console.error("❌ Error rendering step:", error);
      return (
        <div className="text-center py-8">
          <p className="text-red-600">
            An error occurred. Please refresh the page.
          </p>
        </div>
      );
    }
  }, [
    currentStep,
    handleNext,
    handleAddMoreItems,
    localError,
    customerInfo,
    selectedDates,
    handleCustomerInfoChange,
    handlePrevious,
    handleRemoveItem,
    handleIncrementQuantity,
    handleDecrementQuantity,
    cartItems,
    cartTotal,
    handleSubmitBooking,
    creatingBooking,
    cartError,
    dispatch,
  ]);

  // Show loading while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">
            Initializing booking...
          </p>
        </div>
      </div>
    );
  }

  // ENHANCED: Success animation with multiple exit options
  if (showSuccessAnimation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4">
        <div className="text-center max-w-lg mx-auto">
          {/* Animated Success Icon */}
          <div className="relative mb-8">
            <div className="animate-bounce">
              <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Check className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
              </div>
            </div>
            {/* Animated rings around the icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-green-200 rounded-full animate-ping opacity-20 animation-delay-150"></div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Booking Sent 🎉
            </h2>
            <p className="text-gray-600 text-lg sm:text-xl leading-relaxed">
              Your event booking has been sent successfully! We will reach out
              to you via email within 24 hours.
            </p>

            {/* Enhanced manual continue button with comprehensive clearing */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  console.log("🖱️ Manual continue button clicked");

                  // COMPREHENSIVE: Clear everything immediately
                  try {
                    // Clear Redux state
                    dispatch(forceResetCart());
                    dispatch(resetBookingCreation());

                    // Clear all storage with nuclear approach
                    localStorage.clear();
                    sessionStorage.clear();

                    // Small delay then navigate
                    setTimeout(() => {
                      window.location.replace("/");
                    }, 100);
                  } catch (error) {
                    console.error("Error in manual continue:", error);
                    // Fallback to direct navigation
                    window.location.replace("/");
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg font-medium text-lg"
              >
                Continue to Home
              </button>

              {/* Emergency fallback button */}
              <div>
                <button
                  onClick={() => {
                    console.log("🚨 Emergency navigation triggered");
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/";
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Having trouble? Click here to go home
                </button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 text-2xl animate-bounce animation-delay-300">
            🎊
          </div>
          <div className="absolute top-20 right-10 text-2xl animate-bounce animation-delay-500">
            ✨
          </div>
          <div className="absolute bottom-20 left-20 text-2xl animate-bounce animation-delay-700">
            🎈
          </div>
          <div className="absolute bottom-10 right-20 text-2xl animate-bounce animation-delay-900">
            🎉
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart state - ONLY SHOW IF NOT IN SUCCESS MODE
  if (!cartItems || (cartItems.length === 0 && !selectedItem)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🛒</div>
            <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-4">
            Start building your perfect event by adding items to your cart.
          </p>
          <button
            onClick={() =>
              navigate("/", { state: { scrollToCategories: true } })
            }
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition hover:scale-105 shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            Browse Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Mobile Menu Overlay - ONLY SHOW ON FIRST STEP */}
      {showMobileMenu && currentStep === 1 && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="bg-white h-full w-80 max-w-[85vw] shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
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
                  {cartItemCount} item{cartItemCount !== 1 ? "s" : ""}
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
                <p className="text-gray-600 text-sm lg:text-base">
                  Create your perfect event experience
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Total Price</div>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {formatPrice(cartTotal)}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-end mt-1">
                <ShoppingCart className="w-4 h-4 mr-1" />
                {cartItemCount} item{cartItemCount !== 1 ? "s" : ""}
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
                <p className="text-gray-600 text-sm truncate">
                  Create your perfect event
                </p>
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
                    <div
                      className={`relative w-12 h-12 lg:w-16 lg:h-16 rounded-full border-3 flex justify-center items-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 border-green-600 text-white"
                          : isActive
                          ? "bg-blue-500 border-blue-600 text-white animate-pulse"
                          : "border-gray-300 text-gray-400 bg-white"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 lg:w-7 lg:h-7" />
                      ) : (
                        <Icon className="w-5 h-5 lg:w-7 lg:h-7" />
                      )}
                    </div>
                    <div className="mt-2 text-sm font-medium text-center">
                      <div
                        className={`transition-colors ${
                          isActive
                            ? "text-blue-600"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 hidden lg:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-16 lg:w-20 h-1 mx-4 rounded-full transition-colors ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
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
                    <div
                      className={`relative w-10 h-10 rounded-full border-2 flex justify-center items-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 border-green-600 text-white"
                          : isActive
                          ? "bg-blue-500 border-blue-600 text-white animate-pulse"
                          : "border-gray-300 text-gray-400 bg-white"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="mt-1 text-xs font-medium text-center">
                      <div
                        className={`transition-colors ${
                          isActive
                            ? "text-blue-600"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.shortTitle}
                      </div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-8 h-1 mx-2 rounded-full transition-colors ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
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

      {/* Loading Overlay */}
      {(cartLoading || creatingBooking) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center max-w-sm mx-auto w-full">
            <div className="animate-spin h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {creatingBooking ? "Creating Your Booking..." : "Loading..."}
            </h3>
            <p className="text-gray-600 text-sm">
              {creatingBooking
                ? "Please wait while we process your booking"
                : "Please wait"}
            </p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {(cartError || localError) && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-red-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="font-medium text-sm sm:text-base">
            {cartError || localError}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventBookingPage;
