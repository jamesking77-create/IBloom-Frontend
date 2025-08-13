// store/slices/quote-slice.js - FIXED VERSION for Real Backend Integration
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_SERVER_BASEURL || 'http://localhost:5000/'}api`;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Create new quote (Public - from customer)
export const createQuote = createAsyncThunk(
  "quotes/createQuote",
  async (quoteData, { rejectWithValue }) => {
    try {
      console.log('🔄 Creating quote:', quoteData);
      
      // Transform frontend data to match backend expected format
      const backendQuoteData = {
        customer: {
          name: quoteData.name || quoteData.customer?.name,
          email: quoteData.email || quoteData.customer?.email,
          phone: quoteData.phone || quoteData.customer?.phone,
          address: quoteData.customer?.address || '',
          company: quoteData.customer?.company || '',
          eventType: quoteData.eventType || quoteData.customer?.eventType,
          eventDate: quoteData.eventDate || quoteData.customer?.eventDate,
          eventLocation: quoteData.eventLocation || quoteData.customer?.eventLocation,
          guestCount: quoteData.guestCount || quoteData.customer?.guestCount,
          eventDuration: quoteData.eventDuration || quoteData.customer?.eventDuration,
          venue: quoteData.customer?.venue || '',
          specialRequests: quoteData.specialRequests || quoteData.notes || quoteData.customer?.specialRequests,
          budget: quoteData.budget || quoteData.customer?.budget,
          hearAboutUs: quoteData.hearAboutUs || quoteData.customer?.hearAboutUs,
          preferredContact: quoteData.preferredContact || quoteData.customer?.preferredContact || 'phone',
          contactTime: quoteData.contactTime || quoteData.customer?.contactTime || 'anytime'
        },
        categoryId: quoteData.categoryId,
        categoryName: quoteData.categoryName,
        items: quoteData.items || [],
        adminNotes: quoteData.adminNotes || ''
      };

      console.log('📤 Sending to backend:', backendQuoteData);
      
      const response = await apiCall('/quotes', {
        method: 'POST',
        body: JSON.stringify(backendQuoteData),
      });

      console.log('✅ Quote created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create quote error:', error);
      return rejectWithValue(error.message || "Failed to create quote");
    }
  }
);

// Fetch all quotes (Admin only)
export const fetchQuotes = createAsyncThunk(
  "quotes/fetchQuotes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/quotes${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔄 Fetching quotes:', endpoint);
      
      const response = await apiCall(endpoint);
      
      console.log('✅ Quotes fetched successfully:', response.data?.length || 0, 'quotes');
      return response;
    } catch (error) {
      console.error('❌ Fetch quotes error:', error);
      return rejectWithValue(error.message || "Failed to fetch quotes");
    }
  }
);

// Fetch quote by ID (Admin only)
export const fetchQuoteById = createAsyncThunk(
  "quotes/fetchQuoteById",
  async (quoteId, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching quote by ID:', quoteId);
      
      const response = await apiCall(`/quotes/${quoteId}`);
      
      console.log('✅ Quote fetched successfully:', response.data.quoteId);
      return response.data;
    } catch (error) {
      console.error('❌ Fetch quote by ID error:', error);
      return rejectWithValue(error.message || "Failed to fetch quote");
    }
  }
);

// Update quote status (Admin only)
export const updateQuoteStatus = createAsyncThunk(
  "quotes/updateQuoteStatus",
  async ({ quoteId, status }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating quote status:', quoteId, status);
      
      const response = await apiCall(`/quotes/${quoteId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      console.log('✅ Quote status updated successfully');
      return { quoteId, status, ...response.data };
    } catch (error) {
      console.error('❌ Update quote status error:', error);
      return rejectWithValue(error.message || "Failed to update quote status");
    }
  }
);

