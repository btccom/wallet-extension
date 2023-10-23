import { useEffect } from 'react';

import { useNavigate } from '@/ui/router';
import { getUiType, useNotice, useWallet } from '@/ui/utils';

export default function StartupPage() {
  const navigate = useNavigate();
  const wallet = useWallet();

  const [getNotice, , rejectNotice] = useNotice();
  const loadView = async () => {
    const UIType = getUiType();
    const isInNotification = UIType.isNotification;
    const isInTab = UIType.isTab;
    let notice = await getNotice();
    if (isInNotification && !notice) {
      window.close();
      return;
    }

    if (!isInNotification) {
      await rejectNotice();
      notice = undefined;
    }

    const isBooted = await wallet.isBooted();
    const hasVault = await wallet.hasVault();
    const isUnlocked = await wallet.isUnlocked();

    if (!isBooted) {
      navigate('Welcome');
      return;
    }

    if (!isUnlocked) {
      navigate('UnlockPage');
      return;
    }

    if (!hasVault) {
      navigate('Welcome');
      return;
    }

    const currentAccount = await wallet.getCurrentAccount();

    if (!currentAccount) {
      navigate('Welcome');
      return;
    } else if (notice) {
      navigate('NoticePage');
    } else {
      navigate('HomePage');
      return;
    }
  };

  useEffect(() => {
    const init = async () => {
      const ready = await wallet.isReady();

      if (ready) {
        loadView();
      } else {
        setTimeout(() => {
          init();
        }, 1000);
      }
    };
    init();
  }, []);

  return <div></div>;
}
