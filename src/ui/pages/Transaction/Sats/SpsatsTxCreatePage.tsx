import { Button, Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { SpSatInfo } from '@/common/types';
import { Footer, Header, Input } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import SpsatsPreview from '@/ui/components/SpsatsPreview';
import { useNavigate } from '@/ui/router';
import { useCreateSpsatsTxCallback } from '@/ui/store/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

export default function SpsatsTxCreatePage() {
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();

  const { state } = useLocation();
  const { spsatsInfo } = state as {
    spsatsInfo: SpSatInfo;
  };
  const [toInfo, setToInfo] = useState({
    address: '',
    domain: ''
  });

  const [error, setError] = useState('');
  const createSpsatsTx = useCreateSpsatsTxCallback();

  const [feeRate, setFeeRate] = useState(5);
  const defaultOutputValue = spsatsInfo ? spsatsInfo.sats : 10000;
  const [isRbf, setIsRbf] = useState(true);

  const [outputValue, setOutputValue] = useState(defaultOutputValue);

  useEffect(() => {
    setDisabled(true);
    setError('');

    if (feeRate <= 0) {
      return;
    }

    if (!outputValue) {
      return;
    }

    if (!isValidAddress(toInfo.address)) {
      return;
    }

    setDisabled(false);
  }, [toInfo, feeRate, outputValue]);
  const createSpstasTxCallback = () => {
    setDisabled(true);
    createSpsatsTx(toInfo, spsatsInfo.name, feeRate, outputValue, isRbf)
      .then((data) => {
        navigate('SpsatsTxConfirmPage', { rawTxInfo: data });
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
          window.history.go(-1);
        }}
        title="Send Rare Sats"
      />
      <div className="view">
        <div className="flex-col">
          <div className="flex-row justify-center mb-xl">
            {spsatsInfo && <SpsatsPreview data={spsatsInfo} preset="center" />}
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

          <Input
            preset="text"
            containerStyle={{ backgroundColor: '#ececec' }}
            style={{ backgroundColor: '#ececec' }}
            value={String(defaultOutputValue)}
            disabled
          />

          <div className="flex-row justify-between">
            <div className="text textDim">Fee</div>
            <div>
              <Checkbox checked={isRbf} onChange={(e) => setIsRbf(e.target.checked)}>
                RBF
              </Checkbox>
            </div>
          </div>

          <FeeRateBar
            onChange={(val) => {
              setFeeRate(val);
            }}
          />

          {error && <div className="text error">{error}</div>}
          <Footer preset="fixed">
            <Button
              className="primary-btn mt-md full-x"
              disabled={disabled}
              onClick={(e) => {
                createSpstasTxCallback();
              }}>
              Next
            </Button>
          </Footer>
        </div>
      </div>
    </div>
  );
}