// Mark quote as viewed (Admin only)
export const markQuoteAsViewed = createAsyncThunk(
  "quotes/markQuoteAsViewed",
  async (quoteId, { rejectWithValue }) => {
    try {
      console.log('🔄 Marking quote as viewed:', quoteId);
      
      const response = await apiCall(`/quotes/${quoteId}/view`, {
        method: 'PUT',
      });

      console.log('✅ Quote marked as viewed');
      return { quoteId, ...response.data };
    } catch (error) {
      console.error('❌ Mark quote as viewed error:', error);
      return rejectWithValue(error.message || "Failed to mark quote as viewed");
    }
  }
);

// Create quote response (Admin only)
export const createQuoteResponse = createAsyncThunk(
  "quotes/createQuoteResponse",
  async ({ quoteId, responseData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Creating quote response:', quoteId);
      
      const response = await apiCall(`/quotes/${quoteId}/response`, {
        method: 'POST',
        body: JSON.stringify(responseData),
      });

      console.log('✅ Quote response created successfully');
      return { quoteId, response: response.data };
    } catch (error) {
      console.error('❌ Create quote response error:', error);
      return rejectWithValue(error.message || "Failed to create quote response");
    }
  }
);

// Update quote response (Admin only)
export const updateQuoteResponse = createAsyncThunk(
  "quotes/updateQuoteResponse",
  async ({ quoteId, responseData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating quote response:', quoteId);
      
      const response = await apiCall(`/quotes/${quoteId}/response`, {
        method: 'PUT',
        body: JSON.stringify(responseData),
      });

      console.log('✅ Quote response updated successfully');
      return { quoteId, response: response.data };
    } catch (error) {
      console.error('❌ Update quote response error:', error);
      return rejectWithValue(error.message || "Failed to update quote response");
    }
  }
);

// Send quote response (Admin only)
export const sendQuoteResponse = createAsyncThunk(
  "quotes/sendQuoteResponse",
  async ({ quoteId, sendOptions = {} }, { rejectWithValue }) => {
    try {
      console.log('🔄 Sending quote response:', quoteId);
      
      const response = await apiCall(`/quotes/${quoteId}/send`, {
        method: 'POST',
        body: JSON.stringify(sendOptions),
      });

      console.log('✅ Quote response sent successfully');
      return { quoteId, ...response.data };
    } catch (error) {
      console.error('❌ Send quote response error:', error);
      return rejectWithValue(error.message || "Failed to send quote response");
    }
  }
);

// Add communication log (Admin only)
export const addCommunication = createAsyncThunk(
  "quotes/addCommunication",
  async ({ quoteId, communication }, { rejectWithValue }) => {
    try {
      console.log('🔄 Adding communication:', quoteId, communication.type);
      
      const response = await apiCall(`/quotes/${quoteId}/communication`, {
        method: 'POST',
        body: JSON.stringify(communication),
      });

      console.log('✅ Communication added successfully');
      return { quoteId, communication: response.data };
    } catch (error) {
      console.error('❌ Add communication error:', error);
      return rejectWithValue(error.message || "Failed to add communication");
    }
  }
);

