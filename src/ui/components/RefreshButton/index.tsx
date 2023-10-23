import { ReactEventHandler, useState } from 'react';

import { ReloadOutlined } from '@ant-design/icons';

export function RefreshButton({ onClick }: { onClick: ReactEventHandler<HTMLDivElement> }) {
  const [leftTime, setLeftTime] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const wait = (seconds: number) => {
    if (seconds > 0) {
      setLeftTime(seconds);
      setTimeout(() => {
        wait(seconds - 1);
      }, 1000);
      return;
    }
    setDisabled(false);
  };

  return (
    <div
      className="flex-row items-center pointer"
      onClick={(e) => {
        if (disabled) {
          return;
        }
        setDisabled(true);
        wait(5);
        onClick(e);
      }}>
      <ReloadOutlined className="iblue" style={{ fontSize: 12 }} />
      <div className="text font-sm black align-center iblue">{disabled ? `${leftTime} secs` : 'Refresh'}</div>
    </div>
  );
}
