// components/users/OrderPreviewStep.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Star,
  BadgeInfo,
  CheckCircle,
  Edit3,
  ArrowLeft,
  CreditCard,
  Package,
  AlertCircle,
  ShoppingCart,
  Timer,
  Globe,
  Calculator,
  CreditCardIcon,
  AlertCircleIcon,
  Truck,
  Settings,
  MessagesSquare,
} from "lucide-react";

const OrderPreviewStep = ({
  customerInfo,
  onPrevious,
  onNext,
  onEditDates,
  onEditCustomerInfo,
  error,
  cartItems,
  selectedDates,
  total,
  onSubmit,
  loading,
  warehouseInfo,
}) => {
  // Local state for UI interactions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized calculations to prevent unnecessary re-renders
  const calculations = useMemo(() => {
    const dailySubtotal = cartItems?.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (itemPrice * quantity);
    }, 0) || 0;

    // Calculate rental duration
    const startDate = new Date(selectedDates?.startDate);
    const endDate = new Date(selectedDates?.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const subtotal = dailySubtotal * duration;
    const tax = subtotal * 0.075; // 7.5% tax
    const finalTotal = subtotal + tax;

    return {
      dailyRate: dailySubtotal,
      duration,
      subtotal,
      tax,
      total: finalTotal,
      itemCount: cartItems?.reduce((count, item) => count + (parseInt(item.quantity) || 1), 0) || 0
    };
  }, [cartItems, selectedDates]);

  // Improved date formatting with error handling
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

  // Order confirmation handler
  const handleConfirmOrder = useCallback(async () => {
    if (isSubmitting || loading) {
      console.log("⚠️ Already submitting or loading, ignoring click");
      return;
    }

    console.log('🚀 Starting order confirmation...');
    
    // Final validation before submission
    if (!cartItems || cartItems.length === 0) {
      console.error("❌ No items in cart");
      return;
    }
    
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
      console.error("❌ Missing customer information");
      return;
    }
    
    if (!selectedDates?.startDate || !selectedDates?.endDate) {
      console.error("❌ Missing date information");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the order data in the format expected by your orders slice
      const orderData = {
        orderId: "ORD" + Date.now().toString().slice(-6),
        orderDate: new Date().toISOString(),
        status: "pending_confirmation",
        orderMode: "daily",

        // Customer information matching your dummy order structure
        customerInfo: {
          name: customerInfo?.name || "",
          email: customerInfo?.email || "",
          phone: customerInfo?.phone || "",
        },
        
        deliveryInfo: {
          type: customerInfo?.delivery === "yes" ? "delivery" : "warehouse_pickup",
          address: customerInfo?.delivery === "yes" ? customerInfo?.location || "" : warehouseInfo?.address || "Main Warehouse",
          instructions: customerInfo?.specialRequests || "",
        },

        dateInfo: {
          orderDate: new Date().toISOString(),
          startDate: selectedDates?.startDate || "",
          endDate: selectedDates?.endDate || "",
          duration: `${calculations.duration} days`,
          rentalPeriod: calculations.duration,
        },

        items: cartItems.map((item, index) => ({
          id: item.cartId || item.id || index + 1,
          name: item.itemName || item.name || "Unknown Item",
          category: item.category || "General",
          quantity: item.quantity || 1,
          pricePerDay: item.price || 0,
          totalPrice: (item.price || 0) * (item.quantity || 1) * calculations.duration,
          image: item.image || item.imageUrl || "/api/placeholder/100/100",
        })),

        pricing: {
          dailyRate: calculations.dailyRate,
          duration: calculations.duration,
          subtotal: calculations.subtotal,
          tax: calculations.tax,
          deliveryFee: customerInfo?.delivery === "yes" ? 0 : 0, // Will be calculated later
          total: calculations.total,
        },

        // Additional order details
        eventType: customerInfo?.eventType || "",
        location: customerInfo?.location || "",
        guests: customerInfo?.guests || "",
        delivery: customerInfo?.delivery === "yes",
        installation: customerInfo?.installation === "yes",
        specialRequests: customerInfo?.specialRequests || "",
        
        termsAccepted: true,
        notes: `Order by date rental - ${calculations.duration} day(s)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // Warehouse information
        warehouseInfo: warehouseInfo || {},
      };

      console.log("📝 Order data prepared:", orderData);

      const result = await onSubmit(orderData);
      
      console.log("✅ Order created successfully:", result);
      
    } catch (err) {
      console.error("❌ Error confirming order:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    loading,
    cartItems,
    customerInfo,
    selectedDates,
    calculations,
    warehouseInfo,
    onSubmit
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn px-2 sm:px-0">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
          Order Preview
        </h1>
        <p className="text-gray-600 text-base sm:text-lg px-4 sm:px-0">
          Please review your rental order details before confirming below
        </p>
      </div>

      {/* Terms and Conditions for Orders */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8">
        <div className="flex items-center mb-4 sm:mb-6">
          <AlertCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600 mr-2 sm:mr-3" />
          <h2 className="text-lg sm:text-2xl font-bold text-amber-800">
            Rental Terms & Conditions
          </h2>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Daily Rental Policy */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-100">
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Daily Rental Policy
            </h3>
            <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
              <p>
                • Rental period is calculated on a daily basis from pickup date to return date.
              </p>
              <p>
                • Items must be returned by the end of the final rental day to avoid additional charges.
              </p>
              <p>
                • Late returns will incur additional daily charges at the standard rate.
              </p>
              <p>
                • All items are subject to availability and quality inspection before release.
              </p>
            </div>
          </div>

          {/* Pickup and Delivery Policy */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-100">
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Pickup & Delivery Policy
            </h3>
            <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
              <p>
                • Warehouse pickup: Items must be collected during operating hours with valid ID.
              </p>
              <p>
                • Delivery service: Available within Lagos metropolis with additional fees.
              </p>
              <p>
                • Customer or authorized representative must be present during delivery/pickup.
              </p>
              <p>
                • Professional setup services available upon request for additional fees.
              </p>
            </div>
          </div>

          {/* Security Deposit Policy */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-100">
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center">
              <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Security Deposit Policy
            </h3>
            <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
              <p>
                • A refundable security deposit is required for all rental items.
              </p>
              <p>
                • Deposit amount varies based on the total value and type of items rented.
              </p>
              <p>
                • Full deposit is refunded upon return of items in original condition.
              </p>
              <p>
                • Damage or loss costs will be deducted from the security deposit.
              </p>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-100">
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Pricing & Tax Information
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">
              A 7.5% tax will be added to your rental total. Final pricing may vary based on actual rental duration and additional services requested.
            </p>
          </div>
        </div>
      </div>

      {/* Order Overview Card */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
            <BadgeInfo className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Order Overview
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2">
            <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {calculations.duration} Day{calculations.duration !== 1 ? "s" : ""}
            </div>
            <div className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {calculations.itemCount} Item{calculations.itemCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Customer & Event Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center mb-3 sm:mb-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2 sm:mr-3" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                Customer Details
              </h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Customer:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.name || "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Event Type:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.eventType || "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Contact:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.phone || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center mb-3 sm:mb-4">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 sm:mr-3" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                Rental Period
              </h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Start Date:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {formatDate(selectedDates?.startDate)}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  End Date:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {formatDate(selectedDates?.endDate)}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Duration:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {calculations.duration} day{calculations.duration !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery & Setup */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center mb-3 sm:mb-4">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 sm:mr-3" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                Service Options
              </h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Delivery:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.delivery === "yes"
                    ? "Yes - Delivery required"
                    : "No - Warehouse pickup"}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Setup:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.installation === "yes"
                    ? "Yes - Professional setup"
                    : "No - Self setup"}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Location:
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.delivery === "yes" 
                    ? (customerInfo?.location || "Address required")
                    : (warehouseInfo?.name || "Warehouse pickup")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {customerInfo?.specialRequests && (
          <div className="mt-4 sm:mt-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center mb-3 sm:mb-4">
              <MessagesSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mr-2 sm:mr-3" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                Special Requests
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {customerInfo.specialRequests}
            </p>
          </div>
        )}
      </div>

      {/* Items & Pricing */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-green-600" />
            <span className="hidden sm:inline">Rental Items</span>
            <span className="sm:hidden">Items</span>
          </h2>
          <button
            onClick={onEditDates}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm sm:text-base"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Edit Items</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item, index) => {
              const cartId = item.cartId || item.id || `cart-${index}`;
              const itemName = item.itemName || item.name || "Unknown Item";
              const itemPrice = item.price || 0;
              const itemQuantity = item.quantity || 1;
              const itemImage =
                item.image ||
                item.imageUrl ||
                "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop";
              const dailyTotal = itemPrice * itemQuantity;
              const totalForDuration = dailyTotal * calculations.duration;

              return (
                <div
                  key={cartId}
                  className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-gray-100 transition-colors duration-200"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-12 h-12 rounded-lg object-cover shadow-md"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop";
                          }}
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Star className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-base leading-tight">
                          {itemName}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                          <span className="flex items-center">
                            <Timer className="w-3 h-3 mr-1" />
                            {calculations.duration} day{calculations.duration !== 1 ? "s" : ""}
                          </span>
                          <span>Qty: {itemQuantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {formatPrice(itemPrice)} × {itemQuantity} × {calculations.duration} days
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          {formatPrice(totalForDuration)}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="relative">
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-16 h-16 rounded-xl object-cover mr-4 shadow-md"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop";
                          }}
                        />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {itemName}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            <Timer className="w-4 h-4 inline mr-1" />
                            {calculations.duration} day{calculations.duration !== 1 ? "s" : ""}
                          </span>
                          <span className="text-sm text-gray-600">
                            Qty: {itemQuantity}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatPrice(itemPrice)} per day
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">
                        {formatPrice(totalForDuration)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total for {calculations.duration} day{calculations.duration !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                No items selected
              </p>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        {cartItems && cartItems.length > 0 && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-medium text-gray-700">
                    Daily Rate:
                  </span>
                  <span className="text-lg sm:text-xl font-semibold text-gray-800">
                    {formatPrice(calculations.dailyRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-medium text-gray-700">
                    Duration ({calculations.duration} day{calculations.duration !== 1 ? "s" : ""}):
                  </span>
                  <span className="text-lg sm:text-xl font-semibold text-gray-800">
                    × {calculations.duration}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-medium text-gray-700">
                    Subtotal:
                  </span>
                  <span className="text-lg sm:text-xl font-semibold text-gray-800">
                    {formatPrice(calculations.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-medium text-gray-700">
                    Tax (7.5%):
                  </span>
                  <span className="text-lg sm:text-xl font-semibold text-gray-800">
                    {formatPrice(calculations.tax)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg sm:text-2xl font-bold text-gray-800">
                      Total:
                    </span>
                    <span className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {formatPrice(calculations.total)}
                    </span>
                  </div>
                </div>
                <div className="text-center pt-3 sm:pt-4">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Final amount may vary based on delivery location and additional services
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Information Summary */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-purple-600" />
            Customer Information
          </h2>
          <button
            onClick={onEditCustomerInfo}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm sm:text-base"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Edit Details</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.name || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Phone Number</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Delivery Required</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.delivery === "yes"
                    ? "Yes - Deliver to location"
                    : customerInfo?.delivery === "no"
                    ? "No - Warehouse pickup"
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Professional Setup</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.installation === "yes"
                    ? "Yes - Professional setup required"
                    : customerInfo?.installation === "no"
                    ? "No - Self setup"
                    : "Not specified"}
                </p>
              </div>
            </div>

            {customerInfo?.eventType && (
              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Event Type</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo.eventType}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 space-y-3 sm:space-y-0">
        <button
          onClick={onPrevious}
          disabled={isSubmitting || loading}
          className="flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Previous
        </button>

        <button
          onClick={handleConfirmOrder}
          disabled={isSubmitting || loading || !cartItems || cartItems.length === 0}
          className="flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          {isSubmitting || loading ? (
            <>
              <div className="animate-spin rounded-full h-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              <span className="hidden sm:inline">Processing...</span>
              <span className="sm:hidden">Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">
                Confirm Order ({formatPrice(calculations.total)})
              </span>
              <span className="sm:hidden">
                Confirm ({formatPrice(calculations.total)})
              </span>
            </>
          )}
        </button>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-green-200">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Secure Order
            </span>
          </div>
          <div className="flex items-center">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Quality Guaranteed
            </span>
          </div>
          <div className="flex items-center">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Professional Service
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPreviewStep;