import { EVENTS } from '@/common/constant';
import eventManger from '@/common/message/eventManger';
import { PortEvent } from '@/common/message/portEvent';
import commonManager from '@/scripts/background/libs/manager/commonManager';
import storageManager from '@/scripts/background/libs/manager/storageManager';
import { initProvider } from '@/scripts/background/provider';
import {
  browserRuntimeOnConnect,
  browserRuntimeOnInstalled,
  openExtensionInTab
} from '@/scripts/background/utils/chrome';
import walletController from '@/scripts/background/walletController';

import transactionController from './transactionController';
import { StayAlive } from './keepAlive';

let appBackgroundServiceLoaded = false;


  const openStartPageWhenInstall = () => {
    if (appBackgroundServiceLoaded) {
      openExtensionInTab();
      return;
    }
    setTimeout(() => {
      openStartPageWhenInstall();
    }, 1000);
  };

async function initBackgroundService() {
  await storageManager.restoreWallet();
  appBackgroundServiceLoaded = true;
}
async function initEvent() {
  // for page provider
  browserRuntimeOnConnect((port) => {
    if (port.name === 'popup' || port.name === 'notification' || port.name === 'tab') {
      const portEvent = new PortEvent(port);
      portEvent.listen((data) => {
        if (data?.type) {
          switch (data.type) {
            case 'broadcast':
              eventManger.emit(data.method, data.params);
              break;
            case 'controller':
            default:
              if (data.method && transactionController[data.method]) {
                return transactionController[data.method].apply(null, data.params);
              }
              if (data.method) {
                return walletController[data.method].apply(null, data.params);
              }
          }
        }
      });

      const boardcastCallback = (data: any) => {
        portEvent.request({
          type: 'broadcast',
          method: data.method,
          params: data.params
        });
      };

      if (port.name === 'popup') {
        commonManager.setPopupOpen(true);

        port.onDisconnect.addListener(() => {
          commonManager.setPopupOpen(false);
        });
      }

      eventManger.on(EVENTS.broadcastToExtension, boardcastCallback);
      port.onDisconnect.addListener(() => {
        eventManger.on(EVENTS.broadcastToExtension, boardcastCallback);
      });

      return;
    }
    initProvider(port);
  });
  browserRuntimeOnInstalled(async (details) => {
    if (details.reason === 'install') {
      openStartPageWhenInstall();
    }
  });
}

initBackgroundService();
initEvent();
StayAlive();
