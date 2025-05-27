import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// Sample data for development
const sampleBookings = [
  {
    id: 1,
    customerName: 'Sarah Johnson',
    eventType: 'Wedding Reception',
    date: '2024-06-15',
    time: '6:00 PM',
    location: 'Grand Ballroom',
    status: 'pending',
    amount: '₦2,500,000',
    phone: '+234 803 123 4567',
    email: 'sarah.johnson@email.com',
    guests: 150,
    specialRequests: 'Vegetarian options needed, live band setup required',
    paymentStatus: 'partial',
    amountPaid: '₦1,000,000',
    createdAt: '2024-05-20T10:30:00Z'
  },
  {
    id: 2,
    customerName: 'Michael Chen',
    eventType: 'Corporate Event',
    date: '2024-06-18',
    time: '2:00 PM',
    location: 'Conference Center',
    status: 'confirmed',
    amount: '₦1,800,000',
    phone: '+234 807 987 6543',
    email: 'michael.chen@company.com',
    guests: 80,
    specialRequests: 'AV equipment, projector setup',
    paymentStatus: 'paid',
    amountPaid: '₦1,800,000',
    createdAt: '2024-05-18T14:15:00Z'
  },
  {
    id: 3,
    customerName: 'Emily Rodriguez',
    eventType: 'Birthday Party',
    date: '2024-06-20',
    time: '4:00 PM',
    location: 'Garden Pavilion',
    status: 'pending',
    amount: '₦950,000',
    phone: '+234 901 456 7890',
    email: 'emily.rodriguez@email.com',
    guests: 45,
    specialRequests: 'Birthday cake, decorations in pink theme',
    paymentStatus: 'unpaid',
    amountPaid: '₦0',
    createdAt: '2024-05-22T09:45:00Z'
  },
  {
    id: 4,
    customerName: 'David Thompson',
    eventType: 'Anniversary Dinner',
    date: '2024-06-22',
    time: '7:00 PM',
    location: 'Private Dining',
    status: 'confirmed',
    amount: '₦1,200,000',
    phone: '+234 805 234 5678',
    email: 'david.thompson@email.com',
    guests: 12,
    specialRequests: 'Romantic setup, wine pairing',
    paymentStatus: 'paid',
    amountPaid: '₦1,200,000',
    createdAt: '2024-05-19T16:20:00Z'
  },
  {
    id: 5,
    customerName: 'Lisa Wang',
    eventType: 'Baby Shower',
    date: '2024-06-25',
    time: '3:00 PM',
    location: 'Garden Pavilion',
    status: 'pending',
    amount: '₦750,000',
    phone: '+234 809 876 5432',
    email: 'lisa.wang@email.com',
    guests: 35,
    specialRequests: 'Baby shower decorations, non-alcoholic beverages only',
    paymentStatus: 'partial',
    amountPaid: '₦300,000',
    createdAt: '2024-05-21T11:30:00Z'
  },
  {
    id: 6,
    customerName: 'Lisa Wang',
    eventType: 'Baby Shower',
    date: '2024-06-25',
    time: '3:00 PM',
    location: 'Garden Pavilion',
    status: 'pending',
    amount: '₦750,000',
    phone: '+234 809 876 5432',
    email: 'lisa.wang@email.com',
    guests: 35,
    specialRequests: 'Baby shower decorations, non-alcoholic beverages only',
    paymentStatus: 'partial',
    amountPaid: '₦300,000',
    createdAt: '2024-05-21T11:30:00Z'
  },
  {
    id: 7,
    customerName: 'Lisa Wang',
    eventType: 'Baby Shower',
    date: '2024-06-25',
    time: '3:00 PM',
    location: 'Garden Pavilion',
    status: 'pending',
    amount: '₦750,000',
    phone: '+234 809 876 5432',
    email: 'lisa.wang@email.com',
    guests: 35,
    specialRequests: 'Baby shower decorations, non-alcoholic beverages only',
    paymentStatus: 'partial',
    amountPaid: '₦300,000',
    createdAt: '2024-05-21T11:30:00Z'
  }
];

// Async thunk for fetching bookings
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating booking status
export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      const data = await response.json();
      return { bookingId, status: data.status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching single booking details
export const fetchBookingDetails = createAsyncThunk(
  'bookings/fetchBookingDetails',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  bookings: sampleBookings, // Initialize with sample data
  selectedBooking: null,
  loading: false,
  error: null,
  statusFilter: 'all', // all, pending, confirmed, cancelled
  searchQuery: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: sampleBookings.length,
    itemsPerPage: 10
  },
  stats: {
    thisWeek: 3,
    thisMonth: 5,
    totalRevenue: 8200000
  }
};

const bookingsSlice = createSlice({
  name: 'bookings',
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
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = status;
      }
    },
    // Action to load sample data
    loadSampleData: (state) => {
      state.bookings = sampleBookings;
      state.pagination.totalItems = sampleBookings.length;
    }
  },
  extraReducers: (builder) => {
    builder
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
        // Fallback to sample data on error
        state.bookings = sampleBookings;
      })
      
      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
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
      });
  }
});

export const {
  setStatusFilter,
  setSearchQuery,
  setCurrentPage,
  clearSelectedBooking,
  clearError,
  updateBookingStatusOptimistic,
  loadSampleData
} = bookingsSlice.actions;

// Basic selectors with safe defaults
export const selectBookings = (state) => state.bookings?.bookings || [];
export const selectSelectedBooking = (state) => state.bookings?.selectedBooking || null;
export const selectBookingsLoading = (state) => state.bookings?.loading || false;
export const selectBookingsError = (state) => state.bookings?.error || null;
export const selectStatusFilter = (state) => state.bookings?.statusFilter || 'all';
export const selectSearchQuery = (state) => state.bookings?.searchQuery || '';
export const selectPagination = (state) => state.bookings?.pagination || {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10
};
export const selectBookingsStats = (state) => state.bookings?.stats || {
  thisWeek: 0,
  thisMonth: 0,
  totalRevenue: 0
};

// Memoized filtered bookings selector to prevent unnecessary rerenders
export const selectFilteredBookings = createSelector(
  [selectBookings, selectStatusFilter, selectSearchQuery],
  (bookings, statusFilter, searchQuery) => {
    if (!Array.isArray(bookings)) {
      return [];
    }
    
    return bookings.filter(booking => {
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchesSearch = !searchQuery || 
        booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    const pending = filteredBookings.filter(b => b.status === 'pending').length;
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length;
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length;
    
    return {
      total,
      pending,
      confirmed,
      cancelled
    };
  }
);

export default bookingsSlice.reducer;