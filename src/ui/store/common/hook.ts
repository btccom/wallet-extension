import { useCallback } from 'react';

import { AddressType, ExchangeRatePrice } from '@/common/types';
import { useNotice, useWallet } from '@/ui/utils';

import { useAppDispatch, useAppSelector } from '../hooks';
import { commonActions } from './reducer';

export function useCommon() {
  return useAppSelector((state) => state.common);
}
export function useFetchExchangeRate() {
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  return useCallback(async () => {
    const exchangeRate = await wallet.getExchangeRate();
    const prices = exchangeRate.price || [];
    prices.forEach((price: ExchangeRatePrice) => {
      dispatch(
        commonActions.setExchangeRate({
          coin: price.coin,
          exchangeRate: Number(price.priceUsd)
        })
      );
    });
  }, [dispatch, wallet]);
}
export function useInscriptionsTab() {
  const commonState = useCommon();
  return commonState.inscriptionsTab;
}
export function useExchangeRate(coin = 'btc') {
  const commonState = useCommon();
  return commonState.exchangeRate[coin];
}

export function useIsUnlocked() {
  const commonState = useCommon();
  return commonState.isUnlocked;
}

export function useIsReady() {
  const commonState = useCommon();
  return commonState.isReady;
}

export function useUnlockCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const [, resolveNotice] = useNotice();
  return useCallback(
    async (password: string) => {
      await wallet.unlock(password);
      dispatch(commonActions.update({ isUnlocked: true }));
      resolveNotice();
    },
    [dispatch, wallet]
  );
}

export function useCreateAccountCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  return useCallback(
    async (mnemonics: string, hdPath: string, passphrase: string, addressType: AddressType) => {
      await wallet.createKeyringWithMnemonics(mnemonics, hdPath, passphrase, addressType);
      dispatch(commonActions.update({ isUnlocked: true }));
    },
    [dispatch, wallet]
  );
}
