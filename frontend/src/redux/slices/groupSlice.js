import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import groupService from '../../services/groupService';

const initialState = {
  groups: [],
  currentGroup: null, // { details: {}, standings: [], feed: [] }
  loading: false,
  detailsLoading: false,
  error: null,
};

// Fetch all groups
export const fetchGroups = createAsyncThunk(
  'groups/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await groupService.getGroups();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Create group
export const addGroup = createAsyncThunk(
  'groups/create',
  async (groupData, thunkAPI) => {
    try {
      return await groupService.createGroup(groupData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Fetch group details, standings, and activities
export const fetchGroupDetails = createAsyncThunk(
  'groups/fetchDetails',
  async (id, thunkAPI) => {
    try {
      return await groupService.getGroupDetails(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Join group
export const joinGroup = createAsyncThunk(
  'groups/join',
  async (id, thunkAPI) => {
    try {
      await groupService.joinGroup(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Leave group
export const leaveGroup = createAsyncThunk(
  'groups/leave',
  async (id, thunkAPI) => {
    try {
      await groupService.leaveGroup(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Send Nudge
export const triggerNudge = createAsyncThunk(
  'groups/nudge',
  async ({ groupId, recipientId }, thunkAPI) => {
    try {
      return await groupService.sendNudge(groupId, recipientId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Send High-Five
export const triggerHighFive = createAsyncThunk(
  'groups/highFive',
  async ({ groupId, recipientId }, thunkAPI) => {
    try {
      return await groupService.sendHighFive(groupId, recipientId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroupError: (state) => {
      state.error = null;
    },
    resetCurrentGroup: (state) => {
      state.currentGroup = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create
      .addCase(addGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(addGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Details
      .addCase(fetchGroupDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentGroup = {
          details: action.payload.group,
          standings: action.payload.standings,
          feed: action.payload.feed,
        };
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })
      
      // Join
      .addCase(joinGroup.fulfilled, (state, action) => {
        // Redirection or refetch is handled on components, but we flag complete
        state.loading = false;
      })
      
      // Leave
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = null;
      })

      // Interactions (Append new activity item to front of feed list)
      .addCase(triggerNudge.fulfilled, (state, action) => {
        if (state.currentGroup && state.currentGroup.feed) {
          state.currentGroup.feed.unshift(action.payload);
        }
      })
      .addCase(triggerHighFive.fulfilled, (state, action) => {
        if (state.currentGroup && state.currentGroup.feed) {
          state.currentGroup.feed.unshift(action.payload);
        }
      });
  },
});

export const { clearGroupError, resetCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;
