import { Button } from 'antd';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { SpSatInfo } from '@/common/types';
import { Header } from '@/ui/components';
import { MixedCoinCheck } from '@/ui/components/MixedCoinCheck';
import SpsatsPreview from '@/ui/components/SpsatsPreview';
import { useNavigate } from '@/ui/router';

export default function SpSatsDetailPage() {
  const { state } = useLocation();
  const { spsatsInfo }: { spsatsInfo: SpSatInfo } = state;
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [mixTag, setMixTag] = useState<string[]>([]);

  const gotoTransaction = () => {
    navigate('SpsatsTxCreatePage', { spsatsInfo });
  };
  return (
    <div className="container">
      <Header
        title={`Sats #${spsatsInfo.id}`}
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <div className="view">
        <div className="flex-col">
          <div className="flex-row justify-center">
            <SpsatsPreview data={spsatsInfo} type="detail" size="lg" />
          </div>
          <Button
            ghost
            className="primary-btn"
            type="primary"
            onClick={(e) => {
              const tmpMixTag: string[] = [];
              if (spsatsInfo.hasBrc20) {
                //
                tmpMixTag.push('BRC-20');
              }
              if (spsatsInfo.hasInscription) {
                //
                tmpMixTag.push('Inscriptions');
              }
              if (tmpMixTag.length > 0) {
                setMixTag(tmpMixTag);
                setOpenConfirm(true);
                return;
              }
              gotoTransaction();
            }}>
            Send
          </Button>
        </div>
      </div>

      <MixedCoinCheck
        open={openConfirm}
        tags={mixTag}
        onCancel={() => {
          setOpenConfirm(false);
        }}
        onConfirm={() => {
          gotoTransaction();
        }}
      />
    </div>
  );
}
