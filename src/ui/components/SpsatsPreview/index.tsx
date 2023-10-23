import { Tooltip } from 'antd';

import { SpSatInfo, SP_SATS_TYPE } from '@/common/types';

export interface SpsatsPreviewProps {
  data: SpSatInfo;
  onClick?: () => void;
  type?: string;
  size?: string;
  preset?: string;
}
const SP_SATS_TYPE_BGCOLOR = {
  mythic: 'rgba(132, 0, 255, 0.75)',
  legendary: 'rgba(2, 125, 180, 0.95)',
  epic: 'rgba(0, 191, 191, 1)',
  rare: 'rgba(191, 191, 0, 1)',
  uncommon: 'rgba(184, 116, 26, 1)',
  common: 'rgba(170, 170, 170, 0.75)',
  inscription: 'rgb(250, 205, 145)',
  brc20: 'rgb(26, 126, 227)'
};
const SP_SATS_TYPE_TIPS = {
  mythic: 'The first sat of the genesis block',
  legendary: 'The first sat of each cycle',
  epic: 'The first sat of each halving epoch',
  rare: 'The first sat of each difficulty adjustment period',
  uncommon: 'The first sat of each block',
  common: 'Any sat that is not the first sat of its block',
  inscription: 'The UTXO contains inscriptions.',
  brc20: 'The UTXO contains BRC-20 token.'
};
export function SatsRarityPreview({
  rarity,
  shortWidth,
  borded,
  preset
}: {
  rarity: string;
  shortWidth?: boolean;
  borded?: boolean;
  preset?: string;
}) {
  rarity = rarity.toLowerCase();
  return (
    <Tooltip
      title={SP_SATS_TYPE_TIPS[rarity]}
      placement={preset === 'center' ? 'top' : preset === 'right' ? `topRight` : `topLeft`}
      arrowPointAtCenter={true}
      autoAdjustOverflow={true}
      overlayStyle={{
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }}>
      <div
        className="text white-color font-xs align-center"
        style={{
          backgroundColor: SP_SATS_TYPE_BGCOLOR[rarity] || 'inherit',
          padding: `${shortWidth ? '2px 2px' : '2px 2px'}`,
          minWidth: '20px',
          borderRadius: borded ? '5px' : 0
        }}>
        {SP_SATS_TYPE[rarity.toUpperCase()]}
      </div>
    </Tooltip>
  );
}

function Tags({ data, isDetail = false, preset = '' }) {
  return (
    <div className={`flex-row ${isDetail ? 'justify-start' : 'justify-center'}`}>
      {data.hasInscription && <SatsRarityPreview rarity={'inscription'} borded preset={preset} />}
      {data.hasBrc20 && <SatsRarityPreview rarity={'brc20'} borded preset={preset} />}
      <SatsRarityPreview rarity={data.rarity} borded preset={preset} />
    </div>
  );
}
export default function SpsatsPreview({ data, type, onClick, size = 'sm', preset = '' }: SpsatsPreviewProps) {
  return (
    <div
      className={`flex-col bgpreview ${onClick ? 'pointer' : ''}`}
      style={{
        width: type === 'detail' ? '100%' : 160,
        height: 130,
        minWidth: 100,
        minHeight: 130,
        borderRadius: 5
      }}
      onClick={onClick}>
      <div
        className="flex-col"
        style={{
          padding: 8,
          height: 96,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5
        }}>
        {type !== 'detail' && <Tags data={data} isDetail={false} preset={preset} />}
        <div className={`flex-row justify-center ${type === 'detail' ? 'pt-xl' : 'pt-sm'}`}>
          <div className={`text black-muted align-center font-${size}`}>{data.name}</div>
        </div>
        <div className="flex-row justify-center">
          <div className={`text black-color align-center font-${size}`}>{data.id}</div>
        </div>
      </div>

      <div className="flex-col px-sm gap-sm">
        <div className={`flex-row ${type === 'detail' ? 'justify-between' : 'justify-center'}`}>
          {type === 'detail' && <Tags data={data} isDetail={true} />}
          <Tooltip
            title={
              <div className=" wrap" style={{ width: '150px' }}>
                The UTXO containing this Satoshi has {data.sats} sats
              </div>
            }
            overlayStyle={{
              fontSize: '12px'
            }}>
            <div
              className="text white-color font-xs align-center bgsats rounded"
              style={{
                padding: '2px 5px'
              }}>{`${data.sats}sats`}</div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
