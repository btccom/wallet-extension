import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { BRC20_EXPLORER_URL } from '@/common/constant';
import { Inscription, SpSatInfo } from '@/common/types';
import { Footer, Header, LoadingIcon, Segmented } from '@/ui/components';
import { Empty } from '@/ui/components/Empty';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { NavTabBar } from '@/ui/components/NavTabBar';
import SpsatsPreview from '@/ui/components/SpsatsPreview';
import { useNavigate } from '@/ui/router';
import { useInscriptionsTab } from '@/ui/store/common/hook';
import { commonActions } from '@/ui/store/common/reducer';
import { useAccountAddress } from '@/ui/store/ui/hooks';
import { handleListAddMultTag, useWallet } from '@/ui/utils';
import { InfoCircleOutlined } from '@ant-design/icons';

const InscriptionTabItems = () => {
  const navigate = useNavigate();
  const [inscriptionList, setInscriptionList] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();
  const address = useAccountAddress();
  const fetchData = async () => {
    setLoading(true);
    const { list, utxos } = await wallet.getAddressInscriptions(address, 1, 20);
    const newList = handleListAddMultTag(list, utxos);
    setInscriptionList(newList || []);
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="flex-col-center" style={{ minHeight: 150 }}>
        <LoadingIcon />
      </div>
    );
  }

  if (inscriptionList.length === 0) {
    return (
      <div className="flex-col-center" style={{ minHeight: 150 }}>
        <Empty value="Empty" />
      </div>
    );
  }
  return (
    <div className="grid pt-sm" style={{ gridTemplateColumns: 'repeat(3,minmax(0, 1fr))' }}>
      {inscriptionList.map((v) => {
        v.address = address;
        v.content = `${BRC20_EXPLORER_URL}/content/${v.txid}`;
        return (
          <div className="flex-row-center" key={`${v.id}${v.number}${v.index}`}>
            <InscriptionPreview
              onClick={() => {
                navigate('InscriptionsDetailPage', { inscription: v });
              }}
              type="small-list"
              data={v}
            />
          </div>
        );
      })}
    </div>
  );
};

const SatsTabItems = () => {
  const navigate = useNavigate();
  const [spSatList, setSpSatList] = useState<SpSatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();
  const address = useAccountAddress();
  const fetchData = async () => {
    setLoading(true);
    const { spSat, satUtxo } = await wallet.getSpSats(address);

    const newSpSat = handleListAddMultTag(spSat, satUtxo, true);
    newSpSat.map((v) => {
      const data = satUtxo.filter((u) => {
        const spSats = u.spSats.filter((spSatsItem) => {
          return spSatsItem.id === v.id;
        });
        return spSats.length > 0;
      });
      v.sats = data[0] ? Number(data[0].amount) : 0;
      return v;
    });
    setSpSatList(newSpSat);
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);
  if (loading) {
    return (
      <div style={{ minHeight: 150 }} className="flex-col-center">
        <LoadingIcon />
      </div>
    );
  }

  if (spSatList.length === 0) {
    return (
      <div style={{ minHeight: 150 }} className="flex-col-center">
        <Empty value="Empty" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-col">
        <div>
          <div className="text black-muted font-sm align-left items-center">
            {`Rare(${spSatList.length})`}
            <Tooltip
              placement="topLeft"
              arrowPointAtCenter={false}
              title={
                <>
                  <div>Rare Satoshi Supply </div>
                  <div>
                    <ul>
                      <li>common: 2.1 quadrillion</li>
                      <li>uncommon: 6,929,999</li>
                      <li> rare: 3437</li>
                      <li> epic: 32</li>
                      <li> legendary: 5</li>
                      <li>mythic: 1</li>
                    </ul>
                  </div>
                  <div>
                    At the moment, even uncommon satoshis are quite rare. As of this writing, 745,855 uncommon satoshis
                    have been mined - one per 25.6 bitcoin in circulation.
                  </div>
                </>
              }>
              <InfoCircleOutlined className="px-xs pointer" />
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="grid pt-sm" style={{ gridTemplateColumns: 'repeat(2 ,minmax(0, 1fr))' }}>
        {spSatList.map((v) => {
          return (
            <div key={`${v.id}`} className="flex-row items-center">
              <SpsatsPreview
                data={v}
                onClick={() => {
                  navigate('SpSatsDetailPage', { spsatsInfo: v });
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default function InscriptionPage() {
  const tabType = useInscriptionsTab();
  const dispatch = useDispatch();
  const tabOptions = [
    { label: 'Inscriptions', value: 'inscriptions' },
    { label: 'Sats', value: 'sats' }
  ];
  const onChange = (val) => {
    dispatch(commonActions.setInscriptionsTab(val));
  };
  return (
    <div className="container">
      <Header />
      <div className="view">
        <Segmented options={tabOptions} activeKey={tabType} onChange={(v) => onChange(v)} />
        {tabType === 'inscriptions' && <InscriptionTabItems />}
        {tabType === 'sats' && <SatsTabItems />}
      </div>
      <Footer className="padding-zero" preset="fixed">
        <NavTabBar tab="mint" />
      </Footer>
    </div>
  );
}
