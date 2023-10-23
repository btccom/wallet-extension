import { Button } from 'antd';
import React, { useMemo } from 'react';

import { RawTxInfo, TxType } from '@/common/types';
import { numberAdd, satoshisToAmount } from '@/common/utils';
import { Footer } from '@/ui/components';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import SpsatsPreview from '@/ui/components/SpsatsPreview';
import { useNavigate } from '@/ui/router';

interface Props {
  header?: React.ReactNode;
  session?: {
    origin: string;
    icon?: string;
    name: string;
  };
  params: {
    type: TxType;
    rawTxInfo: RawTxInfo;
  };
  handleCancel?: () => void;
  handleConfirm?: () => void;
}

function SignTxDetails({ rawTxInfo }: { rawTxInfo: RawTxInfo }) {
  return (
    <div className="flex-col  gap-lg minHeight">
      <div className="text font-bold align-center font-md">Sign Transaction</div>
      <div className="card rounded flex-col gap-lg full">
        <div className="flex-col gap-lg">
          <div className="flex-row-center">
            <div className="flex-col gap-lg">
              <div className="flex-col mb-md">
                <div className="text textDim mt-md align-center">You will send</div>
                <div className="flex-col-center mt-md">
                  <div className="text text-color align-center font-xxl  align-center font-bold">{`${satoshisToAmount(
                    rawTxInfo.receiveAmount || 0
                  )} BTC`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-col bg-line full-x" style={{ height: 1, backgroundColor: '#efefef' }}></div>
        <div className="flex-row-between gap-xxl full-x">
          <div className="text textDim">Recipient</div>
          <div className="flex-row-end">
            <CopyableAddress address={rawTxInfo.toAddressInfo?.address || ''} />
          </div>
        </div>
        <div className="flex-row-between full-x">
          <div className="text textDim align-center">Spend Amount</div>

          <div className="flex-col justify-end">
            <div className="text text-color font-bold font-md align-right">{`${satoshisToAmount(
              rawTxInfo.deduction
            )} BTC`}</div>
            {rawTxInfo.receiveAmount > 0 && (
              <div className="text font-xs align-right">{`${satoshisToAmount(
                rawTxInfo.receiveAmount
              )} BTC(Output Value)`}</div>
            )}
            {<div className="text font-xs align-right">{`${satoshisToAmount(rawTxInfo.fee)} BTC(network fee)`}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
function SignBrc20TxDetails({ rawTxInfo, type }: any) {
  const sendingInscriptions = useMemo(() => {
    return rawTxInfo.selectBrc20 || rawTxInfo.brc20Utxos;
  }, [rawTxInfo.selectBrc20]);

  const brc20Info = useMemo(() => {
    let tick = '';
    let amount = 0;
    sendingInscriptions.forEach((v) => {
      amount = numberAdd(amount, v.amount);
      tick = v.tick;
    });

    return {
      tick,
      amount
    };
  }, [sendingInscriptions]);
  return (
    <div className="flex-col gap-lg">
      <div className="text font-bold align-center font-md">Sign Transaction</div>
      <div className="card rounded flex-col gap-lg full">
        <div className="flex-row-center">
          <div className="flex-col gap-lg">
            <div className="flex-col mb-md">
              <div className="text textDim mt-md align-center">You will send</div>
              <div className="flex-col-center mt-md">
                <div className="flex-row">
                  <span className="text text-color align-center font-xxl  align-center font-bold">{`${brc20Info.amount}`}</span>
                  <span className="text font-xxl  textDim font-bold">{brc20Info.tick}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-col bg-line full-x" style={{ height: 1, backgroundColor: '#efefef' }}></div>
        <div className="flex-col padding-xxs gap-lg full">
          <div className="flex-row-between items-center">
            <div className="text textDim align-center">Recipient</div>

            <div className="flex-col justify-end">
              <CopyableAddress address={rawTxInfo?.toAddressInfo?.address} />
            </div>
          </div>
          <div className="flex-row-between">
            <div className="text textDim align-center">Spend Amount</div>

            <div className="flex-col justify-end">
              <div className="text text-color font-bold font-md align-right">{`${satoshisToAmount(
                rawTxInfo.deduction
              )} BTC`}</div>
              {rawTxInfo.receiveAmount > 0 && (
                <div className="text font-xs align-right">{`${satoshisToAmount(
                  rawTxInfo.receiveAmount
                )} BTC(in inscriptions)`}</div>
              )}
              {<div className="text font-xs align-right">{`${satoshisToAmount(rawTxInfo.fee)} BTC(network fee)`}</div>}
              {type === TxType.SEND_BRC20 && (
                <div className="text font-xs align-right">{`${satoshisToAmount(
                  rawTxInfo.serviceFee
                )} BTC(service fee)`}</div>
              )}
            </div>
          </div>

          <div className="flex-row-between items-center mt-md">
            <div className="text textDim align-center">{`Spend Inscription (${sendingInscriptions.length})`}</div>
          </div>
          {sendingInscriptions.length > 0 && (
            <div className="flex-col justify-center">
              <div className="flex-row justify-start overflow-x gap-lg " style={{ width: 310 }}>
                {sendingInscriptions.map((v) => {
                  return (
                    <BRC20Preview
                      key={v.tick + v.number + Math.random()}
                      tick={v.tick}
                      balance={v.amount}
                      satsIn={v.satsIn}
                      inscriptionNumber={v.number}
                      item={v}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SignInscriptionTxDetails({ rawTxInfo }: any) {
  const sendingInscriptions = useMemo(() => {
    return [rawTxInfo.inscription];
  }, [rawTxInfo.inscription]);

  return (
    <div className="flex-col gap-lg">
      <div className="text font-bold align-center font-md">Sign Transaction</div>
      <div className="card rounded flex-col" style={{ minHeight: 420 }}>
        <div className="flex-row-between items-center full-x">
          <div className="text textDim align-center">Recipient</div>

          <div className="flex-col justify-end">
            <CopyableAddress address={rawTxInfo?.toAddressInfo?.address} />
          </div>
        </div>
        <div className="flex-row-between full-x">
          <div className="text align-center textDim">Spend Amount</div>

          <div className="flex-col">
            <div className="text text-color font-bold align-right font-md">{`${satoshisToAmount(
              rawTxInfo.deduction
            )} BTC`}</div>
            {rawTxInfo.receiveAmount > 0 && (
              <div className="text align-right">{`${satoshisToAmount(rawTxInfo.receiveAmount)} (in inscription)`}</div>
            )}
            <div className="text align-right">{`${satoshisToAmount(rawTxInfo.fee)} (network fee)`}</div>
          </div>
        </div>

        <div className="flex-row-start full-x">
          <div className="text textDim align-left full-x">{`Spend Inscription (${sendingInscriptions.length})`}</div>
        </div>
        {sendingInscriptions.length > 0 && (
          <div className="flex-row overflow-x gap-lg justify-start pb-lg full">
            {sendingInscriptions.map((v) => {
              return <InscriptionPreview key={v.id} data={v} type="middle" bottombgcolor={'bg2'} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SignSatsTxDetails({ rawTxInfo }: any) {
  const sendingSpsats = useMemo(() => {
    return [rawTxInfo.spsat];
  }, [rawTxInfo.spsat]);
  return (
    <div className="flex-col gap-lg ">
      <div className="text font-bold align-center font-md">Sign Transaction</div>
      <div className="card rounded flex-col" style={{ minHeight: 420 }}>
        <div className="flex-row-between items-center full-x">
          <div className="text textDim align-center">Recipient</div>

          <div className="flex-col justify-end">
            <CopyableAddress address={rawTxInfo?.toAddressInfo?.address} />
          </div>
        </div>
        <div className="flex-row-between full-x">
          <div className="text align-center textDim">Spend Amount</div>

          <div className="flex-col">
            <div className="text text-color font-bold align-right font-md">{`${satoshisToAmount(
              rawTxInfo.deduction
            )} BTC`}</div>
            {rawTxInfo.receiveAmount > 0 && (
              <div className="text align-right">{`${satoshisToAmount(rawTxInfo.receiveAmount)} (in Satoshi)`}</div>
            )}
            <div className="text align-right">{`${satoshisToAmount(rawTxInfo.fee)} (network fee)`}</div>
          </div>
        </div>

        <div className="flex-row-start full-x">
          <div className="text textDim align-left full-x">
            {sendingSpsats.length === 1 ? 'Spend Satoshi' : `Spend Satoshi (${sendingSpsats.length})`}
          </div>
        </div>
        {sendingSpsats.length > 0 && (
          <div className="flex-row overflow-x gap-lg justify-start pb-lg full-x">
            {sendingSpsats.map((v) => {
              v.sats = v.satsIn;
              return <SpsatsPreview key={v.id} data={v} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignHex({ params: { rawTxInfo, type }, header, handleCancel, handleConfirm }: Props) {
  const detailsComponent = useMemo(() => {
    return (
      <>
        {type === TxType.SEND_BITCOIN && <SignTxDetails rawTxInfo={rawTxInfo} />}
        {(type === TxType.TRANSFER_BRC20 || type === TxType.SEND_BRC20) && (
          <SignBrc20TxDetails rawTxInfo={rawTxInfo} type={type} />
        )}
        {type === TxType.SEND_INSCRIPTION && <SignInscriptionTxDetails rawTxInfo={rawTxInfo} />}
        {type === TxType.SEND_SATS && <SignSatsTxDetails rawTxInfo={rawTxInfo} />}
      </>
    );
  }, [type, rawTxInfo]);

  const navigate = useNavigate();
  if (!handleCancel) {
    handleCancel = () => {
      navigate('HomePage');
    };
  }
  return (
    <div className="container">
      {header}
      <div className="view">
        <div className="flex-col">{detailsComponent}</div>

        <Footer preset="fixed">
          <div className="flex-row full">
            <Button type="primary" className="primary-btn full" ghost onClick={handleCancel}>
              Reject
            </Button>
            <Button type="primary" className="primary-btn full" onClick={handleConfirm}>
              Sign & Send
            </Button>
          </div>
        </Footer>
      </div>
    </div>
  );
}
