import EventEmitter from 'events';

import { MessageQueue } from './MessageQueue';

interface MessageData<T> {
  channel: string;
  data: T;
}
export class WindowMessage<T> extends EventEmitter {
  channelName: string;
  origin: string;
  listenCallback: any;
  messageEventHandler: any = [];
  messageQueue = new MessageQueue(800);
  constructor(channelName: string, origin = '') {
    super();
    this.channelName = channelName;
    this.origin = window.top?.location.origin || '*';

    this._onMessage('response', (message) => {
      const { messageId, res, err } = message;
      const oMessage = this.messageQueue.getMessage(messageId);
      if (!oMessage) {
        return;
      }
      const { resolve, reject } = oMessage;
      err ? reject(err) : resolve(res);
    });
    this._onMessage('message', (message) => {
      this.emit('message', message);
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

  _onMessage = (_type, callback) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _self = this;
    function handler(event) {
      let oMessage = event.data;
      if (typeof oMessage !== 'object') {
        try {
          oMessage = JSON.parse(oMessage);
        } catch (err) {
          //
          oMessage = {};
        }
      }
      const { channel, type, message } = oMessage;
      if (channel === _self.channelName && type === _type) {
        // this.onRequest(message);
        callback && callback(message);
      }
    }
    this.messageEventHandler.push(handler);
    window.addEventListener('message', handler);
  };
  // };
  listen = async (callback) => {
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
  postMessage = (type, message) => {
    const channel = this.channelName;
    window.postMessage({ channel, type, message }, this.origin);
  };

  remove = () => {
    this.messageQueue.removeAllMessage();
    this.messageEventHandler.forEach((handler) => {
      window.removeEventListener('message', handler);
    });
  };
}
