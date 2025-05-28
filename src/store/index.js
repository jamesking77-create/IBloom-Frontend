// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice';
import profileReducer from './slices/profile-slice';
import companyReducer from './slices/company-slice';
import uiReducer from './slices/ui-slice';
import notificationReducer from './slices/notification-slice';
import ordersReducer from './slices/order-slice'
import bookingsReducer from './slices/booking-slice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    company: companyReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    orders: ordersReducer,
    bookings: bookingsReducer,
    
  },
});

export default store;