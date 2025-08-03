import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { get, put, post, patch, del } from "../../utils/api";

// Helper function to transform API data to component expected structure
const transformBookingData = (apiBooking) => {
  return {
    ...apiBooking,
    bookingId: apiBooking._id,
    id: apiBooking._id, // For backward compatibility
    // Transform flat structure to nested structure expected by component
    customer: apiBooking.customer || {
      personalInfo: {
        name: apiBooking.customerName || "N/A",
        email: apiBooking.email || "N/A",
        phone: apiBooking.phone || "N/A",
      },
      eventDetails: {
        eventType: apiBooking.eventType || "N/A",
        location: apiBooking.location || "N/A",
        numberOfGuests: apiBooking.guests || 0,
        specialRequests: apiBooking.specialRequests || "",
        delivery: "no", // Default since not in API response
        installation: "no", // Default since not in API response
      },
    },
    eventSchedule: apiBooking.eventSchedule || {
      startDate: apiBooking.startDate,
      endDate: apiBooking.endDate,
      startTime: apiBooking.startTime,
      endTime: apiBooking.endTime,
      isMultiDay: apiBooking.multiDay || false,
      durationInDays: apiBooking.multiDay
        ? Math.ceil(
            (new Date(apiBooking.endDate) - new Date(apiBooking.startDate)) /
              (1000 * 60 * 60 * 24)
          ) + 1
        : 1,
    },
    pricing: apiBooking.pricing || {
      subtotal: parseFloat(apiBooking.amount?.replace(/[₦,]/g, "") || 0),
      tax: parseFloat(apiBooking.amount?.replace(/[₦,]/g, "") || 0) * 0.075,
      total: parseFloat(apiBooking.amount?.replace(/[₦,]/g, "") || 0),
      totalServices:
        apiBooking.items?.length || apiBooking.services?.length || 0,
      formatted: {
        subtotal: apiBooking.amount || "₦0",
        tax: `₦${(
          parseFloat(apiBooking.amount?.replace(/[₦,]/g, "") || 0) * 0.075
        ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
        total: apiBooking.amount || "₦0",
      },
    },
    services: apiBooking.services || apiBooking.items || [],
    businessData: apiBooking.businessData || {
      requiresDeposit: false,
      depositPolicy: "Standard 50% deposit required",
      cancellationPolicy: "Cancellation allowed up to 48 hours before event",
    },
    bookingDate: apiBooking.createdAt,
    // Map original API status to expected status format
    status:
      apiBooking.status === "pending"
        ? "pending_confirmation"
        : apiBooking.status,
  };
};

// Async thunk for creating booking from cart - ENHANCED with WebSocket notification
export const createBookingFromCart = createAsyncThunk(
  "booking/createFromCart",
  async (bookingData, { rejectWithValue, getState }) => {
    try {
      console.log("🚀 Making API call to create booking...");
      console.log(
        "📦 Booking data being sent:",
        JSON.stringify(bookingData, null, 2)
      );

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASEURL}api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData), // Make sure this is properly stringified
        }
      );

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error response:", errorData);
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ API Success response:", result);

      // 🔔 NOTE: WebSocket notification is now handled by the backend
      // The backend will emit the WebSocket notification when the booking is created
      // This ensures admin gets notified immediately without relying on frontend WebSocket connection

      return result;
    } catch (error) {
      console.error("❌ API Call failed:", error);
      return rejectWithValue({
        message: error.message || "Failed to create booking",
        error: error.toString(),
      });
    }
  }
);

// Async thunk for fetching bookings
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get("/api/bookings");
      console.log("bookings response: ", response);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating booking status
export const updateBookingStatus = createAsyncThunk(
  "bookings/updateBookingStatus",
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await patch(`/api/bookings/${bookingId}/status`, {
        status,
      });
      return { bookingId, status: response.data.status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating booking payment status
export const updateBookingPayment = createAsyncThunk(
  "bookings/updateBookingPayment",
  async ({ bookingId, paymentStatus, amountPaid }, { rejectWithValue }) => {
    try {
      const response = await patch(`/api/bookings/${bookingId}/payment`, {
        paymentStatus,
        amountPaid,
      });
      return {
        bookingId,
        paymentStatus: response.data.paymentStatus,
        amountPaid: response.data.amountPaid,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching single booking details
export const fetchBookingDetails = createAsyncThunk(
  "bookings/fetchBookingDetails",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await get(`/api/bookings/${bookingId}`);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating booking items
export const updateBookingItems = createAsyncThunk(
  "bookings/updateBookingItems",
  async ({ bookingId, items, services }, { rejectWithValue }) => {
    try {
      const response = await patch(`/api/bookings/${bookingId}/items`, {
        items,
        services,
      });
      return {
        bookingId,
        items: response.data.items,
        services: response.data.services,
        amount: response.data.amount,
        pricing: response.data.pricing,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for generating and sending invoice
export const generateInvoice = createAsyncThunk(
  "bookings/generateInvoice",
  async ({ bookingId, invoiceData }, { rejectWithValue }) => {
    try {
      const response = await post(`/api/bookings/${bookingId}/invoice`, {
        invoiceData,
      });
      return { bookingId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
  statusFilter: "all",
  searchQuery: "",
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  stats: {
    thisWeek: 0,
    thisMonth: 0,
    totalRevenue: 0,
  },
  // Cart integration states
  creatingBooking: false,
  bookingCreated: false,
  lastCreatedBookingId: null,
  // Invoice states
  generatingInvoice: false,
  invoiceGenerated: false,
  lastInvoiceGenerated: null,
  // WebSocket states
  realtimeEnabled: true,
  newBookingNotifications: [], // Store recent notifications
  pendingUpdates: [], // Store updates that came via WebSocket before UI is ready
};

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.pagination.currentPage = 1;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for status changes - Fixed ID handling
    updateBookingStatusOptimistic: (state, action) => {
      const { bookingId, status } = action.payload;
      const booking = state.bookings.find(
        (b) =>
          b._id === bookingId || b.bookingId === bookingId || b.id === bookingId
      );
      if (booking) {
        booking.status = status;
      }
    },
    // Reset booking creation status
    resetBookingCreation: (state) => {
      state.bookingCreated = false;
      state.lastCreatedBookingId = null;
      state.creatingBooking = false;
      state.error = null;
    },
    // Reset invoice generation status
    resetInvoiceGeneration: (state) => {
      state.invoiceGenerated = false;
      state.lastInvoiceGenerated = null;
      state.generatingInvoice = false;
    },
    // 🔔 WebSocket-related reducers
    addNewBookingNotification: (state, action) => {
      const notification = {
        ...action.payload,
        id: `notif_${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      state.newBookingNotifications.unshift(notification);
      
      // Keep only last 10 notifications
      if (state.newBookingNotifications.length > 10) {
        state.newBookingNotifications = state.newBookingNotifications.slice(0, 10);
      }
    },
    
    markNotificationAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.newBookingNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
    
    clearNotifications: (state) => {
      state.newBookingNotifications = [];
    },
    
    // Handle real-time booking updates from WebSocket
    handleRealtimeNewBooking: (state, action) => {
      const bookingData = action.payload;
      console.log("🔔 Handling real-time new booking:", bookingData);
      
      // Add to notifications
      const notification = {
        type: 'new_booking',
        bookingId: bookingData.bookingId,
        customerName: bookingData.customerName,
        eventType: bookingData.eventType,
        total: bookingData.total,
        message: `New booking from ${bookingData.customerName}`,
        timestamp: bookingData.timestamp || new Date().toISOString(),
        id: `notif_${Date.now()}`,
        read: false
      };
      
      state.newBookingNotifications.unshift(notification);
      
      // Keep only last 10 notifications
      if (state.newBookingNotifications.length > 10) {
        state.newBookingNotifications = state.newBookingNotifications.slice(0, 10);
      }
      
      // Store update for potential UI refresh
      state.pendingUpdates.push({
        type: 'new_booking',
        timestamp: new Date().toISOString(),
        data: bookingData
      });
    },
    
    handleRealtimeStatusUpdate: (state, action) => {
      const updateData = action.payload;
      console.log("🔄 Handling real-time status update:", updateData);
      
      // Update booking in list if it exists
      const booking = state.bookings.find(
        (b) => b._id === updateData.bookingId || 
               b.bookingId === updateData.bookingId || 
               b.id === updateData.bookingId
      );
      
      if (booking) {
        booking.status = updateData.newStatus;
      }
      
      // Add to notifications
      const notification = {
        type: 'status_update',
        bookingId: updateData.bookingId,
        customerName: updateData.customerName,
        oldStatus: updateData.oldStatus,
        newStatus: updateData.newStatus,
        message: `Booking status changed from ${updateData.oldStatus} to ${updateData.newStatus}`,
        timestamp: updateData.timestamp || new Date().toISOString(),
        id: `notif_${Date.now()}`,
        read: false
      };
      
      state.newBookingNotifications.unshift(notification);
      
      if (state.newBookingNotifications.length > 10) {
        state.newBookingNotifications = state.newBookingNotifications.slice(0, 10);
      }
    },
    
    handleRealtimeBookingDeleted: (state, action) => {
      const deleteData = action.payload;
      console.log("🗑️ Handling real-time booking deletion:", deleteData);
      
      // Remove booking from list
      state.bookings = state.bookings.filter(
        (b) => b._id !== deleteData.bookingId && 
               b.bookingId !== deleteData.bookingId && 
               b.id !== deleteData.bookingId
      );
      
      // Add to notifications
      const notification = {
        type: 'booking_deleted',
        bookingId: deleteData.bookingId,
        customerName: deleteData.customerName,
        message: `Booking ${deleteData.bookingId} was deleted`,
        timestamp: deleteData.timestamp || new Date().toISOString(),
        id: `notif_${Date.now()}`,
        read: false
      };
      
      state.newBookingNotifications.unshift(notification);
      
      if (state.newBookingNotifications.length > 10) {
        state.newBookingNotifications = state.newBookingNotifications.slice(0, 10);
      }
    },
    
    clearPendingUpdates: (state) => {
      state.pendingUpdates = [];
    },
    
    setRealtimeEnabled: (state, action) => {
      state.realtimeEnabled = action.payload;
    },
    
    // Auto-refresh trigger (for use with WebSocket notifications)
    triggerAutoRefresh: (state) => {
      // This will trigger a re-fetch of bookings
      // The UI can listen to this action to refresh data
      state.lastAutoRefresh = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Create booking from cart - ENHANCED
      .addCase(createBookingFromCart.pending, (state) => {
        state.creatingBooking = true;
        state.error = null;
        state.bookingCreated = false;
      })
      .addCase(createBookingFromCart.fulfilled, (state, action) => {
        state.creatingBooking = false;
        state.bookingCreated = true;
        state.lastCreatedBookingId =
          action.payload.bookingId || action.payload._id;

        // Transform and add the new booking to the list
        const transformedBooking = transformBookingData(action.payload);
        state.bookings.unshift(transformedBooking);
        state.pagination.totalItems = state.bookings.length;
        
        // Store in localStorage for admin notification (fallback)
        if (typeof window !== "undefined") {
          localStorage.setItem("newBookingCreated", "true");
          localStorage.setItem(
            "newBookingId",
            action.payload.bookingId || action.payload._id
          );
        }
      })
      .addCase(createBookingFromCart.rejected, (state, action) => {
        state.creatingBooking = false;
        state.error = action.payload;
        state.bookingCreated = false;
      })

      // Fetch bookings - Fixed with data transformation
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;

        // Transform each booking to match component expectations
        const transformedBookings = (action.payload.bookings || []).map(
          transformBookingData
        );

        state.bookings = transformedBookings;
        state.pagination = action.payload.pagination || state.pagination;
        state.stats = action.payload.stats || state.stats;
        
        // Clear pending updates after successful fetch
        state.pendingUpdates = [];
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookings = [];
      })

      // Update booking status - Fixed ID handling
      .addCase(updateBookingStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const booking = state.bookings.find(
          (b) =>
            b._id === bookingId ||
            b.bookingId === bookingId ||
            b.id === bookingId
        );
        if (booking) {
          booking.status = status;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update booking payment - Fixed ID handling
      .addCase(updateBookingPayment.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingPayment.fulfilled, (state, action) => {
        const { bookingId, paymentStatus, amountPaid } = action.payload;
        const booking = state.bookings.find(
          (b) =>
            b._id === bookingId ||
            b.bookingId === bookingId ||
            b.id === bookingId
        );
        if (booking) {
          booking.paymentStatus = paymentStatus;
          booking.amountPaid = amountPaid;
        }
      })
      .addCase(updateBookingPayment.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch booking details - Fixed with data transformation
      .addCase(fetchBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = transformBookingData(action.payload);
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update booking items - Fixed ID handling
      .addCase(updateBookingItems.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingItems.fulfilled, (state, action) => {
        const { bookingId, items, services, amount, pricing } = action.payload;
        const booking = state.bookings.find(
          (b) =>
            b._id === bookingId ||
            b.bookingId === bookingId ||
            b.id === bookingId
        );
        if (booking) {
          if (services) booking.services = services;
          if (items) booking.items = items;
          if (amount) booking.amount = amount;
          if (pricing) booking.pricing = pricing;
        }
        if (
          state.selectedBooking &&
          (state.selectedBooking._id === bookingId ||
            state.selectedBooking.bookingId === bookingId ||
            state.selectedBooking.id === bookingId)
        ) {
          if (services) state.selectedBooking.services = services;
          if (items) state.selectedBooking.items = items;
          if (amount) state.selectedBooking.amount = amount;
          if (pricing) state.selectedBooking.pricing = pricing;
        }
      })
      .addCase(updateBookingItems.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Generate invoice
      .addCase(generateInvoice.pending, (state) => {
        state.generatingInvoice = true;
        state.error = null;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.generatingInvoice = false;
        state.invoiceGenerated = true;
        state.lastInvoiceGenerated = action.payload.invoiceNumber;

        // Update booking with invoice info
        const { bookingId } = action.payload;
        const booking = state.bookings.find(
          (b) =>
            b._id === bookingId ||
            b.bookingId === bookingId ||
            b.id === bookingId
        );
        if (booking) {
          booking.invoiceGenerated = true;
          booking.invoiceNumber = action.payload.invoiceNumber;
          booking.invoiceSentAt = new Date().toISOString();
        }
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.generatingInvoice = false;
        state.error = action.payload;
      });
  },
});

export const {
  setStatusFilter,
  setSearchQuery,
  setCurrentPage,
  clearSelectedBooking,
  clearError,
  updateBookingStatusOptimistic,
  resetBookingCreation,
  resetInvoiceGeneration,
  // WebSocket actions
  addNewBookingNotification,
  markNotificationAsRead,
  clearNotifications,
  handleRealtimeNewBooking,
  handleRealtimeStatusUpdate,
  handleRealtimeBookingDeleted,
  clearPendingUpdates,
  setRealtimeEnabled,
  triggerAutoRefresh
} = bookingsSlice.actions;

// Basic selectors with safe defaults
export const selectBookings = (state) => state.bookings?.bookings || [];
export const selectSelectedBooking = (state) =>
  state.bookings?.selectedBooking || null;
export const selectBookingsLoading = (state) =>
  state.bookings?.loading || false;
export const selectBookingsError = (state) => state.bookings?.error || null;
export const selectStatusFilter = (state) =>
  state.bookings?.statusFilter || "all";
export const selectSearchQuery = (state) => state.bookings?.searchQuery || "";
export const selectPagination = (state) =>
  state.bookings?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  };
export const selectBookingsStats = (state) =>
  state.bookings?.stats || {
    thisWeek: 0,
    thisMonth: 0,
    totalRevenue: 0,
  };

// Cart integration selectors
export const selectCreatingBooking = (state) =>
  state.bookings?.creatingBooking || false;
export const selectBookingCreated = (state) =>
  state.bookings?.bookingCreated || false;
export const selectLastCreatedBookingId = (state) =>
  state.bookings?.lastCreatedBookingId || null;

// Invoice selectors
export const selectGeneratingInvoice = (state) =>
  state.bookings?.generatingInvoice || false;
export const selectInvoiceGenerated = (state) =>
  state.bookings?.invoiceGenerated || false;
export const selectLastInvoiceGenerated = (state) =>
  state.bookings?.lastInvoiceGenerated || null;

// 🔔 WebSocket selectors
export const selectRealtimeEnabled = (state) =>
  state.bookings?.realtimeEnabled ?? true;
export const selectNewBookingNotifications = (state) =>
  state.bookings?.newBookingNotifications || [];
export const selectUnreadNotificationCount = (state) =>
  state.bookings?.newBookingNotifications?.filter(n => !n.read).length || 0;
export const selectPendingUpdates = (state) =>
  state.bookings?.pendingUpdates || [];
export const selectLastAutoRefresh = (state) =>
  state.bookings?.lastAutoRefresh || null;

// Memoized filtered bookings selector to prevent unnecessary rerenders
export const selectFilteredBookings = createSelector(
  [selectBookings, selectStatusFilter, selectSearchQuery],
  (bookings, statusFilter, searchQuery) => {
    if (!Array.isArray(bookings)) {
      return [];
    }

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        booking.customer?.personalInfo?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.customer?.eventDetails?.eventType
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.customer?.eventDetails?.location
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.customerName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.eventType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.location?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }
);

// Memoized stats selector
export const selectBookingStats = createSelector(
  [selectFilteredBookings],
  (filteredBookings) => {
    const total = filteredBookings.length;
    const pending = filteredBookings.filter(
      (b) => b.status === "pending_confirmation" || b.status === "pending"
    ).length;
    const confirmed = filteredBookings.filter(
      (b) => b.status === "confirmed"
    ).length;
    const cancelled = filteredBookings.filter(
      (b) => b.status === "cancelled"
    ).length;
    const singleDay = filteredBookings.filter(
      (b) => b.singleDay || !b.eventSchedule?.isMultiDay
    ).length;
    const multiDay = filteredBookings.filter(
      (b) => b.multiDay || b.eventSchedule?.isMultiDay
    ).length;

    return {
      total,
      pending,
      confirmed,
      cancelled,
      singleDay,
      multiDay,
    };
  }
);

// Utility function to get status display info
export const getStatusInfo = (status) => {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        color: "green",
        bgClass: "bg-green-50",
        textClass: "text-green-600",
        dotClass: "bg-green-500",
      };
    case "pending_confirmation":
    case "pending":
      return {
        label: "Pending",
        color: "orange",
        bgClass: "bg-orange-50",
        textClass: "text-orange-600",
        dotClass: "bg-orange-500",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "red",
        bgClass: "bg-red-50",
        textClass: "text-red-600",
        dotClass: "bg-red-500",
      };
    default:
      return {
        label: "Unknown",
        color: "gray",
        bgClass: "bg-gray-50",
        textClass: "text-gray-600",
        dotClass: "bg-gray-500",
      };
  }
};

export default bookingsSlice.reducer;