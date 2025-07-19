import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { get, put, post, patch, del } from "../../utils/api";

// Sample data for development with enhanced date/time fields
// const sampleBookings = [
//   {
//     id: 1,
//     customerName: 'Sarah Johnson',
//     eventType: 'Wedding Reception',
//     startDate: '2024-06-15',
//     endDate: '2024-06-15',
//     startTime: '18:00', // 6:00 PM
//     endTime: '23:30', // 11:30 PM
//     singleDay: true,
//     multiDay: false,
//     location: 'Grand Ballroom',
//     status: 'pending',
//     amount: '₦2,500,000',
//     phone: '+234 803 123 4567',
//     email: 'sarah.johnson@email.com',
//     guests: 150,
//     specialRequests: 'Vegetarian options needed, live band setup required',
//     paymentStatus: 'partial',
//     amountPaid: '₦1,000,000',
//     createdAt: '2024-05-20T10:30:00Z',
//     items: []
//   },
//   {
//     id: 2,
//     customerName: 'Michael Chen',
//     eventType: 'Corporate Event',
//     startDate: '2024-06-18',
//     endDate: '2024-06-19',
//     startTime: '14:00', // 2:00 PM
//     endTime: '10:00', // 10:00 AM next day
//     singleDay: false,
//     multiDay: true,
//     location: 'Conference Center',
//     status: 'confirmed',
//     amount: '₦1,800,000',
//     phone: '+234 807 987 6543',
//     email: 'michael.chen@company.com',
//     guests: 80,
//     specialRequests: 'AV equipment, projector setup',
//     paymentStatus: 'paid',
//     amountPaid: '₦1,800,000',
//     createdAt: '2024-05-18T14:15:00Z',
//     items: []
//   },
//   {
//     id: 3,
//     customerName: 'Emily Rodriguez',
//     eventType: 'Birthday Party',
//     startDate: '2024-06-20',
//     endDate: '2024-06-20',
//     startTime: '16:00', // 4:00 PM
//     endTime: '20:00', // 8:00 PM
//     singleDay: true,
//     multiDay: false,
//     location: 'Garden Pavilion',
//     status: 'pending',
//     amount: '₦950,000',
//     phone: '+234 901 456 7890',
//     email: 'emily.rodriguez@email.com',
//     guests: 45,
//     specialRequests: 'Birthday cake, decorations in pink theme',
//     paymentStatus: 'unpaid',
//     amountPaid: '₦0',
//     createdAt: '2024-05-22T09:45:00Z',
//     items: []
//   },
//   {
//     id: 4,
//     customerName: 'David Thompson',
//     eventType: 'Anniversary Dinner',
//     startDate: '2024-06-22',
//     endDate: '2024-06-22',
//     startTime: '19:00', // 7:00 PM
//     endTime: '22:00', // 10:00 PM
//     singleDay: true,
//     multiDay: false,
//     location: 'Private Dining',
//     status: 'confirmed',
//     amount: '₦1,200,000',
//     phone: '+234 805 234 5678',
//     email: 'david.thompson@email.com',
//     guests: 12,
//     specialRequests: 'Romantic setup, wine pairing',
//     paymentStatus: 'paid',
//     amountPaid: '₦1,200,000',
//     createdAt: '2024-05-19T16:20:00Z',
//     items: []
//   },
//   {
//     id: 5,
//     customerName: 'Lisa Wang',
//     eventType: 'Baby Shower',
//     startDate: '2024-06-25',
//     endDate: '2024-06-25',
//     startTime: '15:00', // 3:00 PM
//     endTime: '18:00', // 6:00 PM
//     singleDay: true,
//     multiDay: false,
//     location: 'Garden Pavilion',
//     status: 'pending',
//     amount: '₦750,000',
//     phone: '+234 809 876 5432',
//     email: 'lisa.wang@email.com',
//     guests: 35,
//     specialRequests: 'Baby shower decorations, non-alcoholic beverages only',
//     paymentStatus: 'partial',
//     amountPaid: '₦300,000',
//     createdAt: '2024-05-21T11:30:00Z',
//     items: []
//   },
//   {
//     id: 6,
//     customerName: 'James Wilson',
//     eventType: 'Conference Summit',
//     startDate: '2024-06-28',
//     endDate: '2024-06-30',
//     startTime: '09:00', // 9:00 AM
//     endTime: '17:00', // 5:00 PM (last day)
//     singleDay: false,
//     multiDay: true,
//     location: 'Main Convention Hall',
//     status: 'confirmed',
//     amount: '₦4,500,000',
//     phone: '+234 805 111 2222',
//     email: 'james.wilson@conference.com',
//     guests: 300,
//     specialRequests: 'Full AV setup, catering for 3 days, accommodation assistance',
//     paymentStatus: 'partial',
//     amountPaid: '₦2,250,000',
//     createdAt: '2024-05-25T08:00:00Z',
//     items: []
//   },
//   {
//     id: 7,
//     customerName: 'Maria Santos',
//     eventType: 'Art Exhibition Opening',
//     startDate: '2024-07-02',
//     endDate: '2024-07-03',
//     startTime: '19:00', // 7:00 PM
//     endTime: '02:00', // 2:00 AM next day
//     singleDay: false,
//     multiDay: true,
//     location: 'Gallery Wing',
//     status: 'pending',
//     amount: '₦1,350,000',
//     phone: '+234 809 333 4444',
//     email: 'maria.santos@artgallery.com',
//     guests: 120,
//     specialRequests: 'Special lighting, wine service, art handling equipment',
//     paymentStatus: 'unpaid',
//     amountPaid: '₦0',
//     createdAt: '2024-05-28T12:00:00Z',
//     items: []
//   }
// ];

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
    // Optimistic update for status changes
    updateBookingStatusOptimistic: (state, action) => {
      const { bookingId, status } = action.payload;
      const booking = state.bookings.find((b) => b.id === bookingId);
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
    // Action to update booking with automatic day type recalculation
    updateBooking: (state, action) => {
      const { bookingId, updates } = action.payload;
      const bookingIndex = state.bookings.findIndex((b) => b.id === bookingId);
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
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (booking) {
        const existingItem = booking.items?.find((i) => i.id === item.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          booking.items = booking.items || [];
          booking.items.push({ ...item, quantity: 1 });
        }
        booking.amount = calculateTotalFromCart(booking.items);
      }
    },
    // Remove item from booking
    removeItemFromBooking: (state, action) => {
      const { bookingId, itemId } = action.payload;
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (booking && booking.items) {
        booking.items = booking.items.filter((item) => item.id !== itemId);
        booking.amount = calculateTotalFromCart(booking.items);
      }
    },
    // Update item quantity in booking
    updateBookingItemQuantity: (state, action) => {
      const { bookingId, itemId, quantity } = action.payload;
      const booking = state.bookings.find((b) => b.id === bookingId);
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
        state.lastCreatedBookingId = action.payload.id;

        // Add the new booking to the list
        const booking = action.payload;
        const dayType = calculateDayType(
          booking.startDate,
          booking.endDate,
          booking.startTime,
          booking.endTime
        );
        const newBooking = {
          ...booking,
          ...dayType,
          items: booking.items || [],
        };
        state.bookings.unshift(newBooking);
        state.pagination.totalItems = state.bookings.length;
      })
      .addCase(createBookingFromCart.rejected, (state, action) => {
        state.creatingBooking = false;
        state.error = action.payload;
      })

      // Fetch bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.stats = action.payload.stats || state.stats;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookings = [];
      })

      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (booking) {
          booking.status = status;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update booking payment
      .addCase(updateBookingPayment.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingPayment.fulfilled, (state, action) => {
        const { bookingId, paymentStatus, amountPaid } = action.payload;
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (booking) {
          booking.paymentStatus = paymentStatus;
          booking.amountPaid = amountPaid;
        }
      })
      .addCase(updateBookingPayment.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch booking details
      .addCase(fetchBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update booking items
      .addCase(updateBookingItems.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingItems.fulfilled, (state, action) => {
        const { bookingId, items, amount } = action.payload;
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (booking) {
          booking.items = items;
          booking.amount = amount;
        }
        if (state.selectedBooking && state.selectedBooking.id === bookingId) {
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
      (b) => b.status === "pending"
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

// Selector for booking items
export const selectBookingItems = createSelector(
  [selectSelectedBooking],
  (booking) => booking?.items || []
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

export default bookingsSlice.reducer;
