import { Button, Modal } from 'antd';
import { useState } from 'react';

import { Version } from '@/common/types';
import { browserTabsCreate } from '@/scripts/background/utils/chrome';
import { useWallet } from '@/ui/utils';

export default function UpgradeVersion({ versionInfo }: { versionInfo: Version }) {
  const forceUpdate = versionInfo.force_upgrade === '1';
  const canOpen = forceUpdate || (versionInfo.force_upgrade && !forceUpdate && !versionInfo.read);
  const [open, setOpen] = useState(canOpen);
  const wallet = useWallet();
  const handleOk = async () => {
    setOpen(false);
    await wallet.updateVersioInfoRead();
    browserTabsCreate({ url: versionInfo.url });
  };
  const handleCancel = async () => {
    setOpen(false);
    await wallet.updateVersioInfoRead();
  };
  if (!canOpen) {
    return null;
  }
  return (
    <Modal
      open={open}
      centered
      width={300}
      footer={null}
      closable={!forceUpdate}
      maskClosable={!forceUpdate}
      onCancel={handleCancel}
      getContainer={() => document.getElementById('root')!}>
      <div className="flex-row-center font-md">
        <p className="text font-bold">Upgrade available</p>
      </div>
      <div className="flex-row-start">
        <p style={{ padding: '0 5px' }}>{versionInfo?.desc || 'Upgrade to new version'}</p>
      </div>
      <div className="flex-row-center mt-lg">
        <Button type="primary" className="rouded" onClick={handleOk} style={{ width: '150px', borderRadius: 20 }}>
          Upgrade now
        </Button>
      </div>
    </Modal>
  );
}
