// store/slices/order-slice.js - CORRECTED ORDER SLICE
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { get, put, post, del } from "../../utils/api";

// Async thunks for order operations
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    const response = await get('/api/orders');
    return response?.data || response;
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData) => {
    const response = await post('/api/orders', orderData);
    return response?.data || response;
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, orderData }) => {
    const response = await put(`/api/orders/${orderId}`, orderData);
    return response?.data || response;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }) => {
    const response = await put(`/api/orders/${orderId}/status`, { status });
    return { orderId, status };
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId) => {
    await del(`/api/orders/${orderId}`);
    return orderId;
  }
);

export const sendOrderInvoice = createAsyncThunk(
  'orders/sendOrderInvoice',
  async (invoiceData) => {
    const response = await post('/api/orders/send-invoice', invoiceData);
    return response?.data || response;
  }
);

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
  },
  stats: {
    thisWeek: 0,
    thisMonth: 0,
    totalRevenue: 0
  },
  realTimeUpdates: {
    enabled: false,
    connected: false,
    lastUpdate: null
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
    },
    
    setRealTimeConnection: (state, action) => {
      state.realTimeUpdates.connected = action.payload;
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    
    enableRealTimeUpdates: (state) => {
      state.realTimeUpdates.enabled = true;
    },
    
    disableRealTimeUpdates: (state) => {
      state.realTimeUpdates.enabled = false;
      state.realTimeUpdates.connected = false;
    },
    
    addNewOrderRealTime: (state, action) => {
      const newOrder = action.payload;
      state.orders.unshift(newOrder);
      state.pagination.totalOrders += 1;
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    
    updateOrderRealTime: (state, action) => {
      const { orderId, updates } = action.payload;
      const orderIndex = state.orders.findIndex(order => 
        order._id === orderId || order.id === orderId
      );
      
      if (orderIndex !== -1) {
        state.orders[orderIndex] = { ...state.orders[orderIndex], ...updates };
        
        if (state.selectedOrder && 
            (state.selectedOrder._id === orderId || state.selectedOrder.id === orderId)) {
          state.selectedOrder = { ...state.selectedOrder, ...updates };
        }
      }
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    
    updateOrderStatusRealTime: (state, action) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.orders.findIndex(order => 
        order._id === orderId || order.id === orderId
      );
      
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
        state.orders[orderIndex].updatedAt = new Date().toISOString();
        
        if (state.selectedOrder && 
            (state.selectedOrder._id === orderId || state.selectedOrder.id === orderId)) {
          state.selectedOrder.status = status;
          state.selectedOrder.updatedAt = new Date().toISOString();
        }
      }
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    
    deleteOrderRealTime: (state, action) => {
      const orderId = action.payload;
      state.orders = state.orders.filter(order => 
        order._id !== orderId && order.id !== orderId
      );
      state.pagination.totalOrders = Math.max(0, state.pagination.totalOrders - 1);
      
      if (state.selectedOrder && 
          (state.selectedOrder._id === orderId || state.selectedOrder.id === orderId)) {
        state.selectedOrder = null;
      }
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    
    updateStatsRealTime: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
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
        
        if (action.payload && typeof action.payload === 'object') {
          if (action.payload.data && Array.isArray(action.payload.data)) {
            state.orders = action.payload.data;
            state.stats = action.payload.stats || state.stats;
            state.pagination = action.payload.pagination || state.pagination;
          } else if (Array.isArray(action.payload)) {
            state.orders = action.payload;
            state.pagination.totalOrders = action.payload.length;
            state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.ordersPerPage);
          }
        } else if (Array.isArray(action.payload)) {
          state.orders = action.payload;
          state.pagination.totalOrders = action.payload.length;
          state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.ordersPerPage);
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.pagination.totalOrders += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      .addCase(updateOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order || action.payload;
        const orderIndex = state.orders.findIndex(order => 
          order._id === updatedOrder._id || order.id === updatedOrder.id
        );
        
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        if (state.selectedOrder && 
            (state.selectedOrder._id === updatedOrder._id || state.selectedOrder.id === updatedOrder.id)) {
          state.selectedOrder = updatedOrder;
        }
      })
      
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        const orderIndex = state.orders.findIndex(order => 
          order._id === orderId || order.id === orderId
        );
        
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = status;
          state.orders[orderIndex].updatedAt = new Date().toISOString();
        }
        
        if (state.selectedOrder && 
            (state.selectedOrder._id === orderId || state.selectedOrder.id === orderId)) {
          state.selectedOrder.status = status;
          state.selectedOrder.updatedAt = new Date().toISOString();
        }
      })
      
      .addCase(deleteOrder.fulfilled, (state, action) => {
        const orderId = action.payload;
        state.orders = state.orders.filter(order => 
          order._id !== orderId && order.id !== orderId
        );
        state.pagination.totalOrders = Math.max(0, state.pagination.totalOrders - 1);
        
        if (state.selectedOrder && 
            (state.selectedOrder._id === orderId || state.selectedOrder.id === orderId)) {
          state.selectedOrder = null;
        }
      })
      
      .addCase(sendOrderInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOrderInvoice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.orderId) {
          const orderIndex = state.orders.findIndex(order => 
            order._id === action.payload.orderId
          );
          if (orderIndex !== -1) {
            state.orders[orderIndex].invoiceGenerated = true;
            state.orders[orderIndex].invoiceSentAt = new Date().toISOString();
          }
        }
      })
      .addCase(sendOrderInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const {
  setSelectedOrder,
  clearSelectedOrder,
  setFilters,
  clearFilters,
  setPagination,
  setRealTimeConnection,
  enableRealTimeUpdates,
  disableRealTimeUpdates,
  addNewOrderRealTime,
  updateOrderRealTime,
  updateOrderStatusRealTime,
  deleteOrderRealTime,
  updateStatsRealTime
} = ordersSlice.actions;

export default ordersSlice.reducer;

// Selectors - ONLY DEFINED ONCE
export const selectAllOrders = (state) => state.orders?.orders || [];
export const selectOrdersLoading = (state) => state.orders?.loading || false;
export const selectOrdersError = (state) => state.orders?.error || null;
export const selectSelectedOrder = (state) => state.orders?.selectedOrder || null;
export const selectOrderFilters = (state) => state.orders?.filters || initialState.filters;
export const selectOrderPagination = (state) => state.orders?.pagination || initialState.pagination;
export const selectOrderStats = (state) => state.orders?.stats || initialState.stats;
export const selectRealTimeUpdates = (state) => state.orders?.realTimeUpdates || initialState.realTimeUpdates;

export const selectFilteredOrders = createSelector(
  [selectAllOrders, selectOrderFilters],
  (orders, filters) => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }

    return orders.filter(order => {
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = (
          (order.orderNumber && order.orderNumber.toLowerCase().includes(searchLower)) ||
          (order.customerInfo?.name && order.customerInfo.name.toLowerCase().includes(searchLower)) ||
          (order.customerInfo?.email && order.customerInfo.email.toLowerCase().includes(searchLower))
        );
        if (!matchesSearch) {
          return false;
        }
      }
      
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const orderDate = new Date(order.createdAt || order.dateInfo?.orderDate);
        
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

export const selectOrdersByStatus = createSelector(
  [selectAllOrders],
  (orders) => {
    const stats = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };
    
    orders.forEach(order => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status]++;
      }
    });
    
    return stats;
  }
);

export const selectRecentOrders = createSelector(
  [selectAllOrders],
  (orders) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return orders.filter(order => 
      new Date(order.createdAt || order.dateInfo?.orderDate) >= weekAgo
    );
  }
);

export const selectOrdersRequiringAttention = createSelector(
  [selectAllOrders],
  (orders) => {
    const now = new Date();
    return orders.filter(order => {
      if (order.status === 'pending') return true;
      
      if (order.status === 'confirmed' && order.dateInfo?.startDate) {
        const startDate = new Date(order.dateInfo.startDate);
        return startDate < now;
      }
      
      return false;
    });
  }
);