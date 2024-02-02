import { createSlice } from '@reduxjs/toolkit';
import { fetchIssues, getSavedRepo } from './api';

const handlePending = (state) => {
  state.isLoading = true;
};

const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};

const repoSlice = createSlice({
  name: 'repo',
  initialState: {
    items: {},
    isLoading: false,
    error: null,
  },
  extraReducers: {
    [fetchIssues.pending]: handlePending,
    [fetchIssues.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      state.items = action.payload;
    },
    [fetchIssues.rejected]: handleRejected,
    [getSavedRepo.fulfilled](state, action) {
      state.items = action.payload;
    },
  },
});

export const repoReducer = repoSlice.reducer;
