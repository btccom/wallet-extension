import { useCallback } from 'react';

import { Account, NetworkType } from '@/common/types';
import { satoshisToAmount } from '@/common/utils';
import { useWallet } from '@/ui/utils';

import { AppState } from '..';
import { useAppDispatch, useAppSelector } from '../hooks';
import { uiActions } from './reducer';

export function useUiState(): AppState['ui'] {
  return useAppSelector((state) => state.ui);
}

export function useKeyrings() {
  const uiState = useUiState();
  return uiState.keyrings;
}

export function useCurrentKeyring() {
  const uiState = useUiState();
  return uiState.current;
}

export function useNetworkType() {
  const uiState = useUiState();
  return uiState.networkType;
}

export function useChangeNetworkTypeCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  return useCallback(
    async (type: NetworkType) => {
      await wallet.setNetworkType(type);
      dispatch(
        uiActions.updateSettings({
          networkType: type
        })
      );
    },
    [dispatch]
  );
}

export function useCurrentAccount() {
  const uiState = useUiState();
  return uiState.currentAccount;
}

export function useAccounts() {
  const uiState = useUiState();
  return uiState.accounts;
}

export function useAccountBalance() {
  const uiState = useUiState();
  const currentAccount = useCurrentAccount();
  return uiState.balanceMap[currentAccount.address] || { amount: '0', expired: true };
}
export function useBalanceByAddress(address: string) {
  const uiState = useUiState();
  return uiState.balanceMap[address] || { amount: '0', expired: true };
}

export function useAccountAddress() {
  const currentAccount = useCurrentAccount();
  return currentAccount.address;
}

export function useSetCurrentAccountCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (account: Account) => {
      dispatch(uiActions.setCurrentAccount(account));
    },
    [dispatch]
  );
}

export function useFetchBalanceCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const balance = useAccountBalance();
  return useCallback(async () => {
    if (!currentAccount.address) return;

    const _accountBalance = await wallet.getAddressBalance(currentAccount.address);
    dispatch(
      uiActions.setBalance({
        address: currentAccount.address,
        amount: satoshisToAmount(_accountBalance.sats),
        btc_amount: satoshisToAmount(_accountBalance.satsInBtc),
        inscription_amount: satoshisToAmount(_accountBalance.satsInInscriptions),
        satsInSpsats: satoshisToAmount(_accountBalance.satsInSpsats),
        brc20: _accountBalance.brc20 || []
      })
    );
  }, [dispatch, wallet, currentAccount, balance]);
}

export function useFetchBalanceByAddressCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const balance = useAccountBalance();
  return useCallback(
    async (address: string) => {
      const _accountBalance = await wallet.getAddressBalance(address);
      dispatch(
        uiActions.setBalance({
          address: address,
          amount: satoshisToAmount(_accountBalance.sats),
          btc_amount: satoshisToAmount(_accountBalance.satsInBtc),
          inscription_amount: satoshisToAmount(_accountBalance.satsInInscriptions),
          satsInSpsats: satoshisToAmount(_accountBalance.satsInSpsats),
          brc20: _accountBalance.brc20 || []
        })
      );
    },
    [dispatch, wallet, balance]
  );
}
