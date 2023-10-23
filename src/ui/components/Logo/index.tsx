import { Image } from 'antd';

import { FONT_SIZE } from '@/ui/utils/constans';

export function Logo(props: { type?: 'large' | 'small' }) {
  const { type } = props;
  const textClassName = type === 'large' ? 'font-xxl' : '';
  const width = type === 'large' ? FONT_SIZE.xxxl : FONT_SIZE.xl;
  return (
    <div className="flex-row-center gap-md">
      <Image src="./images/logo/wallet-logo.png" preview={false} width={width} />
      <span className={`font-bold ${textClassName}`}>BTC.com</span>
    </div>
  );
}
