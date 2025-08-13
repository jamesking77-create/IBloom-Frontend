// screens/user/OrderProcessPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  AlertCircle,
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
} from "../../store/slices/cart-slice";
import OrderDateCustomerStep from "../../components/users/orderDateCustomerStep";
import OrderPreviewStep from "../../components/users/orderPreviewStep";


const OrderProcessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedItem, category, fromWarehouse, warehouseInfo } = location.state || {};

  // Redux selectors
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const selectedDates = useSelector(selectSelectedDates);
  const customerInfo = useSelector(selectCustomerInfo);
  const currentStep = useSelector(selectCartStep);
  const cartLoading = useSelector(selectCartLoading);
  const cartError = useSelector(selectCartError);
  const cartItemCount = useSelector(selectCartItemCount);

  // Local state
  const [localError, setLocalError] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Refs for timeout management
  const redirectTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);

  const steps = [
    {
      id: 1,
      title: "Date & Details",
      icon: Calendar,
      description: "Select dates and enter your information",
      shortTitle: "Date & Info",
    },
    {
      id: 2,
      title: "Review & Order",
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

  // Navigate to home function
  const navigateToHome = useCallback(() => {
    console.log("🏠 Starting navigation to home...");

    try {
      clearAllTimeouts();

      // Clear cart and localStorage
      dispatch(forceResetCart());
      
      const cartKeys = [
        "eventPlatform_cart",
        "cart",
        "cartData",
        "booking_cart",
        "event_cart",
        "order_cart",
        "redux-persist"
      ];
      
      cartKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove ${key}:`, error);
        }
      });

      // Reset all local state
      setShowSuccessAnimation(false);
      setLocalError("");
      setIsNavigating(false);
      setInitialized(false);

      // Navigate
      setTimeout(() => {
        navigate("/", {
          replace: true,
          state: { 
            fromOrderSuccess: true,
            clearCart: true,
            timestamp: Date.now()
          },
        });
      }, 200);

    } catch (error) {
      console.error("❌ Error during navigation:", error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/");
    }
  }, [clearAllTimeouts, dispatch, navigate]);

  // Initialize the order process
  useEffect(() => {
    if (initialized) return;

    console.log("🔄 OrderProcessPage initializing...");
    console.log("selectedItem:", selectedItem);
    console.log("fromWarehouse:", fromWarehouse);

    // Set order mode to "daily" for order by date
    dispatch(setOrderMode("daily"));

    // Reset to step 1 for order process
    dispatch(setStep(1));

    // Add selected item if we have one
    if (selectedItem && !cartItems.find(item => item.id === selectedItem.id)) {
      console.log("✅ Adding selectedItem to cart");
      dispatch(
        addToCart({
          item: selectedItem,
          dates: selectedDates,
          allowDuplicates: false,
        })
      );
    }

    setInitialized(true);
    console.log("✅ OrderProcessPage initialized");
  }, [selectedItem, fromWarehouse, initialized, dispatch, selectedDates, cartItems]);

  // Step change handling
  useEffect(() => {
    if (!initialized) return;

    const scrollTimeout = setTimeout(() => {
      scrollToTop();
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [currentStep, initialized, scrollToTop]);

  // Order success handling (similar to booking but for orders)
  useEffect(() => {
    if (showSuccessAnimation) {
      scrollToTop();
      
      clearAllTimeouts();

      redirectTimeoutRef.current = setTimeout(() => {
        console.log('🚀 3 seconds elapsed, navigating to home...');
        navigateToHome();
      }, 3000);

      safetyTimeoutRef.current = setTimeout(() => {
        console.log('⚠️ Safety timeout: forcing navigation after 5 seconds');
        navigateToHome();
      }, 5000);
    }

    return () => {
      if (showSuccessAnimation) {
        clearAllTimeouts();
      }
    };
  }, [showSuccessAnimation, clearAllTimeouts, scrollToTop, navigateToHome]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting...");
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Handlers
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

  const handleNext = useCallback(() => {
    if (isNavigating) return;

    console.log("=== 🚀 OrderProcessPage handleNext called ===");
    console.log("Current step:", currentStep);

    setIsNavigating(true);
    setLocalError("");

    try {
      // For orders, we have combined validation in step 1
      if (currentStep === 1) {
        console.log("🔍 Validating step 1 (combined)...");

        if (!cartItems || cartItems.length === 0) {
          setLocalError("Add at least one item to your cart");
          setIsNavigating(false);
          return;
        }


        if (!customerInfo?.name?.trim()) {
          setLocalError("Please provide your name");
          setIsNavigating(false);
          return;
        }

        if (!customerInfo?.email?.trim()) {
          setLocalError("Please provide your email address");
          setIsNavigating(false);
          return;
        }

        if (!customerInfo?.phone?.trim()) {
          setLocalError("Please provide your phone number");
          setIsNavigating(false);
          return;
        }

        if (!customerInfo?.delivery) {
          setLocalError("Please select a delivery option");
          setIsNavigating(false);
          return;
        }

        console.log("✅ Step 1 validation passed");
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
      navigate("/smartcategory");
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
      if (quantity > 0) {
        dispatch(updateQuantity({ itemId, quantity }));
      }
    },
    [dispatch]
  );

  const handleIncrementQuantity = useCallback(
    (itemId) => {
      dispatch(incrementQuantity(itemId));
    },
    [dispatch]
  );

  const handleDecrementQuantity = useCallback(
    (itemId) => {
      dispatch(decrementQuantity(itemId));
    },
    [dispatch]
  );

  // Order submission handler (different from booking)
  const handleSubmitOrder = useCallback(
    async (orderData) => {
      console.log("🚀 handleSubmitOrder called with:", orderData);

      try {
        clearAllTimeouts();
        scrollToTop();
        setLocalError("");

        // Here you would dispatch an action to create the order
        // For now, we'll simulate success
        console.log("📝 Order creation simulated - would call order API");
        
        // Simulate order success
        setTimeout(() => {
          setShowSuccessAnimation(true);
        }, 1000);

        return { success: true };
      } catch (error) {
        console.error("❌ Error in handleSubmitOrder:", error);
        setLocalError("Failed to create order. Please try again.");
        throw error;
      }
    },
    [scrollToTop, clearAllTimeouts]
  );

  // Render step content
  const renderStep = useCallback(() => {
    try {
      switch (currentStep) {
        case 1:
          return (
            <OrderDateCustomerStep
              customerInfo={customerInfo}
              selectedDates={selectedDates}
              onDateChange={handleDateChange}
              onCustomerInfoChange={handleCustomerInfoChange}
              onNext={handleNext}
              onAddMoreItems={handleAddMoreItems}
              onRemoveItem={handleRemoveItem}
              onIncrementQuantity={handleIncrementQuantity}
              onDecrementQuantity={handleDecrementQuantity}
              cartItems={cartItems}
              cartTotal={cartTotal}
              error={localError}
              warehouseInfo={warehouseInfo}
            />
          );
        case 2:
          return (
            <OrderPreviewStep
              cartItems={cartItems}
              selectedDates={selectedDates}
              customerInfo={customerInfo}
              total={cartTotal}
              onSubmit={handleSubmitOrder}
              onPrevious={handlePrevious}
              onAddMoreItems={handleAddMoreItems}
              onRemoveItem={handleRemoveItem}
              onIncrementQuantity={handleIncrementQuantity}
              onDecrementQuantity={handleDecrementQuantity}
              loading={cartLoading}
              error={localError || cartError}
              onEditDates={() => dispatch(setStep(1))}
              onEditCustomerInfo={() => dispatch(setStep(1))}
              warehouseInfo={warehouseInfo}
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
    customerInfo,
    selectedDates,
    handleDateChange,
    handleCustomerInfoChange,
    handleNext,
    handleAddMoreItems,
    handleRemoveItem,
    handleIncrementQuantity,
    handleDecrementQuantity,
    cartItems,
    cartTotal,
    localError,
    warehouseInfo,
    handleSubmitOrder,
    handlePrevious,
    cartLoading,
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
            Initializing order process...
          </p>
        </div>
      </div>
    );
  }

  // Success animation
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
              Order Completed! 🎉
            </h2>
            <p className="text-gray-600 text-lg sm:text-xl leading-relaxed">
              Your rental order has been sent successfully!
            </p>
            <p className="text-gray-500 text-sm sm:text-base">
              You will receive confirmation details via email shortly.
            </p>

            {/* Manual continue button */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  console.log("🖱️ Manual continue button clicked");
                  
                  try {
                    dispatch(forceResetCart());
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    setTimeout(() => {
                      window.location.replace("/");
                    }, 100);
                    
                  } catch (error) {
                    console.error("Error in manual continue:", error);
                    window.location.replace("/");
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg font-medium text-lg"
              >
                Continue to Home
              </button>
              
              <div>
                <button
                  onClick={() => {
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



  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
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
                  Order by Date
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">
                  Create your rental order
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
                  Order by Date
                </h1>
                <p className="text-gray-600 text-sm truncate">
                  Create your rental order
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
      {cartLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center max-w-sm mx-auto w-full">
            <div className="animate-spin h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Processing Your Order...
            </h3>
            <p className="text-gray-600 text-sm">
              Please wait while we process your order
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

export default OrderProcessPage;