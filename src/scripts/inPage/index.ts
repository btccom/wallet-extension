// this script is injected into webpage's context
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { EventEmitter } from 'events';

import { log } from '@/common/log';
import { WindowMessage } from '@/common/message/WindowMessage';

import { domReady, getWebisteInfo } from './DomReady';
import { inject } from './inject';
import ReadyPromise from './readyPromise';

const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'BTC.com';

export interface Interceptor {
  onRequest?: (data: any) => any;
  onResponse?: (res: any, data: any) => any;
}

export class RequestPort {
  services: BtccomWalletService;
  constructor(services: BtccomWalletService) {
    this.services = services;

    this.keepAlive();
  }
  /**
   * keep app alive
   */
  private keepAlive = () => {
    this.services
      .request({
        method: 'keepAlive',
        params: {}
      })
      .then((v) => {
        setTimeout(() => {
          this.keepAlive();
        }, 1000);
      });
  };
  // public methods
  requestAccounts = async () => {
    return this.services.request({
      method: 'requestAccounts'
    });
  };

  getAccounts = async () => {
    return this.services.request({
      method: 'getAccounts'
    });
  };
  signTransaction = async ({ psbt }: { psbt: string }) => {
    return this.services.request({
      method: 'signTransaction',
      params: {
        psbt
      }
    });
  };
  deposit = async ({
    toAddress,
    amount,
    type,
    tick
  }: {
    toAddress: string;
    amount: number;
    type: 'btc' | 'brc20';
    tick?: string;
  }) => {
    return this.services.request({
      method: 'deposit',
      params: {
        toAddress,
        amount,
        type,
        tick
      }
    });
  };
  disconnect = async () => {
    return this.services.request({
      method: 'disconnected'
    });
  };
  getLoginSign = async (message: string) => {
    return this.services.request({
      method: 'getLoginSign',
      params: {
        message
      }
    });
  };
  onAccountChanged = (callback: (data: any) => any) => {
    this.services.on('accountsChanged', (data) => {
      callback && callback(data);
    });
  };
}

export class BtccomWalletService extends EventEmitter {
  private _requestPromise = new ReadyPromise(0);

  private messageHandler = new WindowMessage(channelName);

  constructor({ maxListeners = 100 } = {}) {
    super();
    this.setMaxListeners(maxListeners);
    this.initialize();
  }

  initialize = async () => {
    document.addEventListener('visibilitychange', this._requestPromiseCheckVisibility);
    this.messageHandler.on('message', ({ event, data }) => {
      log('[status change event]', event, data);
      this.emit(event, data);
    });
    domReady(async () => {
      const { origin, icon, name } = getWebisteInfo();
      this.messageHandler.request({
        method: 'initSessionInfo',
        params: { icon, name, origin }
      });
    });
  };

  private _requestPromiseCheckVisibility = () => {
    if (document.visibilityState === 'visible') {
      this._requestPromise.check(1);
    } else {
      this._requestPromise.uncheck(1);
    }
  };

  public request = async (data) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return this._requestPromise.call(() => {
      log('[request]', JSON.stringify(data, null, 2));
      return this.messageHandler
        .request(data)
        .then((res) => {
          log('[request: success]', data.method, res);
          return res;
        })
        .catch((err) => {
          log('[request: error]', data.method, serializeError(err));
          throw serializeError(err);
        });
    });
  };
}

const btccomWalletService = new BtccomWalletService();
inject(new RequestPort(btccomWalletService));
