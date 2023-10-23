import { ethErrors } from 'eth-rpc-errors';

const { v4: uuidv4 } = require('uuid');

export class MessageQueue<T> {
  queue: any;
  maxMessageCount: number;
  constructor(maxMessageCount) {
    this.queue = {};
    this.maxMessageCount = maxMessageCount || 100;
  }

  setMessage(message: any) {
    this.checkLimit();
    const messageId = uuidv4();
    const { data } = message;
    this.queue[messageId] = message;
    return { messageId, data };
  }

  getMessage(messageId) {
    if (this.getMessageCount() === 0) {
      return;
    }
    const message = this.queue[messageId];
    delete this.queue[messageId];
    return message;
  }

  getMessageCount() {
    return Object.keys(this.queue).length;
  }
  checkLimit() {
    if (this.getMessageCount() >= this.maxMessageCount) {
      throw ethErrors.rpc.limitExceeded();
    }
  }
  removeAllMessage() {
    Object.values(this.queue).forEach((item: any) => {
      item.reject(ethErrors.provider.userRejectedRequest());
    });
    this.queue = {};
  }
}
