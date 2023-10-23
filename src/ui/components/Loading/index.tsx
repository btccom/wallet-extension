import React from 'react';

import { LoadingIcon } from '@/ui/components/LoadingIcon';

import './index.less';

export interface LoadingProps {
  text?: string;
  onClose?: () => void;
}

export function Loading(props: LoadingProps) {
  const { text } = props;
  return (
    <div className="loading-container">
      <div className=" iblue loading-inner">
        <div className="mask"></div>
        <LoadingIcon className="font-sm" />
        {text && <div className="text iblue">{text}</div>}
      </div>
    </div>
  );
}
