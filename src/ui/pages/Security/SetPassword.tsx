import { Button, Input } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Header } from '@/ui/components';
import { useNavigate } from '@/ui/router';
import { useWallet, useWalletRequest } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { state } = useLocation();
  const { isNewAccount } = state as { isNewAccount: boolean };
  const [password, setPassword] = useState('');

  const [password2, setPassword2] = useState('');

  const [disabled, setDisabled] = useState(true);

  const helper = useHelper();
  const [run, loading] = useWalletRequest(wallet.boot, {
    onSuccess() {
      if (isNewAccount) {
        navigate('CreateHDWalletPage', { isImport: false, fromUnlock: true });
      } else {
        navigate('CreateHDWalletPage', { isImport: true, fromUnlock: true });
      }
    },
    onError(err) {
      helper.toast(err, 'error');
    }
  });

  const btnClick = () => {
    run(password.trim());
  };

  const verify = (pwd2: string) => {
    if (pwd2 && pwd2 !== password) {
      helper.toast('Entered passwords differ', 'warning');
    }
  };

  useEffect(() => {
    setDisabled(true);

    if (password) {
      if (password.length < 5) {
        helper.toast('Password must contain at least 5 characters', 'warning');
        return;
      }

      if (password2) {
        if (password === password2) {
          setDisabled(false);
          return;
        }
      }
    }
  }, [password, password2]);

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      btnClick();
    }
  };

  return (
    <div className="container">
      <Header
        title=" "
        onBack={() => {
          history.go(-1);
        }}
      />
      <div className="view middle">
        <div className="gap-md full-x">
          <div className="flex-col-center gap-xl mt-xxl">
            <span className="text font-bold font-xl">Create a password</span>
            <span className="text align-center sub">You will use this to unlock your wallet</span>
            <Input.Password
              className="input"
              placeholder="Password"
              onBlur={(e) => {
                setPassword(e.target.value);
              }}
              autoFocus={true}
            />
            <Input.Password
              className="input"
              placeholder="Confirm Password"
              onChange={(e) => {
                setPassword2(e.target.value);
              }}
              onBlur={(e) => {
                verify(e.target.value);
              }}
              onKeyUp={(e) => handleOnKeyUp(e)}
            />
            <Button className="primary-btn" disabled={disabled} type="primary" onClick={btnClick}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
