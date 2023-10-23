import { Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ADDRESS_TYPES, GITHUB_URL, KEYCHAIN_TYPE, NETWORK_TYPES } from '@/common/constant';
import { getActiveTab, openExtensionInTab, useExtensionIsInTab } from '@/scripts/background/utils/chrome';
import { Header, Icon } from '@/ui/components';
import { useNavigate as useNavigateRoute } from '@/ui/router';
import { useCurrentAccount, useCurrentKeyring, useNetworkType } from '@/ui/store/ui/hooks';
import { getCurrentVersion, useWallet } from '@/ui/utils';
import { RightOutlined } from '@ant-design/icons';

interface Setting {
  title?: string;
  value?: string;
  desc?: string;
  danger?: boolean;
  action: string;
  route: string;
  right: boolean;
  last?: boolean;
}

const SettingList: Setting[] = [
  {
    title: 'Network',
    value: '',
    desc: '',
    action: 'networkType',
    // route: '/settings/network-type',
    route: '',
    right: false
  },
  {
    title: 'Address Type',
    value: '',
    desc: '',
    action: 'addressType',
    route: '/settings/address-type',
    right: true
  },
  {
    title: 'Connected Sites',
    value: '',
    desc: '',
    action: 'connected-sites',
    route: '/connected-sites',
    right: true
  },
  {
    title: 'Backup Wallet',
    value: '',
    desc: '',
    action: 'BackupWallet',
    route: '/settings/view-mnemonics',
    right: true
  }
];
const SettingListPartTwo: Setting[] = [
  {
    title: 'Lock',
    value: '',
    desc: '',
    action: 'lock',
    route: '/unlock',
    right: true
  },
  {
    title: 'Expand View',
    value: '',
    desc: '',
    action: 'expand-view',
    route: '/settings/export-privatekey',
    right: true
  }
];

export function CardItem({ item, onClick, className = '' }) {
  return item.title ? (
    <>
      <div key={item.action} className={`card  ${onClick ? 'pointer' : ''} ${className}`} onClick={onClick}>
        <div className="flex-row-between full">
          <div className="flex-col-center">
            <div className="text font-bold" style={{ minWidth: 120 }}>
              {item.title || item.desc}
            </div>
          </div>

          <div className="flex-row-center align-self-center">
            {item.value && <div className="text sub align-right full-x">{item.value}</div>}
            {item.right && <RightOutlined style={{ transform: 'scale(1.2)', color: '#AAA' }} />}
          </div>
        </div>
      </div>
      {!item.last && (
        <div className="border-bottom-common" style={{ height: '1px', width: '90%', margin: '0 auto' }}></div>
      )}
    </>
  ) : (
    <Button key={item.action} className="btn mt-lg full-x" style={{ height: 50 }} onClick={onClick}>
      {item.desc}
    </Button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const navigateRoute = useNavigateRoute();

  const networkType = useNetworkType();

  const isInTab = useExtensionIsInTab();

  const [connected, setConnected] = useState(false);

  const currentKeyring = useCurrentKeyring();
  const currentAccount = useCurrentAccount();
  const { currentVesion } = getCurrentVersion();

  const wallet = useWallet();

  useEffect(() => {
    const run = async () => {
      const res: any = await getActiveTab();
      if (!res) return;
      const site = await wallet.getCurrentAccessSite(res?.id);
      if (site) {
        setConnected(site.isConnected);
      }
    };
    run();
  }, []);

  const IsHdKeyringAccount = useMemo(() => {
    return KEYCHAIN_TYPE.HdKeyring === currentKeyring.type;
  }, [currentKeyring.type]);
  const toRenderSettings = SettingList.filter((v) => {
    if (v.action == 'BackupWallet') {
      if (!IsHdKeyringAccount) return false;
      v.value = currentKeyring.alianName;
    }
    if (v.action == 'connected-sites') {
      v.value = connected ? 'Connected' : 'Not connected';
    }

    if (v.action == 'networkType') {
      v.value = NETWORK_TYPES[networkType].label;
    }

    if (v.action == 'addressType') {
      const item = ADDRESS_TYPES[currentKeyring.addressType];
      v.value = `${item.name} (${item.hdPath}/${currentAccount.index})`;
    }

    return true;
  });
  const toRenderPartTwo = SettingListPartTwo.filter((v) => {
    if (v.action == 'expand-view') {
      if (isInTab) {
        return false;
      }
    }
    return true;
  });
  const $settingBgstyle = {};
  return (
    <div className="container" style={{ ...$settingBgstyle }}>
      <Header
        title="Settings"
        onBack={() => {
          history.go(-1);
        }}
      />
      <div className="view" style={{ ...$settingBgstyle }}>
        <div className="flex-col">
          <div>
            {toRenderSettings.map((item, index) => {
              if (toRenderSettings.length - 1 === index) {
                item.last = true;
              }
              return (
                <CardItem
                  key={item.action}
                  className="bg-white-color"
                  item={item}
                  onClick={
                    item.route
                      ? async (e) => {
                          if (item.action === 'BackupWallet') {
                            navigateRoute('ViewMnemonicPage', { keyring: currentKeyring });
                            return;
                          }
                          if (item.action === 'lock') {
                            await wallet.lockWallet();
                          }
                          if (item.action == 'expand-view') {
                            openExtensionInTab();
                            return;
                          }
                          navigate(item.route);
                        }
                      : null
                  }
                />
              );
            })}
            <div className="pt-xl"></div>
            {toRenderPartTwo.map((item, index) => {
              if (toRenderPartTwo.length - 1 === index) {
                item.last = true;
              }
              return (
                <CardItem
                  key={item.action}
                  className="bg-white-color"
                  item={item}
                  onClick={
                    item.route
                      ? async (e) => {
                          if (item.action === 'BackupWallet') {
                            navigateRoute('ViewMnemonicPage', { keyring: currentKeyring });
                            return;
                          }
                          if (item.action === 'lock') {
                            await wallet.lockWallet();
                          }
                          if (item.action == 'expand-view') {
                            openExtensionInTab();
                            return;
                          }
                          navigate(item.route);
                        }
                      : null
                  }
                />
              );
            })}
          </div>
          <div className="flex-row-center gap-xl mt-lg">
          <Icon
              icon="github"
              className='textDim'
              size={20}
              onClick={() => {
                window.open(GITHUB_URL);
              }}
            />
          </div>
          <div className="text sub align-center">{`Version: ${currentVesion}`}</div>
        </div>
      </div>
    </div>
  );
}
