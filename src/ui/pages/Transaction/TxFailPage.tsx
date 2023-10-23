import { Button } from 'antd';
import { useLocation } from 'react-router-dom';

import { TxType, TxTypeTitle } from '@/common/types';
import { Footer, Header } from '@/ui/components';
import { useNavigate } from '@/ui/router';
import { CloseCircleFilled } from '@ant-design/icons';

export default function TxFailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { error, type, title }: { error: string; type?: TxType; title?: string } = state;
  const FailBackToPage = {
    [TxType.SEND_INSCRIPTION]: 'InscriptionPage',
    [TxType.SEND_SATS]: 'InscriptionPage'
  };
  return (
    <div className="container">
      <Header title={title || TxTypeTitle[String(type)] || ''} />
      <div className="view">
        <div className="flex-col justify-center mt-xxl gap-xl">
          <div className="flex-row justify-center">
            <CloseCircleFilled className=" error font-xxxl" />
          </div>

          <div className="text align-center">Payment Failed</div>
          <div className="text sub red align-center">{error}</div>
        </div>
      </div>

      <Footer>
        <Button
          type="primary"
          className="primary-btn full-x"
          onClick={() => {
            navigate(FailBackToPage[String(type)] || 'HomePage');
          }}>
          Done
        </Button>
      </Footer>
    </div>
  );
}
