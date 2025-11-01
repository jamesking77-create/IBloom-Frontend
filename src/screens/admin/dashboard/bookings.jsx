// Bookings.js - UPDATED VERSION with Profile Integration for Invoice
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Search,
  Filter,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Package,
  DollarSign,
  Users,
  Building,
  Truck,
  Settings,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import ibloomlogo from "../../../assets/ibloomcut.png";
import {
  updateBookingStatus,
  fetchBookingDetails,
  setStatusFilter,
  setSearchQuery,
  setCurrentPage,
  clearSelectedBooking,
  clearError,
  fetchBookings,
  selectFilteredBookings,
  selectBookingsLoading,
  selectBookingsError,
  selectStatusFilter,
  selectSearchQuery,
  selectPagination,
  selectSelectedBooking,
  selectBookingStats,
  updateBookingStatusOptimistic,
  getStatusInfo,
  // WebSocket action imports
  handleRealtimeNewBooking,
  handleRealtimeStatusUpdate,
  handleRealtimeBookingDeleted,
} from "../../../store/slices/booking-slice";
// ADDED: Import profile selector
import { fetchProfile } from "../../../store/slices/profile-slice";
import { formatCurrency } from "../../../utils/formatCcy";
import { notifySuccess } from "../../../utils/toastify";
import InvoiceHandler from "./invoiceHandler";
import useRealtimeBooking from "../../../utils/hooks/useRealTimeBookings";

// Helper function to get status styles (simplified - using getStatusInfo from slice)
const getStatusStyles = (status) => {
  const statusInfo = getStatusInfo(status);
  return {
    bg: statusInfo.bgClass,
    text: statusInfo.textClass,
    dot: statusInfo.dotClass,
  };
};

