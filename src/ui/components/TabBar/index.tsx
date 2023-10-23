/* eslint-disable indent */
import { useEffect, useState } from 'react';

import './index.less';

interface TabProps {
  key: string | number;
  label: string;
}

interface TabBarProps {
  defaultActiveKey?: string | number;
  activeKey?: string | number;
  items: TabProps[];
  onTabClick: (string) => void;
  progressEnabled?: boolean;
}

export function TabBar(props: TabBarProps) {
  const { items, defaultActiveKey, activeKey, onTabClick, progressEnabled } = props;
  const [tabKey, setTabKey] = useState(defaultActiveKey);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const curIndex = items.findIndex((v) => v.key === tabKey);
    setProgress(curIndex);
    onTabClick(tabKey);
  }, [tabKey]);

  useEffect(() => {
    if (activeKey !== tabKey) {
      setTabKey(activeKey);

      const curIndex = items.findIndex((v) => v.key === activeKey);
      setProgress(curIndex);
    }
  }, [activeKey]);

  return (
    <div className="flex-row">
      {items.map((v, index) => {
        const isSelected = v.key === tabKey;
        if (progressEnabled && index > progress) {
          return (
            <div className="flex-col" key={v.key}>
              <div className="text textDim">{v.label}</div>
            </div>
          );
        } else {
          return (
            <div
              className={`flex-col ${isSelected ? 'selected-tab' : ''}`}
              key={v.key}
              onClick={() => {
                setTabKey(v.key);
              }}>
              <div className={`text ${isSelected ? 'active' : 'text-color'}`}>{v.label}</div>
            </div>
          );
        }
      })}
    </div>
  );
}
