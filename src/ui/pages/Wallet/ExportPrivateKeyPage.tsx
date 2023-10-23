import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Account } from '@/common/types';
import { Input, Icon, Header, Footer } from '@/ui/components';
import { copyToClipboard, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

type Status = '' | 'error' | 'warning' | undefined;

export default function ExportPrivateKeyPage() {
  const { state } = useLocation();
  const { account } = state as {
    account: Account;
  };

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);

  const [privateKey, setPrivateKey] = useState({ hex: '', wif: '' });
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');
  const wallet = useWallet();
  const helper = useHelper();

  const btnClick = async () => {
    try {
      const _res = await wallet.getPrivateKey(password, account);
      setPrivateKey(_res);
    } catch (e) {
      setStatus('error');
      setError((e as any).message);
    }
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      btnClick();
    }
  };

  useEffect(() => {
    setDisabled(true);
    if (password) {
      setDisabled(false);
      setStatus('');
      setError('');
    }
  }, [password]);

  function copy(str: string) {
    copyToClipboard(str);
    helper.toast('Copied', 'success');
  }

  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Export Private Key"
      />
      {privateKey.wif == '' ? (
        <>
          <div className="view">
            <div className="flex-col gap-lg">
              <div className="card">
                <div className="flex-col gap-lg">
                  <div className="text font-bold red">If you lose your Private Key, your assets will be gone!</div>
                  <div className="text font-bold red">
                    If you share the Private Key to others, your assets will be stolen!
                  </div>
                  <div className="text font-bold red">
                    Private Key is only stored in your browser, it is your responsibilities to keep the Private Key
                    safe!
                  </div>
                </div>
              </div>
              <div className="text align-center my-xl ">
                Please make sure you have read the security tips above before typing your password
              </div>
              <Input
                preset="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                onKeyUp={(e) => handleOnKeyUp(e)}
                autoFocus={true}
              />
              {error && <div className="text error"> {error}</div>}
            </div>
          </div>
          <Footer preset="fixed">
            <Button className="primary-btn full-x" type="primary" disabled={disabled} onClick={btnClick}>
              Show Private Key
            </Button>
          </Footer>
        </>
      ) : (
        <div className="view">
          <div className="flex-col">
            <div className="text sub font-sm align-center">
              If you ever change browsers or move computers, you will need this Private Key to access this account. Save
              it somewhere safe and secret
            </div>
            <div className="text sub font-sm mt-lg align-center">WIF Private Key:</div>

            <div
              className="card pointer"
              onClick={(e) => {
                copy(privateKey.wif);
              }}>
              <div className="flex-row items-center">
                <Icon icon="copy" color="textDim" />
                <div
                  className="text textDim wrap"
                  style={{
                    overflowWrap: 'anywhere'
                  }}>
                  {privateKey.wif}
                </div>
              </div>
            </div>

            <div className="text sub mt-lg font-sm align-center">Hex Private Key:</div>

            <div
              className="card pointer"
              onClick={(e) => {
                copy(privateKey.hex);
              }}>
              <div className="flex-row items-center">
                <Icon icon="copy" color="textDim" />
                <div
                  className="text wrap textDim"
                  style={{
                    overflowWrap: 'anywhere'
                  }}>
                  {privateKey.hex}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
