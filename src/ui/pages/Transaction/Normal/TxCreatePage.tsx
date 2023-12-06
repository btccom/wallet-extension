import { Button, Checkbox } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { SEND_LIMIT } from '@/common/constant';
import { RawTxInfo, TxType } from '@/common/types';
import { amountToSatoshis, satoshisToAmount } from '@/common/utils';
import { Header, Input } from '@/ui/components';
import { FeeRateBar, FeeRateType } from '@/ui/components/FeeRateBar';
import { useNavigate } from '@/ui/router';
import { useBitcoinTx, useCreateBitcoinTxCallback } from '@/ui/store/transactions/hooks';
import { useAccountBalance } from '@/ui/store/ui/hooks';
import { isValidAddress } from '@/ui/utils';
import Icon, { CheckCircleFilled } from '@ant-design/icons';

import SignHex from '../SignHex';

function TxCreatePage({ localState, updateState }) {
  const accountBalance = useAccountBalance();
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();
  const [inputAmount, setInputAmount] = useState(localState.amount);
  const [disabled, setDisabled] = useState(true);
  const [isRbf, setIsRbf] = useState(true);
  const [feeRate, setFeeRate] = useState<number | string>(localState.feeRate);
  const [feeRateIndex, setFeeRateIndex] = useState(localState.feeRateIndex);
  const [toPayInfo, setToPayInfo] = useState<{
    address: string;
    domain: string;
  }>({
    address: localState.address || bitcoinTx.toAddress,
    domain: bitcoinTx.toDomain
  });

  const [error, setError] = useState('');

  const [autoAdjust, setAutoAdjust] = useState(localState.autoAdjust);

  const createBitcoinTx = useCreateBitcoinTxCallback();

  const maxSatoshis = useMemo(() => {
    return amountToSatoshis(accountBalance.btc_amount);
  }, [accountBalance.btc_amount]);
  const toSatoshis = useMemo(() => {
    if (!inputAmount) return 0;
    return amountToSatoshis(inputAmount);
  }, [inputAmount]);

  const limitAmount = useMemo(() => satoshisToAmount(SEND_LIMIT), [SEND_LIMIT]);

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toPayInfo.address)) {
      return;
    }
    if (!toSatoshis) {
      return;
    }
    if (toSatoshis > maxSatoshis) {
      setError(`Insufficient Balance`);
      return;
    }
    if (toSatoshis < SEND_LIMIT) {
      setError(`Amount must be at least ${limitAmount} BTC`);
      return;
    }

    if (!feeRate || Number(feeRate) <= 0) {
      return;
    }

    setDisabled(false);
  }, [toPayInfo, inputAmount, autoAdjust, feeRate]);

  const createBitcoinTxCallback = () => {
    setDisabled(true);
    createBitcoinTx(toPayInfo, toSatoshis, Number(feeRate), autoAdjust, isRbf)
      .then((data) => {
        setDisabled(false);
        updateState({
          rawTxInfo: data,
          address: toPayInfo.address,
          amount: inputAmount,
          feeRate,
          feeRateIndex,
          autoAdjust,
          step: STEP.STEP2
        });
      })
      .catch((e) => {
        setDisabled(false);
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
        title="Send BTC"
      />

      <div className="view">
        <div className="flex-col mt-lg">
          <div className="flex-row justify-between full-x">
            <div className="text textDim">Amount</div>
            <div className="flex-row">
              <div className="text font-sm textDim">Available:</div>
              <div className="text font-bold font-sm">{`${accountBalance.btc_amount} BTC`}</div>
            </div>
          </div>

          <div className="flex-row-center full">
            <Input
              preset="amount"
              placeholder={`Minimum ${limitAmount} BTC`}
              // defaultValue={inputAmount}
              value={inputAmount}
              onChange={async (e) => {
                if (autoAdjust == true) {
                  setAutoAdjust(false);
                }
                setInputAmount(e.target.value);
              }}
              containerStyle={{ width: '100%' }}
              suffix={
                <div
                  className="text iblue-dark pointer"
                  onClick={() => {
                    setAutoAdjust(true);
                    setInputAmount(accountBalance.btc_amount.toString());
                  }}>
                  Max
                </div>
              }
              autoFocus={true}
            />
          </div>
        </div>

        <div className="flex-col mt-lg">
          <div className="text textDim">Recipient</div>
          <Input
            preset="address"
            addressInputData={toPayInfo}
            onAddressInputChange={(val) => {
              setToPayInfo(val);
            }}
          />
        </div>

        <div className="flex-col mt-lg">
          <div className="flex-row justify-between">
            <div className="text textDim">Fee</div>
            <div>
              <Checkbox checked={isRbf} onChange={(e) => setIsRbf(e.target.checked)}>
                RBF
              </Checkbox>
            </div>
          </div>

          <FeeRateBar
            optIndex={feeRateIndex}
            feeRate={String(feeRate)}
            onChange={(val, optIndex) => {
              setFeeRate(val);
              setFeeRateIndex(optIndex);
            }}
          />
        </div>
        {error && <div className="text error mt-lg mb-xxl">{error}</div>}

        <Button
          disabled={disabled}
          className="primary-btn"
          type="primary"
          onClick={(e) => {
            createBitcoinTxCallback();
          }}>
          Next
        </Button>
      </div>
    </div>
  );
}
function TxConfirmPage({ localState, updateState }) {
  const rawTxInfo = localState.rawTxInfo;
  const navigate = useNavigate();
  return (
    <SignHex
      header={
        <Header
          title="Send BTC"
          onBack={() => {
            updateState({
              step: STEP.STEP1
            });
          }}
        />
      }
      params={{ type: TxType.SEND_BITCOIN, rawTxInfo }}
      handleCancel={() => {
        navigate('HomePage');
      }}
      handleConfirm={async () => {
        navigate('TxPasswordConfirmPage', { rawTxInfo, type: TxType.SEND_BITCOIN });
      }}
    />
  );
}

interface LocalStateParams {
  rawTxInfo: RawTxInfo;
  amount: string;
  address: string;
  feeRate: string | number;
  step: STEP;
  autoAdjust: boolean;
  feeRateIndex: number;
}
enum STEP {
  STEP1,
  STEP2
}
export default function Main() {
  const [localState, setLocalState] = useState({
    rawTxInfo: {},
    amount: '',
    address: '',
    feeRate: '',
    step: STEP.STEP1,
    autoAdjust: false,
    feeRateIndex: FeeRateType.AVG
  });
  const updateState = (data: LocalStateParams) => {
    setLocalState(Object.assign({}, localState, data));
  };
  return STEP.STEP1 === localState.step ? (
    <TxCreatePage localState={localState} updateState={updateState} />
  ) : (
    <TxConfirmPage localState={localState} updateState={updateState} />
  );
}
