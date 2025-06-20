// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  forgotPassword as forgotPasswordService,
  login as loginService,
  resetPassword as resetPasswordService,
} from "../../services/auth/authService";
import { notifyError, notifySuccess } from "../../utils/toastify";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginService(email, password);

      if (response?.success === false) {
        return rejectWithValue("Invalid email or password");
      }

      // Store token in localStorage for persistence
      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      notifySuccess("Login successful!");

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordService(email);

      if (response?.success === false) {
        return rejectWithValue(
          response.message || "Failed to send reset email"
        );
      }

      notifySuccess(`Verification email sent to ${email}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send reset email");
    }
  }
);

// Async thunk for reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await resetPasswordService(token, password, confirmPassword);

      if (response?.success === false) {
        return rejectWithValue(
          response.message || "Failed to reset password"
        );
      }

      // Store new token in localStorage for automatic login
      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      notifySuccess("Password reset successful!");
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to reset password");
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    return true;
  }
);

// Check if user has a token stored
const token = localStorage.getItem("token");

const initialState = {
  isAuthenticated: !!token,
  user: null,
  token: token || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send reset email";
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token || null;
        state.isAuthenticated = !!action.payload.token;
        state.user = action.payload.user || null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to reset password";
      });
  },
});

export const { clearError, setAuthenticated } = authSlice.actions;

export default authSlice.reducer;