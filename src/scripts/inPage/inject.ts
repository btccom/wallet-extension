import { RequestPort } from '.';

declare global {
  interface Window {
    BtccomWallet: RequestPort;
  }
}
export function inject(provider: RequestPort) {
  if (!window.BtccomWallet) {
    window.BtccomWallet = new Proxy(provider, {
      deleteProperty: () => true
    });
  }

  Object.defineProperty(window, 'BtccomWallet', {
    value: new Proxy(provider, {
      deleteProperty: () => true
    }),
    writable: false
  });

  window.dispatchEvent(new Event('BtccomWallet#initialized'));
}
