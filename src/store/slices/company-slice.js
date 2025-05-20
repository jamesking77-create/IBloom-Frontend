// store/slices/companySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching companies
export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/companies');
      // return response.json();
      
      // Simulated API response
      return [
        { id: 1, name: 'Acme Inc', logo: '/api/placeholder/60/60', category: 'Technology' },
        { id: 2, name: 'Globex Corp', logo: '/api/placeholder/60/60', category: 'Manufacturing' },
        { id: 3, name: 'ABC Events', logo: '/api/placeholder/60/60', category: 'Events' },
      ];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch companies');
    }
  }
);

// Async thunk for fetching a single company
export const fetchCompanyById = createAsyncThunk(
  'company/fetchCompanyById',
  async (id, { rejectWithValue }) => {
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/companies/${id}`);
      // return response.json();
      
      // Simulated API response
      return {
        id: id,
        name: 'Acme Inc',
        logo: '/api/placeholder/60/60',
        category: 'Technology',
        description: 'A company that provides various services',
        contact: 'contact@acme.com',
        website: 'www.acme.com',
        address: '123 Main St, City, Country'
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch company');
    }
  }
);

const initialState = {
  companies: [],
  selectedCompany: null,
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    selectCompany: (state, action) => {
      state.selectedCompany = action.payload;
    },
    clearCompanyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch companies cases
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
        state.loading = false;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Fetch company by ID cases
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.selectedCompany = action.payload;
        state.loading = false;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { selectCompany, clearCompanyError } = companySlice.actions;

export default companySlice.reducer;