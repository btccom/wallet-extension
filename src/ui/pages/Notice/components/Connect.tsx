import { Button } from 'antd';
import { useEffect, useState } from 'react';

import { Account, WalletKeyring } from '@/common/types';
import { Footer, Header, Icon } from '@/ui/components';
import { AddressBalance } from '@/ui/components/AddressBalance';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import WebsiteHeader from '@/ui/components/WebsiteBar';
import { useAppDispatch } from '@/ui/store/hooks';
import { useCurrentAccount, useCurrentKeyring, useKeyrings } from '@/ui/store/ui/hooks';
import { uiActions } from '@/ui/store/ui/reducer';
import { useNotice, useWallet } from '@/ui/utils';
import { CheckCircleFilled } from '@ant-design/icons';

interface AccountItemProps {
  account?: Account;
  onChange?: any;
  selected?: boolean;
}

export function AccountItem({ account, onChange, selected }: AccountItemProps) {
  if (!account) {
    return <div />;
  }

  return (
    <div
      className="card justify-between rounded"
      onClick={async (e) => {
        if (onChange) {
          onChange(account);
        }
      }}>
      <div className="flex-row full gap-lg ">
        <div className="flex-col align-self-center" style={{ width: 20 }}>
          {selected ? (
            <Icon size={20}>
              <CheckCircleFilled className="font-xl iblue pointer" />
            </Icon>
          ) : (
            <div className="uncheck pointer"></div>
          )}
        </div>
        <div className="flex-col gap-sm">
          <div className="text">{account.alianName}</div>
          <CopyableAddress address={account.address} />
          <AddressBalance address={account.address} />
        </div>
      </div>
    </div>
  );
}

interface Props {
  params: {
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}

export default function Connect({ params: { session } }: Props) {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const wallets = useKeyrings();
  const currentAccount = useCurrentAccount();
  const currentKeyring = useCurrentKeyring();
  const [getNotice, resolveNotice, rejectNotice] = useNotice();
  const [localCurrentAccount, setLocalCurrentAccount] = useState<Account>({} as Account);
  const [localCurrentKeyring, setLocalCurrentKeyring] = useState<WalletKeyring>({} as WalletKeyring);
  const [disabled, setDisabled] = useState(false);

  const handleCancel = () => {
    rejectNotice('User rejected the request.');
  };

  const handleConnect = async () => {
    setDisabled(true);
    if (currentKeyring.key !== localCurrentKeyring.key) {
      await wallet.changeKeyring(localCurrentKeyring);
      dispatch(uiActions.setCurrent(localCurrentKeyring));
    }
    if (currentAccount.pubkey !== localCurrentAccount.pubkey) {
      await wallet.changeAccount(localCurrentAccount);
      dispatch(uiActions.setCurrentAccount(localCurrentAccount));
    }
    resolveNotice();
  };
  useEffect(() => {
    if (currentKeyring) {
      setLocalCurrentKeyring(currentKeyring);
    }
  }, [currentKeyring]);
  useEffect(() => {
    if (currentAccount) {
      setLocalCurrentAccount(currentAccount);
    }
  }, [currentAccount]);
  return (
    <div className="container">
      <Header>
        <WebsiteHeader session={session} />
      </Header>
      <div className="view">
        <div className="flex-col">
          <div className="text font-bold mt-lg align-center">Connect with BTC.com Wallet</div>
          <div className="text align-center">Select the account to use on this site</div>
          <div className="text sub align-center">Only connect with sites you trust.</div>
          <div className="flex-col mt-lg gap-xl">
            {wallets.map((wallet) => (
              <div key={wallet.key} className="flex-col gap-md">
                <div className="text font-bold">{wallet.alianName}</div>
                {wallet.accounts.map((item, index) => (
                  <AccountItem
                    key={wallet.key + item.key + index}
                    account={item}
                    onChange={(v) => {
                      setLocalCurrentAccount(v);
                      setLocalCurrentKeyring(wallet);
                    }}
                    selected={item.pubkey === localCurrentAccount.pubkey}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer preset="fixed">
        <div className="flex-row full">
          <Button className="btn full" type="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button className="primary-btn full" type="primary" disabled={disabled} onClick={handleConnect}>
            Connect
          </Button>
        </div>
      </Footer>
    </div>
  );
}
