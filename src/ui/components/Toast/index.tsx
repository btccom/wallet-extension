import { useEffect } from 'react';

import './index.less';

export type ToastTypes = keyof typeof $presetsClass;
export interface ToastProps {
  type: ToastTypes;
  message: string;
  onClose: () => void;
}
const $presetsClass = {
  info: 'bg-black-dark',
  success: 'bg-green',
  error: 'bg-danger',
  warning: 'bg-warning'
};
export function Toast(props: ToastProps) {
  const { type, message, onClose } = props;
  useEffect(() => {
    setTimeout(() => {
      // onClose();
    }, 2000);
  }, []);

  return (
    <div className="action-container">
      <div className={`toast ${$presetsClass[type]}`}>
        <div className="text align-center white-color">{message}</div>
      </div>
    </div>
  );
}
