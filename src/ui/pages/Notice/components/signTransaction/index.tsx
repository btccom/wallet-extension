import { Button } from 'antd';
import { Psbt, Transaction } from 'bitcoinjs-lib';
import { bitcoin, regtest, testnet } from 'bitcoinjs-lib/src/networks';
import { useEffect, useState } from 'react';

import { satoshisToAmount } from '@/common/utils';
import { Footer, Header } from '@/ui/components';
import { useAccountBalance } from '@/ui/store/ui/hooks';
import { shortAddress, useNotice, useWallet } from '@/ui/utils';
import { CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export interface DepositProps {
  params: {
    session: {
      origin: string;
      icon: string;
      name: string;
    };
    data: {
      psbt: string;
    };
  };
}
export default function SignTransaction({ params: { session, data } }: DepositProps) {
  let { psbt } = data;
  try {
    psbt = Buffer.from(psbt, 'base64').toString('hex');
  } catch (err) {
    console.log(err);
  }
  const [getNotice, resolveNotice, rejectNotice] = useNotice();
  const [type, setType] = useState('data');
  const [transactionInfo, setTransactionInfo] = useState<any>({});
  const wallet = useWallet();
  const [error, setError] = useState('');
  
  useEffect(() => {
    //
    async function init() {
      try {
        const currentAccount = await wallet.getCurrentAccount();
        const showData: any = await wallet.getTransactionByPsbt(psbt);
        const aFilter = showData?.inputs?.filter((item: any) => item.address === currentAccount?.address);
        if (aFilter.length === 0) {
          setError('The wallet can’t sign the transactions of the input address.');
        }
        setTransactionInfo(showData);
      } catch (e: any) {
        setError(e.message);
      }
    }
    init();
  }, []);
  const handleCancel = async () => {
    rejectNotice('User rejected the request.');
  };
  const handleConfirm = async () => {
    resolveNotice({ psbt });
  };
  return (
    <div className="container">
      <Header title={`Sign Transaction`} />
      <div className="view">
        {error && (
          <div className="card mt-lg justify-center bgerror">
            <CloseCircleOutlined className="error font-sm" />
            <div className="text error">{error}</div>
          </div>
        )}
        <div className="flex-col">
          <div className="flex-col  gap-lg minHeight">
            <div className="card rounded flex-col gap-lg full">
              <div className="text align-center font-sm">Spend Amount</div>
              <div className="flex-col-center">
                <div className="text text-color align-center font-xxsl  align-center font-bold">{`${satoshisToAmount(
                  transactionInfo.totalInputValue || '-'
                )} BTC`}</div>
              </div>
              <div className="flex-row-between gap-xxl full-x">
                <div className="text textDim font-xs">Output Value</div>
                <div className="flex-row-end font-sm">{`${satoshisToAmount(
                  transactionInfo.totalOutputValue || '-'
                )} BTC`}</div>
              </div>
              <div className="flex-row-between full-x">
                <div className="text textDim align-center font-xs">Network Fee</div>
                <div className="flex-row-end font-sm">{`${satoshisToAmount(
                  transactionInfo.networkFee || '-'
                )} BTC`}</div>
              </div>
              <div className="flex-col full mt-lg">
                <div className="flex-row gap-lg">
                  <div
                    className={`text black-color pointer ${
                      type === 'data' ? 'font-md iblue' : 'textDim font-sm'
                    }`}
                    onClick={() => {
                      setType('data');
                    }}>
                    DATA
                  </div>
                  <div
                    className={`text pointer ${type === 'hex' ? 'font-md iblue' : 'textDim font-sm'}`}
                    onClick={() => {
                      setType('hex');
                    }}>
                    HEX
                  </div>
                </div>
              </div>
              {type === 'data' && (
                <div className="flex-col full-y full-x gap-xl mt-lg">
                  <div className="text wrap">
                    <div className="text textDim">INPUTS:</div>
                    {transactionInfo.inputs?.map((item, index) => (
                      <div className="flex-row-between gap-xxl full-x" key={index}>
                        <div className="flex-row">
                          <span className="text font-sm">{shortAddress(item.address, 5)}</span>
                          {item.toSign && <span className="text border-link iblue rounded px-xxs">to sign</span>}
                        </div>
                        <div className="flex-row-end font-sm">{`${satoshisToAmount(item.value)} BTC`}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text wrap flex-col gap-md">
                    <div className="text textDim">OUTPUTS:</div>
                    {transactionInfo.outputs?.map((item, index) => (
                      <div key={index} className="flex-row-between gap-xxl full-x">
                        <div className="text font-sm">{shortAddress(item.address, 5)}</div>
                        <div className="flex-row-end font-sm">{`${satoshisToAmount(item.value)} BTC`}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {type === 'hex' && (
                <div className="flex-col full-y full-x">
                  <div className="text wrap" style={{ userSelect: 'text', maxHeight: '384px' }}>
                    {transactionInfo.hex}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer preset="fixed">
          <div className="flex-row full">
            <Button type="primary" className="primary-btn full" ghost onClick={handleCancel}>
              Reject
            </Button>
            <Button type="primary" className="primary-btn full" disabled={!!error} onClick={handleConfirm}>
              Sign & Send
            </Button>
          </div>
        </Footer>
      </div>
    </div>
  );
}
