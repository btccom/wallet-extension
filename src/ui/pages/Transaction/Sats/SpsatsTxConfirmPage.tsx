import { useLocation } from 'react-router-dom';

import { RawTxInfo, TxType } from '@/common/types';
import { Header } from '@/ui/components';
import { useNavigate } from '@/ui/router';

import SignHex from '../SignHex';

interface LocationState {
  rawTxInfo: RawTxInfo;
}

export default function SpsatsTxConfirmPage() {
  const { state } = useLocation();
  const { rawTxInfo }: LocationState = state;
  const navigate = useNavigate();
  return (
    <SignHex
      header={
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
          title={`Send Rare  Sats`}
        />
      }
      params={{ rawTxInfo, type: TxType.SEND_SATS }}
      handleCancel={() => {
        navigate('HomePage');
      }}
      handleConfirm={() => {
        navigate('TxPasswordConfirmPage', { rawTxInfo, type: TxType.SEND_SATS });
      }}
    />
  );
}
