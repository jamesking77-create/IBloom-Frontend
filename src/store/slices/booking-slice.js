import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// Sample data for development with your exact data structure
const sampleBookings = [
  {
    bookingId: 'BK518482',
    bookingDate: '2025-07-18T13:48:38.482Z',
    status: 'pending_confirmation',
    orderMode: 'booking',
    customer: {
      personalInfo: {
        name: 'Oluwaleke',
        email: 'jamesasuelimen77@gmail.com',
        phone: '08142186524'
      },
      eventDetails: {
        eventType: 'Corporate Event',
        location: '312 Herbert Macaulay Way, Sabo Yaba, Lagos',
        numberOfGuests: 150,
        specialRequests: 'AV equipment needed for presentations',
        delivery: 'yes',
        installation: 'yes'
      }
    },
    eventSchedule: {
      startDate: '2025-07-30',
      endDate: '2025-07-30',
      startTime: '09:00',
      endTime: '17:00',
      durationInDays: 1,
      isMultiDay: false,
      formatted: {
        startDate: 'Wednesday, July 30, 2025',
        endDate: 'Wednesday, July 30, 2025',
        startTime: '9:00 AM',
        endTime: '5:00 PM',
        fullSchedule: 'Wednesday, July 30, 2025 from 9:00 AM to 5:00 PM'
      }
    },
    services: [
      {
        serviceId: 'cart_1752840329508_tr2dht5v8',
        name: 'Satin Table Covers',
        description: 'Elegant satin table covers in various colors',
        category: 'General',
        quantity: 1,
        unitPrice: 25,
        subtotal: 25,
        duration: 8,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        orderMode: 'booking',
        addedAt: '2025-07-18T12:05:29.508Z'
      },
      {
        serviceId: 'cart_1752845183437_4bsnhcro3',
        name: 'LED Inflatable Arches',
        description: 'Customizable LED inflatable entrance arches',
        category: 'General',
        quantity: 1,
        unitPrice: 275,
        subtotal: 275,
        duration: 8,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        orderMode: 'booking',
        addedAt: '2025-07-18T13:26:23.438Z'
      }
    ],
    pricing: {
      currency: 'NGN',
      itemsSubtotal: 300,
      taxAmount: 22.5,
      taxRate: 0.075,
      totalAmount: 322.5,
      totalItems: 2,
      totalServices: 2,
      formatted: {
        subtotal: '₦300.00',
        tax: '₦22.50',
        total: '₦322.50'
      }
    },
    businessData: {
      requiresDeposit: true,
      depositPolicy: 'Refundable deposit varies by items selected',
      cancellationPolicy: 'As per terms and conditions',
      deliveryRequired: true,
      setupRequired: true,
      followUpRequired: true,
      preferredContact: 'email'
    },
    validation: {
      hasCustomerInfo: true,
      hasEventSchedule: true,
      hasPricing: true,
      hasServices: true
    }
  },
  {
    bookingId: 'BK518483',
    bookingDate: '2025-07-17T10:30:15.123Z',
    status: 'confirmed',
    orderMode: 'booking',
    customer: {
      personalInfo: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '08034567890'
      },
      eventDetails: {
        eventType: 'Wedding Reception',
        location: 'Grand Ballroom, Victoria Island, Lagos',
        numberOfGuests: 200,
        specialRequests: 'Vegetarian options needed, live band setup required',
        delivery: 'yes',
        installation: 'yes'
      }
    },
    eventSchedule: {
      startDate: '2025-08-15',
      endDate: '2025-08-15',
      startTime: '18:00',
      endTime: '23:30',
      durationInDays: 1,
      isMultiDay: false,
      formatted: {
        startDate: 'Friday, August 15, 2025',
        endDate: 'Friday, August 15, 2025',
        startTime: '6:00 PM',
        endTime: '11:30 PM',
        fullSchedule: 'Friday, August 15, 2025 from 6:00 PM to 11:30 PM'
      }
    },
    services: [
      {
        serviceId: 'srv_001',
        name: 'Wedding Decoration Package',
        description: 'Complete wedding decoration with flowers and lighting',
        category: 'Wedding',
        quantity: 1,
        unitPrice: 150000,
        subtotal: 150000,
        duration: 12,
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        orderMode: 'booking',
        addedAt: '2025-07-17T09:15:20.100Z'
      }
    ],
    pricing: {
      currency: 'NGN',
      itemsSubtotal: 150000,
      taxAmount: 11250,
      taxRate: 0.075,
      totalAmount: 161250,
      totalItems: 1,
      totalServices: 1,
      formatted: {
        subtotal: '₦150,000.00',
        tax: '₦11,250.00',
        total: '₦161,250.00'
      }
    },
    businessData: {
      requiresDeposit: true,
      depositPolicy: '50% deposit required for wedding bookings',
      cancellationPolicy: '48 hours cancellation policy',
      deliveryRequired: true,
      setupRequired: true,
      followUpRequired: true,
      preferredContact: 'phone'
    },
    validation: {
      hasCustomerInfo: true,
      hasEventSchedule: true,
      hasPricing: true,
      hasServices: true
    }
  },
  {
    bookingId: 'BK518484',
    bookingDate: '2025-07-16T14:20:30.456Z',
    status: 'cancelled',
    orderMode: 'booking',
    customer: {
      personalInfo: {
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        phone: '08087654321'
      },
      eventDetails: {
        eventType: 'Birthday Party',
        location: 'Private Residence, Lekki, Lagos',
        numberOfGuests: 50,
        specialRequests: 'Children\'s party theme with bounce house',
        delivery: 'yes',
        installation: 'yes'
      }
    },
    eventSchedule: {
      startDate: '2025-07-28',
      endDate: '2025-07-29',
      startTime: '16:00',
      endTime: '12:00',
      durationInDays: 2,
      isMultiDay: true,
      formatted: {
        startDate: 'Monday, July 28, 2025',
        endDate: 'Tuesday, July 29, 2025',
        startTime: '4:00 PM',
        endTime: '12:00 PM',
        fullSchedule: 'Monday, July 28, 2025 at 4:00 PM to Tuesday, July 29, 2025 at 12:00 PM'
      }
    },
    services: [
      {
        serviceId: 'srv_002',
        name: 'Bounce House Rental',
        description: 'Large inflatable bounce house for children',
        category: 'Entertainment',
        quantity: 1,
        unitPrice: 25000,
        subtotal: 25000,
        duration: 20,
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        orderMode: 'booking',
        addedAt: '2025-07-16T13:45:15.200Z'
      }
    ],
    pricing: {
      currency: 'NGN',
      itemsSubtotal: 25000,
      taxAmount: 1875,
      taxRate: 0.075,
      totalAmount: 26875,
      totalItems: 1,
      totalServices: 1,
      formatted: {
        subtotal: '₦25,000.00',
        tax: '₦1,875.00',
        total: '₦26,875.00'
      }
    },
    businessData: {
      requiresDeposit: true,
      depositPolicy: '30% deposit required',
      cancellationPolicy: '24 hours cancellation policy',
      deliveryRequired: true,
      setupRequired: true,
      followUpRequired: false,
      preferredContact: 'email'
    },
    validation: {
      hasCustomerInfo: true,
      hasEventSchedule: true,
      hasPricing: true,
      hasServices: true
    }
  }
];

