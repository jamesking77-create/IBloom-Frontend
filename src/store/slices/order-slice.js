import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { get, put, post, del } from "../../utils/api";


// // Async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    const response = await get('/api/orders'); 
    return response?.data;
  }
);

// export const fetchOrders = createAsyncThunk(
//   'orders/fetchOrders',
//   async (params = {}) => {
//     // Replace with your actual API call 
//     // const response = await fetch('/api/orders', { method: 'GET' });
//     // return response.json();
    
//     // Dummy data for now
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(dummyOrders);
//       }, 500);
//     });
//   }
// );

// Dummy data structure
const dummyOrders = [
  {
    id: 1,
    orderNumber: 'Order #41489',
    customerInfo: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 234-567-8900'
    },
    deliveryInfo: {
      type: 'delivery', 
      address: '123 Main St, City, State 12345',
      instructions: 'Leave at front door'
    },
    dateInfo: {
      orderDate: '2024-05-27T10:30:00Z',
      startDate: '2024-05-28T09:00:00Z',
      endDate: '2024-05-28T18:00:00Z',
      isMultiDay: false,
      duration: '9 hours'
    },
    items: [
      {
        id: 101,
        name: 'Professional Camera Set',
        category: 'Photography',
        quantity: 2,
        pricePerDay: 150,
        totalPrice: 300,
        image: '/api/placeholder/100/100'
      },
      {
        id: 102,
        name: 'Lighting Kit',
        category: 'Photography',
        quantity: 1,
        pricePerDay: 75,
        totalPrice: 75,
        image: '/api/placeholder/100/100'
      }
    ],
    pricing: {
      subtotal: 375,
      tax: 37.5,
      deliveryFee: 25,
      total: 437.5
    },
    status: 'confirmed', // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
    termsAccepted: true,
    notes: 'Customer requested early delivery if possible',
    createdAt: '2024-05-27T10:30:00Z',
    updatedAt: '2024-05-27T10:30:00Z'
  },
  {
    id: 2,
    orderNumber: 'Order #41490',
    customerInfo: {
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 234-567-8901'
    },
    deliveryInfo: {
      type: 'warehouse_pickup',
      address: 'Main Warehouse - 456 Industrial Blvd',
      instructions: 'Call upon arrival'
    },
    dateInfo: {
      orderDate: '2024-05-27T14:15:00Z',
      startDate: '2024-05-29T08:00:00Z',
      endDate: '2024-05-31T20:00:00Z',
      isMultiDay: true,
      duration: '3 days'
    },
    items: [
      {
        id: 103,
        name: 'Event Sound System',
        category: 'Audio',
        quantity: 1,
        pricePerDay: 200,
        totalPrice: 600,
        image: '/api/placeholder/100/100'
      },
      {
        id: 104,
        name: 'Wireless Microphones (Set of 4)',
        category: 'Audio',
        quantity: 1,
        pricePerDay: 100,
        totalPrice: 300,
        image: 'https://irukka.com/wp-content/uploads/2020/03/Wireless-Microphone-%E2%80%93-Wharfedale-Aerovocals-1.jpg'
      }
    ],
    pricing: {
      subtotal: 900,
      tax: 90,
      deliveryFee: 0,
      total: 990
    },
    status: 'pending',
    termsAccepted: true,
    notes: '',
    createdAt: '2024-05-27T14:15:00Z',
    updatedAt: '2024-05-27T14:15:00Z'
  },
  {
    id: 3,
    orderNumber: 'Order #41491',
    customerInfo: {
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      phone: '+1 234-567-8902'
    },
    deliveryInfo: {
      type: 'delivery',
      address: '789 Oak Avenue, Downtown, State 54321',
      instructions: 'Business address - ask for Mike at reception'
    },
    dateInfo: {
      orderDate: '2024-05-26T16:45:00Z',
      startDate: '2024-05-27T12:00:00Z',
      endDate: '2024-05-27T22:00:00Z',
      isMultiDay: false,
      duration: '10 hours'
    },
    items: [
      {
        id: 105,
        name: 'DJ Equipment Package',
        category: 'Audio',
        quantity: 1,
        pricePerDay: 300,
        totalPrice: 300,
        image: '/api/placeholder/100/100'
      }
    ],
    pricing: {
      subtotal: 300,
      tax: 30,
      deliveryFee: 20,
      total: 350
    },
    status: 'in_progress',
    termsAccepted: true,
    notes: 'Corporate event - handle with extra care',
    createdAt: '2024-05-26T16:45:00Z',
    updatedAt: '2024-05-27T08:00:00Z'
  }
];

const initialState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,
  filters: {
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    ordersPerPage: 10
  }
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
      }
      // Also update selected order if it's the same order
      if (state.selectedOrder && state.selectedOrder.id === orderId) {
        state.selectedOrder.status = status;
        state.selectedOrder.updatedAt = new Date().toISOString();
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        dateRange: 'all',
        searchTerm: ''
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.pagination.totalOrders = action.payload.length;
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.ordersPerPage);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const {
  setSelectedOrder,
  clearSelectedOrder,
  updateOrderStatus,
  setFilters,
  clearFilters,
  setPagination
} = ordersSlice.actions;

export default ordersSlice.reducer;

// Basic selectors
export const selectAllOrders = (state) => state.orders?.orders || [];
export const selectOrdersLoading = (state) => state.orders?.loading || false;
export const selectOrdersError = (state) => state.orders?.error || null;
export const selectSelectedOrder = (state) => state.orders?.selectedOrder || null;
export const selectOrderFilters = (state) => state.orders?.filters || initialState.filters;
export const selectOrderPagination = (state) => state.orders?.pagination || initialState.pagination;

// Memoized filtered orders selector using createSelector
export const selectFilteredOrders = createSelector(
  [selectAllOrders, selectOrderFilters],
  (orders, filters) => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }

    return orders.filter(order => {
      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = (
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.customerInfo.name.toLowerCase().includes(searchLower) ||
          order.customerInfo.email.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const orderDate = new Date(order.createdAt);
        
        switch (filters.dateRange) {
          case 'today':
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            if (orderDateOnly.getTime() !== today.getTime()) {
              return false;
            }
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (orderDate < weekAgo) {
              return false;
            }
            break;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            if (orderDate < monthAgo) {
              return false;
            }
            break;
          default:
            break;
        }
      }
      
      return true;
    });
  }
);