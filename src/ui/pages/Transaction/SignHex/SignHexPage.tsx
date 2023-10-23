import { useLocation } from 'react-router-dom';

import { RawTxInfo, TxType, TxTypeTitle } from '@/common/types';
import { Header } from '@/ui/components';
import { useNavigate } from '@/ui/router';

import SignHex from '.';

export function SignHexPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const contextData = state as {
    rawTxInfo: RawTxInfo;
    type: TxType;
    title?: string;
  };
  const title = contextData.title || TxTypeTitle[contextData.type] || 'Sign Transaction';
  return (
    <div className="container">
      <Header
        title={title}
        onBack={() => {
          navigate('HomePage');
        }}
      />
      <SignHex
        params={{
          rawTxInfo: contextData.rawTxInfo,
          type: contextData.type
        }}
        header={true}
        handleConfirm={() => {
          navigate('TxPasswordConfirmPage', { rawTxInfo: contextData.rawTxInfo, type: contextData.type, title: title });
        }}
      />
    </div>
  );
}
