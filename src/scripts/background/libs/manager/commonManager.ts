import compareVersions from 'compare-versions';
import cloneDeep from 'lodash/cloneDeep';

import { EVENTS } from '@/common/constant';
import eventManger from '@/common/message/eventManger';
import { Account, AddressType, BitcoinBalance, NetworkType, Version } from '@/common/types';

import sessionManager from './sessionManager';
import storageManager from './storageManager';

const version = process.env.release || '0';

export interface PreferenceStore {
  currentKeyIndex: number;
  currentAccount: Account | undefined | null;
  balanceMap: {
    [address: string]: BitcoinBalance;
  };
  watchAddressPreference: Record<string, number>;
  walletSavedList: [];
  alianNames?: Record<string, string>;
  initAlianNames: boolean;
  firstOpen: boolean;
  currency: string;
  addressType: AddressType;
  networkType: NetworkType;
  keyringAlianNames: {
    [key: string]: string;
  };
  accountAlianNames: {
    [key: string]: string;
  };
  editingKeyringIndex: number;
  editingAccount: Account | undefined | null;
  hiddenMoney: boolean;
  versionInfo: Version;
}

class CommonManager {
  store!: PreferenceStore;
  popupOpen = false;
  hasOtherProvider = false;

  init = async () => {
    this.store = await storageManager.createStorage<PreferenceStore>({
      name: 'common',
      template: {
        currentKeyIndex: 0,
        currentAccount: undefined,
        editingKeyringIndex: 0,
        editingAccount: undefined,
        balanceMap: {},
        watchAddressPreference: {},
        walletSavedList: [],
        alianNames: {},
        initAlianNames: false,
        firstOpen: false,
        currency: 'USD',
        addressType: AddressType.P2WPKH,
        networkType: NetworkType.MAINNET,
        keyringAlianNames: {},
        accountAlianNames: {},
        hiddenMoney: false,
        versionInfo: {
          version: '',
          desc: '',
          url: '',
          force_upgrade: '0',
          new_version: '',
          read: false
        }
      }
    });
    if (!this.store.currency) {
      this.store.currency = 'USD';
    }

    if (!this.store.initAlianNames) {
      this.store.initAlianNames = false;
    }
    if (!this.store.balanceMap) {
      this.store.balanceMap = {};
    }

    if (!this.store.walletSavedList) {
      this.store.walletSavedList = [];
    }

    if (this.store.addressType === undefined || this.store.addressType === null) {
      this.store.addressType = AddressType.P2WPKH;
    }

    if (!this.store.networkType) {
      this.store.networkType = NetworkType.MAINNET;
    }

    if (this.store.currentAccount) {
      if (!this.store.currentAccount.pubkey) {
        // old version.
        this.store.currentAccount = undefined; // will restored to new version
      }
    }

    if (!this.store.keyringAlianNames) {
      this.store.keyringAlianNames = {};
    }

    if (!this.store.accountAlianNames) {
      this.store.accountAlianNames = {};
    }
  };

  getCurrentAccount = () => {
    return cloneDeep(this.store.currentAccount);
  };

  setCurrentAccount = (account?: Account | null) => {
    this.store.currentAccount = account;
    if (account) {
      sessionManager.broadcastRegister('accountsChanged', [account.address]);
      eventManger.emit(EVENTS.broadcastToExtension, {
        method: 'accountsChanged',
        params: account
      });
    }
  };

  // popupOpen
  setPopupOpen = (isOpen: boolean) => {
    this.popupOpen = isOpen;
  };

  getPopupOpen = () => {
    return this.popupOpen;
  };

  // addressBalance
  updateAddressBalance = (address: string, data: BitcoinBalance) => {
    const balanceMap = this.store.balanceMap || {};
    this.store.balanceMap = {
      ...balanceMap,
      [address]: data
    };
  };

  removeAddressBalance = (address: string) => {
    const key = address;
    if (key in this.store.balanceMap) {
      const map = this.store.balanceMap;
      delete map[key];
      this.store.balanceMap = map;
    }
  };

  getAddressBalance = (address: string): BitcoinBalance | null => {
    const balanceMap = this.store.balanceMap || {};
    return balanceMap[address] || null;
  };

  // walletSavedList
  getWalletSavedList = () => {
    return this.store.walletSavedList || [];
  };

  updateWalletSavedList = (list: []) => {
    this.store.walletSavedList = list;
  };

  // alianNames
  getInitAlianNameStatus = () => {
    return this.store.initAlianNames;
  };

  changeInitAlianNameStatus = () => {
    this.store.initAlianNames = true;
  };
  // deprecate
  getAddressType = () => {
    return this.store.addressType;
  };

  // network type
  getNetworkType = () => {
    return this.store.networkType;
  };

  setNetworkType = (networkType: NetworkType) => {
    this.store.networkType = networkType;
  };

  // currentKeyringIndex
  getCurrentKeyIndex = () => {
    return this.store.currentKeyIndex;
  };

  setCurrentKeyIndex = (keyringIndex: number) => {
    this.store.currentKeyIndex = keyringIndex;
  };

  // keyringAlianNames
  setKeyringAlianName = (keyringKey: string, name: string) => {
    this.store.keyringAlianNames = Object.assign({}, this.store.keyringAlianNames, { [keyringKey]: name });
  };

  getKeyringAlianName = (keyringKey: string, defaultName?: string) => {
    const name = this.store.keyringAlianNames[keyringKey];
    if (!name && defaultName) {
      this.store.keyringAlianNames[keyringKey] = defaultName;
    }
    return this.store.keyringAlianNames[keyringKey];
  };

  // accountAlianNames
  setAccountAlianName = (accountKey: string, name: string) => {
    this.store.accountAlianNames = Object.assign({}, this.store.accountAlianNames, { [accountKey]: name });
  };

  getAccountAlianName = (accountKey: string, defaultName?: string) => {
    const name = this.store.accountAlianNames[accountKey];
    if (!name && defaultName) {
      this.store.accountAlianNames[accountKey] = defaultName;
    }
    return this.store.accountAlianNames[accountKey];
  };

  // editingKeyringIndex
  getEditingKeyringIndex = () => {
    return this.store.editingKeyringIndex;
  };

  setEditingKeyringIndex = (keyringIndex: number) => {
    this.store.editingKeyringIndex = keyringIndex;
  };

  getHiddenMoney = () => {
    return this.store.hiddenMoney;
  };

  setHiddenMoney = (hiddenMoney: boolean) => {
    this.store.hiddenMoney = hiddenMoney;
  };

  getVersionInfo = () => {
    return this.store.versionInfo;
  };

  setVersionInfo = (versionInfo: Version) => {
    this.store.versionInfo = {...this.store.versionInfo, ...versionInfo};
  };
  updateVersioInfoRead = () => {
    this.store.versionInfo = {...this.store.versionInfo, ...{read: true}};
  }
}

export default new CommonManager();
