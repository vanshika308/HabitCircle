import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const token = localStorage.getItem('token');

const initialState = {
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
};

// Register user thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (user, thunkAPI) => {
    try {
      return await authService.register(user);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Login user thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (user, thunkAPI) => {
    try {
      return await authService.login(user);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Load current user session
export const loadCurrentUser = createAsyncThunk(
  'auth/loadMe',
  async (_, thunkAPI) => {
    try {
      return await authService.getMe();
    } catch (error) {
      // If token is invalid or expired, clear it
      authService.logout();
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Update user profile thunk
export const updateUserProfile = createAsyncThunk(
  'users/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      return await authService.updateProfile(profileData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Fetch user stats/risk scores
export const fetchUserStats = createAsyncThunk(
  'users/fetchStats',
  async (_, thunkAPI) => {
    try {
      return await authService.getStats();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.stats = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          avatarUrl: action.payload.avatarUrl,
          bio: action.payload.bio,
          streaks: action.payload.streaks,
          riskScore: action.payload.riskScore,
        };
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          avatarUrl: action.payload.avatarUrl,
          bio: action.payload.bio,
          streaks: action.payload.streaks,
          riskScore: action.payload.riskScore,
        };
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Load user
      .addCase(loadCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch stats
      .addCase(fetchUserStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
        // Keep user model streaks and risk scores in sync with the stats payload
        if (state.user) {
          state.user.streaks = action.payload.streaks;
          state.user.riskScore = action.payload.riskScore;
        }
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
