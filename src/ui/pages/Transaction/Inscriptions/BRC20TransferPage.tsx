import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { RawTxInfo, TokenBalance, TickTransfer, TxType } from '@/common/types';
import { Header, Input } from '@/ui/components';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { Empty } from '@/ui/components/Empty';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { MixedCoinCheck } from '@/ui/components/MixedCoinCheck';
import { RefreshButton } from '@/ui/components/RefreshButton';
import { TabBar } from '@/ui/components/TabBar';
import { useNavigate } from '@/ui/router';
import { useCreateMultiBrc20TxCallback } from '@/ui/store/transactions/hooks';
import { useCurrentAccount } from '@/ui/store/ui/hooks';
import { handleListAddMultTag, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

function Step1({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const { tokenBalance, transferAmount } = contextData;
  const [openSatsCheck, setOpenSatsCheck] = useState(false);
  const [mixTag, setMixTag] = useState<any>([]);
  const navigate = useNavigate();

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(true);
    if (contextData.transferAmount <= 0) {
      return;
    }

    setDisabled(false);
  }, [contextData.transferAmount]);

  const onClickNext = () => {
    updateContextData({
      tick: tokenBalance.tick,
      tabKey: TabKey.STEP2
    });
  };
  const onCheckSats = () => {
    const aHasBrc20Inscriptions = Object.values(contextData.inscriptions).filter((v: any) => {
      return v.hasBrc20;
    });
    const aHasSatsInscriptions = Object.values(contextData.inscriptions).filter((v: any) => {
      return v.hasSpSat;
    });
    const tag: any = [];
    if (aHasSatsInscriptions.length > 0) {
      setOpenSatsCheck(true);
      tag.push('Rare Satoshi');
    }
    if (aHasBrc20Inscriptions.length > 0) {
      setOpenSatsCheck(true);
      tag.push('BRC-20');
    }
    if (tag.length > 0) {
      setMixTag(tag);
      setOpenSatsCheck(true);
      return;
    }
    onClickNext();
  };

  return (
    <div className="view mt-lg">
      <div className="flex-col full">
        <div className="flex-col gap-lg full">
          <div className="flex-col">
            <TransferableList contextData={contextData} updateContextData={updateContextData} />
          </div>
          <MixedCoinCheck
            tags={mixTag}
            open={openSatsCheck}
            onCancel={() => {
              setOpenSatsCheck(false);
            }}
            onConfirm={() => {
              onClickNext();
            }}
          />
          <div className="flex-row justify-ceter mt-lg">
            <div className="flex-col full">
              <div className="flex-col">
                <div
                  className="flex-col full-x px-md py-md pointer bg-white border-transfer rounded"
                  onClick={() => {
                    navigate('InscribeTransferScreen', { ticker: tokenBalance.tick });
                  }}>
                  <div className="text  align-center iblue font-lg">Inscribe Transfer</div>
                  <div className="text align-center font-xs textDim">{`Available ${tokenBalance.available} ${tokenBalance.tick}`}</div>
                </div>
                <div className="flex-row">
                  <div className="text sub">
                    {'* To send BRC-20, you have to inscribe a Transfer inscription first'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button className="primary-btn" type="primary" onClick={onCheckSats} disabled={disabled}>
          Next
        </Button>
      </div>
    </div>
  );
}

function TransferableList({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const wallet = useWallet();
  const { tokenBalance } = contextData;

  const [items, setItems] = useState<TickTransfer[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });
  const [allSelected, setAllSelected] = useState(false);
  const helper = useHelper();
  const account = useCurrentAccount();
  const fetchData = async () => {
    try {
      helper.loading(true);
      const { transferableUtxo, list } = await wallet
        .getAddressTokenBalances(account.address, tokenBalance.tick)
        .then((tokenBalance) => {
          const list: any = [];
          tokenBalance.transferableUtxo.forEach((v) => {
            const transferableBrc20 = v.transferableBrc20;
            list.push({
              id: `${v.txid}:${v.index}`,
              tick: transferableBrc20.tick,
              amount: transferableBrc20.amount,
              number: transferableBrc20.number,
              txid: v.txid,
              index: v.index,
              satsIn: v.amount,
              timestamp: v.timestamp
            });
          });
          return { transferableUtxo: tokenBalance.transferableUtxo, list };
        })
        .catch((err) => {
          helper.loading(false);
          return { transferableUtxo: [], list: [] };
        });
      const newList = handleListAddMultTag(list, transferableUtxo);
      setItems(newList);
      setTotal(total);
    } catch (e) {
      helper.toast((e as Error).message, 'error');
    } finally {
      helper.loading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);
  const totalAmount = items.reduce((pre, cur) => pre + parseInt(cur.amount), 0);

  const selectedCount = useMemo(() => Object.keys(contextData.inscriptions).length, [contextData]);

  return (
    <div className="flex-col" style={{ minHeight: '250px' }}>
      <div className="flex-row-between items-center my-md">
        <div className="text textDim">Transfer Amount</div>
        <div className="flex-row justify-center">
          <div className="text font-sm align-center">{`${contextData.transferAmount}`}</div>
          <div className="text font-sm black-muted">{`${contextData.tokenBalance.tick}`}</div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="flex-col">
          <div className="flex-row justify-between pb-md">
            <div className="text textDim">{`Transfer Inscriptions (${selectedCount}/${items.length})`}</div>
            <RefreshButton
              onClick={() => {
                fetchData();
              }}
            />
          </div>

          <div className="flex-row overflow-x gap-lg">
            {items.map((v, index) => (
              <BRC20Preview
                key={v.id}
                tick={v.tick || ''}
                balance={v.amount}
                inscriptionNumber={v.number}
                timestamp={v.timestamp}
                satsIn={v.satsIn}
                item={v}
                selected={!!contextData.inscriptions[v.id]}
                type="Transfer"
                onClick={() => {
                  if (contextData.inscriptions[v.id]) {
                    const inscriptions = { ...contextData.inscriptions };
                    delete inscriptions[v.id];
                    const transferAmount = contextData.transferAmount - parseInt(v.amount);
                    updateContextData({
                      inscriptions,
                      transferAmount
                    });
                    if (allSelected) {
                      setAllSelected(false);
                    }
                  } else {
                    const inscriptions = { ...contextData.inscriptions };
                    inscriptions[v.id] = v;
                    const transferAmount = contextData.transferAmount + parseInt(v.amount);
                    updateContextData({
                      inscriptions,
                      transferAmount
                    });
                    if (allSelected == false && transferAmount === totalAmount) {
                      setAllSelected(true);
                    }
                  }
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-col">
          <div className="flex-row justify-between">
            <div className="text textDim">Transfer Inscriptions (0)</div>
            <RefreshButton
              onClick={() => {
                fetchData();
              }}
            />
          </div>
          <div className="flex-row justify-center" style={{ paddingTop: '80px' }}>
            <Empty />
          </div>
        </div>
      )}
    </div>
  );
}

function Step2({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const createBrc20Tx = useCreateMultiBrc20TxCallback();

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(true);
    if (!contextData.receiver) {
      return;
    }
    if (contextData.feeRate <= 0) {
      return;
    }
    setDisabled(false);
  }, [contextData.receiver, contextData.feeRate]);

  const helper = useHelper();
  const navigate = useNavigate();
  const onClickNext = async () => {
    try {
      helper.loading(true);
      const inscriptionIds = Array.from(Object.keys(contextData.inscriptions));
      const rawTxInfo = await createBrc20Tx(
        { address: contextData.receiver },
        inscriptionIds,
        contextData.tick,
        contextData.feeRate
      );
      rawTxInfo.selectBrc20 = Object.values(contextData.inscriptions);
      // updateContextData({ tabKey: TabKey.STEP3, rawTxInfo: rawTxInfo });

      navigate('SignHexPage', { type: TxType.TRANSFER_BRC20, rawTxInfo: rawTxInfo });
    } catch (e) {
      const error = e as Error;
      helper.toast(error.message, 'error');
    } finally {
      helper.loading(false);
    }
  };
  return (
    <div className="view mt-lg mt-lg">
      <div className="flex-col full">
        <div className="flex-col">
          <div className="text textDim">Send</div>
          <Input preset="text" value={`${contextData.transferAmount} ${contextData.tokenBalance.tick}`} disabled />
        </div>

        <div className="flex-col">
          <div className="text textDim">Recipient</div>
          <Input
            preset="address"
            addressInputData={{
              address: '',
              domain: ''
            }}
            autoFocus={true}
            onAddressInputChange={(val) => {
              updateContextData({ receiver: val.address });
            }}
          />
        </div>
        <div className="flex-col">
          <div className="text textDim">Fee</div>
          <FeeRateBar
            onChange={(val) => {
              updateContextData({ feeRate: val });
            }}
          />
        </div>
      </div>

      <Button type="primary" className="primary-btn" onClick={onClickNext} disabled={disabled}>
        Next
      </Button>
    </div>
  );
}

enum TabKey {
  STEP1,
  STEP2
}

interface ContextData {
  tabKey: TabKey;
  tokenBalance: TokenBalance;
  transferAmount: number;
  transferableList: TickTransfer[];
  inscriptions: { [key: string]: TickTransfer };
  feeRate: number;
  receiver: string;
  rawTxInfo: RawTxInfo;
  tick: string;
}

interface UpdateContextDataParams {
  tabKey?: TabKey;
  transferAmount?: number;
  transferableList?: TickTransfer[];
  inscriptions?: { [key: string]: TickTransfer };
  feeRate?: number;
  receiver?: string;
  rawTxInfo?: RawTxInfo;
  tick?: string;
}

export default function BRC20TransferPage() {
  const { state } = useLocation();
  const props = state as {
    tokenBalance: TokenBalance;
    selectedAmount: number;
  };

  const tokenBalance = props.tokenBalance;
  const selectedAmount = props.selectedAmount || 0;

  const [contextData, setContextData] = useState<ContextData>({
    tabKey: TabKey.STEP1,
    tokenBalance,
    transferAmount: selectedAmount,
    transferableList: [],
    inscriptions: {},
    feeRate: 5,
    receiver: '',
    rawTxInfo: {
      txHex: '',
      fee: 0,
      deduction: 0,
      receiveAmount: 0
    },
    tick: ''
  });

  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  const component = useMemo(() => {
    if (contextData.tabKey === TabKey.STEP1) {
      return <Step1 contextData={contextData} updateContextData={updateContextData} />;
    } else if (contextData.tabKey === TabKey.STEP2) {
      return <Step2 contextData={contextData} updateContextData={updateContextData} />;
    }
  }, [contextData]);

  return (
    <div className="container">
      <Header
        title="Transfer"
        onBack={() => {
          if (contextData.tabKey === TabKey.STEP2) {
            updateContextData({ tabKey: TabKey.STEP1 });
            return;
          }
          window.history.go(-1);
        }}
      />
      <div className="flex-row justify-center">
        <TabBar
          progressEnabled
          defaultActiveKey={TabKey.STEP1}
          activeKey={contextData.tabKey}
          items={[
            { key: TabKey.STEP1, label: 'Step1' },
            { key: TabKey.STEP2, label: 'Step2' }
          ]}
          onTabClick={(key) => {
            updateContextData({ tabKey: key });
          }}
        />
      </div>

      <div className="flex-row mt-lg"></div>
      {component}
    </div>
  );
}
