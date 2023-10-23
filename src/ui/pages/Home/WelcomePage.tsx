/* eslint-disable quotes */
import { Button } from 'antd';

import { Logo } from '@/ui/components';
import { useNavigate } from '@/ui/router';
import { useWallet } from '@/ui/utils';

export default function WelcomePage() {
  const navigate = useNavigate();
  const wallet = useWallet();

  return (
    <>
      <div className="container">
        <div className="view middle">
          <div className="full-x">
            <div className="flex-row-center">
              <Logo type="large" />
            </div>
            <div className="flex-col-center full gap-lg mt-xxl">
              <Button
                className="primary-btn"
                type="primary"
                onClick={async () => {
                  const isBooted = await wallet.isBooted();
                  if (isBooted) {
                    navigate('CreateHDWalletPage', { isImport: false });
                  } else {
                    navigate('SetPasswordPage', { isNewAccount: true });
                  }
                }}>
                Create new wallet
              </Button>
              <Button
                className="btn"
                type="default"
                onClick={async () => {
                  const isBooted = await wallet.isBooted();
                  if (isBooted) {
                    navigate('CreateHDWalletPage', { isImport: true });
                  } else {
                    navigate('SetPasswordPage', { isNewAccount: false });
                  }
                }}>
                I already have a wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
