import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import coreReducer from './core/coreSlice';

const store = configureStore({
  reducer: {
    core: coreReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(apiSlice.middleware);
  },
});

export const getState = (state: RootState) => state;
export const getCoreState = (state: RootState) => state.core;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export default store;
