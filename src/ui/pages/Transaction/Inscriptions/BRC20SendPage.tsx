import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { TokenBalance, TxType } from '@/common/types';
import { numberAdd } from '@/common/utils';
import { Footer, Header, Input } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useNavigate } from '@/ui/router';
import { useCreateSendBrc20TxCallback } from '@/ui/store/transactions/hooks';
import { isValidAddress, useWallet } from '@/ui/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';

export default function BRC20SendPage() {
  const { state } = useLocation();
  const props = state as {
    tokenBalance: TokenBalance;
    selectedAmount: number;
  };
  const navigator = useNavigate();
  const wallet = useWallet();
  const [disabled, setDisabled] = useState(true);
  const [feeRate, setFeeRate] = useState<number>(0);
  const [inputAmount, setInputAmount] = useState('');
  const [toPayInfo, setToPayInfo] = useState<{
    address: string;
    domain: string;
  }>({
    address: '',
    domain: ''
  });
  const tokenBalance = props.tokenBalance;
  const [error, setError] = useState('');
  const totalAmount = Number(numberAdd(tokenBalance.available, tokenBalance.transferable));
  const SendBRC20Callback = useCreateSendBrc20TxCallback();
  useEffect(() => {
    setError('');
    setDisabled(true);
    if (!isValidAddress(toPayInfo.address)) {
      return;
    }
    if (!inputAmount) {
      return;
    }
    if (Number(inputAmount) > totalAmount) {
      setError(`Insufficient Balance`);
      return;
    }
    if (Number(inputAmount) < 0) {
      return;
    }
    if (feeRate <= 0) {
      return;
    }

    setDisabled(false);
  }, [toPayInfo.address, inputAmount, feeRate]);
  const sendBRC20TxCallback = async () => {
    setDisabled(true);
    try {
      const tx = await SendBRC20Callback(toPayInfo, Number(inputAmount), tokenBalance.tick, feeRate);
      if (tx.code) {
        throw new Error(tx.message);
      }
      navigator('SignHexPage', {
        title: `Send ${tokenBalance.tick}`,
        rawTxInfo: tx,
        type: TxType.SEND_BRC20
      });
    } catch (e: any) {
      //
      setError(e.message);
    }
    setDisabled(false);
  };
  return (
    <div className="container">
      <Header
        onBack={() => {
          history.go(-1);
        }}
        title={`Send ${tokenBalance.tick}`}
        Right={
          <div
            className="text iblue pointer"
            onClick={() => {
              navigator('BRC20TransferPage', {
                tokenBalance
              });
            }}>
            Transfer
          </div>
        }
      />
      <div className="view">
        <div className="flex-col mt-lg">
          <div className="flex-row justify-between full-x">
            <div className="text textDim">Amount</div>
            <div className="flex-row">
              <div className="text font-sm textDim">Balance:</div>
              <div className="text font-bold font-sm">{`${totalAmount} ${tokenBalance.tick}`}</div>
            </div>
          </div>
          <div className="flex-row-center full">
            <Input
              preset="amount"
              placeholder={'Amount'}
              // defaultValue={inputAmount}
              value={inputAmount}
              onChange={async (e) => {
                setInputAmount(e.target.value);
              }}
              containerStyle={{ width: '100%' }}
              suffix={
                <div
                  className="text iblue-dark pointer"
                  onClick={() => {
                    setInputAmount(totalAmount.toString());
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
          <div className="text textDim">Fee</div>
          <FeeRateBar
            onChange={(val) => {
              setFeeRate(Number(val));
            }}
          />
          <div className="flex-col mt-lg">
            <div className="text black-muted ">Attention</div>
            <div className="text black-muted font-xs">
              *The system will automatically combine UTXOs based on the amount you enter and send out the inscriptions.
              <QuestionCircleOutlined
                className="black-muted pointer font-md"
                onClick={() => {
                  navigator('InvalidIntroducePage');
                }}
              />
            </div>
          </div>
          {error && <div className="text error mt-lg mb-xxl">{error}</div>}
        </div>
      </div>
      <Footer className="fixed">
        <Button
          disabled={disabled}
          className="primary-btn full-x"
          type="primary"
          onClick={(e) => {
            sendBRC20TxCallback();
          }}>
          Next
        </Button>
      </Footer>
    </div>
  );
}
