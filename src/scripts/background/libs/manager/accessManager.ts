import { PERMISSION_ORIGIN } from '@/common/constant';
import { AccessSite, ALL_CHAINS } from '@/common/types';

import storageManager from './storageManager';

export type AccessStore = {
  cache: AccessSite[];
};

class AccessService {
  store: AccessStore = {
    cache: []
  };
  _cache: Map<string, any> = new Map();
  maxAge = 3600 * 1e3;
  init = async () => {
    const storage = await storageManager.createStorage<AccessStore>({
      name: 'access'
    });
    this.store = storage || this.store;
    this.store.cache = this.store.cache || [];
    this.storeToCache();
  };

  getWithoutUpdate = (key: string) => {
    return this._cache.get(key);
  };
  cacheToStore = () => {
    this._cache.forEach((item, origin) => {
      if (item.expireTime >= Date.now()) {
        this.store.cache.push(item);
      }
    });
  };
  storeToCache = () => {
    this._cache = new Map();
    this.store.cache.forEach((item) => {
      if (item.expireTime >= Date.now()) {
        this._cache.set(item.origin, item);
      }
    });
  };
  touchAccessSite = (origin) => {
    if (origin === PERMISSION_ORIGIN) return;
    this.cacheToStore();
  };

  addAccessSite = (origin: string, name: string, icon: string, defaultChain: ALL_CHAINS.BTC, isSigned = false) => {
    this._cache.set(origin, {
      origin,
      name,
      icon,
      chain: defaultChain,
      isSigned,
      isTop: false,
      isConnected: true,
      expireTime: this.getExpiredTime()
    });
    this.cacheToStore();
  };

  updateAccessSite = (origin: string, value: Partial<AccessSite>, partialUpdate?: boolean) => {
    if (origin === PERMISSION_ORIGIN) return;

    if (partialUpdate) {
      const originData = this._cache.get(origin);
      this._cache.set(origin, { ...originData, expireTime: this.getExpiredTime(), ...value });
    } else {
      value.expireTime = this.getExpiredTime();
      this._cache.set(origin, value as AccessSite);
    }
  };

  hasPermission = (origin) => {
    if (origin === PERMISSION_ORIGIN) return true;

    const site = this._cache.get(origin);
    return site && site.isConnected;
  };

  getAccessSites = () => {
    const sites: AccessSite[] = [];
    this._cache.forEach((item: AccessSite, origin) => {
      if (item.isConnected && item.expireTime >= Date.now()) {
        sites.push(item);
      }
    });
    return sites;
  };

  getAccessSite = (key: string) => {
    const site = this._cache.get(key) || {};
    if (site && site.isConnected && site.expireTime >= Date.now()) {
      return site;
    }
  };
  getExpiredTime = () => {
    return Date.now() + this.maxAge;
  };
  removeAccessSite = (origin: string) => {
    this._cache.delete(origin);
    this.cacheToStore();
    return true;
  };
}

export default new AccessService();
