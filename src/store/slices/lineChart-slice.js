import { createSlice } from '@reduxjs/toolkit';

// Initial state with sample data
const initialState = {
  data: [
    { name: 'Jan', bookings: 40, revenue: 240000 },
    { name: 'Feb', bookings: 30, revenue: 139800 },
    { name: 'Mar', bookings: 20, revenue: 980000 },
    { name: 'Apr', bookings: 27, revenue: 390800 },
    { name: 'May', bookings: 18, revenue: 480000 },
    { name: 'Jun', bookings: 23, revenue: 380000 },
    { name: 'Jul', bookings: 34, revenue: 430000 },
  ],
  loading: false,
  error: null,
  selectedMetrics: ['bookings', 'revenue'], // Which metrics to display
  dateRange: {
    start: null,
    end: null
  },
  totalBookings: 0,
  totalRevenue: 0,
  averageBookings: 0,
  averageRevenue: 0
};

const lineChartSlice = createSlice({
  name: 'lineChart',
  initialState,
  reducers: {
    // Set chart data
    setChartData: (state, action) => {
      state.data = action.payload;
      lineChartSlice.caseReducers.calculateTotals(state);
    },
    
    // Add new data point
    addDataPoint: (state, action) => {
      const { name, bookings, revenue } = action.payload;
      const existingIndex = state.data.findIndex(item => item.name === name);
      
      if (existingIndex >= 0) {
        // Update existing data point
        state.data[existingIndex] = { name, bookings, revenue };
      } else {
        // Add new data point
        state.data.push({ name, bookings, revenue });
      }
      
      lineChartSlice.caseReducers.calculateTotals(state);
    },
    
    // Update specific data point
    updateDataPoint: (state, action) => {
      const { name, updates } = action.payload;
      const index = state.data.findIndex(item => item.name === name);
      
      if (index >= 0) {
        state.data[index] = { ...state.data[index], ...updates };
        lineChartSlice.caseReducers.calculateTotals(state);
      }
    },
    
    // Remove data point
    removeDataPoint: (state, action) => {
      const name = action.payload;
      state.data = state.data.filter(item => item.name !== name);
      lineChartSlice.caseReducers.calculateTotals(state);
    },
    
    // Set which metrics to display
    setSelectedMetrics: (state, action) => {
      state.selectedMetrics = action.payload;
    },
    
    // Toggle metric visibility
    toggleMetric: (state, action) => {
      const metric = action.payload;
      if (state.selectedMetrics.includes(metric)) {
        state.selectedMetrics = state.selectedMetrics.filter(m => m !== metric);
      } else {
        state.selectedMetrics.push(metric);
      }
    },
    
    // Set date range filter
    setDateRange: (state, action) => {
      const { start, end } = action.payload;
      state.dateRange = { start, end };
    },
    
    // Clear date range filter
    clearDateRange: (state) => {
      state.dateRange = { start: null, end: null };
    },
    
    // Calculate totals and averages
    calculateTotals: (state) => {
      const totalBookings = state.data.reduce((sum, item) => sum + (item.bookings || 0), 0);
      const totalRevenue = state.data.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const dataLength = state.data.length || 1;
      
      state.totalBookings = totalBookings;
      state.totalRevenue = totalRevenue;
      state.averageBookings = Math.round(totalBookings / dataLength);
      state.averageRevenue = Math.round(totalRevenue / dataLength);
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Sort data by date/name
    sortData: (state, action) => {
      const { field = 'name', order = 'asc' } = action.payload;
      
      state.data.sort((a, b) => {
        if (order === 'asc') {
          return a[field] > b[field] ? 1 : -1;
        } else {
          return a[field] < b[field] ? 1 : -1;
        }
      });
    },
    
    // Reset to initial state
    resetChart: (state) => {
      Object.assign(state, initialState);
    }
  }
});

// Export actions
export const {
  setChartData,
  addDataPoint,
  updateDataPoint,
  removeDataPoint,
  setSelectedMetrics,
  toggleMetric,
  setDateRange,
  clearDateRange,
  calculateTotals,
  setLoading,
  setError,
  clearError,
  sortData,
  resetChart
} = lineChartSlice.actions;

// Selectors
export const selectChartData = (state) => state.lineChart.data;
export const selectSelectedMetrics = (state) => state.lineChart.selectedMetrics;
export const selectDateRange = (state) => state.lineChart.dateRange;
export const selectTotalBookings = (state) => state.lineChart.totalBookings;
export const selectTotalRevenue = (state) => state.lineChart.totalRevenue;
export const selectAverageBookings = (state) => state.lineChart.averageBookings;
export const selectAverageRevenue = (state) => state.lineChart.averageRevenue;
export const selectLoading = (state) => state.lineChart.loading;
export const selectError = (state) => state.lineChart.error;

// Computed selectors
export const selectFilteredData = (state) => {
  const data = state.lineChart.data;
  const { start, end } = state.lineChart.dateRange;
  
  if (!start || !end) return data;
  
  // Filter by date range if needed
  return data.filter(item => {
    // You can implement date filtering logic here
    return true; // For now, return all data
  });
};

export const selectChartStats = (state) => ({
  totalBookings: state.lineChart.totalBookings,
  totalRevenue: state.lineChart.totalRevenue,
  averageBookings: state.lineChart.averageBookings,
  averageRevenue: state.lineChart.averageRevenue,
  dataPoints: state.lineChart.data.length
});

// Async thunks for API integration
export const fetchChartData = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Replace with actual API call
    const response = await fetch('/api/chart-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chart data');
    }
    
    const data = await response.json();
    dispatch(setChartData(data));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateMonthData = (monthData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Replace with actual API call
    const response = await fetch('/api/update-month', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monthData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update month data');
    }
    
    const updatedData = await response.json();
    dispatch(updateDataPoint({
      name: monthData.name,
      updates: updatedData
    }));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const bulkUpdateData = (dataArray) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Replace with actual API call
    const response = await fetch('/api/bulk-update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataArray })
    });
    
    if (!response.ok) {
      throw new Error('Failed to bulk update data');
    }
    
    const updatedData = await response.json();
    dispatch(setChartData(updatedData));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default lineChartSlice.reducer;

// Store configuration example:
/*
import { configureStore } from '@reduxjs/toolkit';
import lineChartReducer from './lineChartSlice';

export const store = configureStore({
  reducer: {
    lineChart: lineChartReducer,
  },
});
*/