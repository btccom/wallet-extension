import { Button } from 'antd';
import QRCode from 'qrcode.react';

import { Header } from '@/ui/components';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import { useAccountAddress, useCurrentAccount } from '@/ui/store/ui/hooks';
import { copyToClipboard } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

export default function ReceivePage() {
  const currentAccount = useCurrentAccount();
  const address = useAccountAddress();
  const helper = useHelper();

  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Receive"
      />
      <div className="view">
        <div className="flex-col mt-lg gap-xl">
          <div className="flex-col mb-xl">
            <div className="text  font-sm align-center">BTC-Bitcoin Address</div>
          </div>
          <div className="flex-col mb-xs">
            <CopyableAddress address={address} preset="center" />
          </div>
          <div className="flex-col-center align-self-center bg-white padding-sm" style={{ borderRadius: 5 }}>
            <QRCode value={address || ''} renderAs="svg" size={180}></QRCode>
          </div>
          <div className="flex-row-center">
            <div className="text font-xs">scan QR code to receive BTC or BRC-20</div>
          </div>
          <div className="flex-row-center mt-xxl">
            <Button
              className="primary-btn full"
              type="primary"
              onClick={() => {
                copyToClipboard(currentAccount?.address).then(() => {
                  helper.toast('Copied', 'success');
                });
              }}>
              Copy Address
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
