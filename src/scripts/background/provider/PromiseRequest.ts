import { ethErrors } from 'eth-rpc-errors';
import compose from 'koa-compose';
import 'reflect-metadata';

import { EVENTS } from '@/common/constant';
import eventManger from '@/common/message/eventManger';
import { ALL_CHAINS } from '@/common/types';
import accessManager from '@/scripts/background/libs/manager/accessManager';
import noticeManager from '@/scripts/background/libs/manager/noticeManager';
import walletKeyManager from '@/scripts/background/libs/manager/walletKeyManager';
import { underline2Camelcase } from '@/scripts/background/utils';

import RequestController from './RequestController';

class PromiseRequest {
  private _tasks: ((args: any) => void)[] = [];
  _context: any = {};
  requestedNotice = false;

  add(fn: any): PromiseRequest {
    if (typeof fn !== 'function') {
      throw new Error('promise need function to handle');
    }
    this._tasks.push(fn);

    return this;
  }

  run() {
    return compose(this._tasks);
  }
}
const isSignNotice = (type: string) => ['deposit'].includes(type);
const windowHeight = 600;
const promiseRequest = new PromiseRequest();
const requestContext = promiseRequest
  .add(async (ctx, next) => {
    // check method
    const {
      data: { method }
    } = ctx.request;
    ctx.mapMethod = underline2Camelcase(method);

    if (!RequestController[ctx.mapMethod]) {
      throw ethErrors.rpc.methodNotFound({
        message: `method [${method}] doesn't has corresponding handler`,
        data: ctx.request.data
      });
    }

    return next();
  })
  .add(async (ctx, next) => {
    const { mapMethod } = ctx;
    if (!Reflect.getMetadata('SAFE', RequestController, mapMethod)) {
      // check lock
      const isUnlock = walletKeyManager.memStore.getState().isUnlocked;

      if (!isUnlock) {
        ctx.request.requestedNotice = true;
        await noticeManager.requestNotice({ lock: true });
      }
    }

    return next();
  })
  .add(async (ctx, next) => {
    // check connect
    const {
      request: {
        session: { origin, name, icon }
      },
      mapMethod
    } = ctx;
    if (!Reflect.getMetadata('SAFE', RequestController, mapMethod)) {
      if (!accessManager.hasPermission(origin)) {
        ctx.request.requestedNotice = true;
        await noticeManager.requestNotice(
          {
            params: {
              method: 'connect',
              data: {},
              session: { origin, name, icon }
            },
            noticeComponent: 'Connect'
          },
          { height: windowHeight }
        );
        accessManager.addAccessSite(origin, name, icon, ALL_CHAINS.BTC);
      }
    }

    return next();
  })

  .add(async (ctx, next) => {
    // check need approval
    const {
      request: {
        data: { params, method },
        session: { origin, name, icon }
      },
      mapMethod
    } = ctx;
    const [noticeType, condition, options = {}] = Reflect.getMetadata('NOTICE', RequestController, mapMethod) || [];

    if (noticeType && (!condition || !condition(ctx.request))) {
      ctx.request.requestedNotice = true;
      ctx.noticeRes = await noticeManager.requestNotice(
        {
          noticeComponent: noticeType,
          params: {
            method,
            data: params,
            session: { origin, name, icon }
          },
          origin
        },
        { height: windowHeight }
      );
      if (isSignNotice(noticeType)) {
        accessManager.updateAccessSite(origin, { isSigned: true }, true);
      } else {
        accessManager.touchAccessSite(origin);
      }
    }

    return next();
  })
  .add(async (ctx) => {
    const { noticeRes, mapMethod, request } = ctx;
    // process request
    const [approvalType] = Reflect.getMetadata('NOTICE', RequestController, mapMethod) || [];

    const { uiRequestComponent, ...rest } = noticeRes || {};
    const {
      session: { origin }
    } = request;
    const requestDefer = Promise.resolve(
      RequestController[mapMethod]({
        ...request,
        noticeRes
      })
    );

    requestDefer
      .then((result) => {
        if (isSignNotice(approvalType)) {
          eventManger.emit(EVENTS.broadcastToExtension, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: true,
              data: result
            }
          });
        }
        return result;
      })
      .catch((e: any) => {
        if (isSignNotice(approvalType)) {
          eventManger.emit(EVENTS.broadcastToExtension, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: false,
              errorMsg: JSON.stringify(e)
            }
          });
        }
      });
    async function requestNoticeLoop({ uiRequestComponent, ...rest }) {
      ctx.request.requestedNotice = true;
      const res = await noticeManager.requestNotice({
        noticeComponent: uiRequestComponent,
        params: rest,
        origin,
        approvalType
      });
      if (res.uiRequestComponent) {
        return await requestNoticeLoop(res);
      } else {
        return res;
      }
    }
    if (uiRequestComponent) {
      ctx.request.requestedNotice = true;
      return await requestNoticeLoop({ uiRequestComponent, ...rest });
    }

    return requestDefer;
  })
  .run();

export default (request) => {
  const ctx: any = { request: { ...request, requestedNotice: false } };
  return requestContext(ctx).finally(() => {
    if (ctx.request.requestedNotice) {
      promiseRequest.requestedNotice = false;
      // only unlock notification if current flow is an notice flow
      noticeManager.unLock();
    }
  });
};
