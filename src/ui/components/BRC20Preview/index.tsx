import { getDateShowdate } from '@/common/utils';

import { Icon } from '../Icon';
import { SatsRarityPreview } from '../SpsatsPreview';

export interface BRC20PreviewProps {
  tick: string | undefined;
  balance: string;
  inscriptionNumber: number;
  timestamp?: number;
  type?: string;
  selected?: boolean;
  satsIn?: string | number;
  tickAlignCenter?: boolean;
  item?: any;
  onClick?: () => void;
}

export default function BRC20Preview({
  tick,
  balance,
  inscriptionNumber,
  satsIn,
  type,
  selected,
  item,
  onClick
}: BRC20PreviewProps) {
  if (!balance) {
    balance = 'deploy';
  }
  let time = '';
  if (item?.timestamp) {
    const date = new Date(item?.timestamp * 1000);
    time = getDateShowdate(date);
  }
  const isUnconfirmed = !inscriptionNumber || inscriptionNumber === -1;
  const numberStr = isUnconfirmed ? 'Unconfirmed' : `#${inscriptionNumber}`;
  const textcolor = selected ? 'white-muted' : 'black-muted';
  return (
    <div
      className={`flex-col bgpreview  ${onClick ? 'pointer' : ''}`}
      style={{
        minHeight: 120,
        borderRadius: 5,
        gap: 0
      }}
      onClick={onClick}>
      <div
        className={`flex-col ${type === 'Transfer' ? (selected ? 'bg-iblue-light' : 'bgpreview') : 'bgpreview'}`}
        style={{
          padding: 8,
          minWidth: 135,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5
        }}>
        <div className="flex-row justify-end">
          {item?.spSatsTag?.length > 0 &&
            item.spSatsTag.map((v, index) => {
              return <SatsRarityPreview key={v} rarity={v} shortWidth={true} borded={true} />;
            })}
        </div>
        <div className="flex-row mb-sm justify-center">
          <div className={`text font-lg ${textcolor}`}>{tick}</div>
        </div>
        <div className={`text align-center font-xxl ${selected ? 'white-color' : 'black-color'}`}>{balance}</div>
        {satsIn && (
          <div className="flex-row justify-center mb-sm">
            <div className="text white-color font-xs bgsats rounded" style={{ padding: '2px' }}>{`${satsIn}sats`}</div>
          </div>
        )}
      </div>
      <div className={`flex-col px-md py-xs gap-zero full justify-center bg2 full-y round-bottom`}>
        <div className={`flex-row justify-between items-center`}>
          <div className={`flex-col-center gap-zero`}>
            <div className={`text full-x ${isUnconfirmed ? 'orange align-ceter' : ''}`}>{numberStr}</div>
            {isUnconfirmed === false && time && <div className={`text sub `}>{time}</div>}
          </div>
          <div>
            {type === 'Transfer' && !selected && <div className="uncheck"></div>}
            {selected && <Icon icon="circle-check" color="green" size={18} />}
          </div>
        </div>
      </div>
    </div>
  );
}
