import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import habitReducer from './slices/habitSlice';
import groupReducer from './slices/groupSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    habits: habitReducer,
    groups: groupReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors with Date objects inside state
    }),
});
