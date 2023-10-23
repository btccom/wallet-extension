import { Button } from 'antd';
import { useEffect, useState } from 'react';

import { Header, Input } from '@/ui/components';
import { useNavigate } from '@/ui/router';
import { useCurrentKeyring, useSetCurrentAccountCallback } from '@/ui/store/ui/hooks';
import { useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const helper = useHelper();
  const setCurrentAccount = useSetCurrentAccountCallback();
  const currentKeyring = useCurrentKeyring();
  const [alianName, setAlianName] = useState('');
  const [defaultName, setDefaultName] = useState('');
  const handleOnClick = async () => {
    await wallet.deriveNewAccountFromMnemonic(currentKeyring, alianName || defaultName);
    helper.toast('Success', 'success');
    const currentAccount = await wallet.getCurrentAccount();
    setCurrentAccount(currentAccount);
    navigate('HomePage');
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      handleOnClick();
    }
  };

  const init = async () => {
    const accountName = await wallet.getNextAlianName(currentKeyring);
    setDefaultName(accountName);
  };
  useEffect(() => {
    init();
  }, []);

  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="New account"
      />
      <div className="view">
        <div className="flex-col">
          <Input
            placeholder={defaultName}
            onChange={(e) => {
              setAlianName(e.target.value);
            }}
            onKeyUp={(e) => handleOnKeyUp(e)}
            autoFocus={true}
          />
          <Button
            type="primary"
            className="primary-btn"
            onClick={(e) => {
              handleOnClick();
            }}>
            Create a Account
          </Button>
        </div>
      </div>
    </div>
  );
}
