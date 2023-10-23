import { Button } from 'antd';
import { useEffect, useState } from 'react';

import { RawTxInfo } from '@/common/types';
import { satoshisToAmount } from '@/common/utils';
import { Footer, Header, Icon, LoadingIcon } from '@/ui/components';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useCreateBitcoinTxCallback } from '@/ui/store/transactions/hooks';
import { useAccountBalance, useCurrentAccount, useCurrentKeyring } from '@/ui/store/ui/hooks';
import { useNotice, useWallet } from '@/ui/utils';
import { CloseCircleOutlined } from '@ant-design/icons';

import { DepositProps } from '.';

function SignTxDetails({
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
  return (
    <div className="card items-start" style={{ minHeight: 340 }}>
      <div className="flex-col full-x">
        <div className="flex-row mt-lg gap-xl justify-between">
          <div className="text textDim">Deposit Amount</div>
          <div className="flex-row-center">
            <div className={`text wrap ${error ? 'error' : 'iblue'}`}>
              {`-${satoshisToAmount(rawTxInfo.receiveAmount || 0)} BTC`}{' '}
            </div>
          </div>
        </div>
        <div className="flex-row mt-lg gap-xl justify-between">
          <div className="text textDim">Network Fee</div>
          <div className="flex-row-center">
            <div className={`text wrap`}>{`-${error ? '-' : satoshisToAmount(rawTxInfo.fee || 0)} BTC`} </div>
            <Icon icon="down" onClick={() => setVisibleFeeRateBar(!visibleFeeRateBar)} />
          </div>
        </div>
        {visibleFeeRateBar && (
          <div className="bgfeerate padding-sm">
            <FeeRateBar onChange={onChangeFeeRate} />
          </div>
        )}
        <div className="flex-row mt-lg gap-xl justify-between">
          <div className="text textDim">Recipient</div>
          <div className="flex-row-center gap-md">
            <CopyableAddress address={rawTxInfo.toAddressInfo?.address || ''} />
          </div>
        </div>
        <div className="flex-row mt-lg gap-xl justify-between">
          <div className="text textDim">Wallet</div>
          <div className="flex-col-end">
            <div className="flex-row-center gap-md">
              <div className="flex-col-end">
                <div className="text text-color wrap align-right">
                  {`${currentKeyring.alianName}-${currentAccount.alianName}`}{' '}
                </div>
                <CopyableAddress address={currentAccount.address} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Deposit({ params: { session, data } }: DepositProps) {
  const [rawTxInfo, setRawTxInfo] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const wallet = useWallet();
  const balance = useAccountBalance();
  const [getNotice, resolveNotice, rejectNotice] = useNotice();
  const [feeRate, setFeeRate] = useState(0);
  const [disabled, setDisabled] = useState(true);
  const type = data.type || 'btc';
  const handleCancel = (msg = '') => {
    rejectNotice(msg || 'User rejected the request.');
  };
  const handleConfirm = async () => {
    resolveNotice(rawTxInfo);
  };
  const CreateBitCoinTx = useCreateBitcoinTxCallback();

  async function initSendBtc(feeRate = 0) {
    const toAddressInfo = { address: data.toAddress, domain: session.origin };
    setDisabled(true);
    try {
      const result = await CreateBitCoinTx(toAddressInfo, Number(data.amount), feeRate);
      setRawTxInfo(result);
      setDisabled(false);
      setError('');
    } catch (e: any) {
      //
      setError(e.message);
      setRawTxInfo({ txHex: '', toAddressInfo, fee: feeRate, receiveAmount: data.amount });
    }
    setIsReady(true);
  }
  useEffect(() => {
    async function init(feeRate) {
      if (!feeRate) {
        const FeeRates = await wallet.getFeeRates();
        feeRate = FeeRates[1].feerate;
      }
      initSendBtc(feeRate);
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
            <div className="text error">{error}</div>
          </div>
        )}
        <SignTxDetails
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
