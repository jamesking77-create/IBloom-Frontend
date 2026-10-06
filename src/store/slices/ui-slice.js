// store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: window.innerWidth >= 768, // Default open on desktop, closed on mobile
  isMobile: window.innerWidth < 768,
  isProfileOpen: false,
  isNotificationsOpen: false,
  // Public site: the customer's item list drawer (see UI/listBar.jsx)
  isListOpen: false,
  // Public site: the catalogue search panel (see UI/searchPalette.jsx)
  isSearchOpen: false,
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
    },
    openList: (state) => {
      state.isListOpen = true;
    },
    closeList: (state) => {
      state.isListOpen = false;
    },
    openSearch: (state) => {
      state.isSearchOpen = true;
    },
    closeSearch: (state) => {
      state.isSearchOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setMobileState,
  toggleProfileDropdown,
  toggleNotificationsDropdown,
  closeAllDropdowns,
  openList,
  closeList,
  openSearch,
  closeSearch,
} = uiSlice.actions;

export default uiSlice.reducer;