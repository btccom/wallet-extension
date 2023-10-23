import { Account, AddressType, Brc20Ticks, NetworkType, WalletConfig, WalletKeyring } from '@/common/types';
import { createSlice } from '@reduxjs/toolkit';

const initialKeyring: WalletKeyring = {
  key: '',
  index: 0,
  type: '',
  addressType: AddressType.P2TR,
  accounts: [],
  alianName: '',
  hdPath: ''
};

const initialAccount: Account = {
  type: '',
  address: '',
  brandName: '',
  alianName: '',
  displayBrandName: '',
  index: 0,
  balance: 0,
  pubkey: '',
  key: ''
};

export interface UiState {
  keyrings: WalletKeyring[];
  current: WalletKeyring;
  //account
  accounts: Account[];
  currentAccount: Account;
  loading: boolean;
  balanceMap: {
    [key: string]: {
      amount: string;
      btc_amount: string;
      inscription_amount: string;
      satsInSpsats: string;
      brc20: Brc20Ticks[];
      expired: boolean;
    };
  };
  //setting
  addressType: AddressType.P2TR;
  networkType: NetworkType.MAINNET;
  walletConfig: {
    version: '';
  };
}

export const initialState: UiState = {
  keyrings: [],
  current: initialKeyring,
  //account
  accounts: [],
  currentAccount: initialAccount,
  loading: false,
  balanceMap: {},
  //setting
  addressType: AddressType.P2TR,
  networkType: NetworkType.MAINNET,
  walletConfig: {
    version: ''
  }
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrent(state, action: { payload: WalletKeyring }) {
      const { payload } = action;
      state.current = payload || initialKeyring;
    },
    setKeyrings(state, action: { payload: WalletKeyring[] }) {
      const { payload } = action;
      state.keyrings = payload;
    },

    reset(state) {
      return initialState;
    },

    updateKeyringName(state, action: { payload: WalletKeyring }) {
      const keyring = action.payload;
      if (state.current.key === keyring.key) {
        state.current.alianName = keyring.alianName;
      }
      state.keyrings.forEach((v) => {
        if (v.key === keyring.key) {
          v.alianName = keyring.alianName;
        }
      });
    },

    updateAccountName(state, action: { payload: Account }) {
      const account = action.payload;
      //account
      if (state.currentAccount.key === account.key) {
        state.currentAccount.alianName = account.alianName;
      }
      state.accounts.forEach((v) => {
        if (v.key === account.key) {
          v.alianName = account.alianName;
        }
      });

      state.current.accounts.forEach((v) => {
        if (v.key === account.key) {
          v.alianName = account.alianName;
        }
      });

      state.keyrings.forEach((v) => {
        v.accounts.forEach((w) => {
          if (w.key === account.key) {
            w.alianName = account.alianName;
          }
        });
      });
    },
    //account
    setCurrentAccount(state, action: { payload: Account }) {
      const { payload } = action;
      state.currentAccount = payload || initialAccount;
    },
    setAccounts(state, action: { payload: Account[] }) {
      const { payload } = action;
      state.accounts = payload;
    },
    setBalance(
      state,
      action: {
        payload: {
          address: string;
          amount: string;
          btc_amount: string;
          inscription_amount: string;
          satsInSpsats: string;
          brc20: Brc20Ticks[];
        };
      }
    ) {
      const {
        payload: { address, amount, btc_amount, inscription_amount, satsInSpsats, brc20 }
      } = action;
      state.balanceMap[address] = state.balanceMap[address] || {
        amount: '0',
        btc_amount: '0',
        inscription_amount: '0',
        satsInSpsats: '0',
        brc20: [],
        expired: true
      };
      state.balanceMap[address].amount = amount;
      state.balanceMap[address].btc_amount = btc_amount;
      state.balanceMap[address].inscription_amount = inscription_amount;
      state.balanceMap[address].satsInSpsats = satsInSpsats;
      state.balanceMap[address].brc20 = brc20;
      state.balanceMap[address].expired = false;
    },
    expireBalance(state) {
      const balance = state.balanceMap[state.currentAccount.address];
      if (balance) {
        balance.expired = true;
      }
    },
    //setting
    updateSettings(
      state,
      action: {
        payload: {
          locale?: string;
          addressType?: AddressType;
          networkType?: NetworkType;
          walletConfig?: WalletConfig;
        };
      }
    ) {
      const { payload } = action;
      state = Object.assign({}, state, payload);
      return state;
    }
  }
});

export const uiActions = slice.actions;
export default slice.reducer;
