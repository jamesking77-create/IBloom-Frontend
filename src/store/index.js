// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import profileReducer from "./slices/profile-slice";
import companyReducer from "./slices/company-slice";
import uiReducer from "./slices/ui-slice";
import notificationReducer from "./slices/notification-slice";
import ordersReducer from "./slices/order-slice";
import bookingsReducer from "./slices/booking-slice";
import mailerReducer from "./slices/mailer";
import categoriesReducer from "./slices/categoriesSlice";
import quotesReducer from "./slices/quote-slice";
import cartReducer from "./slices/cart-slice";
const categorySyncMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // When a category is removed from profile, sync with categories slice
  if (action.type === "profile/removeCategory") {
    const state = store.getState();
    const categoryIndex = action.payload;
    const categoryName = state.profile.editData.categories[categoryIndex]?.name;

    if (categoryName) {
      // Dispatch sync action to categories slice
      store.dispatch({
        type: "categories/syncCategoryRemoval",
        payload: categoryName,
      });
    }
  }

  return result;
};
export const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    orders: ordersReducer,
    bookings: bookingsReducer,
    mailer: mailerReducer,
    profile: profileReducer,
    categories: categoriesReducer,
    quotes:quotesReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }).concat(categorySyncMiddleware),
});

export default store;
