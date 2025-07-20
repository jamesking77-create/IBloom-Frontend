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
    customer: {
      personalInfo: {
        name: apiBooking.customerName || 'N/A',
        email: apiBooking.email || 'N/A', 
        phone: apiBooking.phone || 'N/A'
      },
      eventDetails: {
        eventType: apiBooking.eventType || 'N/A',
        location: apiBooking.location || 'N/A',
        numberOfGuests: apiBooking.guests || 0,
        specialRequests: apiBooking.specialRequests || '',
        delivery: 'no', // Default since not in API response
        installation: 'no' // Default since not in API response
      }
    },
    eventSchedule: {
      startDate: apiBooking.startDate,
      endDate: apiBooking.endDate, 
      startTime: apiBooking.startTime,
      endTime: apiBooking.endTime,
      isMultiDay: apiBooking.multiDay || false,
      durationInDays: apiBooking.multiDay ? 
        Math.ceil((new Date(apiBooking.endDate) - new Date(apiBooking.startDate)) / (1000 * 60 * 60 * 24)) + 1 : 1
    },
    pricing: {
      subtotal: parseFloat(apiBooking.amount?.replace(/[₦,]/g, '') || 0),
      tax: parseFloat(apiBooking.amount?.replace(/[₦,]/g, '') || 0) * 0.075,
      total: parseFloat(apiBooking.amount?.replace(/[₦,]/g, '') || 0),
      totalServices: apiBooking.items?.length || 0,
      formatted: {
        subtotal: apiBooking.amount || '₦0',
        tax: `₦${(parseFloat(apiBooking.amount?.replace(/[₦,]/g, '') || 0) * 0.075).toLocaleString('en-NG', {minimumFractionDigits: 2})}`,
        total: apiBooking.amount || '₦0'
      }
    },
    services: apiBooking.items || [],
    businessData: {
      requiresDeposit: false,
      depositPolicy: 'Standard 50% deposit required',
      cancellationPolicy: 'Cancellation allowed up to 48 hours before event'
    },
    bookingDate: apiBooking.createdAt,
    // Map original API status to expected status format
    status: apiBooking.status === 'pending' ? 'pending_confirmation' : apiBooking.status
  };
};

// Utility function to calculate if event is single day or multi-day
const calculateDayType = (startDate, endDate, startTime, endTime) => {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  // If end date is different from start date, it's definitely multi-day
  if (startDate !== endDate) {
    return { singleDay: false, multiDay: true };
  }

  // If same date but end time is earlier than start time, it means it goes to next day
  if (endTime < startTime) {
    return { singleDay: false, multiDay: true };
  }

  // Otherwise, it's a single day event
  return { singleDay: true, multiDay: false };
};

// Utility function to calculate total amount from cart items
const calculateTotalFromCart = (items) => {
  return items.reduce((total, item) => {
    const itemPrice = parseFloat(item.price);
    return total + itemPrice * item.quantity;
  }, 0);
};

