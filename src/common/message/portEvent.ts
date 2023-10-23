import EventEmitter from 'events';

import { browserRuntimeConnect } from '@/scripts/background/utils/chrome';

import { PORT_EVENT } from '../constant';
import { MessageQueue } from './MessageQueue';

export class PortEvent extends EventEmitter {
  prefix = PORT_EVENT.prefix;
  port: any;
  listenCallback: any;
  messageQueue = new MessageQueue(800);
  constructor(port?: chrome.runtime.Port) {
    super();
    if (port) {
      this.port = port;
    }
  }
  initialize(name = '') {
    this.port = browserRuntimeConnect(undefined, name ? { name } : null);
    this._onMessage(`message`, (message) => {
      this.emit('message', message);
    });
    this._onMessage(`response`, ({ messageId, res, err }) => {
      const oMessage = this.messageQueue.getMessage(messageId);
      if (!oMessage) {
        return;
      }
      const { resolve, reject } = oMessage;
      err ? reject(err) : resolve(res);
    });
  }
  request = async (data) => {
    this.messageQueue.checkLimit();
    return new Promise((resolve, reject) => {
      const message = this.messageQueue.setMessage({
        data,
        resolve,
        reject
      });
      this.postMessage('request', message);
    });
  };
  _onMessage = (type, callback) => {
    this.port.onMessage.addListener(({ _type_, data }) => {
      if (_type_ === `${this.prefix}${type}`) {
        callback && callback(data);
      }
    });
  };
  listen = async (callback) => {
    if (!this.port) return;
    this.listenCallback = callback;
    this._onMessage('request', async ({ messageId, data }) => {
      if (this.listenCallback) {
        let res, err;

        try {
          res = await this.listenCallback(data);
        } catch (e: any) {
          err = {
            message: e.message,
            stack: e.stack
          };
          e.code && (err.code = e.code);
          e.data && (err.data = e.data);
        }

        this.postMessage('response', { messageId, res, err });
      }
    });
  };
  postMessage = (type, data) => {
    if (!this.port) return;
    try {
      this.port.postMessage({ _type_: `${this.prefix}${type}`, data });
    } catch (err) {
      //
    }
  };
  remove() {
    this.messageQueue.removeAllMessage();
    this.port.disconnect();
  }
}
