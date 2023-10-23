import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { InscribeTransferPushTxResult, InscriptionTransaction, RawTxInfo, TokenBalance, TxType } from '@/common/types';
import { satoshisToAmount } from '@/common/utils';
import { Footer, Header, Input } from '@/ui/components';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { Empty } from '@/ui/components/Empty';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import TxPasswordConfirmPage from '@/ui/pages/Transaction/TxPasswordConfirmPage';
import { useNavigate } from '@/ui/router';
import { useExchangeRate } from '@/ui/store/common/hook';
import { usePushInscribeTransferTxCallback } from '@/ui/store/transactions/hooks';
import { useCurrentAccount } from '@/ui/store/ui/hooks';
import { balanceToUsd, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

interface Props {
  params: {
    data: {
      ticker: string;
      amount: string;
    };
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}

enum Step {
  STEP1,
  STEP2,
  STEP3,
  STEP4
}

interface ContextData {
  step: Step;
  ticker: string;
  session?: any;
  tokenBalance?: TokenBalance;
  order?: InscriptionTransaction;
  rawTxInfo?: RawTxInfo;
  amount?: number;
  rawTx?: string;
  pushTxResult: InscribeTransferPushTxResult;
}

interface UpdateContextDataParams {
  step?: Step;
  ticket?: string;
  session?: any;
  tokenBalance?: TokenBalance;
  order?: InscriptionTransaction;
  rawTxInfo?: RawTxInfo;
  amount?: number;
  rawTx?: string;
  pushTxResult?: InscribeTransferPushTxResult;
}

const defaultPushTxResult: InscribeTransferPushTxResult = {
  txid: '',
  reveal: '',
  sats_in_inscriptions: '',
  tick: '',
  brc20_amount: ''
};

export default function InscribeTransfer({ params: { data, session } }: Props) {
  const [contextData, setContextData] = useState<ContextData>({
    step: Step.STEP1,
    ticker: data.ticker,
    amount: parseInt(data.amount),
    session,
    rawTx: '',
    pushTxResult: defaultPushTxResult
  });
  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  if (contextData.step === Step.STEP1) {
    return <InscribeTransferStep contextData={contextData} updateContextData={updateContextData} />;
  } else if (contextData.step === Step.STEP2) {
    return <InscribeConfirmStep contextData={contextData} updateContextData={updateContextData} />;
  } else if (contextData.step === Step.STEP3) {
    return <InscribeSignStep contextData={contextData} updateContextData={updateContextData} />;
  } else {
    return <InscribeResultStep contextData={contextData} updateContextData={updateContextData} />;
  }
}
export function InscribeTransferScreen() {
  const { state } = useLocation();
  const { ticker }: { ticker: string } = state;

  const [contextData, setContextData] = useState<ContextData>({
    step: Step.STEP1,
    ticker: ticker,
    pushTxResult: defaultPushTxResult
  });
  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  if (contextData.step === Step.STEP1) {
    return <InscribeTransferStep contextData={contextData} updateContextData={updateContextData} />;
  } else if (contextData.step === Step.STEP2) {
    return <InscribeConfirmStep contextData={contextData} updateContextData={updateContextData} />;
  } else if (contextData.step === Step.STEP3) {
    return <InscribeSignStep contextData={contextData} updateContextData={updateContextData} />;
  } else {
    return <InscribeResultStep contextData={contextData} updateContextData={updateContextData} />;
  }
}

interface StepProps {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}

function InscribeTransferStep({ contextData, updateContextData }: StepProps) {
  const wallet = useWallet();
  const account = useCurrentAccount();
  const [feeRate, setFeeRate] = useState(5);
  const [inputAmount, setInputAmount] = useState('');

  const helper = useHelper();

  const [inputError, setInputError] = useState('');

  const [disabled, setDisabled] = useState(true);

  const [inputDisabled, setInputDisabled] = useState(false);
  useEffect(() => {
    if (contextData.amount) {
      setInputAmount(contextData.amount.toString());
      setInputDisabled(true);
    }
  }, []);

  useEffect(() => {
    setInputError('');
    setDisabled(true);

    const amount = parseInt(inputAmount);
    if (!amount) {
      return;
    }

    if (!contextData.tokenBalance) {
      return;
    }

    if (amount <= 0) {
      return;
    }

    if (amount > parseInt(contextData.tokenBalance.available)) {
      setInputError('Insufficient Balance');
      return;
    }

    if (feeRate <= 0) {
      return;
    }

    setDisabled(false);
  }, [inputAmount, feeRate, contextData.tokenBalance]);

  useEffect(() => {
    wallet
      .getAddressTokenBalances(account.address, contextData.ticker)
      .then((v) => {
        updateContextData({ tokenBalance: v });
      })
      .catch((e) => {
        helper.toast(e.message, 'error');
      });
  }, []);

  const onClickInscribe = async () => {
    try {
      setDisabled(true);
      helper.loading(true);
      const amount = parseInt(inputAmount);
      const order = await wallet.inscribeBRC20Transfer(account.address, contextData.ticker, amount.toString(), feeRate);
      updateContextData({
        order,
        amount,
        rawTxInfo: {
          txHex: order.rtx,
          fee: Number(order.fee),
          deduction: Number(order.cost),
          receiveAmount: amount,
          inputs: order.inputs
        },
        step: Step.STEP2
      });
    } catch (e) {
      helper.toast((e as Error).message, 'error');
    } finally {
      helper.loading(false);
    }
    setDisabled(false);
  };

  const { tokenBalance } = contextData;

  return (
    <div className="container">
      <Header
        title="Inscribe Transfer"
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <div className="view">
        <div className="flex-col full">
          <div className="flex-col full gap-lg">
            <div className="flex-col">
              <div className="flex-row justify-between">
                <div className="text textDim">Available</div>
                {tokenBalance ? (
                  <div className="flex-col">
                    <div
                      className="text align-center font-xs"
                      onClick={() => {
                        setInputAmount(tokenBalance.available);
                      }}>{`${tokenBalance.available} ${tokenBalance.tick}`}</div>
                  </div>
                ) : (
                  <div className="text">loading...</div>
                )}
              </div>

              <Input
                preset="amount"
                placeholder={'Amount'}
                value={inputAmount}
                autoFocus={true}
                onChange={async (e) => {
                  setInputAmount(e.target.value);
                }}
                suffix={
                  <div
                    className="text iblue-dark pointer"
                    onClick={() => {
                      //
                      if (tokenBalance) setInputAmount(tokenBalance.available);
                    }}>
                    Max
                  </div>
                }
                disabled={inputDisabled}
              />
              {inputError && <div className="text error">{inputError}</div>}
            </div>

            <div className="flex-col">
              <div className="text textDim">Fee</div>
              <FeeRateBar
                onChange={(val) => {
                  setFeeRate(val);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer>
        <div className="flex-row full">
          <Button type="primary" className="primary-btn full" onClick={onClickInscribe} disabled={disabled}>
            Next
          </Button>
        </div>
      </Footer>
    </div>
  );
}

function InscribeConfirmStep({ contextData, updateContextData }: StepProps) {
  const navigate = useNavigate();
  const exchangeRate = useExchangeRate();

  const { order, tokenBalance, amount, rawTxInfo, session } = contextData;

  if (!order || !tokenBalance || !rawTxInfo) {
    return <Empty />;
  }

  const fee = rawTxInfo.fee || 0;
  const inscription_fee = order.inscription_fee || 0;
  const service_fee = order.service_fee || 0;

  const networkFee = useMemo(() => satoshisToAmount(fee), [fee]);
  const outputValue = useMemo(() => satoshisToAmount(order.sats_in_inscription), [order.sats_in_inscription]);
  const minerFee = useMemo(() => satoshisToAmount(Number(inscription_fee)), [order.inscription_fee]);
  const serviceFee = useMemo(() => satoshisToAmount(service_fee), [order.service_fee]);
  const totalFee = useMemo(() => satoshisToAmount(order.deduction), [order.deduction]);

  return (
    <div className="container">
      <Header
        title="Inscribe Transfer"
        onBack={() => {
          navigate('BRC20TickPage', { tokenBalance: tokenBalance, ticker: tokenBalance.tick });
        }}
      />
      <div className="view">
        <div className="flex-col full">
          <div className="flex-col full">
            <div className="flex-col justify-center mt-xxl mb-md">
              <div className="text font-bold font-xxl active align-center">{`${amount} ${tokenBalance.tick}`}</div>
              <div className="flex-row mt-xl items-center gap-xl">
                <div className="text font-xs black-muted">Preview</div>
                <div className="card2 px-xs bg-white-muted">
                  <div className="text wrap font-xs px-xs">{`{"p":"brc-20","op":"transfer","tick":"${tokenBalance.tick}","amt":"${amount}"}`}</div>
                </div>
              </div>
            </div>

            <div className="flex-col gap-xl">
              <div className="flex-row justify-between">
                <div className="text font-xs black-muted">Inscription Output Value</div>
                <div className="text">{`${outputValue} BTC`}</div>
              </div>

              <div className="flex-row justify-between">
                <div className="text font-xs black-muted">Payment Network Fee</div>
                <div className="text">{`${networkFee} BTC`}</div>
              </div>
              <div className="flex-row justify-between">
                <div className="text font-xs black-muted">Inscription Network Fee</div>
                <div className="text">{`${minerFee} BTC`}</div>
              </div>

              <div className="flex-row justify-between">
                <div className="text font-xs black-muted">Inscription Service Fee</div>
                <div className="text">{`${serviceFee} BTC`}</div>
              </div>
              <div className="flex-row mb-sm bg-line" style={{ height: '1px' }}>
                &nbsp;
              </div>
              <div className="flex-row justify-between">
                <div className="text active">Total</div>
                <div className="flex-col">
                  <div className="text active">{`${totalFee} BTC`}</div>
                  {exchangeRate && (
                    <div className="text black-muted align-right">{`≈ $ ${balanceToUsd(totalFee, exchangeRate)}`}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer>
        <div className="flex-row full">
          <Button
            className="primary-btn full"
            type="primary"
            onClick={() => {
              updateContextData({
                step: Step.STEP3
              });
            }}>
            Pay & Inscribe
          </Button>
        </div>
      </Footer>
    </div>
  );
}

function InscribeSignStep({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const pushInscribeTransferTx = usePushInscribeTransferTxCallback();
  const helper = useHelper();
  const navigator = useNavigate();
  return (
    <TxPasswordConfirmPage
      rawTxInfo={contextData.rawTxInfo}
      type={TxType.INSCRIBE_TRANSFER}
      callback={async (rawTx: string) => {
        const pushTxResult = await pushInscribeTransferTx(contextData.order?.oid || '', rawTx);
        if (pushTxResult.error) {
          navigator('TxFailPage', { error: pushTxResult.error, type: TxType.INSCRIBE_TRANSFER });
          return;
        }
        updateContextData({
          rawTx: rawTx,
          pushTxResult: pushTxResult.result,
          step: Step.STEP4
        });
      }}
    />
  );
}

function InscribeResultStep({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  if (!contextData.order || !contextData.tokenBalance) {
    return <Empty />;
  }
  const { pushTxResult } = contextData;
  const navigate = useNavigate();
  return (
    <div className="container">
      <Header
        title="Inscribe Transfer"
        onBack={() => {
          updateContextData({
            step: Step.STEP1
          });
        }}
      />
      <div className="view" style={{ gap: 12 }}>
        <div className="flex-col justify-center mt-xxl gap-xl">
          <div className="flex-col-center">
            <BRC20Preview
              tick={pushTxResult.tick}
              balance={pushTxResult.brc20_amount}
              satsIn={pushTxResult.sats_in_inscriptions}
              inscriptionNumber={0}
            />
            <div className="flex-col justify-between px-sm pb-sm gap-sm">
              <div className="text align-center">You have inscribed a transfer</div>
              <div className="text align-center">Please wait for the update of BRC-20</div>
              <div className="text align-center">(about 3 minutes)</div>
            </div>
          </div>
        </div>
      </div>
      <Footer>
        <div className="flex-row full">
          <Button
            className="primary-btn full"
            type="primary"
            onClick={() => {
              history.go(-1);
            }}>
            Done
          </Button>
        </div>
      </Footer>
    </div>
  );
}
