import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import habitService from '../../services/habitService';

const initialState = {
  habits: [],
  loading: false,
  error: null,
};

// Fetch habits
export const fetchHabits = createAsyncThunk(
  'habits/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await habitService.getAllHabits();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Create habit
export const addHabit = createAsyncThunk(
  'habits/create',
  async (habitData, thunkAPI) => {
    try {
      return await habitService.createHabit(habitData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Update habit
export const editHabit = createAsyncThunk(
  'habits/update',
  async ({ id, habitData }, thunkAPI) => {
    try {
      return await habitService.updateHabit(id, habitData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Delete habit
export const removeHabit = createAsyncThunk(
  'habits/delete',
  async (id, thunkAPI) => {
    try {
      await habitService.deleteHabit(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Toggle check-in
export const toggleHabit = createAsyncThunk(
  'habits/toggleCheckin',
  async ({ id, date }, thunkAPI) => {
    try {
      return await habitService.checkinHabit(id, { date });
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    clearHabitError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create
      .addCase(addHabit.pending, (state) => {
        state.loading = true;
      })
      .addCase(addHabit.fulfilled, (state, action) => {
        state.loading = false;
        state.habits.push(action.payload);
      })
      .addCase(addHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update
      .addCase(editHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(h => h._id === action.payload._id);
        if (index > -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(editHabit.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete
      .addCase(removeHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(h => h._id !== action.payload);
      })
      
      // Checkin
      .addCase(toggleHabit.fulfilled, (state, action) => {
        const { habit } = action.payload;
        const index = state.habits.findIndex(h => h._id === habit._id);
        if (index > -1) {
          state.habits[index] = habit;
        }
      });
  },
});

export const { clearHabitError } = habitSlice.actions;
export default habitSlice.reducer;
