import { useCallback, useEffect, useRef } from 'react';

import eventManger from '@/common/message/eventManger';
import { Account } from '@/common/types';
import { useWallet } from '@/ui/utils';

import { useFetchExchangeRate } from './common/hook';
import { useIsUnlocked } from './common/hook';
import { useAppDispatch } from './hooks';
import { useAccountBalance, useCurrentAccount, useFetchBalanceCallback } from './ui/hooks';
import { uiActions } from './ui/reducer';

export default function StoreUpdate() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const isUnlocked = useIsUnlocked();
  const selfRef = useRef({
    preAccountKey: '',
    loadingBalance: false
  });
  const self = selfRef.current;

  const onCurrentChange = useCallback(async () => {
    if (isUnlocked && currentAccount && currentAccount.key != self.preAccountKey) {
      self.preAccountKey = currentAccount.key;

      const keyrings = await wallet.getKeyrings();
      dispatch(uiActions.setKeyrings(keyrings));
      const currentKeyring = await wallet.getCurrentKeyring();
      dispatch(uiActions.setCurrent(currentKeyring));

      const _accounts = await wallet.getAccounts();
      dispatch(uiActions.setAccounts(_accounts));

      dispatch(uiActions.expireBalance());
    }
  }, [dispatch, currentAccount, wallet, isUnlocked]);

  const fetchExchange = useFetchExchangeRate();
  useEffect(() => {
    onCurrentChange();
  }, [currentAccount && currentAccount.key, isUnlocked]);
  const fetchBalance = useFetchBalanceCallback();
  const balance = useAccountBalance();
  useEffect(() => {
    const init = async () => {
      if (self.loadingBalance) {
        return;
      }
      if (!isUnlocked) {
        return;
      }
      if (!balance.expired) {
        return;
      }
      self.loadingBalance = true;
      try {
        await fetchBalance();
        await fetchExchange();
      } catch (err: any) {
        console.log(err.message);
      }

      self.loadingBalance = false;
    };
    init();
  }, [fetchBalance, wallet, isUnlocked, self, balance]);
  useEffect(() => {
    const accountChangeHandler = (account: Account) => {
      if (account && account.address) {
        dispatch(uiActions.setCurrentAccount(account));
      }
    };
    eventManger.on('accountsChanged', accountChangeHandler);
    return () => {
      eventManger.detach('accountsChanged', accountChangeHandler);
    };
  }, [dispatch]);

  return null;
}
