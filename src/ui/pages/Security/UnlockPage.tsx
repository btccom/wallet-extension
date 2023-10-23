import { Button } from 'antd';
import React, { useEffect, useState } from 'react';

import { Input } from '@/ui/components/Input';
import { Logo } from '@/ui/components/Logo';
import { useNavigate } from '@/ui/router';
import { useUnlockCallback } from '@/ui/store/common/hook';
import { getUiType, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

export default function UnlockPage() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const UIType = getUiType();
  const isInNotification = UIType.isNotification;
  const unlock = useUnlockCallback();
  const helper = useHelper();
  const btnClick = async () => {
    // run(password);
    try {
      await unlock(password);
      if (!isInNotification) {
        const hasVault = await wallet.hasVault();
        if (!hasVault) {
          navigate('Welcome');
          return;
        } else {
          navigate('HomePage');
          return;
        }
      }
    } catch (e) {
      helper.toast('PASSWORD ERROR', 'error');
    }
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      btnClick();
    }
  };

  useEffect(() => {
    if (password) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [password]);
  return (
    <div className="container">
      <div className="view middle">
        <div className="flex-col full-x">
          <div className="flex-row justify-center">
            <Logo type="large" />
          </div>

          <div className="flex-col gap-xl mt-xxl">
            <div className="text font-bold align-center">Enter your password</div>
            <Input
              preset="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => handleOnKeyUp(e)}
              autoFocus={true}
            />
            <Button disabled={disabled} className="primary-btn" type="primary" onClick={btnClick}>
              Unlock
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
