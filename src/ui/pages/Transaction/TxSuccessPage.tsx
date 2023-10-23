import { Button } from 'antd';
import { useLocation } from 'react-router-dom';

import { TxTypeTitle } from '@/common/types';
import { Icon, Footer, Header } from '@/ui/components';
import { useNavigate } from '@/ui/router';
import { getExplorerTxUrlByTxid } from '@/ui/utils';

export default function TxSuccessPage() {
  const { state } = useLocation();
  const { txid, title, type }: { txid: string; title?: string; type?: string } = state;
  const navigate = useNavigate();
  const viewTxDetailUrl = getExplorerTxUrlByTxid(txid);
  return (
    <div className="container">
      <Header title={title || TxTypeTitle[String(type)] || ''} />

      <div className="view" style={{ gap: 12 }}>
        <div className="flex-col justify-center mt-xxl gap-xl">
          <div className="flex-row justify-center">
            <Icon icon="success" size={50} style={{ alignSelf: 'center' }} />
          </div>
          <div className="text align-center font-lg">Payment Successful</div>
          <div className="text sub align-center textDim">Your transaction has been sent successfully</div>
          <div
            className="flex-row justify-center pointer"
            onClick={() => {
              window.open(`${viewTxDetailUrl}`);
            }}>
            <Icon icon="eye" color="textDim" />
            <div className="text textDim">View on Block Explorer</div>
          </div>
        </div>
      </div>
      <Footer>
        <Button
          type="primary"
          className="primary-btn full-x"
          onClick={() => {
            navigate('HomePage');
          }}>
          Done
        </Button>
      </Footer>
    </div>
  );
}
