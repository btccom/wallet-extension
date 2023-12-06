import { Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { RawTxInfo } from '@/common/types';
import { numberAdd, satoshisToAmount } from '@/common/utils';
import { Footer, Header, Icon, LoadingIcon } from '@/ui/components';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useNavigate } from '@/ui/router';
import { useCreateSendBrc20TxCallback } from '@/ui/store/transactions/hooks';
import { useAccountBalance, useCurrentAccount, useCurrentKeyring } from '@/ui/store/ui/hooks';
import { useNotice, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';
import { CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { DepositProps } from '.';

function SignBrc20TxDetails({
  rawTxInfo,
  error,
  onChangeFeeRate
}: {
  rawTxInfo: RawTxInfo;
  error?: string;
  onChangeFeeRate: (rate: number) => void;
}) {
  const [visibleFeeRateBar, setVisibleFeeRateBar] = useState(false);
  const currentAccount = useCurrentAccount();
  const currentKeyring = useCurrentKeyring();
  const helper = useHelper();
  const sendingInscriptions = useMemo(() => {
    return rawTxInfo.selectBrc20 || rawTxInfo.brc20Utxos || [];
  }, [rawTxInfo.selectBrc20]);
  const brc20Info = useMemo(() => {
    let tick = '';
    let amount = 0;
    sendingInscriptions.forEach((v) => {
      amount = numberAdd(amount, v.amount);
      tick = v.tick || '';
    });

    return {
      tick,
      amount
    };
  }, [sendingInscriptions]);
  return (
    <div className="card padding-lg rounded" style={{ minHeight: 'auto' }}>
      <div className="flex-col full-x">
        <div className="flex-row mt-sm gap-xl justify-between">
          <div className="text textDim">Deposit Amount</div>
          <div className="flex-row-center">
            <span
              className={`text ${error ? 'error' : 'iblue'} align-center align-center`}>{`-${brc20Info.amount}`}</span>
            <span className={`text ${error ? 'error' : 'iblue'}`}>{brc20Info.tick}</span>
          </div>
        </div>
        {!error && (
          <>
            <div className="flex-row mt-sm gap-xl justify-between">
              <div className="text textDim">Spend Amount</div>
              <div className="flex-row-center">
                <div className={`text wrap ${error ? 'error' : 'iblue'}`}>
                  {`${error ? '--' : `-${satoshisToAmount(rawTxInfo.deduction || 0)}`} BTC`}{' '}
                </div>
              </div>
            </div>
            <div className="flex-row mt-sm gap-xl justify-between">
              <div className="text textDim">Inscription Output Value</div>
              <div className="flex-row-center">
                <div className={`text wrap `}>
                  {`${error ? '--' : satoshisToAmount(rawTxInfo.receiveAmount || 0)} BTC`}{' '}
                </div>
              </div>
            </div>
            <div className="flex-row mt-sm gap-xl justify-between">
              <div className="text textDim">Service Fee</div>
              <div className="flex-row-center">
                <div className={`text wrap`}>
                  {`${error ? '--' : satoshisToAmount(rawTxInfo.serviceFee || 0)} BTC`}{' '}
                </div>
              </div>
            </div>
          </>
        )}
        <div className="flex-row mt-sm gap-xl justify-between">
          <div className="text textDim">Network Fee</div>
          <div className="flex-row-center">
            <div className={`text wrap`}>{`${error ? '--' : satoshisToAmount(rawTxInfo.fee || 0)} BTC`} </div>
            <Icon icon="down" onClick={() => setVisibleFeeRateBar(!visibleFeeRateBar)} />
          </div>
        </div>
        {visibleFeeRateBar && (
          <div className="bgfeerate padding-sm">
            <FeeRateBar onChange={onChangeFeeRate} />
          </div>
        )}
        <div className="flex-row mt-sm gap-xl justify-between">
          <div className="text textDim">Recipient</div>
          <div className="flex-row-center gap-md">
            <CopyableAddress address={rawTxInfo.toAddressInfo?.address || ''} />
          </div>
        </div>
        <div className="flex-row mt-sm gap-xl justify-between">
          <div className="text textDim">Wallet</div>
          <div className="flex-col-end">
            <div className="flex-row gap-md">
              <div className="flex-col-end">
                <div className="text text-color wrap align-right">
                  {`${currentKeyring.alianName}-${currentAccount.alianName}`}{' '}
                </div>
                <CopyableAddress address={currentAccount.address} />
              </div>
            </div>
          </div>
        </div>
        {!error && sendingInscriptions.length > 0 && (
          <>
            <div className="flex-row-between items-center">
              <div className="text textDim align-center">
                {sendingInscriptions.length === 1
                  ? 'Spend Inscription'
                  : `Spend Inscription (${sendingInscriptions.length})`}
              </div>
            </div>
            <div className="flex-col justify-center">
              <div className="flex-row justify-start overflow-x gap-lg pb-lg full" style={{ width: 335 }}>
                {sendingInscriptions.map((v) => {
                  return (
                    <BRC20Preview
                      item={v}
                      key={(v.tick || '') + v.number + Math.random()}
                      tick={v.tick}
                      balance={v.amount}
                      satsIn={v.satsIn}
                      inscriptionNumber={v.number}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default function Deposit({ params: { session, data } }: DepositProps) {
  const [rawTxInfo, setRawTxInfo] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const wallet = useWallet();
  const balance = useAccountBalance();
  const [getNotice, resolveNotice, rejectNotice] = useNotice();
  const [feeRate, setFeeRate] = useState(0);
  const [disabled, setDisabled] = useState(true);
  const navigator = useNavigate();
  const handleCancel = (msg = '') => {
    rejectNotice(msg || 'User rejected the request.');
  };
  const handleConfirm = async () => {
    resolveNotice(rawTxInfo);
  };
  const CreateSendBrc20Tx = useCreateSendBrc20TxCallback();

  async function initSendBrc20(feeRate = 0) {
    //
    setDisabled(true);
    const toAddressInfo = { address: data.toAddress, domain: session.origin };
    try {
      const isRbf = 'isRbf' in data ? !!data.isRbf : true;
      const result = await CreateSendBrc20Tx(toAddressInfo, data.amount, data.tick || '', feeRate, isRbf);
      if (result.code && result.code !== '0') {
        setErrorCode(String(result.code));
        throw new Error(result.message);
      }
      setRawTxInfo(result);
      setDisabled(false);
      setError('');
    } catch (e: any) {
      //
      setError(e.message);
      setRawTxInfo({
        txHex: '',
        toAddressInfo,
        fee: feeRate,
        receiveAmount: data.amount,
        brc20Utxos: [
          {
            amount: data.amount,
            tick: data.tick
          }
        ]
      });
    }
    setIsReady(true);
  }
  useEffect(() => {
    async function init(feeRate) {
      if (!feeRate) {
        const FeeRates = await wallet.getFeeRates();
        feeRate = FeeRates[1].feerate;
      }
      initSendBrc20(feeRate);
    }
    init(feeRate);
  }, [data, session, feeRate, balance]);
  if (!isReady) {
    return (
      <div className="container">
        <div className="view justify-center items-center">
          <Icon>
            <LoadingIcon />
          </Icon>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <Header title={`Deposit ${data.tick || data.type.toUpperCase()}`} />
      <div className="view">
        {error && (
          <div className="card mt-lg justify-center bgerror">
            <CloseCircleOutlined className="error font-sm" />
            <div className="text error">
              {error}
              {errorCode === '-20011' && (
                <QuestionCircleOutlined
                  style={{ verticalAlign: 'middle', paddingLeft: '4px', lineHeight: 0 }}
                  className="error pointer font-md"
                  onClick={() => {
                    navigator('InvalidIntroducePage');
                  }}
                />
              )}
            </div>
          </div>
        )}
        <SignBrc20TxDetails
          rawTxInfo={rawTxInfo}
          error={error}
          onChangeFeeRate={(v) => {
            if (v) setFeeRate(v);
          }}
        />
        <Footer preset="fixed">
          <div className="flex-row full">
            <Button
              className="btn full"
              type="default"
              onClick={() => {
                handleCancel();
              }}>
              Cancel
            </Button>
            <Button className="primary-btn full" disabled={disabled} type="primary" onClick={handleConfirm}>
              Sign
            </Button>
          </div>
        </Footer>
      </div>
    </div>
  );
}
