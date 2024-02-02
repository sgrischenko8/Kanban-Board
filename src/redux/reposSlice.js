import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'repos',
  storage,
};

const reposSlice = createSlice({
  name: 'repos',
  initialState: [],
  reducers: {
    setRepos(state, action) {
      state.repos = action.payload;
    },
  },
});

export const { setRepos } = reposSlice.actions;

export const persistedReducer = persistReducer(
  persistConfig,
  reposSlice.reducer,
);

export const reposReducer = reposSlice.reducer;
