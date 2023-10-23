import { ethErrors } from 'eth-rpc-errors';
import { EthereumProviderError } from 'eth-rpc-errors/dist/classes';
import Events from 'events';

import winMgr from '@/scripts/background/utils/window';

interface Notice {
  data: {
    state: number;
    params?: any;
    origin?: string;
    noticeComponent: string;
    requestDefer?: Promise<any>;
    noticeType: string;
  };
  resolve(params?: any): void;
  reject(err: EthereumProviderError<any>): void;
}

// something need user notice in window
// should only open one window, unfocus will close the current notification
class NoticeService extends Events {
  notice: Notice | null = null;
  notifiWindowId = 0;
  isLocked = false;

  constructor() {
    super();

    winMgr.event.on('windowRemoved', (winId: number) => {
      if (winId === this.notifiWindowId) {
        this.notifiWindowId = 0;
        this.rejectNotice();
      }
    });
  }

  getNotice = () => this.notice?.data;

  resolveNotice = (data?: any, forceReject = false) => {
    if (forceReject) {
      this.notice?.reject(new EthereumProviderError(4001, 'User Cancel'));
    } else {
      this.notice?.resolve(data);
    }
    this.notice = null;
    this.emit('resolve', data);
  };

  rejectNotice = async (err?: string, stay = false, isInternal = false) => {
    if (!this.notice) return;
    if (isInternal) {
      this.notice?.reject(ethErrors.rpc.internal(err));
    } else {
      this.notice?.reject(ethErrors.provider.userRejectedRequest<any>(err));
    }

    await this.clear(stay);
    this.emit('reject', err);
  };

  requestNotice = async (data, winProps?): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.notice = {
        data,
        resolve,
        reject
      };

      this.openNotification(winProps);
    });
  };

  clear = async (stay = false) => {
    this.notice = null;
    if (this.notifiWindowId && !stay) {
      await winMgr.remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
  };

  unLock = () => {
    this.isLocked = false;
  };

  lock = () => {
    this.isLocked = true;
  };

  openNotification = (winProps) => {
    // if (this.isLocked) return;
    // this.lock();
    if (this.notifiWindowId) {
      winMgr.remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
    winMgr.openNotification(winProps).then((winId) => {
      this.notifiWindowId = winId!;
    });
  };
}

export default new NoticeService();
