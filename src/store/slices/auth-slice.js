// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginService } from '../../services/auth/authService';
import { notifySuccess } from '../../utils/toastify';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginService(email, password);
      
      if (response?.success === false) {
        return rejectWithValue('Invalid email or password');
      }
      
      // Store token in localStorage for persistence
      if (response?.token) {
        localStorage.setItem('token', response.token);
      }

      notifySuccess('Login successful!');
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // You might want to call a logout API endpoint here
    return true;
  }
);

// Check if user has a token stored
const token = localStorage.getItem('token');

const initialState = {
  isAuthenticated: !!token,
  user: null,
  token: token || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear any error messages
    clearError: (state) => {
      state.error = null;
    },
    // In case we need to manually set auth state
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, setAuthenticated } = authSlice.actions;

export default authSlice.reducer;