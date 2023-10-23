import React, { ReactNode, useCallback, useContext, useRef, useState } from 'react';

import { useExtensionIsInTab } from '@/scripts/background/utils/chrome';

import { Loading } from '../components';
import { Toast, ToastTypes } from '../components/Toast';

const commonContext = {
  toast: (message, type: ToastTypes) => {
    // todo
  },
  loading: (show: boolean) => {
    // todo
    if (show) {
      return <Loading />;
    } else {
      return <></>;
    }
  }
};
function LoadingView({ handler }) {
  const [loading, setLoading] = useState<boolean>(false);
  handler.loading = useCallback((loading: boolean) => {
    setLoading(loading);
  }, []);
  if (loading) {
    return <Loading />;
  } else {
    return <div />;
  }
}
function ToastView({ handler }) {
  const [toasts, setToasts] = useState<any>([]);
  const ref = useRef<any>({
    toasts: []
  });
  const self = ref.current;
  const basicToast = useCallback(
    (message: string, type?: ToastTypes) => {
      const key = 'key' + Math.random();
      self.toasts.push({
        key,
        props: {
          type: type || 'info',
          message,
          onClose: () => {
            self.toasts = self.toasts.filter((v) => v.key !== key);
            setToasts(self.toasts.map((v) => v));
          }
        }
      });
      setToasts(self.toasts.map((v) => v));
    },
    [toasts]
  );

  handler.toast = useCallback(
    (message: string, type: ToastTypes) => {
      basicToast(message, type);
    },
    [basicToast]
  );

  return (
    <div>
      {toasts.map(({ key, props }) => (
        <Toast key={key} {...props} />
      ))}
    </div>
  );
}

const HelperContext = React.createContext<any>(commonContext);
export const HelperProvider = ({ children }: { children?: ReactNode }) => {
  const extensionIsInTab = useExtensionIsInTab();
  const ref = useRef<any>(commonContext);
  const self = ref.current;
  return (
    <HelperContext.Provider value={self}>
      <div
        style={{
          width: extensionIsInTab ? '100vw' : '375px',
          height: extensionIsInTab ? '100vh' : '600px'
        }}>
        {children}
      </div>
      <LoadingView handler={self} />
      <ToastView handler={self} />
    </HelperContext.Provider>
  );
};
export function useHelper() {
  return useContext(HelperContext);
}
