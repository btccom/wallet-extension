import { createSlice } from '@reduxjs/toolkit';

export interface CommonState {
  isUnlocked: boolean;
  isReady: boolean;
  isBooted: boolean;
  inscriptionsTab: string;
  exchangeRate: {
    [key: string]: number;
  };
}

export const initialState: CommonState = {
  isUnlocked: false,
  isReady: false,
  isBooted: false,
  exchangeRate: {
    btc: 0
  },
  inscriptionsTab: 'inscriptions'
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    reset(state) {
      return initialState;
    },
    update(
      state,
      action: {
        payload: {
          isUnlocked?: boolean;
          isReady?: boolean;
          isBooted?: boolean;
        };
      }
    ) {
      const { payload } = action;
      state = Object.assign({}, state, payload);
      return state;
    },
    setExchangeRate(state, action: { payload: { coin: string; exchangeRate: number } }) {
      const { payload } = action;
      state.exchangeRate[payload.coin] = payload.exchangeRate;
    },
    setInscriptionsTab(state, action: { payload: string }) {
      const { payload } = action;
      state.inscriptionsTab = payload;
    }
  }
});

export const commonActions = commonSlice.actions;
export default commonSlice.reducer;
