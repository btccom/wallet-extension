
import { EVENTS } from '@/common/constant';
import eventManger from '@/common/message/eventManger';
import { PortEvent } from '@/common/message/portEvent';
const portEvent = new PortEvent();
portEvent.initialize('popup');

portEvent.listen((data) => {
  if (data.type === 'broadcast') {
    eventManger.emit(data.method, data.params);
  }
});

eventManger.on(EVENTS.broadcastToBackground, (data) => {
  portEvent.request({
    type: 'broadcast',
    method: data.method,
    params: data.data
  });
});

export const wallet: Record<string, any> = new Proxy(
  {},
  {
    get(obj, key) {
      return function (...params: any) {
        return portEvent.request({
          type: 'controller',
          method: key,
          params
        });
      };
    }
  }
);