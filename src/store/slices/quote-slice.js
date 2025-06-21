import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API calls - replace with your actual API endpoints
export const fetchQuotes = createAsyncThunk(
  'quotes/fetchQuotes',
  async (_, { rejectWithValue }) => {
    try {
      // Check if API endpoint exists, otherwise use mock data
      const apiUrl = '/api/admin/quotes';
      
      // First check if we're in development or if API is available
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // In development, return mock data immediately to avoid API errors
        return mockQuotes;
      }

      // For production, try to fetch from API
      const response = await fetch(apiUrl);
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return mockQuotes;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      // Return mock data as fallback instead of rejecting
      return mockQuotes;
    }
  }
);

export const updateQuoteStatus = createAsyncThunk(
  'quotes/updateQuoteStatus',
  async ({ quoteId, status }, { rejectWithValue }) => {
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // In development, simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { quoteId, status };
      }

      const response = await fetch(`/api/admin/quotes/${quoteId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // For development, still return the update
        if (isDevelopment) {
          return { quoteId, status };
        }
        throw new Error('Server returned non-JSON response');
      }
      
      if (!response.ok) {
        // For development, still return the update
        if (isDevelopment) {
          return { quoteId, status };
        }
        throw new Error(`Failed to update quote status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return { quoteId, status: data.status || status };
    } catch (error) {
      console.error('Error updating quote status:', error);
      
      // In development mode, still allow the update to proceed
      if (process.env.NODE_ENV === 'development') {
        return { quoteId, status };
      }
      
      return rejectWithValue(error.message);
    }
  }
);

// Mock data for development - remove when connecting to real API
const mockQuotes = [
  {
    id: 1,
    quoteId: 'QT001',
    userName: 'John Doe',
    userEmail: 'john.doe@email.com',
    userPhone: '+234-123-456-7890',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    notes: 'Customer needs these items for a construction project. Delivery required by end of month.',
    items: [
      {
        id: 1,
        name: 'Steel Rebar 12mm',
        description: 'High-grade steel reinforcement bar',
        image: '/images/rebar-12mm.jpg',
        sku: 'STL-RB-12',
        price: 2500,
        quantity: 50
      },
      {
        id: 2,
        name: 'Cement Bag 50kg',
        description: 'Portland cement, premium quality',
        image: '/images/cement-50kg.jpg',
        sku: 'CMT-PRT-50',
        price: 4200,
        quantity: 20
      },
      {
        id: 3,
        name: 'Sand (Per Ton)',
        description: 'Fine construction sand',
        image: '/images/construction-sand.jpg',
        sku: 'SND-FN-TN',
        price: 15000,
        quantity: 3
      }
    ]
  },
  {
    id: 2,
    quoteId: 'QT002',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@email.com',
    userPhone: '+234-987-654-3210',
    status: 'reviewed',
    createdAt: '2024-01-14T14:20:00Z',
    notes: 'Bulk order for residential development project.',
    items: [
      {
        id: 4,
        name: 'Concrete Blocks',
        description: '6 inch hollow blocks',
        image: '/images/concrete-blocks.jpg',
        sku: 'CB-HL-6',
        price: 350,
        quantity: 500
      },
      {
        id: 5,
        name: 'Roofing Sheets',
        description: 'Corrugated aluminum roofing',
        image: '/images/roofing-aluminum.jpg',
        sku: 'RF-AL-CR',
        price: 8500,
        quantity: 25
      }
    ]
  },
  {
    id: 3,
    quoteId: 'QT003',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@email.com',
    userPhone: '+234-555-123-4567',
    status: 'responded',
    createdAt: '2024-01-13T09:15:00Z',
    notes: 'Small renovation project. Customer prefers local pickup.',
    items: [
      {
        id: 6,
        name: 'Paint Bucket 4L',
        description: 'Premium interior wall paint - White',
        image: '/images/paint-white-4l.jpg',
        sku: 'PNT-INT-WH4',
        price: 12000,
        quantity: 8
      },
      {
        id: 7,
        name: 'Paint Brushes Set',
        description: 'Professional painting brush set',
        image: '/images/brush-set.jpg',
        sku: 'BR-SET-PRO',
        price: 3500,
        quantity: 2
      }
    ]
  }
];

const quotesSlice = createSlice({
  name: 'quotes',
  initialState: {
    quotes: [],
    loading: false,
    error: null,
    selectedQuote: null,
    updating: false, // Track status update loading
  },
  reducers: {
    setSelectedQuote: (state, action) => {
      state.selectedQuote = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // For immediate local status updates
    updateQuoteStatusLocal: (state, action) => {
      const { quoteId, status } = action.payload;
      const quote = state.quotes.find(q => q.quoteId === quoteId);
      if (quote) {
        quote.status = status;
      }
    },
    // Manual action to load mock data
    loadMockData: (state) => {
      state.quotes = mockQuotes;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quotes
      .addCase(fetchQuotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.loading = false;
        state.quotes = action.payload;
        state.error = null;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch quotes';
      })
      // Update quote status
      .addCase(updateQuoteStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateQuoteStatus.fulfilled, (state, action) => {
        state.updating = false;
        const { quoteId, status } = action.payload;
        const quote = state.quotes.find(q => q.quoteId === quoteId);
        if (quote) {
          quote.status = status;
        }
      })
      .addCase(updateQuoteStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSelectedQuote, 
  clearError, 
  updateQuoteStatusLocal,
  loadMockData 
} = quotesSlice.actions;

export default quotesSlice.reducer;