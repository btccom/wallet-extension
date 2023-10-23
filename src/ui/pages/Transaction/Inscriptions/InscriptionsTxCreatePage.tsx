import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription, TxType } from '@/common/types';
import { Footer, Header, Input } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useNavigate } from '@/ui/router';
import { useCreateOrdinalsTxCallback, useOrdinalsTx } from '@/ui/store/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

export default function InscriptionsTxCreatePage() {
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();

  const { state } = useLocation();
  const { inscription } = state as {
    inscription: Inscription;
  };
  const ordinalsTx = useOrdinalsTx();
  const [toInfo, setToInfo] = useState({
    address: ordinalsTx.toAddress,
    domain: ordinalsTx.toDomain
  });

  const [error, setError] = useState('');
  const createOrdinalsTx = useCreateOrdinalsTxCallback();

  const [feeRate, setFeeRate] = useState(5);
  const defaultOutputValue = inscription ? inscription.amount : 10000;

  const minOutputValue = Math.max(inscription.offset, 546);
  const [outputValue, setOutputValue] = useState(defaultOutputValue);

  useEffect(() => {
    setDisabled(true);
    setError('');

    if (feeRate <= 0) {
      return;
    }

    if (outputValue < minOutputValue) {
      setError(`OutputValue must be at least ${minOutputValue}`);
      return;
    }

    if (!outputValue) {
      return;
    }

    if (!isValidAddress(toInfo.address)) {
      return;
    }

    if (
      toInfo.address == ordinalsTx.toAddress &&
      feeRate == ordinalsTx.feeRate &&
      outputValue == ordinalsTx.outputValue
    ) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }
    setDisabled(false);
  }, [toInfo.address, feeRate, outputValue]);
  const createOrdinalsTxCallback = () => {
    setDisabled(true);
    createOrdinalsTx(toInfo, inscription.id, feeRate, outputValue)
      .then((data) => {
        navigate('SignHexPage', { rawTxInfo: data, type: TxType.SEND_INSCRIPTION });
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  };
  return (
    <div className="container">
      <Header
        onBack={() => {
          history.go(-1);
        }}
        title="Send Inscription"
      />
      <div className="view">
        <div className="flex-col">
          <div className="flex-row justify-center mb-xl">
            {inscription && <InscriptionPreview data={inscription} type="middle" />}
          </div>
          <div className="text textDim">Recipient</div>

          <Input
            preset="address"
            addressInputData={toInfo}
            autoFocus={true}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
          />

          <div className="text textDim">OutputValue</div>

          <Input preset="text" value={String(defaultOutputValue)} disabled />

          <div className="text textDim">Fee</div>

          <FeeRateBar
            onChange={(val) => {
              setFeeRate(Number(val));
            }}
          />

          {error && <div className="text error">{error}</div>}
        </div>
        <Footer preset="fixed">
          <Button
            className="primary-btn full-x"
            type="primary"
            disabled={disabled}
            onClick={(e) => {
              createOrdinalsTxCallback();
            }}>
            Next
          </Button>
        </Footer>
      </div>
    </div>
  );
}
