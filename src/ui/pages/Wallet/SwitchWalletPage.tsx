import { Button, Modal } from 'antd';
import { useMemo, useState } from 'react';

import { KEYCHAIN_TYPE } from '@/common/constant';
import { WalletKeyring } from '@/common/types';
import { Footer, Header, Icon } from '@/ui/components';
import { AddressBalance } from '@/ui/components/AddressBalance';
import { useNavigate } from '@/ui/router';
import { useAppDispatch } from '@/ui/store/hooks';
import { useCurrentKeyring, useKeyrings } from '@/ui/store/ui/hooks';
import { uiActions } from '@/ui/store/ui/reducer';
import { shortAddress, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';
import { CheckCircleFilled, DeleteOutlined, EditOutlined, KeyOutlined } from '@ant-design/icons';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface ItemData {
  key: string;
  keyring: WalletKeyring;
}

interface WalletItemProps {
  keyring: WalletKeyring;
  autoNav?: boolean;
}

export function WalletItem({ keyring, autoNav }: WalletItemProps, ref) {
  const navigate = useNavigate();
  const currentKeyring = useCurrentKeyring();
  const selected = currentKeyring.index === keyring?.index;
  const wallet = useWallet();
  const keyrings = useKeyrings();

  const dispatch = useAppDispatch();

  const helper = useHelper();
  const displayAddress = useMemo(() => {
    const address = keyring.accounts[0].address;
    return shortAddress(address, 6);
  }, [keyring]);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);

  return (
    <div className="card flex-row justify-between mt-md rounded">
      <div
        className="flex-row full gap-xl"
        onClick={async (e) => {
          if (currentKeyring.key !== keyring.key) {
            await wallet.changeKeyring(keyring);
            dispatch(uiActions.setCurrent(keyring));
            dispatch(uiActions.setCurrentAccount(keyring.accounts[0]));
          }
          if (autoNav) navigate('HomePage');
        }}>
        <div className="flex-col align-self-center" style={{ width: 20 }}>
          {selected ? (
            <Icon size={20}>
              <CheckCircleFilled className="font-xl iblue" />
            </Icon>
          ) : (
            <div className="uncheck"></div>
          )}
        </div>

        <div className="flex-col justify-center gap-sm">
          <div className="text">{`${keyring.alianName}`}</div>
          <div className="text sub">{`${displayAddress}`}</div>
          <AddressBalance address={keyring.accounts[0].address} />
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
          icon="moreoutline"
          size={25}
          onClick={async (e) => {
            setOptionsVisible(!optionsVisible);
          }}></Icon>

        {optionsVisible && (
          <div
            className="flex-col bgpop"
            style={{
              width: 180,
              position: 'absolute',
              right: 0,
              padding: 5,
              zIndex: 10
            }}>
            <div className="flex-col">
              <div
                className="flex-row"
                onClick={() => {
                  navigate('EditWalletNamePage', { keyring });
                }}>
                <EditOutlined className="black-color" />
                <div className="text font-sm">Edit Name</div>
              </div>

              {keyring.type === KEYCHAIN_TYPE.HdKeyring ? (
                <div
                  className="flex-row"
                  onClick={() => {
                    navigate('ViewMnemonicPage', { keyring });
                  }}>
                  <KeyOutlined className="black-color" />
                  <div className="text font-sm">Show Secret Recovery Phrase</div>
                </div>
              ) : (
                <div
                  className="flex-row"
                  onClick={() => {
                    navigate('ExportPrivateKeyPage', { account: keyring.accounts[0] });
                  }}>
                  <KeyOutlined className="black-color" />
                  <div className="text font-sm">Export Private Key</div>
                </div>
              )}
              <div
                className="flex-row"
                onClick={() => {
                  if (keyrings.length == 1) {
                    helper.toast('Removing the last wallet is not allowed', 'error');
                    return;
                  }
                  setRemoveVisible(true);
                  setOptionsVisible(false);
                }}>
                <Icon color="danger">
                  <DeleteOutlined />
                </Icon>

                <div className="text font-sm danger">Remove Wallet</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {removeVisible && (
        <Modal
          centered
          open={removeVisible}
          getContainer={() => document.getElementById('root') || document.body}
          onCancel={() => setRemoveVisible(false)}
          bodyStyle={{ paddingTop: 12 }}
          className="rounded"
          width={300}
          footer={false}>
          <div className="flex-col-center">
            <div
              className="flex-row-center"
              style={{
                width: 30,
                height: 30,
                borderRadius: '1.5rem',
                backgroundColor: '#CC3333'
              }}>
              <FontAwesomeIcon icon={faTrashCan} style={{ height: '1rem' }} className="white-color" />
            </div>

            <div className="card2" style={{ width: 200 }}>
              <div className="flex-col padding-xs bg-selected rounded gap-sm">
                <div className="text align-center font-sm">{keyring.alianName}</div>
                <div className="text sub align-center">{displayAddress}</div>
              </div>
            </div>
            <div className="text align-center font-xs">
              Please pay attention to whether you have backed up the mnemonic/private key to prevent asset loss
            </div>
            <div className="text danger font-xs">This action is not reversible.</div>
          </div>

          <div className="flex-row full mt-xl gap-xl">
            <Button
              className="primary-btn full"
              type="primary"
              ghost
              onClick={(e) => {
                setRemoveVisible(false);
              }}>
              Cancel
            </Button>
            <Button
              className="danger-btn full"
              onClick={async () => {
                const nextKeyring = await wallet.removeKeyring(keyring);
                if (nextKeyring) {
                  const keyrings = await wallet.getKeyrings();
                  dispatch(uiActions.setKeyrings(keyrings));
                  dispatch(uiActions.setCurrent(keyrings[0]));
                  dispatch(uiActions.setCurrentAccount(nextKeyring.accounts[0]));
                  setRemoveVisible(false);
                } else {
                  navigate('Welcome');
                }
              }}>
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function SwitchWalletPage() {
  const navigate = useNavigate();

  const keyrings = useKeyrings();
  const items = useMemo(() => {
    const _items: ItemData[] = keyrings.map((v) => {
      return {
        key: v.key,
        keyring: v
      };
    });
    // _items.push({
    //   key: 'add'
    // });
    return _items;
  }, [keyrings]);
  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Switch Wallet"
      />
      <div className="view">
        {items.map((item, index) => (
          <WalletItem key={index} keyring={item.keyring} autoNav={true} />
        ))}
        <Footer preset="fixed">
          <Button
            className="primary-btn full-x"
            onClick={() => {
              navigate('AddWalletPage');
            }}>
            Create New Wallet
          </Button>
        </Footer>
      </div>
    </div>
  );
}
