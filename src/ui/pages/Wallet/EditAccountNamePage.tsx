import { Button } from 'antd';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Account } from '@/common/types';
import { Header, Input } from '@/ui/components';
import { useAppDispatch } from '@/ui/store/hooks';
import { uiActions } from '@/ui/store/ui/reducer';
import { useWallet } from '@/ui/utils';

export default function EditAccountNamePage() {
  const { state } = useLocation();
  const { account } = state as {
    account: Account;
  };

  const wallet = useWallet();
  const [alianName, setAlianName] = useState('');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const newAccount = await wallet.setAccountAlianName(account, alianName);
    dispatch(uiActions.updateAccountName(newAccount));
    window.history.go(-1);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      handleOnClick();
    }
  };

  const validName = useMemo(() => {
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
        title={account.alianName}
      />
      <div className="view">
        <Input
          placeholder={account.alianName}
          onChange={(e) => {
            setAlianName(e.target.value);
          }}
          onKeyUp={(e) => handleOnKeyUp(e)}
          autoFocus={true}
        />
        <Button
          disabled={!validName}
          className="primary-btn"
          type="primary"
          onClick={(e) => {
            handleOnClick();
          }}>
          Change Account Name
        </Button>
      </div>
    </div>
  );
}
