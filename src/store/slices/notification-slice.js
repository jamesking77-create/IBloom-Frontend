import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
    
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
  lastFetched: null,
};


const calculateUnreadCount = (notifications) => {
  return notifications.filter(notification => notification.isUnread).length;
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotification = {
        id: Date.now(),
        text: action.payload.text,
        time: action.payload.time || new Date().toLocaleString(),
        isUnread: true,
        type: action.payload.type || 'info',
        source: action.payload.source || 'system', 
        link: action.payload.link || null, 
        icon: action.payload.icon || null, 
      };
      state.notifications.unshift(newNotification); 
      state.unreadCount = calculateUnreadCount(state.notifications);
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isUnread = false;
        state.unreadCount = calculateUnreadCount(state.notifications);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isUnread = false;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      state.unreadCount = calculateUnreadCount(state.notifications);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    addSystemNotification: (state, action) => {
      
      const newNotification = {
        id: Date.now(),
        text: action.payload.text,
        time: new Date().toLocaleString(),
        isUnread: true,
        type: 'system',
        source: 'system',
        icon: 'Bell'
      };
      state.notifications.unshift(newNotification);
      state.unreadCount = calculateUnreadCount(state.notifications);
    },
    addActivityNotification: (state, action) => {
      // Specifically for user activity-based notifications
      const newNotification = {
        id: Date.now(),
        text: action.payload.text,
        time: new Date().toLocaleString(),
        isUnread: true,
        type: 'activity',
        source: action.payload.source || 'profile',
        icon: action.payload.icon || 'Activity',
        link: action.payload.link || null,
      };
      state.notifications.unshift(newNotification);
      state.unreadCount = calculateUnreadCount(state.notifications);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = calculateUnreadCount(action.payload);
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotification,
  clearNotifications,
  addSystemNotification,
  addActivityNotification
} = notificationSlice.actions;

export default notificationSlice.reducer;
