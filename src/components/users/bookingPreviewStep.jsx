// screens/user/components/PreviewStep.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Users,
  MessageSquare,
  Star,
  BadgeInfo,
  CheckCircle,
  Edit3,
  ArrowLeft,
  CreditCard,
  Package,
  Heart,
  AlertCircle,
  ShoppingCart,
  Timer,
  Globe,
  Calculator,
  CreditCardIcon,
  AlertCircleIcon,
  Truck,
  Settings,
} from "lucide-react";
import {
  selectCartItems,
  selectCartTotal,
  selectCartSubtotal,
  selectSelectedDates,
  selectCartItemCount,
  formatPrice,
  forceResetCart,
  resetSubmissionStatus,
} from "../../store/slices/cart-slice";
import BookingSuccessPopup from "../../UI/bookingSuccessPopup";
import { useNavigate } from "react-router-dom";

const BookingPreviewStep = ({
  customerInfo,
  onPrevious,
  onNext,
  onEditDates,
  onEditCustomerInfo,
  error,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Get cart data from Redux store
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const cartSubtotal = useSelector(selectCartSubtotal);
  const selectedDates = useSelector(selectSelectedDates);
  const cartItemCount = useSelector(selectCartItemCount);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    try {
      // Create complete booking object with ALL data
      const completeBookingData = {
        // Booking Metadata
        bookingId: "BK" + Date.now().toString().slice(-6),
        bookingDate: new Date().toISOString(),
        status: "pending_confirmation",
        orderMode: "booking",

        // Customer Information (ALL details)
        customer: {
          personalInfo: {
            name: customerInfo?.name || "",
            email: customerInfo?.email || "",
            phone: customerInfo?.phone || "",
          },
          eventDetails: {
            eventType: customerInfo?.eventType || "",
            numberOfGuests: customerInfo?.guests || 0,
            location: customerInfo?.location || "",
            specialRequests: customerInfo?.specialRequests || "",
            delivery: customerInfo?.delivery || "",
            installation: customerInfo?.installation || "",
          },
        },

        // Event Schedule & Dates
        eventSchedule: {
          startDate: selectedDates?.startDate || "",
          endDate: selectedDates?.endDate || "",
          startTime: selectedDates?.startTime || "",
          endTime: selectedDates?.endTime || "",
          isMultiDay: selectedDates?.multiDay || false,
          durationInDays: calculateDuration(),

          // Formatted versions for display
          formatted: {
            startDate: formatDate(selectedDates?.startDate),
            endDate: formatDate(selectedDates?.endDate),
            startTime: formatTime(selectedDates?.startTime),
            endTime: formatTime(selectedDates?.endTime),
            fullSchedule: `${formatDate(
              selectedDates?.startDate
            )} from ${formatTime(selectedDates?.startTime)} to ${formatTime(
              selectedDates?.endTime
            )}`,
          },
        },

        // All Cart Items with Full Details
        services: cartItems.map((item, index) => ({
          serviceId: item.cartId || item.id || `service-${index}`,
          name: item.itemName || item.name || "Unknown Service",
          description: item.description || "",
          category: item.category || "General",

          // Pricing
          unitPrice: item.price || 0,
          quantity: item.quantity || 1,
          duration: item.duration || 1,
          subtotal: (item.price || 0) * (item.quantity || 1),

          // Media & Display
          image: item.image || item.imageUrl || "",

          // Booking specific
          orderMode: item.orderMode || "booking",
          addedAt: item.addedAt || new Date().toISOString(),

          // Additional metadata
          originalData: item.originalData || null,
        })),

        // Financial Breakdown
        pricing: {
          itemsSubtotal: cartSubtotal || 0,
          taxAmount: (cartTotal || 0) - (cartSubtotal || 0),
          taxRate: 0.075, // 7.5%
          totalAmount: cartTotal || 0,
          currency: "NGN",

          // Summary
          totalItems: cartItemCount || 0,
          totalServices: cartItems.length || 0,

          // Formatted prices
          formatted: {
            subtotal: formatPrice(cartSubtotal || 0),
            tax: formatPrice((cartTotal || 0) - (cartSubtotal || 0)),
            total: formatPrice(cartTotal || 0),
          },
        },

        // System & Tracking Info
        systemInfo: {
          platform: "web",
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          locale: "en-NG",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          createdAt: new Date().toISOString(),
          source: "event_booking_page",
        },

        // Additional Business Data
        businessData: {
          requiresDeposit: true,
          depositPolicy: "Refundable deposit varies by items selected",
          cancellationPolicy: "As per terms and conditions",
          deliveryRequired: customerInfo?.location ? true : false,
          setupRequired: true,
          deliveryRequired: customerInfo?.delivery === "yes",
          setupRequired: customerInfo?.installation === "yes",
          // Contact preferences
          preferredContact: customerInfo?.email ? "email" : "phone",
          followUpRequired: true,
        },

        // Validation & Completeness Check
        validation: {
          hasCustomerInfo: !!(
            customerInfo?.name &&
            customerInfo?.email &&
            customerInfo?.phone
          ),
          hasEventSchedule: !!(
            selectedDates?.startDate && selectedDates?.endDate
          ),
          hasServices: cartItems.length > 0,
          hasPricing: !!(cartTotal && cartTotal > 0),
          isComplete: function () {
            return (
              this.hasCustomerInfo &&
              this.hasEventSchedule &&
              this.hasServices &&
              this.hasPricing
            );
          },
        },
      };

      // Log the complete booking data
      console.log("this is complete data", completeBookingData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate booking ID (you would get this from your API response)
      const generatedBookingId = completeBookingData.bookingId;
      setBookingId(generatedBookingId);

      // Show success popup
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("❌ Error confirming booking:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    dispatch(forceResetCart());
    dispatch(resetSubmissionStatus());

    setTimeout(() => {
      navigate("/", {
        replace: true,
        state: { transition: "fade" },
      });
    }, 300);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDuration = () => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) return 1;

    const startDate = new Date(selectedDates.startDate);
    const endDate = new Date(selectedDates.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  const eventDuration = calculateDuration();

  return (
    <>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn px-2 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Booking Preview
          </h1>
          <p className="text-gray-600 text-base sm:text-lg px-4 sm:px-0">
            Please review your event details before confirming your booking
            below
          </p>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <AlertCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600 mr-2 sm:mr-3" />
            <h2 className="text-lg sm:text-2xl font-bold text-amber-800">
              Terms & Conditions
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Refundable Deposit Policy */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-100">
              <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center">
                <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Refundable Deposit Policy
              </h3>
              <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                <p>
                  • To ensure the safety and return of our rental items, a
                  refundable deposit will be added to your invoice. This amount
                  is not fixed and varies based on your selected items.
                </p>
                <p>
                  • If all items are returned complete and in good condition,
                  your full deposit will be refunded.
                </p>
                <p>
                  • If any item is lost or damaged, the cost will be deducted
                  from the deposit.
                </p>
                <p>
                  • In cases where the deposit does not cover the full cost of
                  the damaged or missing items, clients will be required to pay
                  the balance to cover replacement or repair.
                </p>
                <p>
                  • We encourage all clients to handle rental items with care to
                  ensure a full refund of their deposit.
                </p>
              </div>
            </div>

            {/* Tax Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-100">
              <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Tax Information
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                A 7.5% tax will be added to your total price below.
              </p>
            </div>
          </div>
        </div>

        {/* Event Overview Card - FIXED FOR MOBILE */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-white/20">
          {/* Mobile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
              <BadgeInfo className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
              Event Overview
            </h2>
            <div className="flex items-center space-x-2 sm:space-x-2">
              <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {eventDuration} {eventDuration === 1 ? "Day" : "Days"}
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {cartItemCount} Service{cartItemCount !== 1 ? "s" : ""}
              </div>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-gray-600">Service Preferences:</span>
              <div className="font-medium text-gray-800 text-sm sm:text-base space-y-1">
                <div className="flex items-center">
                  <Truck className="w-3 h-3 mr-1" />
                  <span className="text-xs">
                    {customerInfo?.delivery === 'yes' ? 'Delivery Required' : 
                     customerInfo?.delivery === 'no' ? 'Self Pickup' : 'Delivery TBD'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Settings className="w-3 h-3 mr-1" />
                  <span className="text-xs">
                    {customerInfo?.installation === 'yes' ? 'Professional Setup' : 
                     customerInfo?.installation === 'no' ? 'Self Setup' : 'Setup TBD'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Event Type & Customer */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center mb-3 sm:mb-4">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2 sm:mr-3" />
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Event Details
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
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
                    Host:
                  </span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.name || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Expected Guests:
                  </span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.guests || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center mb-3 sm:mb-4">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 sm:mr-3" />
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Schedule
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
                {selectedDates?.multiDay &&
                  selectedDates?.endDate !== selectedDates?.startDate && (
                    <div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        End Date:
                      </span>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">
                        {formatDate(selectedDates?.endDate)}
                      </p>
                    </div>
                  )}
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Time:
                  </span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {formatTime(selectedDates?.startTime)} -{" "}
                    {formatTime(selectedDates?.endTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center mb-3 sm:mb-4">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-2 sm:mr-3" />
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Location & Contact
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Venue:
                  </span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Phone:
                  </span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.phone || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Email:
                  </span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.email || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {customerInfo?.specialRequests && (
            <div className="mt-4 sm:mt-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center mb-3 sm:mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mr-2 sm:mr-3" />
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

        {/* Services & Pricing */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-green-600" />
              <span className="hidden sm:inline">Selected Services</span>
              <span className="sm:hidden">Services</span>
            </h2>
            <button
              onClick={onEditDates}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm sm:text-base"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Edit Services</span>
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
                const itemDuration = item.duration || 1;
                const orderMode = item.orderMode || "booking";
                const itemTotal = itemPrice * itemQuantity;

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
                              {itemDuration}{" "}
                              {orderMode === "booking" ? "hr" : "day"}
                            </span>
                            <span>Qty: {itemQuantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {formatPrice(itemPrice)} each
                        </span>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">
                            {formatPrice(itemTotal)}
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
                              {itemDuration}{" "}
                              {orderMode === "booking" ? "hour(s)" : "day(s)"}
                            </span>
                            <span className="text-sm text-gray-600">
                              Qty: {itemQuantity}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatPrice(itemPrice)} each
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">
                          {formatPrice(itemTotal)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total for this service
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
                  No services selected
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
                      Subtotal:
                    </span>
                    <span className="text-lg sm:text-xl font-semibold text-gray-800">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 sm:pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-2xl font-bold text-gray-800">
                        Total(Tax inclusive):
                      </span>
                      <span className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="text-center pt-3 sm:pt-4">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Final amount may vary based on actual requirements
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Information */}
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
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Event Type</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.eventType || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.location || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Phone Number
                  </p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Email Address
                  </p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Number of Guests
                  </p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {customerInfo?.guests || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Preferences - Fixed Grid Layout */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Delivery Required
                </p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.delivery === "yes"
                    ? "Yes - Deliver to venue"
                    : customerInfo?.delivery === "no"
                    ? "No - Self pickup"
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Professional Setup
                </p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {customerInfo?.installation === "yes"
                    ? "Yes - Professional setup required"
                    : customerInfo?.installation === "no"
                    ? "No - Self setup"
                    : "Not specified"}
                </p>
              </div>
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

        {/* Action Buttons - FIXED FOR MOBILE */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 space-y-3 sm:space-y-0">
          <button
            onClick={onPrevious}
            disabled={isLoading}
            className="flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Previous
          </button>

          <button
            onClick={handleConfirmBooking}
            disabled={isLoading || !cartItems || cartItems.length === 0}
            className="flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 h-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">Processing...</span>
                <span className="sm:hidden">Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">
                  Confirm Booking ({formatPrice(cartTotal)})
                </span>
                <span className="sm:hidden">
                  Confirm ({formatPrice(cartTotal)})
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
                Secure Booking
              </span>
            </div>
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Trusted Service
              </span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Premium Quality
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <BookingSuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleCloseSuccessPopup}
        bookingId={bookingId}
        customerInfo={customerInfo}
      />
    </>
  );
};

export default BookingPreviewStep;