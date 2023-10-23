import { load, save } from 'redux-localstorage-simple';

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import common from './common/reducer';
import transactions from './transactions/reducer';
import ui from './ui/reducer';

const PERSISTED_KEYS: string[] = ['ui'];
const store = configureStore({
  reducer: {
    transactions,
    ui,
    common
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true }).concat(save({ states: PERSISTED_KEYS, debounce: 1000 })),
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: true })
});

setupListeners(store.dispatch);

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
