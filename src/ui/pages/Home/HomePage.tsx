import { Button } from 'antd';
import Tooltip from 'antd/lib/tooltip';
import { useEffect, useMemo, useState } from 'react';

import { KEYCHAIN_TYPE } from '@/common/constant';
import { NetworkType, Brc20Ticks } from '@/common/types';
import { getActiveTab } from '@/scripts/background/utils/chrome';
import { Footer, Header, Icon, LoadingIcon } from '@/ui/components';
import BRC20BalanceBar from '@/ui/components/BRC20BalanceBar';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import { Empty } from '@/ui/components/Empty';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { useNavigate } from '@/ui/router';
import { useExchangeRate } from '@/ui/store/common/hook';
import { useAppDispatch } from '@/ui/store/hooks';
import { useAccountBalance, useCurrentAccount, useCurrentKeyring, useNetworkType } from '@/ui/store/ui/hooks';
import { uiActions } from '@/ui/store/ui/reducer';
import { balanceToUsd, getCurrentVersion, getExplorerUrl, shortAddress, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';
import { ExportOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import UpgradeVersion from '@/ui/components/UpgradeVersion';

export default function HomePage() {
  const [versionInfo, setVersionInfo] = useState<any>({});
  const navigate = useNavigate();
  const helper = useHelper();
  const { currentVesion } = getCurrentVersion();

  const accountBalance = useAccountBalance();
  const networkType = useNetworkType();
  const isTestNetwork = networkType !== NetworkType.MAINNET;
  const currentKeyring = useCurrentKeyring();
  const currentAccount = useCurrentAccount();
  const exchangeRate = useExchangeRate();
  const balanceValue = useMemo(() => {
    if (accountBalance.amount === '0') {
      return '--';
    } else {
      return accountBalance.amount;
    }
  }, [accountBalance.amount]);

  const brc20TicksList = useMemo(() => {
    if (accountBalance.amount === '0') {
      return null;
    } else {
      return accountBalance.brc20;
    }
  }, [accountBalance.amount, accountBalance.brc20]);
  const wallet = useWallet();
  const [hideMoney, setHideMoney] = useState(false);

  const dispatch = useAppDispatch();
  const tabKey = 0;

  useEffect(() => {
    const run = async () => {
      try {
        const versionInfo = await wallet.getVersionInfo();
        setVersionInfo(versionInfo);
        dispatch(uiActions.expireBalance());
        const hideMoney = await wallet.getHiddenMoney();
        setHideMoney(!!hideMoney);
        const activeTab: any = await getActiveTab();
        if (!activeTab) return;
      } catch (err) {
        //
        console.log(err);
      }
    };
    run();
  }, []);
  const tabItems = [
    {
      key: 0,
      label: 'BRC-20',
      children: <BRC20List brc20TicksList={brc20TicksList} hideMoney={hideMoney} />
    }
  ];

  const hiddenMoneyHandler = async (flag: boolean) => {
    setHideMoney(flag);
    await wallet.setHiddenMoney(flag);
  };

  const showMoney = (text: string | number | undefined) => {
    if (hideMoney) return '********';
    return text || '--';
  };
  const IsHdKeyringAccount = useMemo(() => {
    return KEYCHAIN_TYPE.HdKeyring === currentKeyring.type;
  }, [currentKeyring.type]);
  return (
    <div className="container">
      <UpgradeVersion versionInfo={versionInfo} />
      <Header
        Left={
          <div
            className="card1 pointer wrap"
            onClick={() => {
              navigate('SwitchWalletPage');
            }}>
            <span className="font-xxs">{currentKeyring.alianName}</span>
          </div>
        }
        title={
          <div
            className={`flex-row-center ${IsHdKeyringAccount ? 'pointer' : ''}`}
            onClick={() => {
              if (IsHdKeyringAccount) {
                navigate('SwitchAccountPage');
              }
            }}>
            <Icon icon="user" />
            <div className="text font-sm">{shortAddress(currentAccount?.alianName, 7)}</div>
            {IsHdKeyringAccount && <Icon icon="down" />}
          </div>
        }
        Right={<Icon className="pointer" icon="settings" size={14} onClick={() => navigate('SettingsPage')} />}
      />
      <div className="view">
        <div className="flex-col gap-xl">
          <div className="card rounded">
            <div className="flex-col full-x mt-xl mb-xl">
              <div className="flex-row-center">
                <CopyableAddress address={currentAccount?.address} />
              </div>
              {isTestNetwork && (
                <div className="text align-center danger full-x">Bitcoin Testnet is used for testing.</div>
              )}
              <Tooltip
                title={
                  <span>
                    <div className="flex-row-between">
                      <span>{'BTC Balance'}</span>
                      <span className={`${hideMoney ? 'star' : ''}`}>
                        {showMoney(`${accountBalance.btc_amount} BTC`)}
                      </span>
                    </div>
                    <div className="flex-row-between">
                      <span>{'Inscription Balance'}</span>
                      <span className={`${hideMoney ? 'star' : ''}`}>
                        {showMoney(`${accountBalance.inscription_amount} BTC`)}
                      </span>
                    </div>
                    <div className="flex-row-between">
                      <span>{'Sats Balance'}</span>
                      <span className={`${hideMoney ? 'star' : ''}`}>
                        {showMoney(`${accountBalance.satsInSpsats} BTC`)}
                      </span>
                    </div>
                  </span>
                }
                overlayStyle={{
                  fontSize: '12px'
                }}>
                <div className="flex-col mt-lg">
                  <div className="flex-row-center" style={{ alignItems: !hideMoney ? 'center' : '' }}>
                    <span className={`text font-bold font-xxl ${hideMoney ? 'star' : ''}`}>
                      {showMoney(`${balanceValue} BTC`)}
                    </span>
                    <span
                      className="flex-row-center"
                      style={{
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        hiddenMoneyHandler(!hideMoney);
                      }}>
                      {hideMoney ? (
                        <EyeInvisibleOutlined className="font-lg flex-row-center" />
                      ) : (
                        <EyeOutlined className="font-lg flex-row-center" />
                      )}
                    </span>
                  </div>

                  <div className="flex-row-center">
                    {balanceValue !== '--' && (
                      <span className="flex-row-center black-muted font-sm">
                        ≈
                        <span className={`${hideMoney ? 'star' : ''}`}>
                          {showMoney(`$ ${balanceToUsd(balanceValue, exchangeRate)}`)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </Tooltip>
              <div className="flex-row-center gap-lg full-x mt-lg">
                <Button
                  className="primary-btn full"
                  type="primary"
                  ghost
                  style={{ maxWidth: '110px' }}
                  onClick={(e) => {
                    navigate('ReceiveScreen');
                  }}>
                  Receive
                </Button>

                <Button
                  className="primary-btn full"
                  type="primary"
                  style={{ maxWidth: '110px' }}
                  onClick={(e) => {
                    navigate('TxCreatePage');
                  }}>
                  Send
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-row-between">
            <span className="font-bold iblue-dark font-sm">{tabItems[tabKey].label}</span>
            <div
              className="flex-row items-center pointer"
              onClick={() => {
                window.open(`${getExplorerUrl()}/address/${currentAccount.address}`);
              }}>
              <span className="font-xs">View History</span>
              <ExportOutlined className="font-xs" />
            </div>
          </div>

          {tabItems[tabKey]?.children}
        </div>
      </div>
      <Footer className="padding-zero" preset="fixed">
        <NavTabBar tab="home" />
      </Footer>
    </div>
  );
}

function BRC20List({ brc20TicksList, hideMoney }: { brc20TicksList: Brc20Ticks[] | null; hideMoney: boolean }) {
  const navigate = useNavigate();

  const [brc20Ticks, setBrc20Ticks] = useState<Brc20Ticks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brc20TicksList === null) {
      setLoading(true);
    } else {
      setBrc20Ticks(brc20TicksList || []);
      setLoading(false);
    }
  }, [brc20TicksList]);
  if (loading) {
    return (
      <div style={{ minHeight: 150 }} className="flex-col-center">
        <LoadingIcon />
      </div>
    );
  }

  if (brc20Ticks.length === 0) {
    return (
      <div className="flex-col-center" style={{ minHeight: 150 }}>
        <div>
          <Empty value={'Empty'} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-row gap-lg" style={{ flexWrap: 'wrap' }}>
        {brc20Ticks.map((data, index) => (
          <BRC20BalanceBar
            key={index}
            tickBanlance={data}
            hideMoney={hideMoney}
            onClick={() => {
              navigate('BRC20TickPage', { tokenBalance: data, ticker: data.tick });
            }}
            onSendClick={(event) => {
              event.stopPropagation();
              navigate('BRC20SendPage', {
                tokenBalance: data,
                selectedInscriptionIds: [],
                selectedAmount: 0
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}