const Bookings = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectFilteredBookings);
  const loading = useSelector(selectBookingsLoading);
  const error = useSelector(selectBookingsError);
  const statusFilter = useSelector(selectStatusFilter);
  const searchQuery = useSelector(selectSearchQuery);
  const pagination = useSelector(selectPagination);
  const selectedBooking = useSelector(selectSelectedBooking);
  const bookingStats = useSelector(selectBookingStats);

  // ADDED: Get profile data for company info
  const profileData = useSelector((state) => state.profile.userData);
  const profileLoading = useSelector((state) => state.profile.loading);

  // WebSocket connection for real-time updates
  const {
    isConnected: wsConnected,
    connectionState: wsState,
    connectionError: wsError,
    reconnect: wsReconnect,
    clientId: wsClientId,
  } = useRealtimeBooking({
    enabled: true,
    clientType: "admin",
    onNewBooking: (data) => {
      console.log("🔔 Admin received new booking:", data);
      dispatch(handleRealtimeNewBooking(data));
      setTimeout(() => {
        dispatch(fetchBookings());
      }, 500);
      notifySuccess(`🎉 New booking from ${data.customerName}!`);
    },
    onBookingStatusUpdate: (data) => {
      console.log("🔄 Admin received status update:", data);
      dispatch(handleRealtimeStatusUpdate(data));
      setTimeout(() => {
        dispatch(fetchBookings());
      }, 500);
    },
    onBookingDeleted: (data) => {
      console.log("🗑️ Admin received deletion notification:", data);
      dispatch(handleRealtimeBookingDeleted(data));
      setTimeout(() => {
        dispatch(fetchBookings());
      }, 500);
    },
    onConnected: () => {
      console.log("✅ Admin WebSocket connected");
      dispatch(fetchBookings());
    },
    onDisconnected: () => {
      console.log("📵 Admin WebSocket disconnected");
    },
    onError: (error) => {
      console.error("❌ Admin WebSocket error:", error);
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [deletingBooking, setDeletingBooking] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [currentViewingBooking, setCurrentViewingBooking] = useState(null);
  const [expandedBookings, setExpandedBookings] = useState(new Set());
  const [expandedServices, setExpandedServices] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [sendingInvoice, setSendingInvoice] = useState(false);

  console.log("Bookings component loaded");

  // Load saved bank details from localStorage
  const loadSavedBankDetails = () => {
    try {
      const saved = localStorage.getItem("companyBankDetails");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load saved bank details:", error);
    }
    return {
      bankName: "",
      accountName: "",
      accountNumber: "",
      sortCode: "",
      swiftCode: "",
    };
  };

  // Save bank details to localStorage
  const saveBankDetails = (bankDetails) => {
    try {
      localStorage.setItem("companyBankDetails", JSON.stringify(bankDetails));
    } catch (error) {
      console.error("Failed to save bank details:", error);
    }
  };

  // ADDED: Helper function to get company info from profile with fallbacks
  const getCompanyInfoFromProfile = () => {
    const savedBankDetails = loadSavedBankDetails();

    return {
      name: profileData?.name || "Your Event Company",
      address: profileData?.location || "123 Business Street",
      city: "Lagos", // You might want to extract this from location if it's structured
      state: "Lagos State", // You might want to extract this from location if it's structured
      country: "Nigeria",
      phone: profileData?.phone || profileData?.mobile || "+234 123 456 7890",
      email: profileData?.email || "billing@youreventcompany.com",
      website: "www.youreventcompany.com", // Add website field to profile if needed
      // Bank details remain from localStorage
      bankDetails: {
        bankName: savedBankDetails.bankName,
        accountName: savedBankDetails.accountName,
        accountNumber: savedBankDetails.accountNumber,
        sortCode: savedBankDetails.sortCode,
        swiftCode: savedBankDetails.swiftCode,
      },
    };
  };

  // Helper function to calculate totals from services only
  const calculateTotalsFromServices = (services, taxRate = 0.075) => {
    const subtotal = services.reduce(
      (sum, service) => sum + (service.total || service.subtotal || 0),
      0
    );
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  useEffect(() => {
    dispatch(fetchBookings());
    // ADDED: Fetch profile data if not already loaded
    if (!profileData?.name && !profileLoading) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profileData?.name, profileLoading]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSelectedBooking());
    };
  }, [dispatch]);

  useEffect(() => {
    // Check for new booking flag on component mount and focus
    const checkForNewBooking = () => {
      const newBookingFlag = localStorage.getItem("newBookingCreated");
      const newBookingId = localStorage.getItem("newBookingId");

      if (newBookingFlag === "true") {
        notifySuccess("🎉 New booking received!");
        localStorage.removeItem("newBookingCreated");
        localStorage.removeItem("newBookingId");
        dispatch(fetchBookings());
      }
    };

    checkForNewBooking();

    const handleFocus = () => {
      checkForNewBooking();
    };

    window.addEventListener("focus", handleFocus);
    const interval = setInterval(checkForNewBooking, 5000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [dispatch]);

  const handleInvoiceSuccess = (message) => {
    notifySuccess(message);
    setShowInvoiceModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateTimeRange = (eventSchedule) => {
    if (!eventSchedule) return "N/A";
    const startDate = formatDate(eventSchedule.startDate);
    const endDate = formatDate(eventSchedule.endDate);
    const startTime = formatTime(eventSchedule.startTime);
    const endTime = formatTime(eventSchedule.endTime);

    if (!eventSchedule.isMultiDay) {
      return `${startDate} • ${startTime} - ${endTime}`;
    } else {
      return `${startDate} ${startTime} - ${endDate} ${endTime}`;
    }
  };

  const toggleBookingExpansion = (bookingId) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  const handleViewBooking = async (booking) => {
    setCurrentViewingBooking(booking);
    setShowViewModal(true);
    setExpandedServices(false);
  };

  // UPDATED: Invoice generation now uses profile data
  const handleGenerateInvoice = (booking) => {
    // Get company info from profile with fallbacks
    const companyInfo = getCompanyInfoFromProfile();

    // Calculate totals from services only
    const services =
      booking.services?.map((service) => ({
        id: service.serviceId,
        name: service.name,
        description: service.description,
        quantity: service.quantity,
        unitPrice: service.subtotal / service.quantity,
        total: service.subtotal,
        editable: false,
      })) || [];

    const taxRate = 0.075; // 7.5%
    const { subtotal, tax, total } = calculateTotalsFromServices(
      services,
      taxRate
    );

    // Initialize invoice data with booking information
    const bookingKey = booking.bookingId || booking._id || "unknown";
    const invoice = {
      invoiceNumber: `INV-${bookingKey}`,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now

      // UPDATED: Company details from profile (editable)
      company: companyInfo,

      // Customer details (from booking - NOT editable)
      customer: {
        name: booking.customer?.personalInfo?.name || "",
        email: booking.customer?.personalInfo?.email || "",
        phone: booking.customer?.personalInfo?.phone || "",
        address: booking.customer?.eventDetails?.location || "",
      },

      // Event details (NOT editable)
      event: {
        type: booking.customer?.eventDetails?.eventType || "",
        date: booking.eventSchedule?.startDate || "",
        time: `${booking.eventSchedule?.startTime || ""} - ${
          booking.eventSchedule?.endTime || ""
        }`,
        location: booking.customer?.eventDetails?.location || "",
        guests: booking.customer?.eventDetails?.numberOfGuests || 0,
      },

      // Services (NOT editable except descriptions)
      services,

      // Additional services (delivery/installation) - YES/NO ONLY
      additionalServices: [
        {
          id: "delivery",
          name: "Delivery Service",
          description: "Equipment delivery to event location",
          included: booking.customer?.eventDetails?.delivery === "yes",
          required: booking.customer?.eventDetails?.delivery === "yes",
        },
        {
          id: "installation",
          name: "Setup & Installation",
          description: "Professional equipment setup and installation",
          included: booking.customer?.eventDetails?.installation === "yes",
          required: booking.customer?.eventDetails?.installation === "yes",
        },
      ],

      // Pricing (calculated from services only)
      subtotal,
      taxRate,
      tax,
      total,

      // Additional fields
      notes: booking.customer?.eventDetails?.specialRequests || "",
      terms:
        "Payment is due within 30 days. Late payments may incur additional fees.",

      // Deposit info
      requiresDeposit: booking.businessData?.requiresDeposit || false,
      depositAmount: booking.businessData?.requiresDeposit ? total * 0.5 : 0,
    };

    setInvoiceData(invoice);
    setShowInvoiceModal(true);
  };

  // Rest of the component methods remain the same...
  const handleDeleteBooking = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    setDeletingBooking(true);
    try {
      const bookingId = bookingToDelete._id || bookingToDelete.bookingId;

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASEURL}api/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete booking");
      }

      const result = await response.json();
      notifySuccess(`Booking ${result.deletedBookingId} deleted successfully`);
      dispatch(fetchBookings());
      setShowDeleteModal(false);
      setBookingToDelete(null);

      if (
        currentViewingBooking &&
        (currentViewingBooking._id === bookingId ||
          currentViewingBooking.bookingId === bookingId)
      ) {
        setShowViewModal(false);
        setCurrentViewingBooking(null);
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
      alert(`Failed to delete booking: ${error.message}`);
    } finally {
      setDeletingBooking(false);
    }
  };

  const cancelDeleteBooking = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleSendInvoice = async () => {
    setSendingInvoice(true);
    try {
      const requestBody = {
        invoiceData: {
          ...invoiceData,
          bookingId:
            currentViewingBooking?._id || currentViewingBooking?.bookingId,
        },
        customerEmail: invoiceData.customer.email,
        customerName: invoiceData.customer.name,
      };

      console.log("Sending invoice email request:", requestBody);

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASEURL}api/bookings/send-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invoice");
      }

      const result = await response.json();

      notifySuccess(
        `Invoice ${invoiceData.invoiceNumber} sent successfully to ${invoiceData.customer.email}!`
      );
      setShowInvoiceModal(false);
    } catch (error) {
      console.error("Failed to send invoice:", error);
      alert(`Failed to send invoice: ${error.message}`);
    } finally {
      setSendingInvoice(false);
    }
  };

  const updateInvoiceField = (field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCompanyField = (field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value,
      },
    }));
  };

  const updateBankDetailField = (field, value) => {
    setInvoiceData((prev) => {
      const updatedBankDetails = {
        ...prev.company.bankDetails,
        [field]: value,
      };

      saveBankDetails(updatedBankDetails);

      return {
        ...prev,
        company: {
          ...prev.company,
          bankDetails: updatedBankDetails,
        },
      };
    });
  };

  const updateServiceField = (serviceIndex, field, value) => {
    setInvoiceData((prev) => {
      const updatedServices = [...prev.services];
      updatedServices[serviceIndex] = {
        ...updatedServices[serviceIndex],
        [field]: value,
      };

      if (field === "unitPrice" || field === "quantity") {
        updatedServices[serviceIndex].total =
          updatedServices[serviceIndex].unitPrice *
          updatedServices[serviceIndex].quantity;
      }

      const { subtotal, tax, total } = calculateTotalsFromServices(
        updatedServices,
        prev.taxRate
      );

      return {
        ...prev,
        services: updatedServices,
        subtotal,
        tax,
        total,
        depositAmount: prev.requiresDeposit ? total * 0.5 : 0,
      };
    });
  };

  const updateAdditionalServiceField = (serviceIndex, field, value) => {
    setInvoiceData((prev) => {
      const updatedServices = [...prev.additionalServices];
      updatedServices[serviceIndex] = {
        ...updatedServices[serviceIndex],
        [field]: value,
      };

      return {
        ...prev,
        additionalServices: updatedServices,
      };
    });
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setProcessingBookingId(bookingId);
    try {
      dispatch(updateBookingStatusOptimistic({ bookingId, status: newStatus }));

      if (
        currentViewingBooking &&
        (currentViewingBooking.bookingId === bookingId ||
          currentViewingBooking._id === bookingId)
      ) {
        setCurrentViewingBooking((prev) => ({ ...prev, status: newStatus }));
      }

      await dispatch(
        updateBookingStatus({ bookingId, status: newStatus })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update booking status:", error);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleApprove = (bookingId) => {
    handleStatusUpdate(bookingId, "confirmed");
  };

  const handleReject = (bookingId) => {
    handleStatusUpdate(bookingId, "cancelled");
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  // Calculate pagination
  const totalPages = Math.ceil(bookings.length / pagination.itemsPerPage);
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedBookings = bookings.slice(startIndex, endIndex);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Bookings Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and track all event bookings
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                {wsConnected ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <div
                  className={`w-2 h-2 rounded-full ${
                    wsConnected
                      ? "bg-green-500 animate-pulse"
                      : wsState === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    wsConnected
                      ? "text-green-600"
                      : wsState === "connecting"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {wsConnected
                    ? "Live Updates Active"
                    : wsState === "connecting"
                    ? "Connecting..."
                    : "Offline Mode"}
                </span>
              </div>
              {wsError && (
                <button
                  onClick={wsReconnect}
                  className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reconnect
                </button>
              )}
              {wsClientId && (
                <div className="text-xs text-gray-500 hidden sm:block">
                  ID: {wsClientId.slice(-6)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-800 text-sm sm:text-base">{error}</p>
              <button
                onClick={() => dispatch(clearError())}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm sm:text-base"
                />
              </div>

              {/* Status Filter */}
              <div className="relative sm:w-48">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white w-full text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="pending_confirmation">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
              <div>
                <div className="font-bold text-lg sm:text-xl text-gray-900">
                  {bookingStats.total}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">Total</div>
              </div>
              <div>
                <div className="font-bold text-lg sm:text-xl text-orange-600">
                  {bookingStats.pending}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">Pending</div>
              </div>
              <div>
                <div className="font-bold text-lg sm:text-xl text-green-600">
                  {bookingStats.confirmed}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">
                  Confirmed
                </div>
              </div>
              <div>
                <div className="font-bold text-lg sm:text-xl text-blue-600">
                  {bookingStats.multiDay}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">
                  Multi-day
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : paginatedBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedBookings.map((booking, index) => {
                const statusStyles = getStatusStyles(booking.status);
                const statusInfo = getStatusInfo(booking.status);
                const bookingKey =
                  booking._id || booking.bookingId || `booking-${index}`;
                const isProcessing = processingBookingId === booking._id;
                const isExpanded = expandedBookings.has(bookingKey);

                return (
                  <div
                    key={bookingKey}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    {/* Mobile Layout */}
                    <div className="block lg:hidden">
                      <div className="flex flex-col gap-4">
                        {/* Booking Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <User size={20} className="text-gray-500" />
                            <h3 className="font-semibold text-lg text-gray-900">
                              {booking.customer?.personalInfo?.name || "N/A"}
                            </h3>
                            <div
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusStyles.bg} ${statusStyles.text}`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${statusStyles.dot}`}
                              ></div>
                              {statusInfo.label}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {booking.customer?.eventDetails?.eventType || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {bookingKey}
                          </p>

                          <div className="flex justify-between items-end gap-2 mt-3">
                            <div className="grid grid-cols-1 gap-2 text-sm flex-1">
                              <div className="flex items-center gap-2">
                                <Calendar
                                  size={14}
                                  className="text-gray-400 flex-shrink-0"
                                />
                                <span className="truncate">
                                  {formatDateTimeRange(booking.eventSchedule)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin
                                  size={14}
                                  className="text-gray-400 flex-shrink-0"
                                />
                                <span className="truncate">
                                  {booking.customer?.eventDetails?.location ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right">
                                <div className="font-bold text-lg text-gray-900">
                                  {booking.pricing?.formatted?.total || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.pricing?.totalServices || 0} services
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  toggleBookingExpansion(bookingKey)
                                }
                                className="p-1 rounded-lg hover:bg-gray-100"
                              >
                                {isExpanded ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="border-t pt-3 mt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-gray-400" />
                                  <span>
                                    {booking.customer?.eventDetails
                                      ?.numberOfGuests || 0}{" "}
                                    guests
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone size={14} className="text-gray-400" />
                                  <span className="truncate">
                                    {booking.customer?.personalInfo?.phone ||
                                      "N/A"}
                                  </span>
                                </div>
                              </div>

                              {booking.eventSchedule?.isMultiDay && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock size={14} className="text-gray-400" />
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                    {booking.eventSchedule.durationInDays ||
                                      "Multi"}{" "}
                                    Day Event
                                  </span>
                                </div>
                              )}

                              {booking.customer?.eventDetails
                                ?.specialRequests && (
                                <div className="text-sm">
                                  <div className="flex items-start gap-2">
                                    <FileText
                                      size={14}
                                      className="text-gray-400 mt-0.5 flex-shrink-0"
                                    />
                                    <span className="text-gray-600">
                                      {
                                        booking.customer.eventDetails
                                          .specialRequests
                                      }
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleViewBooking(booking)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Eye size={16} />
                              <span className="hidden sm:inline">View</span>
                            </button>

                            <button
                              onClick={() => handleGenerateInvoice(booking)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              <FileText size={16} />
                              <span className="hidden sm:inline">Invoice</span>
                            </button>

                            <button
                              onClick={() => handleDeleteBooking(booking)}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <Trash2 size={16} />
                            </button>

                            {(booking.status === "pending_confirmation" ||
                              booking.status === "pending") && (
                              <>
                                <button
                                  onClick={() => handleApprove(booking._id)}
                                  disabled={isProcessing}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                                >
                                  <Check size={16} />
                                  <span className="hidden sm:inline">
                                    {isProcessing ? "Processing..." : "Approve"}
                                  </span>
                                  <span className="sm:hidden">✓</span>
                                </button>

                                <button
                                  onClick={() => handleReject(booking._id)}
                                  disabled={isProcessing}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                                >
                                  <X size={16} />
                                  <span className="hidden sm:inline">
                                    Reject
                                  </span>
                                  <span className="sm:hidden">✗</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                      <div className="flex items-center justify-between">
                        {/* Booking Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <User size={20} className="text-gray-500" />
                            <h3 className="font-semibold text-lg text-gray-900">
                              {booking.customer?.personalInfo?.name || "N/A"}
                            </h3>
                            <div
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`}
                              ></div>
                              {statusInfo.label}
                            </div>
                            {booking.eventSchedule?.isMultiDay && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                Multi-day
                              </span>
                            )}
                          </div>

                          <div className="text-gray-600 mb-4">
                            {booking.customer?.eventDetails?.eventType || "N/A"}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <span>
                                {formatDateTimeRange(booking.eventSchedule)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-gray-400" />
                              <span>
                                {booking.customer?.eventDetails?.location ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-gray-400" />
                              <span>
                                {booking.customer?.eventDetails
                                  ?.numberOfGuests || 0}{" "}
                                guests
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-gray-500">
                            <span>ID: {bookingKey}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {booking.pricing?.totalServices || 0} services
                            </span>
                            {booking.businessData?.requiresDeposit && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-orange-600">
                                  Deposit required
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Amount and Actions */}
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-bold text-xl text-gray-900">
                              {booking.pricing?.formatted?.total || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              Total Amount
                            </div>
                            <div className="text-xs text-gray-400">
                              Subtotal:{" "}
                              {booking.pricing?.formatted?.subtotal || "N/A"} +
                              Tax: {booking.pricing?.formatted?.tax || "N/A"}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewBooking(booking)}
                              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Eye size={16} />
                              View
                            </button>

                            <button
                              onClick={() => handleGenerateInvoice(booking)}
                              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              <FileText size={16} />
                              Invoice
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking)}
                              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              title="Delete Booking"
                            >
                              <Trash2 size={16} />
                            </button>

                            {(booking.status === "pending_confirmation" ||
                              booking.status === "pending") && (
                              <>
                                <button
                                  onClick={() => handleApprove(booking._id)}
                                  disabled={isProcessing}
                                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                                >
                                  <Check size={16} />
                                  {isProcessing ? "Processing..." : "Approve"}
                                </button>

                                <button
                                  onClick={() => handleReject(booking._id)}
                                  disabled={isProcessing}
                                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                                >
                                  <X size={16} />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, bookings.length)} of{" "}
            {bookings.length} bookings
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="hidden sm:flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (pagination.currentPage <= 3) {
                  page = i + 1;
                } else if (pagination.currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      page === pagination.currentPage
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Compact View Booking Modal */}
      {showViewModal && currentViewingBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Booking Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    ID:{" "}
                    {currentViewingBooking.bookingId ||
                      currentViewingBooking._id}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`flex items-center gap-3 p-3 rounded-lg mt-4 ${
                  getStatusInfo(currentViewingBooking.status).bgClass
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    getStatusInfo(currentViewingBooking.status).dotClass
                  }`}
                ></div>
                <div className="flex-1">
                  <div
                    className={`font-semibold ${
                      getStatusInfo(currentViewingBooking.status).textClass
                    }`}
                  >
                    {getStatusInfo(currentViewingBooking.status).label}
                  </div>
                  <div className="text-sm text-gray-600">
                    Booked on{" "}
                    {new Date(
                      currentViewingBooking.bookingDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Event Info - Compact Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <User size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="font-medium">
                        {currentViewingBooking.customer?.personalInfo?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span>
                        {currentViewingBooking.customer?.personalInfo?.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="break-all">
                        {currentViewingBooking.customer?.personalInfo?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Event Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Building
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span>
                        {
                          currentViewingBooking.customer?.eventDetails
                            ?.eventType
                        }
                      </span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Calendar
                        size={16}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <span>
                        {formatDateTimeRange(
                          currentViewingBooking.eventSchedule
                        )}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin
                        size={16}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <span>
                        {currentViewingBooking.customer?.eventDetails?.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span>
                        {
                          currentViewingBooking.customer?.eventDetails
                            ?.numberOfGuests
                        }{" "}
                        Guests
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Section - Compact Design */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Services Booked (
                    {currentViewingBooking.services?.length || 0})
                  </h3>
                  <button
                    onClick={() => setExpandedServices(!expandedServices)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {expandedServices ? "Collapse" : "Expand All"}
                    {expandedServices ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>

                {expandedServices ? (
                  // Expanded View - Grid Layout
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentViewingBooking.services?.map((service, index) => (
                      <div
                        key={service.serviceId || index}
                        className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex gap-3">
                          {service.image && (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {service.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {service.description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                Qty: {service.quantity}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(service.subtotal)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {service.category}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Compact List View
                  <div className="space-y-2">
                    {currentViewingBooking.services?.map((service, index) => (
                      <div
                        key={service.serviceId || index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {service.image && (
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {service.name}
                            </h4>
                            <span className="font-medium text-sm ml-2">
                              {formatCurrency(service.subtotal)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Qty: {service.quantity}</span>
                            <span>•</span>
                            <span>{service.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Special Requests */}
              {currentViewingBooking.customer?.eventDetails
                ?.specialRequests && (
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-3">
                    Special Requests
                  </h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm">
                    {
                      currentViewingBooking.customer.eventDetails
                        .specialRequests
                    }
                  </p>
                </div>
              )}

              {/* Pricing & Requirements - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pricing Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-3">
                    Pricing Breakdown
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Subtotal ({currentViewingBooking.pricing?.totalServices}{" "}
                        services):
                      </span>
                      <span>
                        {currentViewingBooking.pricing?.formatted?.subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax 7.5%:</span>
                      <span>
                        {currentViewingBooking.pricing?.formatted?.tax}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-lg">
                        {currentViewingBooking.pricing?.formatted?.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Requirements */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-3">
                    Service Requirements
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Package
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span>
                        Delivery:{" "}
                        {currentViewingBooking.customer?.eventDetails
                          ?.delivery === "yes"
                          ? "Required"
                          : "Not required"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Settings
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span>
                        Installation:{" "}
                        {currentViewingBooking.customer?.eventDetails
                          ?.installation === "yes"
                          ? "Required"
                          : "Not required"}
                      </span>
                    </div>
                    {currentViewingBooking.businessData?.requiresDeposit && (
                      <div className="flex items-start gap-3 text-sm">
                        <DollarSign
                          size={16}
                          className="text-orange-500 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <div className="font-medium text-orange-600">
                            Deposit Required
                          </div>
                          <div className="text-gray-600 text-xs">
                            {currentViewingBooking.businessData.depositPolicy}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 text-sm">
                      <FileText
                        size={16}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <div className="font-medium">Cancellation Policy</div>
                        <div className="text-gray-600 text-xs">
                          {
                            currentViewingBooking.businessData
                              ?.cancellationPolicy
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-shrink-0 border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {currentViewingBooking.status === "pending_confirmation" && (
                  <>
                    <button
                      onClick={() => handleApprove(currentViewingBooking._id)}
                      disabled={
                        processingBookingId === currentViewingBooking._id
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <Check size={18} />
                      {processingBookingId === currentViewingBooking._id
                        ? "Processing..."
                        : "Approve Booking"}
                    </button>
                    <button
                      onClick={() => handleReject(currentViewingBooking._id)}
                      disabled={
                        processingBookingId === currentViewingBooking._id
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <X size={18} />
                      Reject Booking
                    </button>
                  </>
                )}

                {currentViewingBooking.status === "confirmed" && (
                  <button
                    onClick={() => handleReject(currentViewingBooking._id)}
                    disabled={processingBookingId === currentViewingBooking._id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <X size={18} />
                    Cancel Booking
                  </button>
                )}

                {currentViewingBooking.status === "cancelled" && (
                  <button
                    onClick={() => handleApprove(currentViewingBooking._id)}
                    disabled={processingBookingId === currentViewingBooking._id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <Check size={18} />
                    Reactivate Booking
                  </button>
                )}

                <button
                  onClick={() => handleDeleteBooking(currentViewingBooking)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  title="Delete Booking Permanently"
                >
                  <Trash2 size={18} />
                  Delete
                </button>

                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updated Invoice Modal with Bank Details and Yes/No Additional Services */}
      {showInvoiceModal && invoiceData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full h-[95vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create Invoice
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Customize and send invoice to customer
                  </p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Invoice Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto bg-white">
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      INVOICE
                    </h1>
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <label className="text-sm font-medium text-gray-600 w-24">
                          Invoice #:
                        </label>
                        <input
                          type="text"
                          value={invoiceData.invoiceNumber}
                          onChange={(e) =>
                            updateInvoiceField("invoiceNumber", e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                        />
                      </div>
                      <div className="flex gap-4">
                        <label className="text-sm font-medium text-gray-600 w-24">
                          Issue Date:
                        </label>
                        <input
                          type="date"
                          value={invoiceData.issueDate}
                          onChange={(e) =>
                            updateInvoiceField("issueDate", e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex gap-4">
                        <label className="text-sm font-medium text-gray-600 w-24">
                          Due Date:
                        </label>
                        <input
                          type="date"
                          value={invoiceData.dueDate}
                          onChange={(e) =>
                            updateInvoiceField("dueDate", e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div className="text-right">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={ibloomlogo}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Company and Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* From Company */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">From:</h3>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={invoiceData.company.name}
                        onChange={(e) =>
                          updateCompanyField("name", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={invoiceData.company.address}
                        onChange={(e) =>
                          updateCompanyField("address", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={invoiceData.company.city}
                          onChange={(e) =>
                            updateCompanyField("city", e.target.value)
                          }
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={invoiceData.company.state}
                          onChange={(e) =>
                            updateCompanyField("state", e.target.value)
                          }
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Phone"
                        value={invoiceData.company.phone}
                        onChange={(e) =>
                          updateCompanyField("phone", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={invoiceData.company.email}
                        onChange={(e) =>
                          updateCompanyField("email", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>

                    {/* Bank Details Section */}
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Bank Details:
                      </h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={invoiceData.company.bankDetails?.bankName}
                          onChange={(e) =>
                            updateBankDetailField("bankName", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Account Name"
                          value={invoiceData.company.bankDetails.accountName}
                          onChange={(e) =>
                            updateBankDetailField("accountName", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={invoiceData.company.bankDetails.accountNumber}
                          onChange={(e) =>
                            updateBankDetailField(
                              "accountNumber",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Sort Code (Optional)"
                            value={invoiceData.company.bankDetails.sortCode}
                            onChange={(e) =>
                              updateBankDetailField("sortCode", e.target.value)
                            }
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="SWIFT Code (Optional)"
                            value={invoiceData.company.bankDetails.swiftCode}
                            onChange={(e) =>
                              updateBankDetailField("swiftCode", e.target.value)
                            }
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* To Customer */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Bill To:
                    </h3>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">
                        {invoiceData.customer.name}
                      </div>
                      <div className="text-gray-600">
                        {invoiceData.customer.email}
                      </div>
                      <div className="text-gray-600">
                        {invoiceData.customer.phone}
                      </div>
                      <div className="text-gray-600">
                        {invoiceData.customer.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Event Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {invoiceData.event.type}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(invoiceData.event.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>{" "}
                      {invoiceData.event.time}
                    </div>
                    <div>
                      <span className="font-medium">Guests:</span>{" "}
                      {invoiceData.event.guests}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Location:</span>{" "}
                      {invoiceData.event.location}
                    </div>
                  </div>
                </div>

                {/* Services Table */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Booked Services
                  </h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-700">
                            Service
                          </th>
                          <th className="text-center p-3 font-medium text-gray-700 w-20">
                            Qty
                          </th>
                          <th className="text-right p-3 font-medium text-gray-700 w-24">
                            Unit Price
                          </th>
                          <th className="text-right p-3 font-medium text-gray-700 w-24">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoiceData.services.map((service, index) => (
                          <tr key={service.id} className="bg-gray-50">
                            <td className="p-3">
                              <div className="font-medium text-gray-900">
                                {service.name}
                              </div>
                              <textarea
                                value={service.description}
                                onChange={(e) =>
                                  updateServiceField(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 mt-1 resize-none"
                                rows="2"
                                placeholder="Add service description..."
                              />
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-sm font-medium">
                                {service.quantity}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-sm font-medium">
                                {formatCurrency(service.unitPrice)}
                              </span>
                            </td>
                            <td className="p-3 text-right font-medium">
                              {formatCurrency(service.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Services - Updated to Yes/No format */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Additional Services
                  </h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-700">
                            Service
                          </th>
                          <th className="text-center p-3 font-medium text-gray-700 w-32">
                            Included
                          </th>
                          <th className="text-left p-3 font-medium text-gray-700">
                            Description / Price
                          </th>
                          <th className="text-right p-3 font-medium text-gray-700 w-24">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoiceData.additionalServices.map(
                          (service, index) => {
                            const isPriceableService =
                              service.name.toLowerCase().includes("delivery") ||
                              service.name
                                .toLowerCase()
                                .includes("installation");
                            const showPriceInput =
                              isPriceableService && service.included === true;

                            return (
                              <tr
                                key={service.id}
                                className={
                                  service.required ? "bg-yellow-50" : ""
                                }
                              >
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">
                                      {service.name}
                                    </span>
                                    {service.required && (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-4">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`service-${service.id}`}
                                        checked={service.included === true}
                                        onChange={() =>
                                          updateAdditionalServiceField(
                                            index,
                                            "included",
                                            true
                                          )
                                        }
                                        className="text-green-600"
                                      />
                                      <span className="text-sm font-medium text-green-600">
                                        Yes
                                      </span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`service-${service.id}`}
                                        checked={service.included === false}
                                        onChange={() =>
                                          updateAdditionalServiceField(
                                            index,
                                            "included",
                                            false
                                          )
                                        }
                                        className="text-red-600"
                                      />
                                      <span className="text-sm font-medium text-red-600">
                                        No
                                      </span>
                                    </label>
                                  </div>
                                </td>
                                <td className="p-3">
                                  {showPriceInput ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">
                                        ₦
                                      </span>
                                      <input
                                        type="number"
                                        value={service.price || ""}
                                        onChange={(e) =>
                                          updateAdditionalServiceField(
                                            index,
                                            "price",
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                                        placeholder="Enter price"
                                        min="0"
                                        step="0.01"
                                      />
                                    </div>
                                  ) : (
                                    <textarea
                                      value={service.description}
                                      onChange={(e) =>
                                        updateAdditionalServiceField(
                                          index,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 resize-none"
                                      rows="2"
                                      placeholder="Add service description..."
                                    />
                                  )}
                                </td>
                                <td className="p-3 text-right font-medium">
                                  {showPriceInput && service.price ? (
                                    formatCurrency(service.price)
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Additional services are included as specified. Required
                    services are marked based on customer selection.
                  </p>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-80">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(invoiceData.subtotal)}</span>
                      </div>
                      {(() => {
                        const additionalServicesTotal =
                          invoiceData.additionalServices
                            .filter((s) => s.included === true && s.price)
                            .reduce((sum, s) => sum + (s.price || 0), 0);

                        return additionalServicesTotal > 0 ? (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Additional Services:</span>
                            <span>
                              {formatCurrency(additionalServicesTotal)}
                            </span>
                          </div>
                        ) : null;
                      })()}
                      {(() => {
                        const additionalServicesTotal =
                          invoiceData.additionalServices
                            .filter((s) => s.included === true && s.price)
                            .reduce((sum, s) => sum + (s.price || 0), 0);
                        const subtotalWithAdditional =
                          invoiceData.subtotal + additionalServicesTotal;
                        const taxAmount =
                          subtotalWithAdditional * invoiceData.taxRate;

                        return (
                          <div className="flex justify-between">
                            <span>
                              Tax ({(invoiceData.taxRate * 100).toFixed(1)}%):
                            </span>
                            <span>{formatCurrency(taxAmount)}</span>
                          </div>
                        );
                      })()}
                      {(() => {
                        const additionalServicesTotal =
                          invoiceData.additionalServices
                            .filter((s) => s.included === true && s.price)
                            .reduce((sum, s) => sum + (s.price || 0), 0);
                        const subtotalWithAdditional =
                          invoiceData.subtotal + additionalServicesTotal;
                        const taxAmount =
                          subtotalWithAdditional * invoiceData.taxRate;
                        const grandTotal = subtotalWithAdditional + taxAmount;

                        return (
                          <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>{formatCurrency(grandTotal)}</span>
                          </div>
                        );
                      })()}
                      {invoiceData.requiresDeposit && (
                        <div className="flex justify-between text-orange-600">
                          <span>Deposit Required:</span>
                          <span>
                            {formatCurrency(invoiceData.depositAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Totals */}
                {/* <div className="flex justify-end mb-6">
                  <div className="w-80">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(invoiceData.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Tax ({(invoiceData.taxRate * 100).toFixed(1)}%):
                        </span>
                        <span>{formatCurrency(invoiceData.tax)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(invoiceData.total)}</span>
                      </div>
                      {invoiceData.requiresDeposit && (
                        <div className="flex justify-between text-orange-600">
                          <span>Deposit Required:</span>
                          <span>
                            {formatCurrency(invoiceData.depositAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div> */}

                {/* Notes and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                    <textarea
                      value={invoiceData.notes}
                      onChange={(e) =>
                        updateInvoiceField("notes", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24 resize-none"
                      placeholder="Special requests or additional information..."
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Terms & Conditions
                    </h3>
                    <textarea
                      value={invoiceData.terms}
                      onChange={(e) =>
                        updateInvoiceField("terms", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24 resize-none"
                      placeholder="Payment terms and conditions..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with InvoiceHandler */}
            <div className="flex-shrink-0 border-t border-gray-200 p-6">
              <div className="space-y-4">
                {/* Invoice Handler Component */}
                <InvoiceHandler
                  invoiceData={invoiceData}
                  onClose={() => setShowInvoiceModal(false)}
                  onSuccess={handleInvoiceSuccess}
                />

                {/* Close Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Booking Modal */}
      {showDeleteModal && bookingToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delete Booking
                  </h2>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-3">
                  Are you sure you want to permanently delete this booking?
                </p>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">Customer:</span>
                    <span className="text-gray-900">
                      {bookingToDelete.customer?.personalInfo?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">Event:</span>
                    <span className="text-gray-900">
                      {bookingToDelete.customer?.eventDetails?.eventType ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">Date:</span>
                    <span className="text-gray-900">
                      {bookingToDelete.eventSchedule?.startDate
                        ? formatDate(bookingToDelete.eventSchedule.startDate)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingToDelete.pricing?.formatted?.total || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ Warning: This will permanently delete the booking and send
                  a cancellation email to the customer.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={cancelDeleteBooking}
                disabled={deletingBooking}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBooking}
                disabled={deletingBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
