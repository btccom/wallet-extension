import { useMemo } from 'react';

import { LeftOutlined } from '@ant-design/icons';

import { Logo } from '../Logo';
import './index.module.less';

interface HeaderProps {
  onBack?: () => void;
  title?: any;
  Left?: React.ReactNode;
  Right?: React.ReactNode;
  children?: React.ReactNode;
  hideLeft?: boolean;
}

export function Header(props: HeaderProps) {
  const { onBack, title, Left, Right, children, hideLeft = false } = props;

  const CenterComponent = useMemo(() => {
    if (children) {
      return children;
    } else if (title) {
      return <span className="text font-bold font-sm">{title}</span>;
    } else {
      return <Logo type="small" />;
    }
  }, [title]);
  return (
    <div style={{ display: 'block' }}>
      <div
        className="flex-row-between items-center"
        style={{
          height: '67.5px',
          padding: 18
        }}>
        {!hideLeft && (
          <div className="flex-row full">
            <div className="flex-col align-self-center">
              {Left}
              {onBack && (
                <div
                  className="pointer flex-row"
                  onClick={(e) => {
                    onBack();
                  }}>
                  <LeftOutlined className="font-lg" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-row items-center">{CenterComponent}</div>

        <div className="flex-row full justify-end">
          <div className="flex-col align-self-center">{Right}</div>
        </div>
      </div>
    </div>
  );
}
