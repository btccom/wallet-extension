import { Tooltip } from 'antd';
import { CSSProperties } from 'react';

import { Inscription } from '@/common/types';
import { getDateShowdate } from '@/common/utils';

import { SatsRarityPreview } from '../SpsatsPreview';
import './index.less';

const $fontSizeClass = {
  large: 'font-md',
  middle: 'font-sm',
  small: 'font-xxs'
};
type Types = 'large' | 'middle' | 'small' | 'small-list';

export interface InscriptionProps {
  data: Inscription;
  onClick?: (data: any) => void;
  type: Types;
  tagPosition?: 'top' | 'bottom';
  bottombgcolor?: string;
}
function SpSatsTagItems({ spSatsTag, tagPosition }) {
  return (
    <div
      className={`flex-row mt-sm ${tagPosition === 'top' ? 'justify-center' : 'justify-start'}`}
      style={{ paddingTop: '5px', paddingRight: '5px' }}>
      {spSatsTag?.map((v) => {
        return <SatsRarityPreview key={v} shortWidth={true} rarity={v} borded />;
      })}
    </div>
  );
}
export default function InscriptionPreview({
  data,
  onClick,
  type,
  tagPosition = 'top',
  bottombgcolor = ''
}: InscriptionProps) {
  const date = new Date(data.timestamp * 1000);
  const time = getDateShowdate(date);
  const isUnconfirmed = date.getTime() < 100;
  const numberStr = isUnconfirmed ? 'unconfirmed' : `# ${data.number}`;
  const spSatsTag = [...(data.spSatsTag || [])];
  if (data.hasBrc20) {
    spSatsTag?.unshift('brc20');
  }
  const tagStyle: CSSProperties = tagPosition && type === 'large' ? { right: '10px' } : {};
  return (
    <div
      onClick={onClick}
      className={`flex-col gap-zero rounded preview-container-${type} ${onClick ? 'pointer' : ''}`}>
      <iframe
        onClick={(e) => e.preventDefault()}
        className={`preview-iframe-${type}`}
        src={data.preview || ''}
        style={{ pointerEvents: 'none', width: '100%', margin: '2px auto' }}
        sandbox="allow-scripts"
        scrolling="no"
        loading="lazy"></iframe>
      <div className={`preview-iframe-${type}`} style={{ position: 'absolute', zIndex: 10 }}>
        <div className="flex-col full-y">
          {tagPosition === 'top' && <SpSatsTagItems spSatsTag={spSatsTag} tagPosition={tagPosition} />}
          <div className="flex-row full-y justify-center mb-sm">
            <Tooltip
              title={
                <div className=" wrap" style={{ width: '150px' }}>
                  The UTXO containing this inscription has {data.amount} sats
                </div>
              }
              overlayStyle={{
                fontSize: '12px'
              }}>
              <div
                style={Object.assign({}, tagStyle, {
                  position: 'absolute',
                  bottom: '10px'
                })}>
                <div
                  className="text font-xs white-color bgsats"
                  style={{
                    padding: 2,
                    borderRadius: 5,
                    paddingLeft: 4,
                    paddingRight: 4,
                    marginRight: 2
                  }}>{`${data.amount} sats`}</div>
              </div>
            </Tooltip>
          </div>
          {tagPosition === 'bottom' && (
            <div className="mb-md ml-md">
              <SpSatsTagItems spSatsTag={spSatsTag} tagPosition={tagPosition} />
            </div>
          )}
        </div>
      </div>
      <div className={`flex-col px-xs py-xs gap-zero ${bottombgcolor || 'bg-white'} full round-bottom`}>
        <div className={`text font ${isUnconfirmed ? 'orange' : 'active'} ${$fontSizeClass[type]}`}>{numberStr}</div>
        {isUnconfirmed == false && <div className={`text sub ${$fontSizeClass[type]}`}>{time}</div>}
      </div>
    </div>
  );
}
