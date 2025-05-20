// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice';
import profileReducer from './slices/profile-slice';
import companyReducer from './slices/company-slice';
import uiReducer from './slices/ui-slice';
import notificationReducer from './slices/notification-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    company: companyReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
});

export default store;