// Utility function to calculate total amount from services
const calculateTotalFromServices = (services) => {
  return services.reduce((total, service) => {
    return total + (service.subtotal || (service.unitPrice * service.quantity));
  }, 0);
};

// Async thunk for creating booking from cart
export const createBookingFromCart = createAsyncThunk(
  'bookings/createBookingFromCart',
  async (cartData, { rejectWithValue }) => {
    try {
      const { services, eventSchedule, customer, businessData } = cartData;
      
      // Calculate total amount from cart services
      const itemsSubtotal = calculateTotalFromServices(services);
      const taxAmount = itemsSubtotal * 0.075; // 7.5% tax
      const totalAmount = itemsSubtotal + taxAmount;
      
      // Prepare booking data
      const bookingData = {
        bookingId: `BK${Date.now()}`,
        bookingDate: new Date().toISOString(),
        status: 'pending_confirmation',
        orderMode: 'booking',
        customer,
        eventSchedule,
        services,
        pricing: {
          currency: 'NGN',
          itemsSubtotal,
          taxAmount,
          taxRate: 0.075,
          totalAmount,
          totalItems: services.length,
          totalServices: services.length,
          formatted: {
            subtotal: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(itemsSubtotal),
            tax: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(taxAmount),
            total: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalAmount)
          }
        },
        businessData: businessData || {
          requiresDeposit: true,
          depositPolicy: 'Refundable deposit varies by items selected',
          cancellationPolicy: 'As per terms and conditions',
          deliveryRequired: true,
          setupRequired: true,
          followUpRequired: true,
          preferredContact: 'email'
        },
        validation: {
          hasCustomerInfo: true,
          hasEventSchedule: true,
          hasPricing: true,
          hasServices: true
        }
      };
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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

// Async thunk for updating booking services
export const updateBookingServices = createAsyncThunk(
  'bookings/updateBookingServices',
  async ({ bookingId, services }, { rejectWithValue }) => {
    try {
      const itemsSubtotal = calculateTotalFromServices(services);
      const taxAmount = itemsSubtotal * 0.075;
      const totalAmount = itemsSubtotal + taxAmount;
      
      const response = await fetch(`/api/bookings/${bookingId}/services`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          services, 
          pricing: {
            itemsSubtotal,
            taxAmount,
            totalAmount,
            totalItems: services.length,
            totalServices: services.length
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking services');
      }
      
      const data = await response.json();
      return { bookingId, services: data.services, pricing: data.pricing };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  bookings: sampleBookings,
  selectedBooking: null,
  loading: false,
  error: null,
  statusFilter: 'all', // all, pending_confirmation, confirmed, cancelled
  searchQuery: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: sampleBookings.length,
    itemsPerPage: 10
  },
  stats: {
    thisWeek: 2,
    thisMonth: 3,
    totalRevenue: 188447.5
  },
  // Cart integration states
  creatingBooking: false,
  bookingCreated: false,
  lastCreatedBookingId: null
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
      const booking = state.bookings.find(b => b.bookingId === bookingId);
      if (booking) {
        booking.status = status;
      }
    },
    // Action to load sample data
    loadSampleData: (state) => {
      state.bookings = sampleBookings;
      state.pagination.totalItems = sampleBookings.length;
    },
    // Action to add new booking
    addBooking: (state, action) => {
      const booking = action.payload;
      const newBooking = {
        ...booking,
        bookingId: booking.bookingId || `BK${Date.now()}`,
        bookingDate: booking.bookingDate || new Date().toISOString(),
        services: booking.services || []
      };
      state.bookings.unshift(newBooking);
      state.pagination.totalItems = state.bookings.length;
    },
    // Action to update booking
    updateBooking: (state, action) => {
      const { bookingId, updates } = action.payload;
      const bookingIndex = state.bookings.findIndex(b => b.bookingId === bookingId);
      if (bookingIndex !== -1) {
        const updatedBooking = { ...state.bookings[bookingIndex], ...updates };
        
        // Recalculate pricing if services are updated
        if (updates.services) {
          const itemsSubtotal = calculateTotalFromServices(updates.services);
          const taxAmount = itemsSubtotal * 0.075;
          const totalAmount = itemsSubtotal + taxAmount;
          
          updatedBooking.pricing = {
            ...updatedBooking.pricing,
            itemsSubtotal,
            taxAmount,
            totalAmount,
            totalItems: updates.services.length,
            totalServices: updates.services.length
          };
        }
        
        state.bookings[bookingIndex] = updatedBooking;
      }
    },
    // Reset booking creation status
    resetBookingCreation: (state) => {
      state.bookingCreated = false;
      state.lastCreatedBookingId = null;
    },
    // Add service to existing booking
    addServiceToBooking: (state, action) => {
      const { bookingId, service } = action.payload;
      const booking = state.bookings.find(b => b.bookingId === bookingId);
      if (booking) {
        const existingService = booking.services?.find(s => s.serviceId === service.serviceId);
        if (existingService) {
          existingService.quantity += 1;
          existingService.subtotal = existingService.unitPrice * existingService.quantity;
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
    // Remove service from booking
    removeServiceFromBooking: (state, action) => {
      const { bookingId, serviceId } = action.payload;
      const booking = state.bookings.find(b => b.bookingId === bookingId);
      if (booking && booking.services) {
        booking.services = booking.services.filter(service => service.serviceId !== serviceId);
        
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
    // Update service quantity in booking
    updateBookingServiceQuantity: (state, action) => {
      const { bookingId, serviceId, quantity } = action.payload;
      const booking = state.bookings.find(b => b.bookingId === bookingId);
      if (booking && booking.services) {
        const service = booking.services.find(s => s.serviceId === serviceId);
        if (service && quantity > 0) {
          service.quantity = quantity;
          service.subtotal = service.unitPrice * quantity;
          
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
      }
    }
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
        state.lastCreatedBookingId = action.payload.bookingId;
        
        // Add the new booking to the list
        const booking = action.payload;
        state.bookings.unshift(booking);
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
        state.bookings = sampleBookings;
      })
      
      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const booking = state.bookings.find(b => b.bookingId === bookingId);
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
      })
      
      // Update booking services
      .addCase(updateBookingServices.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingServices.fulfilled, (state, action) => {
        const { bookingId, services, pricing } = action.payload;
        const booking = state.bookings.find(b => b.bookingId === bookingId);
        if (booking) {
          booking.services = services;
          booking.pricing = { ...booking.pricing, ...pricing };
        }
        if (state.selectedBooking && state.selectedBooking.bookingId === bookingId) {
          state.selectedBooking.services = services;
          state.selectedBooking.pricing = { ...state.selectedBooking.pricing, ...pricing };
        }
      })
      .addCase(updateBookingServices.rejected, (state, action) => {
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
  loadSampleData,
  addBooking,
  updateBooking,
  resetBookingCreation,
  addServiceToBooking,
  removeServiceFromBooking,
  updateBookingServiceQuantity
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

// Cart integration selectors
export const selectCreatingBooking = (state) => state.bookings?.creatingBooking || false;
export const selectBookingCreated = (state) => state.bookings?.bookingCreated || false;
export const selectLastCreatedBookingId = (state) => state.bookings?.lastCreatedBookingId || null;

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
        booking.customer?.personalInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer?.eventDetails?.eventType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer?.eventDetails?.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.bookingId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }
);

// Memoized stats selector
export const selectBookingStats = createSelector(
  [selectFilteredBookings],
  (filteredBookings) => {
    const total = filteredBookings.length;
    const pendingConfirmation = filteredBookings.filter(b => b.status === 'pending_confirmation').length;
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length;
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length;
    const singleDay = filteredBookings.filter(b => !b.eventSchedule?.isMultiDay).length;
    const multiDay = filteredBookings.filter(b => b.eventSchedule?.isMultiDay).length;
    
    return {
      total,
      pendingConfirmation,
      confirmed,
      cancelled,
      singleDay,
      multiDay
    };
  }
);

// Selector for booking services
export const selectBookingServices = createSelector(
  [selectSelectedBooking],
  (booking) => booking?.services || []
);

// Utility function to format currency
export const formatCurrency = (amount, currency = 'NGN') => {
  if (typeof amount === 'string' && amount.includes('₦')) {
    return amount;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
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
      return {
        label: 'Pending Confirmation',
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