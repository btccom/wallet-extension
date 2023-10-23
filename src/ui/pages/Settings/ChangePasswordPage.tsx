import { Button } from 'antd';
import { useEffect, useState } from 'react';

import { Input, Header } from '@/ui/components';
import { useNavigate } from '@/ui/router';
import { useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

type Status = '' | 'error' | 'warning' | undefined;

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [passwordC, setPasswordC] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [statusC, setStatusC] = useState<Status>('');
  const [status1, setStatus1] = useState<Status>('');
  const [status2, setStatus2] = useState<Status>('');
  const [disabled, setDisabled] = useState(true);
  const wallet = useWallet();
  const helper = useHelper();

  useEffect(() => {
    setDisabled(true);
    if (password) {
      if (password.length < 6) {
        helper.toast('at least five characters', 'warning');
        setStatus1('error');
        return;
      }

      setStatus1('');

      if (password !== password2) {
        helper.toast('Entered passwords differ', 'warning');
        setStatus2('error');
        return;
      }
      setStatus2('');

      if (passwordC) {
        setDisabled(false);
      }
    }
  }, [passwordC, password, password2]);

  const handleOnBlur = (e, type: string) => {
    switch (type) {
      case 'password':
        setPassword(e.target.value);
        break;
      case 'password2':
        setPassword2(e.target.value);
        break;
      case 'passwordC':
        setPasswordC(e.target.value);
        break;
    }
  };

  const verify = async () => {
    try {
      await wallet.changePassword(passwordC, password);
      helper.toast('Success', 'success');
      navigate('HomePage');
    } catch (err) {
      helper.toast((err as any).message, 'error');
    }
  };
  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Change Password"
      />
      <div className="view">
        <div className="flex-col gap-lg">
          <Input
            preset="password"
            placeholder="Current Password"
            onBlur={(e) => {
              handleOnBlur(e, 'passwordC');
            }}
            autoFocus={true}
          />
          <Input
            preset="password"
            placeholder="New Password"
            onBlur={(e) => {
              handleOnBlur(e, 'password');
            }}
          />
          <Input
            preset="password"
            placeholder="Confirm Password"
            onBlur={(e) => {
              handleOnBlur(e, 'password2');
            }}
          />
          <Button
            disabled={disabled}
            className="primary-btn"
            type="primary"
            onClick={() => {
              verify();
            }}>
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
