import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toast: null, // { message: '', type: 'success' | 'error' | 'info' }
  isSidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'success',
      };
    },
    clearToast: (state) => {
      state.toast = null;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { showToast, clearToast, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