// Delete quote (Admin only)
export const deleteQuote = createAsyncThunk(
  "quotes/deleteQuote",
  async (quoteId, { rejectWithValue }) => {
    try {
      console.log('🔄 Deleting quote:', quoteId);
      
      const response = await apiCall(`/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      console.log('✅ Quote deleted successfully');
      return quoteId;
    } catch (error) {
      console.error('❌ Delete quote error:', error);
      return rejectWithValue(error.message || "Failed to delete quote");
    }
  }
);

// Get quote statistics (Admin only)
export const getQuoteStats = createAsyncThunk(
  "quotes/getQuoteStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching quote statistics');
      
      const response = await apiCall('/quotes/stats/dashboard');
      
      console.log('✅ Quote statistics fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Get quote stats error:', error);
      return rejectWithValue(error.message || "Failed to fetch quote statistics");
    }
  }
);

// Export quotes (Admin only)
export const exportQuotes = createAsyncThunk(
  "quotes/exportQuotes",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 Exporting quotes');
      
      const queryParams = new URLSearchParams(params);
      const response = await apiCall(`/quotes/export/data?${queryParams}`);
      
      console.log('✅ Quotes exported successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Export quotes error:', error);
      return rejectWithValue(error.message || "Failed to export quotes");
    }
  }
);

// Verify quote (Public)
export const verifyQuote = createAsyncThunk(
  "quotes/verifyQuote",
  async (quoteId, { rejectWithValue }) => {
    try {
      console.log('🔄 Verifying quote:', quoteId);
      
      const response = await apiCall(`/quotes/verify/${quoteId}`);
      
      console.log('✅ Quote verified successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Verify quote error:', error);
      return rejectWithValue(error.message || "Failed to verify quote");
    }
  }
);

const initialState = {
  // Data
  quotes: [],
  currentQuote: null,
  
  // Loading states
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  responding: false,
  sending: false,
  exporting: false,
  verifying: false,
  
  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  responseError: null,
  sendError: null,
  exportError: null,
  verifyError: null,
  
  // Success states
  createSuccess: false,
  updateSuccess: false,
  responseSuccess: false,
  sendSuccess: false,
  exportSuccess: false,
  verifySuccess: false,
  
  // Pagination and filtering
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNext: false,
    hasPrev: false
  },
  
  filters: {
    status: 'all',
    search: '',
    categoryName: '',
    dateFrom: null,
    dateTo: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  
  // Statistics
  stats: {
    total: 0,
    byStatus: {
      pending: 0,
      reviewed: 0,
      responded: 0,
      accepted: 0,
      cancelled: 0,
      expired: 0
    },
    recent: [],
    unviewed: 0
  },
  
  // UI state
  lastUpdated: null,
  selectedQuoteIds: [],
  
  // WebSocket connection state
  wsConnected: false,
  wsError: null,
  
  // Export data
  exportedData: null,
  
  // Verification data
  verificationData: null
};

const quotesSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.responseError = null;
      state.sendError = null;
      state.exportError = null;
      state.verifyError = null;
      state.wsError = null;
    },

    // Clear success states
    clearSuccess: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.responseSuccess = false;
      state.sendSuccess = false;
      state.exportSuccess = false;
      state.verifySuccess = false;
    },

    // Set current quote
    setCurrentQuote: (state, action) => {
      state.currentQuote = action.payload;
    },

    // Clear current quote
    clearCurrentQuote: (state) => {
      state.currentQuote = null;
    },

    // Update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        search: '',
        categoryName: '',
        dateFrom: null,
        dateTo: null,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
    },

    // Reset pagination
    resetPagination: (state) => {
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 20,
        hasNext: false,
        hasPrev: false
      };
    },

    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Select/deselect quotes for bulk actions
    toggleQuoteSelection: (state, action) => {
      const quoteId = action.payload;
      const index = state.selectedQuoteIds.indexOf(quoteId);
      
      if (index > -1) {
        state.selectedQuoteIds.splice(index, 1);
      } else {
        state.selectedQuoteIds.push(quoteId);
      }
    },

    // Select all quotes
    selectAllQuotes: (state) => {
      state.selectedQuoteIds = state.quotes.map(quote => quote._id || quote.id);
    },

    // Clear all selections
    clearQuoteSelection: (state) => {
      state.selectedQuoteIds = [];
    },

    // Update quote locally (for optimistic updates)
    updateQuoteLocally: (state, action) => {
      const { quoteId, updates } = action.payload;
      const index = state.quotes.findIndex(quote => 
        quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
      );
      
      if (index !== -1) {
        state.quotes[index] = { ...state.quotes[index], ...updates };
      }
      
      if (state.currentQuote && (
        state.currentQuote.quoteId === quoteId || 
        state.currentQuote.id === quoteId
      )) {
        state.currentQuote = { ...state.currentQuote, ...updates };
      }
    },

    // WebSocket connection state
    setWebSocketConnected: (state, action) => {
      state.wsConnected = action.payload;
      if (action.payload) {
        state.wsError = null;
      }
    },

    // WebSocket error
    setWebSocketError: (state, action) => {
      state.wsError = action.payload;
      state.wsConnected = false;
    },

    // Handle real-time quote updates from WebSocket
    handleNewQuoteNotification: (state, action) => {
      const newQuote = action.payload;
      // Add to beginning of list if not already exists
      const exists = state.quotes.some(quote => 
        quote._id === newQuote._id || quote.quoteId === newQuote.quoteId
      );
      
      if (!exists) {
        state.quotes.unshift(newQuote);
        state.stats.total += 1;
        state.stats.byStatus.pending += 1;
        state.stats.unviewed += 1;
      }
    },

    // Handle quote status update from WebSocket
    handleQuoteStatusUpdate: (state, action) => {
      const { quoteId, oldStatus, newStatus } = action.payload;
      const index = state.quotes.findIndex(quote => 
        quote._id === quoteId || quote.quoteId === quoteId
      );
      
      if (index !== -1) {
        state.quotes[index].status = newStatus;
        state.quotes[index].updatedAt = new Date().toISOString();
        
        // Update stats
        if (state.stats.byStatus[oldStatus] > 0) {
          state.stats.byStatus[oldStatus] -= 1;
        }
        state.stats.byStatus[newStatus] += 1;
      }
      
      // Update current quote if it matches
      if (state.currentQuote && (
        state.currentQuote._id === quoteId || state.currentQuote.quoteId === quoteId
      )) {
        state.currentQuote.status = newStatus;
        state.currentQuote.updatedAt = new Date().toISOString();
      }
    },

    // Handle quote deletion from WebSocket
    handleQuoteDeletion: (state, action) => {
      const quoteId = action.payload;
      
      // Remove from quotes list
      const index = state.quotes.findIndex(quote => 
        quote._id === quoteId || quote.quoteId === quoteId
      );
      
      if (index !== -1) {
        const deletedQuote = state.quotes[index];
        state.quotes.splice(index, 1);
        
        // Update stats
        state.stats.total -= 1;
        if (state.stats.byStatus[deletedQuote.status] > 0) {
          state.stats.byStatus[deletedQuote.status] -= 1;
        }
        if (!deletedQuote.viewedByAdmin) {
          state.stats.unviewed -= 1;
        }
      }
      
      // Clear current quote if it was deleted
      if (state.currentQuote && (
        state.currentQuote._id === quoteId || state.currentQuote.quoteId === quoteId
      )) {
        state.currentQuote = null;
      }
      
      // Remove from selected quotes
      state.selectedQuoteIds = state.selectedQuoteIds.filter(id => id !== quoteId);
    },

    // Handle quote response created from WebSocket
    handleQuoteResponseCreated: (state, action) => {
      const { quoteId, response } = action.payload;
      const index = state.quotes.findIndex(quote => 
        quote._id === quoteId || quote.quoteId === quoteId
      );
      
      if (index !== -1) {
        state.quotes[index].response = response;
        state.quotes[index].status = 'responded';
        state.quotes[index].respondedAt = new Date().toISOString();
        state.quotes[index].updatedAt = new Date().toISOString();
      }
    },

    // Clear exported data
    clearExportedData: (state) => {
      state.exportedData = null;
    },

    // Clear verification data
    clearVerificationData: (state) => {
      state.verificationData = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Create quote
      .addCase(createQuote.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.creating = false;
        state.createSuccess = true;
        // Don't add to list here - it will come via WebSocket or admin fetch
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
        state.createSuccess = false;
      })

      // Fetch quotes
      .addCase(fetchQuotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.success) {
          state.quotes = action.payload.data || [];
          state.pagination = action.payload.pagination || state.pagination;
          state.lastUpdated = new Date().toISOString();
          
          // Calculate stats from current quotes
          const quotes = state.quotes;
          state.stats = {
            total: quotes.length,
            byStatus: {
              pending: quotes.filter(q => q.status === 'pending').length,
              reviewed: quotes.filter(q => q.status === 'reviewed').length,
              responded: quotes.filter(q => q.status === 'responded').length,
              accepted: quotes.filter(q => q.status === 'accepted').length,
              cancelled: quotes.filter(q => q.status === 'cancelled').length,
              expired: quotes.filter(q => q.status === 'expired').length,
            },
            recent: quotes.slice(0, 5),
            unviewed: quotes.filter(q => !q.viewedByAdmin).length
          };
        } else {
          state.error = 'Failed to fetch quotes';
        }
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch quotes';
      })

      // Fetch quote by ID
      .addCase(fetchQuoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuote = action.payload;
      })
      .addCase(fetchQuoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update quote status
      .addCase(updateQuoteStatus.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateQuoteStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        
        const { quoteId, status } = action.payload;
        
        // Update the quote in the list
        const index = state.quotes.findIndex(quote => 
          quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
        );
        if (index !== -1) {
          const oldStatus = state.quotes[index].status;
          state.quotes[index].status = status;
          state.quotes[index].updatedAt = new Date().toISOString();
          
          // Update stats
          if (state.stats.byStatus[oldStatus] > 0) {
            state.stats.byStatus[oldStatus] -= 1;
          }
          state.stats.byStatus[status] += 1;
        }
        
        // Update current quote if it matches
        if (state.currentQuote && (
          state.currentQuote._id === quoteId || 
          state.currentQuote.quoteId === quoteId || 
          state.currentQuote.id === quoteId
        )) {
          state.currentQuote.status = status;
          state.currentQuote.updatedAt = new Date().toISOString();
        }
      })
      .addCase(updateQuoteStatus.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Mark as viewed
      .addCase(markQuoteAsViewed.pending, (state) => {
        // No loading state for this action
      })
      .addCase(markQuoteAsViewed.fulfilled, (state, action) => {
        const { quoteId } = action.payload;
        
        // Update the quote in the list
        const index = state.quotes.findIndex(quote => 
          quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
        );
        if (index !== -1 && !state.quotes[index].viewedByAdmin) {
          state.quotes[index].viewedByAdmin = true;
          state.quotes[index].viewedAt = new Date().toISOString();
          state.stats.unviewed = Math.max(0, state.stats.unviewed - 1);
        }
        
        // Update current quote if it matches
        if (state.currentQuote && (
          state.currentQuote._id === quoteId || 
          state.currentQuote.quoteId === quoteId || 
          state.currentQuote.id === quoteId
        )) {
          state.currentQuote.viewedByAdmin = true;
          state.currentQuote.viewedAt = new Date().toISOString();
        }
      })
      .addCase(markQuoteAsViewed.rejected, (state, action) => {
        // Handle error silently for view tracking
        console.error('Failed to mark as viewed:', action.payload);
      })

      // Create quote response
      .addCase(createQuoteResponse.pending, (state) => {
        state.responding = true;
        state.responseError = null;
        state.responseSuccess = false;
      })
      .addCase(createQuoteResponse.fulfilled, (state, action) => {
        state.responding = false;
        state.responseSuccess = true;
        
        const { quoteId, response } = action.payload;
        
        // Update the quote with response
        const index = state.quotes.findIndex(quote => 
          quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
        );
        if (index !== -1) {
          const oldStatus = state.quotes[index].status;
          state.quotes[index].response = response;
          state.quotes[index].status = 'responded';
          state.quotes[index].respondedAt = new Date().toISOString();
          state.quotes[index].updatedAt = new Date().toISOString();
          
          // Update stats
          if (state.stats.byStatus[oldStatus] > 0) {
            state.stats.byStatus[oldStatus] -= 1;
          }
          state.stats.byStatus.responded += 1;
        }
        
        // Update current quote if it matches
        if (state.currentQuote && (
          state.currentQuote._id === quoteId || 
          state.currentQuote.quoteId === quoteId || 
          state.currentQuote.id === quoteId
        )) {
          state.currentQuote.response = response;
          state.currentQuote.status = 'responded';
          state.currentQuote.respondedAt = new Date().toISOString();
          state.currentQuote.updatedAt = new Date().toISOString();
        }
      })
      .addCase(createQuoteResponse.rejected, (state, action) => {
        state.responding = false;
        state.responseError = action.payload;
        state.responseSuccess = false;
      })

      // Update quote response
      .addCase(updateQuoteResponse.pending, (state) => {
        state.responding = true;
        state.responseError = null;
      })
      .addCase(updateQuoteResponse.fulfilled, (state, action) => {
        state.responding = false;
        
        const { quoteId, response } = action.payload;
        
        // Update the quote with response
        const index = state.quotes.findIndex(quote => 
          quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
        );
        if (index !== -1) {
          state.quotes[index].response = response;
          state.quotes[index].updatedAt = new Date().toISOString();
        }
        
        // Update current quote if it matches
        if (state.currentQuote && (
          state.currentQuote._id === quoteId || 
          state.currentQuote.quoteId === quoteId || 
          state.currentQuote.id === quoteId
        )) {
          state.currentQuote.response = response;
          state.currentQuote.updatedAt = new Date().toISOString();
        }
      })
      .addCase(updateQuoteResponse.rejected, (state, action) => {
        state.responding = false;
        state.responseError = action.payload;
      })

      // Send quote response
      .addCase(sendQuoteResponse.pending, (state) => {
        state.sending = true;
        state.sendError = null;
        state.sendSuccess = false;
      })
      .addCase(sendQuoteResponse.fulfilled, (state, action) => {
        state.sending = false;
        state.sendSuccess = true;
        
        const { quoteId } = action.payload;
        const index = state.quotes.findIndex(quote => 
          quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
        );
        if (index !== -1) {
          state.quotes[index].updatedAt = new Date().toISOString();
        }
      })
      .addCase(sendQuoteResponse.rejected, (state, action) => {
        state.sending = false;
        state.sendError = action.payload;
        state.sendSuccess = false;
      })

      // Add communication
      .addCase(addCommunication.pending, (state) => {
        // No loading state for this action
      })
      .addCase(addCommunication.fulfilled, (state, action) => {
        const { quoteId, communication } = action.payload;
        
        // Update the quote with new communication
        const index = state.quotes.findIndex(quote => 
          quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
        );
        if (index !== -1) {
          if (!state.quotes[index].communications) {
            state.quotes[index].communications = [];
          }
          state.quotes[index].communications.push(communication);
          state.quotes[index].updatedAt = new Date().toISOString();
        }
        
        // Update current quote if it matches
        if (state.currentQuote && (
          state.currentQuote._id === quoteId || 
          state.currentQuote.quoteId === quoteId || 
          state.currentQuote.id === quoteId
        )) {
          if (!state.currentQuote.communications) {
            state.currentQuote.communications = [];
          }
          state.currentQuote.communications.push(communication);
          state.currentQuote.updatedAt = new Date().toISOString();
        }
      })
      .addCase(addCommunication.rejected, (state, action) => {
        console.error('Failed to add communication:', action.payload);
      })

      // Delete quote
      .addCase(deleteQuote.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.deleting = false;
        const quoteId = action.payload;
        
        // Find and remove from quotes list
        const index = state.quotes.findIndex(quote => 
          quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
        );
        
        if (index !== -1) {
          const deletedQuote = state.quotes[index];
          state.quotes.splice(index, 1);
          
          // Update stats
          state.stats.total -= 1;
          if (state.stats.byStatus[deletedQuote.status] > 0) {
            state.stats.byStatus[deletedQuote.status] -= 1;
          }
          if (!deletedQuote.viewedByAdmin) {
            state.stats.unviewed = Math.max(0, state.stats.unviewed - 1);
          }
        }
        
        // Clear current quote if it was deleted
        if (state.currentQuote && (
          state.currentQuote._id === quoteId || 
          state.currentQuote.quoteId === quoteId || 
          state.currentQuote.id === quoteId
        )) {
          state.currentQuote = null;
        }
        
        // Remove from selected quotes
        state.selectedQuoteIds = state.selectedQuoteIds.filter(id => id !== quoteId);
      })
      .addCase(deleteQuote.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload;
      })

      // Get quote statistics
      .addCase(getQuoteStats.pending, (state) => {
        // No loading state for stats
      })
      .addCase(getQuoteStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload };
      })
      .addCase(getQuoteStats.rejected, (state, action) => {
        console.error('Failed to get quote stats:', action.payload);
      })

      // Export quotes
      .addCase(exportQuotes.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
        state.exportSuccess = false;
      })
      .addCase(exportQuotes.fulfilled, (state, action) => {
        state.exporting = false;
        state.exportSuccess = true;
        state.exportedData = action.payload;
      })
      .addCase(exportQuotes.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
        state.exportSuccess = false;
      })

      // Verify quote
      .addCase(verifyQuote.pending, (state) => {
        state.verifying = true;
        state.verifyError = null;
        state.verifySuccess = false;
      })
      .addCase(verifyQuote.fulfilled, (state, action) => {
        state.verifying = false;
        state.verifySuccess = true;
        state.verificationData = action.payload;
      })
      .addCase(verifyQuote.rejected, (state, action) => {
        state.verifying = false;
        state.verifyError = action.payload;
        state.verifySuccess = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentQuote,
  clearCurrentQuote,
  setFilters,
  clearFilters,
  resetPagination,
  setPagination,
  toggleQuoteSelection,
  selectAllQuotes,
  clearQuoteSelection,
  updateQuoteLocally,
  setWebSocketConnected,
  setWebSocketError,
  handleNewQuoteNotification,
  handleQuoteStatusUpdate,
  handleQuoteDeletion,
  handleQuoteResponseCreated,
  clearExportedData,
  clearVerificationData,
} = quotesSlice.actions;

// Basic Selectors
export const selectQuotes = (state) => state.quotes?.quotes || [];
export const selectCurrentQuote = (state) => state.quotes?.currentQuote;
export const selectQuotesLoading = (state) => state.quotes?.loading || false;
export const selectQuotesCreating = (state) => state.quotes?.creating || false;
export const selectQuotesUpdating = (state) => state.quotes?.updating || false;
export const selectQuotesDeleting = (state) => state.quotes?.deleting || false;
export const selectQuotesResponding = (state) => state.quotes?.responding || false;
export const selectQuotesSending = (state) => state.quotes?.sending || false;
export const selectQuotesExporting = (state) => state.quotes?.exporting || false;
export const selectQuotesVerifying = (state) => state.quotes?.verifying || false;

// Error Selectors
export const selectQuotesError = (state) => state.quotes?.error;
export const selectQuotesCreateError = (state) => state.quotes?.createError;
export const selectQuotesUpdateError = (state) => state.quotes?.updateError;
export const selectQuotesDeleteError = (state) => state.quotes?.deleteError;
export const selectQuotesResponseError = (state) => state.quotes?.responseError;
export const selectQuotesSendError = (state) => state.quotes?.sendError;
export const selectQuotesExportError = (state) => state.quotes?.exportError;
export const selectQuotesVerifyError = (state) => state.quotes?.verifyError;

// Success Selectors
export const selectQuotesCreateSuccess = (state) => state.quotes?.createSuccess;
export const selectQuotesUpdateSuccess = (state) => state.quotes?.updateSuccess;
export const selectQuotesResponseSuccess = (state) => state.quotes?.responseSuccess;
export const selectQuotesSendSuccess = (state) => state.quotes?.sendSuccess;
export const selectQuotesExportSuccess = (state) => state.quotes?.exportSuccess;
export const selectQuotesVerifySuccess = (state) => state.quotes?.verifySuccess;

// Data Selectors
export const selectQuotesPagination = (state) => state.quotes?.pagination;
export const selectQuotesFilters = (state) => state.quotes?.filters;
export const selectSelectedQuoteIds = (state) => state.quotes?.selectedQuoteIds || [];
export const selectQuotesStats = (state) => state.quotes?.stats;
export const selectQuotesLastUpdated = (state) => state.quotes?.lastUpdated;
export const selectExportedData = (state) => state.quotes?.exportedData;
export const selectVerificationData = (state) => state.quotes?.verificationData;

// WebSocket Selectors
export const selectWebSocketConnected = (state) => state.quotes?.wsConnected;
export const selectWebSocketError = (state) => state.quotes?.wsError;

// Computed Selectors
export const selectQuoteById = (quoteId) => (state) =>
  state.quotes?.quotes?.find(quote => 
    quote._id === quoteId || quote.quoteId === quoteId || quote.id === quoteId
  );

export const selectQuotesByStatus = (status) => (state) =>
  state.quotes?.quotes?.filter(quote => quote.status === status) || [];

export const selectFilteredQuotes = (state) => {
  const quotes = state.quotes?.quotes || [];
  const filters = state.quotes?.filters || {};
  
  return quotes.filter(quote => {
    // Status filter
    if (filters.status && filters.status !== 'all' && quote.status !== filters.status) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        quote.quoteId,
        quote.customer?.name,
        quote.customer?.email,
        quote.customer?.phone,
        quote.categoryName,
        quote.customer?.eventType,
        quote.customer?.company
      ];
      
      const matches = searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchTerm)
      );
      
      if (!matches) return false;
    }
    
    // Category filter
    if (filters.categoryName && quote.categoryName !== filters.categoryName) {
      return false;
    }
    
    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const quoteDate = new Date(quote.createdAt);
      if (filters.dateFrom && quoteDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && quoteDate > new Date(filters.dateTo)) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by the specified field and order
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle nested properties
    if (sortBy.includes('.')) {
      const keys = sortBy.split('.');
      aValue = keys.reduce((obj, key) => obj?.[key], a);
      bValue = keys.reduce((obj, key) => obj?.[key], b);
    }
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

export const selectQuotesSummary = (state) => {
  const quotes = state.quotes?.quotes || [];
  return {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    reviewed: quotes.filter(q => q.status === 'reviewed').length,
    responded: quotes.filter(q => q.status === 'responded').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    cancelled: quotes.filter(q => q.status === 'cancelled').length,
    expired: quotes.filter(q => q.status === 'expired').length,
    unviewed: quotes.filter(q => !q.viewedByAdmin).length,
  };
};

export const selectUnviewedQuotes = (state) => 
  state.quotes?.quotes?.filter(quote => !quote.viewedByAdmin) || [];

export const selectRecentQuotes = (state) => 
  state.quotes?.quotes?.slice(0, 10) || [];

export const selectQuotesByCategory = (state) => {
  const quotes = state.quotes?.quotes || [];
  return quotes.reduce((acc, quote) => {
    const category = quote.categoryName || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(quote);
    return acc;
  }, {});
};

export const selectQuotesWithResponse = (state) =>
  state.quotes?.quotes?.filter(quote => quote.response) || [];

export const selectQuotesWithoutResponse = (state) =>
  state.quotes?.quotes?.filter(quote => !quote.response && quote.status !== 'cancelled') || [];

export const selectIsAnyQuoteLoading = (state) => {
  const quotes = state.quotes;
  return quotes?.loading || quotes?.creating || quotes?.updating || 
         quotes?.deleting || quotes?.responding || quotes?.sending;
};

export default quotesSlice.reducer;