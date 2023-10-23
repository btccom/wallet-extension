/* eslint-disable @typescript-eslint/ban-types */
import { debounce } from 'debounce';

import commonManager from '@/scripts/background/libs/manager/commonManager';
import accessManager from '@/scripts/background/libs/manager/accessManager';
import apiManager from '@/scripts/background/libs/manager/apiManager';
import walletKeyManager from '@/scripts/background/libs/manager/walletKeyManager';
import { browserStorageGet, browserStorageSet } from '@/scripts/background/utils/chrome';

interface CreateStoreParams<T> {
  name: string;
  template?: T;
}

class StorageManager {
  _cache: any;

  constructor() {
    //
  }
  persistStorage(name: string, obj: object) {
    debounce(this.setData(name, obj), 1000);
  }

  async createStorage<T extends object>({ name, template = Object.create(null) }: CreateStoreParams<T>): Promise<T> {
    //
    const tpl = template;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const createProxy = <A extends object>(obj: A): A =>
      new Proxy(obj, {
        set(target, prop, value) {
          target[prop] = value;
          self.persistStorage(name, target);

          return true;
        },

        deleteProperty(target, prop) {
          if (Reflect.has(target, prop)) {
            Reflect.deleteProperty(target, prop);
            self.persistStorage(name, target);
          }

          return true;
        }
      });
    return createProxy<T>(tpl);
  }
  async getData(prop?) {
    if (this._cache) {
      return this._cache.get(prop);
    }
    const result: any = await browserStorageGet(null);
    this._cache = new Map(Object.entries(result).map(([k, v]) => [k, v]));
    return prop ? result[prop] : result;
  }

  async setData(prop, value): Promise<void> {
    await browserStorageSet({ [prop]: value });
    this._cache.set(prop, value);
  }
  async restoreWallet() {
    //
    const keyringState = await this.getData('keyringState');
    walletKeyManager.loadStore(keyringState);
    walletKeyManager.store.subscribe((value) => this.setData('keyringState', value));
    await commonManager.init();
    await apiManager.init();
    await accessManager.init();
  }
}

export default new StorageManager();
