import { Button } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription } from '@/common/types';
import { Header } from '@/ui/components';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { MixedCoinCheck } from '@/ui/components/MixedCoinCheck';
import { useNavigate } from '@/ui/router';
import { useAppDispatch } from '@/ui/store/hooks';
import { transactionsActions } from '@/ui/store/transactions/reducer';
import { copyToClipboard, getExplorerTxUrlByTxid } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';
import { useCurrentAccount } from '@/ui/store/ui/hooks';

export default function InscriptionsDetailPage() {
  const { state } = useLocation();
  const { inscription }: { inscription: Inscription } = state;
  const [openConfirm, setOpenConfirm] = useState(false);
  const [mixTag, setMixTag] = useState<string[]>([]);
  const navigate = useNavigate();

  const currentAccount = useCurrentAccount();
  const withSend = currentAccount.address === inscription.address;

  const dispatch = useAppDispatch();

  const isUnconfirmed = inscription.timestamp == 0;
  const date = moment(inscription.timestamp * 1000).format('YYYY-MM-DD hh:mm:ss');

  const sExplorerTxUrl = getExplorerTxUrlByTxid(inscription.txid);
  const gotoTransaction = () => {
    dispatch(transactionsActions.reset());
    navigate('InscriptionsTxCreatePage', { inscription });
  };
  return (
    <div className="container">
      <Header
        title={isUnconfirmed ? 'Inscription (not confirmed yet)' : `Inscription #${inscription.number}`}
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <div className="view">
        <div className="flex-col">
          <div className="flex-row justify-center">
            <InscriptionPreview data={inscription} type="large" tagPosition="bottom" />
          </div>

          {withSend && (
            <Button
              ghost
              className="primary-btn"
              type="primary"
              onClick={(e) => {
                const tmpMixTag: string[] = [];
                if (inscription.hasBrc20) {
                  //
                  tmpMixTag.push('BRC-20');
                }
                if (inscription.hasSpSat) {
                  //
                  tmpMixTag.push('Rare Satoshi');
                }
                if (tmpMixTag.length > 0) {
                  setMixTag(tmpMixTag);
                  setOpenConfirm(true);
                } else {
                  gotoTransaction();
                }
              }}>
              Send
            </Button>
          )}
          <div className="flex-col gap-lg">
            <DataItems title="id" value={inscription.id} />
            <DataItems title="address" value={inscription.address || ''} />
            <DataItems title="output value" value={inscription.amount} />
            <DataItems title="preview" value={inscription.preview || ''} link={inscription.preview} />
            <DataItems title="content" value={inscription.content || ''} link={inscription.content} />
            <DataItems title="timestamp" value={isUnconfirmed ? 'unconfirmed' : date} />
            <DataItems title="genesis transaction" value={inscription.txid} link={sExplorerTxUrl} />
          </div>
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

function DataItems({ value, title, link }: { value: string | number; title: string; link?: string }) {
  const helper = useHelper();
  return (
    <div className="flex-col">
      <div className="text sub">{title}</div>
      <div
        className={`text wrap font-xs ${link ? 'link' : 'font-bold'}`}
        onClick={() => {
          if (link) {
            window.open(link);
          } else {
            copyToClipboard(value).then(() => {
              helper.toast('Copied', 'success');
            });
          }
        }}>
        {value}
      </div>
    </div>
  );
}
