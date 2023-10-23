import { Tooltip } from 'antd';

import { Brc20Ticks } from '@/common/types';
import { numberAdd } from '@/common/utils';

export interface BRC20BalanceBarProps {
  tickBanlance: Brc20Ticks;
  onClick?: () => void;
  onSendClick?: (event: any) => void;
  hideMoney?: boolean;
}

const showMoney = (text: string | number | undefined, hideMoney: boolean) => {
  if (hideMoney) return '********';
  return text || '--';
};
export default function BRC20BalanceBar(props: BRC20BalanceBarProps) {
  const {
    tickBanlance: { tick, transferable, available },
    hideMoney = false,
    onClick,
    onSendClick
  } = props;
  return (
    <div
      className="card rounded pointer"
      style={{
        borderWidth: 0,
        minWidth: 150,
        width: '100%'
      }}
      onClick={onClick}>
      <div className="flex-col full">
        <div className="flex-row-between">
          <span className="text font-md">{tick} </span>
          <Tooltip
            title="The transferable amount is the balance that has been inscribed into transfer inscriptions but has not yet been sent."
            placement='topRight'
            overlayStyle={{
              fontSize: '12px'
            }}>
            <span className="text font-sm iblue" onClick={onSendClick}>
              Send
            </span>
          </Tooltip>
        </div>

        <div className="flex-row-between">
          <span className="textDim font-xs">Balance</span>
          <span className="text font-xs">{showMoney(numberAdd(transferable, available), hideMoney)}</span>
        </div>
      </div>
    </div>
  );
}