// Async thunk for creating booking from cart
export const createBookingFromCart = createAsyncThunk(
  "bookings/createBookingFromCart",
  async (cartData, { rejectWithValue }) => {
    try {
      const { items, selectedDates, customerInfo } = cartData;

      // Calculate total amount from cart items
      const totalAmount = calculateTotalFromCart(items);

      // Prepare booking data
      const bookingData = {
        customerName: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        eventType: customerInfo.eventType,
        guests: customerInfo.guests,
        specialRequests: customerInfo.specialRequests,
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate,
        startTime: selectedDates.startTime,
        endTime: selectedDates.endTime,
        items: items,
        amount: totalAmount,
        status: "pending",
        paymentStatus: "unpaid",
        amountPaid: 0,
        location: customerInfo.location || "TBD",
      };

      const response = await post("/api/bookings", bookingData);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching bookings
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get("/api/bookings");
      console.log("bookings response: ", response)
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
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
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating booking items
export const updateBookingItems = createAsyncThunk(
  "bookings/updateBookingItems",
  async ({ bookingId, items }, { rejectWithValue }) => {
    try {
      const totalAmount = calculateTotalFromCart(items);

      const response = await patch(`/api/bookings/${bookingId}/items`, {
        items,
        amount: totalAmount,
      });
      return {
        bookingId,
        items: response.data.items,
        amount: response.data.amount,
      };
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
    thisWeek: 3,
    thisMonth: 5,
    totalRevenue: 8200000,
  },
  // Cart integration states
  creatingBooking: false,
  bookingCreated: false,
  lastCreatedBookingId: null,
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
      const booking = state.bookings.find((b) => 
        b._id === bookingId || 
        b.bookingId === bookingId || 
        b.id === bookingId
      );
      if (booking) {
        booking.status = status;
      }
    },
    // Action to add new booking with automatic day type calculation
    addBooking: (state, action) => {
      const booking = action.payload;
      const dayType = calculateDayType(
        booking.startDate,
        booking.endDate,
        booking.startTime,
        booking.endTime
      );
      const newBooking = {
        ...booking,
        id: Date.now(), // Simple ID generation for demo
        ...dayType,
        createdAt: new Date().toISOString(),
        items: booking.items || [],
      };
      state.bookings.unshift(newBooking);
      state.pagination.totalItems = state.bookings.length;
    },
    // Action to update booking
    updateBooking: (state, action) => {
      const { bookingId, updates } = action.payload;
      const bookingIndex = state.bookings.findIndex((b) => 
        b._id === bookingId || 
        b.bookingId === bookingId || 
        b.id === bookingId
      );
      if (bookingIndex !== -1) {
        const updatedBooking = { ...state.bookings[bookingIndex], ...updates };

        // Recalculate day type if date/time fields are updated
        if (
          updates.startDate ||
          updates.endDate ||
          updates.startTime ||
          updates.endTime
        ) {
          const dayType = calculateDayType(
            updatedBooking.startDate,
            updatedBooking.endDate,
            updatedBooking.startTime,
            updatedBooking.endTime
          );
          updatedBooking.singleDay = dayType.singleDay;
          updatedBooking.multiDay = dayType.multiDay;
        }

        // Recalculate total amount if items are updated
        if (updates.items) {
          updatedBooking.amount = calculateTotalFromCart(updates.items);
        }

        state.bookings[bookingIndex] = updatedBooking;
      }
    },
    // Reset booking creation status
    resetBookingCreation: (state) => {
      state.bookingCreated = false;
      state.lastCreatedBookingId = null;
    },
    // Add item to existing booking
    addItemToBooking: (state, action) => {
      const { bookingId, item } = action.payload;
      const booking = state.bookings.find((b) => 
        b._id === bookingId || 
        b.bookingId === bookingId || 
        b.id === bookingId
      );
      if (booking) {
        const existingItem = booking.items?.find((i) => i.id === item.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          booking.services = booking.services || [];
          booking.services.push({ ...service, quantity: 1, subtotal: service.unitPrice });
        }
        
        // Recalculate pricing
        const itemsSubtotal = calculateTotalFromServices(booking.services);
        const taxAmount = itemsSubtotal * 0.075;
        const totalAmount = itemsSubtotal + taxAmount;
        
        booking.pricing = {
          ...booking.pricing,
          itemsSubtotal,
          taxAmount,
          totalAmount,
          totalItems: booking.services.length,
          totalServices: booking.services.length
        };
      }
    },
    // Remove item from booking
    removeItemFromBooking: (state, action) => {
      const { bookingId, itemId } = action.payload;
      const booking = state.bookings.find((b) => 
        b._id === bookingId || 
        b.bookingId === bookingId || 
        b.id === bookingId
      );
      if (booking && booking.items) {
        booking.items = booking.items.filter((item) => item.id !== itemId);
        booking.amount = calculateTotalFromCart(booking.items);
      }
    },
    // Update item quantity in booking
    updateBookingItemQuantity: (state, action) => {
      const { bookingId, itemId, quantity } = action.payload;
      const booking = state.bookings.find((b) => 
        b._id === bookingId || 
        b.bookingId === bookingId || 
        b.id === bookingId
      );
      if (booking && booking.items) {
        const item = booking.items.find((i) => i.id === itemId);
        if (item && quantity > 0) {
          item.quantity = quantity;
          booking.amount = calculateTotalFromCart(booking.items);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking from cart
      .addCase(createBookingFromCart.pending, (state) => {
        state.creatingBooking = true;
        state.error = null;
      })
      .addCase(createBookingFromCart.fulfilled, (state, action) => {
        state.creatingBooking = false;
        state.bookingCreated = true;
        state.lastCreatedBookingId = action.payload._id;

        // Transform and add the new booking to the list
        const transformedBooking = transformBookingData(action.payload);
        state.bookings.unshift(transformedBooking);
        state.pagination.totalItems = state.bookings.length;
      })
      .addCase(createBookingFromCart.rejected, (state, action) => {
        state.creatingBooking = false;
        state.error = action.payload;
      })

      // Fetch bookings - Fixed with data transformation
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        
        // Transform each booking to match component expectations
        const transformedBookings = (action.payload.bookings || []).map(transformBookingData);
        
        state.bookings = transformedBookings;
        state.pagination = action.payload.pagination || state.pagination;
        state.stats = action.payload.stats || state.stats;
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
        const booking = state.bookings.find((b) => 
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
        const booking = state.bookings.find((b) => 
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
        const { bookingId, items, amount } = action.payload;
        const booking = state.bookings.find((b) => 
          b._id === bookingId || 
          b.bookingId === bookingId || 
          b.id === bookingId
        );
        if (booking) {
          booking.items = items;
          booking.amount = amount;
        }
        if (state.selectedBooking && 
            (state.selectedBooking._id === bookingId || 
             state.selectedBooking.bookingId === bookingId || 
             state.selectedBooking.id === bookingId)) {
          state.selectedBooking.items = items;
          state.selectedBooking.amount = amount;
        }
      })
      .addCase(updateBookingItems.rejected, (state, action) => {
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
  addBooking,
  updateBooking,
  resetBookingCreation,
  addItemToBooking,
  removeItemFromBooking,
  updateBookingItemQuantity,
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
        booking.customer?.eventDetails?.eventType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer?.eventDetails?.location?.toLowerCase().includes(searchQuery.toLowerCase());

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
    const singleDay = filteredBookings.filter((b) => b.singleDay).length;
    const multiDay = filteredBookings.filter((b) => b.multiDay).length;

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

// Selector for booking services
export const selectBookingServices = createSelector(
  [selectSelectedBooking],
  (booking) => booking?.services || []
);

// Utility function to format time for display
export const formatTime = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Utility function to calculate event duration
export const calculateEventDuration = (
  startDate,
  endDate,
  startTime,
  endTime
) => {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  const diffMs = end - start;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    return `${days} day${
      days > 1 ? "s" : ""
    } ${remainingHours}h ${diffMinutes}m`;
  }

  return `${diffHours}h ${diffMinutes}m`;
};

// Utility function to format price
export const formatPrice = (amount) => {
  if (typeof amount === "string") {
    return amount;
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Utility function to get status display info
export const getStatusInfo = (status) => {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Confirmed',
        color: 'green',
        bgClass: 'bg-green-50',
        textClass: 'text-green-600',
        dotClass: 'bg-green-500'
      };
    case 'pending_confirmation':
    case 'pending':
      return {
        label: 'Pending',
        color: 'orange',
        bgClass: 'bg-orange-50',
        textClass: 'text-orange-600',
        dotClass: 'bg-orange-500'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        color: 'red',
        bgClass: 'bg-red-50',
        textClass: 'text-red-600',
        dotClass: 'bg-red-500'
      };
    default:
      return {
        label: 'Unknown',
        color: 'gray',
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-600',
        dotClass: 'bg-gray-500'
      };
  }
};

export default bookingsSlice.reducer;