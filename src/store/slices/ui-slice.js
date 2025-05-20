// store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: window.innerWidth >= 768, // Default open on desktop, closed on mobile
  isMobile: window.innerWidth < 768,
  isProfileOpen: false,
  isNotificationsOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setMobileState: (state, action) => {
      state.isMobile = action.payload;
      // On mobile, sidebar should be closed by default
      if (action.payload && state.isSidebarOpen) {
        state.isSidebarOpen = false;
      }
    },
    toggleProfileDropdown: (state) => {
      state.isProfileOpen = !state.isProfileOpen;
      // Close notifications if profile is opened
      if (state.isProfileOpen) {
        state.isNotificationsOpen = false;
      }
    },
    toggleNotificationsDropdown: (state) => {
      state.isNotificationsOpen = !state.isNotificationsOpen;
      // Close profile if notifications is opened
      if (state.isNotificationsOpen) {
        state.isProfileOpen = false;
      }
    },
    closeAllDropdowns: (state) => {
      state.isProfileOpen = false;
      state.isNotificationsOpen = false;
    }
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setMobileState,
  toggleProfileDropdown,
  toggleNotificationsDropdown,
  closeAllDropdowns
} = uiSlice.actions;

export default uiSlice.reducer;