import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ADDRESS_TYPES } from '@/common/constant';
import { AddressType } from '@/common/types';
import { Footer, Header, Input } from '@/ui/components';
import { AddressTypeCard } from '@/ui/components/AddressTypeCard';
import { TabBar } from '@/ui/components/TabBar';
import { useNavigate } from '@/ui/router';
import { useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

function Step1({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const [wif, setWif] = useState('');
  const [disabled, setDisabled] = useState(true);
  const wallet = useWallet();
  useEffect(() => {
    setDisabled(true);

    if (!wif) {
      return;
    }

    setDisabled(false);
  }, [wif]);

  const onChange = (e) => {
    const val = e.target.value;
    setWif(val);
    updateContextData({ step1Completed: val });
  };

  const helper = useHelper();

  const btnClick = async () => {
    try {
      const _res = await wallet.createTmpKeyringWithPrivateKey(wif, AddressType.P2TR);
      if (_res.accounts.length == 0) {
        throw new Error('Invalid PrivateKey');
      }
    } catch (e) {
      helper.toast((e as Error).message, 'error');
      return;
    }
    updateContextData({
      wif,
      tabType: TabType.STEP2
    });
  };

  return (
    <div className="flex-col gap-lg">
      <div className="text font-bold align-center font-lg">Private Key</div>

      <Input
        placeholder={'WIF Private Key / Hex Private Key'}
        onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if ('Enter' == e.key) {
            btnClick();
          }
        }}
        onChange={onChange}
        autoFocus={true}
      />
      <Footer preset="fixed">
        <Button disabled={disabled} className="primary-btn full-x" type="primary" onClick={btnClick}>
          Continue
        </Button>
      </Footer>
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
  const wallet = useWallet();
  const helper = useHelper();

  const hdPathOptions = useMemo(() => {
    return ADDRESS_TYPES.filter((v) => {
      if (v.order < 0) {
        return false;
      }
      return true;
    })
      .sort((a, b) => a.order - b.order)
      .map((v) => {
        return {
          label: v.name,
          hdPath: v.hdPath,
          addressType: v.value
        };
      });
  }, [contextData]);

  const [previewAddresses, setPreviewAddresses] = useState<string[]>(hdPathOptions.map((v) => ''));
  const run = async () => {
    const addresses: string[] = [];
    for (let i = 0; i < hdPathOptions.length; i++) {
      const options = hdPathOptions[i];
      const keyring = await wallet.createTmpKeyringWithPrivateKey(contextData.wif, options.addressType);
      const address = keyring.accounts[0].address;
      addresses.push(address);
    }

    setPreviewAddresses(addresses);
  };
  useEffect(() => {
    run();
  }, [contextData.wif]);
  const pathIndex = useMemo(() => {
    return hdPathOptions.findIndex((v) => v.addressType === contextData.addressType);
  }, [hdPathOptions, contextData.addressType]);

  const navigate = useNavigate();

  const onNext = async () => {
    try {
      await wallet.createKeyringWithPrivateKey(contextData.wif, contextData.addressType);
      navigate('HomePage');
    } catch (e) {
      helper.toast((e as any).message, 'error');
    }
  };
  return (
    <div className="flex-col gap-lg">
      <div className="text font-bold ">Address Type</div>
      {hdPathOptions.map((item, index) => {
        const address = previewAddresses[index];
        return (
          <AddressTypeCard
            key={index}
            label={`${item.label}`}
            address={address}
            checked={index == pathIndex}
            onClick={() => {
              updateContextData({ addressType: item.addressType });
            }}
          />
        );
      })}

      <Footer preset="fixed">
        <Button className="primary-btn full-x" type="primary" onClick={onNext}>
          Continue
        </Button>
      </Footer>
    </div>
  );
}
enum TabType {
  STEP1 = 'STEP1',
  STEP2 = 'STEP2',
  STEP3 = 'STEP3'
}

interface ContextData {
  wif: string;
  addressType: AddressType;
  step1Completed: boolean;
  tabType: TabType;
  addresses: string[];
}

interface UpdateContextDataParams {
  wif?: string;
  addressType?: AddressType;
  step1Completed?: boolean;
  tabType?: TabType;
  addresses?: [];
}

export default function ImportSimpleWallet() {
  const [contextData, setContextData] = useState<ContextData>({
    wif: '',
    addressType: AddressType.P2WPKH,
    step1Completed: false,
    tabType: TabType.STEP1,
    addresses: []
  });

  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  const items = [
    {
      key: TabType.STEP1,
      label: 'Step 1',
      children: <Step1 contextData={contextData} updateContextData={updateContextData} />
    },
    {
      key: TabType.STEP2,
      label: 'Step 2',
      children: <Step2 contextData={contextData} updateContextData={updateContextData} />
    }
  ];

  const renderChildren = items.find((v) => v.key == contextData.tabType)?.children;

  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Create Single Wallet"
      />
      <div className="view">
        <div className="flex-row-center">
          <TabBar
            progressEnabled
            defaultActiveKey={TabType.STEP1}
            items={items}
            activeKey={contextData.tabType}
            onTabClick={(key) => {
              const toTabType = key as TabType;
              if (toTabType === TabType.STEP2) {
                if (!contextData.step1Completed) {
                  setTimeout(() => {
                    updateContextData({ tabType: contextData.tabType });
                  }, 200);
                  return;
                }
              }
              updateContextData({ tabType: toTabType });
            }}
          />
        </div>

        {renderChildren}
      </div>
    </div>
  );
}
