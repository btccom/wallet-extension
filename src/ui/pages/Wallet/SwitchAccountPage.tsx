import { Button } from 'antd';
import { useMemo, useState } from 'react';

import { Account } from '@/common/types';
import { Footer, Header, Icon } from '@/ui/components';
import { AddressBalance } from '@/ui/components/AddressBalance';
import { useNavigate } from '@/ui/router';
import { useAppDispatch } from '@/ui/store/hooks';
import { useCurrentAccount, useCurrentKeyring } from '@/ui/store/ui/hooks';
import { uiActions } from '@/ui/store/ui/reducer';
import { copyToClipboard, shortAddress, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';
import { CheckCircleFilled, CopyOutlined, EditOutlined, KeyOutlined } from '@ant-design/icons';

export interface AccountData {
  key: string;
  account?: Account;
}

interface AccountItemProps {
  account?: Account;
  autoNav?: boolean;
}

export function AccountItem({ account, autoNav }: AccountItemProps) {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const selected = currentAccount.pubkey == account?.pubkey;
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  const keyring = useCurrentKeyring();
  if (!account) {
    return <div />;
  }
  const [optionsVisible, setOptionsVisible] = useState(false);
  const path = keyring.hdPath + '/' + account.index;

  const helper = useHelper();

  return (
    <div className="card justify-between mt-md rounded">
      <div className="flex-row full-x">
        <div className="flex-col align-self-center" style={{ width: 20 }}>
          {selected ? (
            <Icon size={20}>
              <CheckCircleFilled className="font-xl iblue" />
            </Icon>
          ) : (
            <div className="uncheck"></div>
          )}
        </div>
        <div
          className="flex-col gap-sm"
          onClick={async (e) => {
            if (currentAccount.pubkey !== account.pubkey) {
              await wallet.changeAccount(account);
              dispatch(uiActions.setCurrentAccount(account));
            }
            if (autoNav) navigate('HomePage');
          }}>
          <div className="text">{account.alianName}</div>
          <div className="text sub">{`${shortAddress(account.address)} (${path})`}</div>
          <AddressBalance address={account.address} />
        </div>
      </div>
      <div className="flex-col" style={{ position: 'relative' }}>
        {optionsVisible && (
          <div
            style={{
              position: 'fixed',
              zIndex: 10,
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }}
            onTouchStart={(e) => {
              setOptionsVisible(false);
            }}
            onMouseDown={(e) => {
              setOptionsVisible(false);
            }}></div>
        )}

        <Icon
          onClick={async (e) => {
            setOptionsVisible(!optionsVisible);
          }}
          icon="moreoutline"
          size={25}
        />

        {optionsVisible && (
          <div
            className="flex-col bgpop"
            style={{
              width: 160,
              position: 'absolute',
              right: 0,
              padding: 5,
              zIndex: 10
            }}>
            <div
              className="flex-row pointer"
              onClick={() => {
                navigate('EditAccountNamePage', { account });
              }}>
              <EditOutlined className="black-color" />
              <div className="text font-sm">Edit Name</div>
            </div>
            <div
              className="flex-row pointer"
              onClick={() => {
                copyToClipboard(account.address);
                helper.toast('copied', 'success');
                setOptionsVisible(false);
              }}>
              <CopyOutlined className="black-color" />
              <div className="text font-sm">Copy address</div>
            </div>
            <div
              className="flex-row pointer"
              onClick={() => {
                navigate('ExportPrivateKeyPage', { account });
              }}>
              <KeyOutlined className="black-color" />
              <div className="text font-sm">Export Private Key</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SwitchAccountPage() {
  const navigate = useNavigate();
  const keyring = useCurrentKeyring();
  const items = useMemo(() => {
    const _items: AccountData[] = keyring.accounts.map((v) => {
      return {
        key: v.address,
        account: v
      };
    });
    return _items;
  }, []);

  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Switch Account"
      />
      <div className="view">
        {items.map((item, index) => (
          <AccountItem key={index} account={item.account} autoNav={true} />
        ))}
        <Footer preset="fixed">
          <Button
            className="primary-btn full-x"
            onClick={() => {
              navigate('CreateAccountPage');
            }}>
            Create New Account
          </Button>
        </Footer>
      </div>
    </div>
  );
}
