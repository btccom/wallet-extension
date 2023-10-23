import { ethErrors } from 'eth-rpc-errors';
import { EventEmitter } from 'events';

import noticeManager from '@/scripts/background/libs/manager/noticeManager';
import sessionManager from '@/scripts/background/libs/manager/sessionManager';
import walletKeyManager from '@/scripts/background/libs/manager/walletKeyManager';
import { browserTabsOnRemoved } from '@/scripts/background/utils/chrome';

import PromiseRequest from './PromiseRequest';
import { InsideRequest } from './RequestController';
import { PortEvent } from '@/common/message/portEvent';


export const initProvider = (port) =>{

  const portEvent = new PortEvent(port);
  portEvent.listen(async (data) => {
    const sessionId = port.sender?.tab?.id;
    const session = sessionManager.getOrCreateSession(sessionId);

    const req = { data, session };
    req.session.postMessage = (event, data) => {
      portEvent.postMessage('message', { event, data });
    };
    return ProviderController(req);
  });
}
const tabEvent = new EventEmitter();

browserTabsOnRemoved((tabId) => {
  tabEvent.emit('tabRemove', tabId);
  sessionManager.deleteSession(tabId);
});

async function ProviderController(req) {
  const {
    data: { method }
  } = req;

  if (InsideRequest[method]) {
    return InsideRequest[method](req);
  }

  const hasVault = walletKeyManager.hasVault();
  if (!hasVault) {
    //for first time open wallet
    if (method === 'requestAccounts') {
      noticeManager.requestNotice({ lock: true });
    }
    throw ethErrors.provider.userRejectedRequest({
      message: 'Create an account first.'
    });
  }
  return PromiseRequest(req);
}

export default ProviderController;
