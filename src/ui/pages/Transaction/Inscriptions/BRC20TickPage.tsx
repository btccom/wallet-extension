import { Button, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { TokenBalance } from '@/common/types';
import { numberAdd, numberMinus } from '@/common/utils';
import { Header } from '@/ui/components';
import { useNavigate } from '@/ui/router';
import { useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useCurrentAccount } from '@/ui/store/ui/hooks';

export default function BRC20TickPage() {
  const { state } = useLocation();
  const { ticker }: { ticker: string } = state;
  const [canMint, setCanMint] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance>({
    tick: '',
    available: '0',
    transferable: '0',
    transferableUtxo: []
  });
  const helper = useHelper();

  const wallet = useWallet();

  const account = useCurrentAccount();
  useEffect(() => {
    helper.loading(true);
    const init = async () => {
      const tickInfo = await wallet.getTickInfo(ticker);
      if (tickInfo.max) {
        const canMint = numberMinus(tickInfo.max || 0, tickInfo.totalMint || 0) > 0;
        setCanMint(canMint);
      }
      await wallet
        .getAddressTokenBalances(account.address, ticker)
        .then((tokenBalance) => {
          setTokenBalance(tokenBalance);
        })
        .catch((err) => {
          helper.loading(false);
        });
      helper.loading(false);
    };
    init();
  }, []);

  const balance = useMemo(() => {
    if (!tokenBalance) {
      return '--';
    }
    return numberAdd(tokenBalance.available, tokenBalance.transferable);
  }, [tokenBalance]);

  const navigate = useNavigate();
  return (
    <div className="container">
      <Header
        title={ticker}
        onBack={() => {
          window.history.go(-1);
        }}
      />
      {tokenBalance && (
        <div className="view">
          <div className="flex-row py-xl pt-xxl pb-xxl justify-center">
            <div className="text font-bold font-xxl align-center">{`${balance}`}</div>
            <div className="text font-bold font-xxl align-center black-muted">{`${ticker}`}</div>
          </div>
          <div className="flex-col gap-lg">
            <div className="flex-row justify-between">
              <div className="flex-row gap-sm">
                <div className="text font-bold textDim  black-muted ">Transferable</div>
                <Tooltip
                  title="The transferable amount is the balance that has been inscribed into transfer inscriptions but has not yet been sent."
                  overlayStyle={{
                    fontSize: '12px'
                  }}>
                  <InfoCircleOutlined
                    className="textDim black-muted"
                    style={{
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  />
                </Tooltip>
              </div>
              <div className="flex-col">
                <div className="flex-row">
                  <div className="text  ">{`${tokenBalance.transferable}`}</div>
                  <div className="text  black-muted">{`${ticker}`}</div>
                </div>
              </div>
            </div>
            <div className="flex-row justify-between">
              <div className="flex-col">
                <div className="text font-bold textDim  black-muted">Available</div>
              </div>
              <div className="flex-col">
                <div className="flex-row">
                  <div className="text  ">{`${tokenBalance.available}`}</div>
                  <div className="text  black-muted">{`${ticker}`}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-row justify-between mt-lg">
            <Button
              className="primary-btn full"
              type="primary"
              style={!canMint ? { backgroundColor: 'grey' } : {}}
              disabled={!canMint}
              onClick={(e) => {
                if (canMint) {
                  window.open(`https://ordinals.btc.com/en/inscribe/brc20?ticker=${encodeURIComponent(ticker)}`);
                }
              }}>
              Mint
            </Button>

            <Button
              className="primary-btn full"
              type="primary"
              onClick={(e) => {
                navigate('ReceiveScreen');
              }}>
              Receive
            </Button>

            <Button
              className="primary-btn full"
              type="primary"
              onClick={(e) => {
                navigate('BRC20SendPage', {
                  tokenBalance: tokenBalance,
                  selectedInscriptionIds: [],
                  selectedAmount: 0
                });
              }}>
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
