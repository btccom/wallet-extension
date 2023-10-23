// import extension from 'extensionizer';
import { v4 as uuid } from 'uuid';

import { WindowMessage } from '@/common/message/WindowMessage';
import { PortEvent } from '@/common/message/portEvent';
import shouldInjectProvider from '@/common/provider-injection';

function injectScript() {
  const channel = uuid();
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.setAttribute('channel', channel);
    scriptTag.src = chrome.runtime.getURL('inPage.js');
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);

    const portEvent = new PortEvent();
    portEvent.initialize();
    const internalMessage = new WindowMessage(channel);
    internalMessage.listen((data) => {
      return portEvent.request(data);
    });
    portEvent.on('message', (data) => {
      internalMessage.postMessage('message', data);
    });

    document.addEventListener('beforeunload', () => {
      portEvent.remove();
      internalMessage.remove();
    });
  } catch (error) {
    console.error('Btcm: Provider injection failed.', error);
  }
}

if (shouldInjectProvider()) {
  injectScript();
}
