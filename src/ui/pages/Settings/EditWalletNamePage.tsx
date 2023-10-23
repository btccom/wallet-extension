import { Button } from 'antd';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { WalletKeyring } from '@/common/types';
import { Header, Input } from '@/ui/components';
import { useAppDispatch } from '@/ui/store/hooks';
import { uiActions } from '@/ui/store/ui/reducer';
import { useWallet } from '@/ui/utils';

export default function EditWalletNamePage() {
  const { state } = useLocation();
  const { keyring } = state as {
    keyring: WalletKeyring;
  };

  const wallet = useWallet();
  const [alianName, setAlianName] = useState('');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const newKeyring = await wallet.setKeyringAlianName(keyring, alianName || keyring.alianName);
    dispatch(uiActions.updateKeyringName(newKeyring));
    window.history.go(-1);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      handleOnClick();
    }
  };

  const isValidName = useMemo(() => {
    if (alianName.length == 0) {
      return false;
    }
    return true;
  }, [alianName]);

  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={keyring.alianName}
      />
      <div className="view">
        <div className="flex-col gap-lg">
          <Input
            placeholder={keyring.alianName}
            onChange={(e) => {
              setAlianName(e.target.value);
            }}
            onKeyUp={(e) => handleOnKeyUp(e)}
            autoFocus={true}
          />
          <Button
            disabled={!isValidName}
            type="primary"
            className="text primary-btn"
            onClick={(e) => {
              handleOnClick();
            }}>
            Change Wallet Name
          </Button>
        </div>
      </div>
    </div>
  );
}
