import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { log } from '@/common/log';
import { RawTxInfo, TxType } from '@/common/types';
import { Footer, Header } from '@/ui/components';
import { Input } from '@/ui/components/Input';
import { useNavigate } from '@/ui/router';
import { usePushBitcoinTxCallback } from '@/ui/store/transactions/hooks';
import { useCurrentAccount } from '@/ui/store/ui/hooks';
import { useWallet } from '@/ui/utils';

interface LocationState {
  rawTxInfo: RawTxInfo;
  type?: TxType;
  title?: string;
}
export default function TxPasswordConfirmPage({
  rawTxInfo,
  type,
  title,
  callback = null
}: {
  rawTxInfo?: RawTxInfo;
  type?: TxType;
  title?: string;
  callback?: any;
}) {
  const wallet = useWallet();
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  if (!rawTxInfo) {
    const { state } = useLocation();
    const locationData: LocationState = state;
    rawTxInfo = locationData.rawTxInfo;
    type = locationData.type;
    title = locationData.title;
  }
  const pushBitcoinTx = usePushBitcoinTxCallback();
  const btnClick = async () => {
    if (disabled) {
      return;
    }
    setDisabled(true);

    // run(password);
    try {
      await wallet.verifyPassword(password);
    } catch (e) {
      setError('Incorrect password');
      setDisabled(false);
      return;
    }
    try {
      let rawTx: string = await wallet.signTx(rawTxInfo?.txHex || '', rawTxInfo?.inputs);
      log('send', rawTx);
      if (rawTxInfo?.next === 'transfer') {
        const nextTransfer = await wallet.transfer(account.address, rawTxInfo?.id || '', rawTx);
        log('transfer', nextTransfer);
        rawTx = await wallet.signTx(nextTransfer.rtx, nextTransfer.inputs);
        log('transfer', rawTx);
      }
      if (callback) {
        return callback && callback(rawTx);
      }
      pushBitcoinTx(rawTx).then(({ success, txid, error }) => {
        if (success) {
          navigate('TxSuccessPage', { txid, title, type });
        } else {
          navigate('TxFailPage', { error, type, title });
        }
      });
    } catch (e: any) {
      navigate('TxFailPage', { error: e.message, type, title });
      setError(e.message);
    }
    setDisabled(false);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setError('');
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
      <Header
        title="Secured Wallet"
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <div className="view middle">
        <div className="flex-col full-x">
          <div className="flex-col gap-xl mt-xxl">
            <div className="text font-bold font-md">Enter password</div>
            <Input
              preset="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => handleOnKeyUp(e)}
              autoFocus={true}
            />
            {error && <div className="text red font-sm">{error}</div>}
          </div>
        </div>
      </div>
      <Footer>
        <div className="flex-row full">
          <Button disabled={disabled} className="primary-btn full" type="primary" onClick={btnClick}>
            Confirm
          </Button>
        </div>
      </Footer>
    </div>
  );
}
