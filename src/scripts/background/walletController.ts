/* eslint-disable indent */
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

import {
  ADDRESS_TYPES,
  BRAND_ALIAN_TYPE_TEXT,
  KEYCHAIN_TYPE,
  KEYCHAIN_TYPES,
  NETWORK_TYPES,
  OPENAPI_URL_MAINNET,
  OPENAPI_URL_TESTNET
} from '@/common/constant';
import { AddressType, BitcoinBalance, NetworkType, WalletKeyring, Account, AccessSite } from '@/common/types';
import accessManager from '@/scripts/background/libs/manager/accessManager';
import apiManager, { ApiManager } from '@/scripts/background/libs/manager/apiManager';
import commonManager from '@/scripts/background/libs/manager/commonManager';
import noticeManager from '@/scripts/background/libs/manager/noticeManager';
import sessionManager from '@/scripts/background/libs/manager/sessionManager';
import walletKeyManager, { DisplayedKeryring, Keyring } from '@/scripts/background/libs/manager/walletKeyManager';
import { publicKeyToAddress, getPsbtNetworkType } from '@/scripts/background/utils';

const stashKeyrings: Record<string, Keyring> = {};

const ECPair = ECPairFactory(ecc);

export type AccountAsset = {
  name: string;
  symbol: string;
  amount: string;
  value: string;
};

export class WalletController {
  api: ApiManager = apiManager;

  /* wallet */
  boot = (password: string) => walletKeyManager.boot(password);
  isBooted = () => walletKeyManager.isBooted();

  getNotice = noticeManager.getNotice;
  resolveNotice = noticeManager.resolveNotice;
  rejectNotice = noticeManager.rejectNotice;

  hasVault = () => walletKeyManager.hasVault();
  verifyPassword = (password: string) => walletKeyManager.verifyPassword(password);
  changePassword = (password: string, newPassword: string) => walletKeyManager.changePassword(password, newPassword);

  initAlianNames = async () => {
    commonManager.changeInitAlianNameStatus();
  };

  isReady = () => {
    if (commonManager.store) {
      return true;
    } else {
      return false;
    }
  };

  unlock = async (password: string) => {
    const alianNameInited = commonManager.getInitAlianNameStatus();
    await walletKeyManager.submitPassword(password);
    sessionManager.broadcastRegister('unlock');
    if (!alianNameInited) {
      this.initAlianNames();
    }
    const account = await this.getCurrentAccount();
    if (account) {
      this.changeAccount(account);
    }
  };
  isUnlocked = () => {
    return walletKeyManager.memStore.getState().isUnlocked;
  };

  lockWallet = async () => {
    await walletKeyManager.setLocked();
    sessionManager.broadcastRegister('accountsChanged', []);
    sessionManager.broadcastRegister('lock');
  };

  setPopupOpen = (isOpen: boolean) => {
    commonManager.setPopupOpen(isOpen);
  };

  getAddressBalance = async (address: string) => {
    const account = commonManager.getCurrentAccount();
    if (account) {
      this.api.setPublicKey(account.pubkey);
    }
    const data = await apiManager.getAddressBalance(address);
    commonManager.updateAddressBalance(address, data);
    return data;
  };

  getAddressCacheBalance = (address: string | undefined): BitcoinBalance => {
    const defaultBalance: BitcoinBalance = {
      sats: 0,
      satsInBtc: 0,
      satsInInscriptions: 0,
      satsInSpsats: 0,
      brc20: []
    };
    if (!address) return defaultBalance;
    return commonManager.getAddressBalance(address) || defaultBalance;
  };

  getAddressInscriptions = async (address: string, cursor: number, size: number) => {
    const data = await apiManager.getAddressInscriptions(address, cursor, size);
    return data;
  };

  /* keyrings */

  clearKeyrings = () => walletKeyManager.clearKeyrings();

  getPrivateKey = async (password: string, { pubkey, type }: { pubkey: string; type: string }) => {
    await this.verifyPassword(password);
    const keyring = await walletKeyManager.getKeyringForAccount(pubkey, type);
    if (!keyring) return null;
    const privateKey = await keyring.exportAccount(pubkey);
    const networkType = this.getNetworkType();
    const network = getPsbtNetworkType(networkType);
    const hex = privateKey;
    const wif = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network }).toWIF();
    return {
      hex,
      wif
    };
  };

  getMnemonics = async (password: string, keyring: WalletKeyring) => {
    await this.verifyPassword(password);
    const originKeyring = walletKeyManager.keyrings[keyring.index];
    const serialized = await originKeyring.serialize();
    return {
      mnemonic: serialized.mnemonic,
      hdPath: serialized.hdPath,
      passphrase: serialized.passphrase
    };
  };

  createKeyringWithPrivateKey = async (data: string, addressType: AddressType, alianName?: string) => {
    let originKeyring: Keyring;
    try {
      originKeyring = await walletKeyManager.importPrivateKey(data, addressType);
    } catch (e) {
      console.log(e);
      throw e;
    }
    const displayedKeyring = await walletKeyManager.displayForKeyring(
      originKeyring,
      addressType,
      walletKeyManager.keyrings.length - 1
    );
    const keyring = this.displayedKeyringToWalletKeyring(displayedKeyring, walletKeyManager.keyrings.length - 1);
    this.changeKeyring(keyring);
  };

  getPreMnemonics = () => walletKeyManager.getPreMnemonics();
  generatePreMnemonic = () => walletKeyManager.generatePreMnemonic();
  removePreMnemonics = () => walletKeyManager.removePreMnemonics();
  createKeyringWithMnemonics = async (
    mnemonic: string,
    hdPath: string,
    passphrase: string,
    addressType: AddressType
  ) => {
    const originKeyring = await walletKeyManager.createKeyringWithMnemonics(mnemonic, hdPath, passphrase, addressType);
    walletKeyManager.removePreMnemonics();

    const displayedKeyring = await walletKeyManager.displayForKeyring(
      originKeyring,
      addressType,
      walletKeyManager.keyrings.length - 1
    );
    const keyring = this.displayedKeyringToWalletKeyring(displayedKeyring, walletKeyManager.keyrings.length - 1);
    this.changeKeyring(keyring);
  };

  createTmpKeyringWithMnemonics = async (
    mnemonic: string,
    hdPath: string,
    passphrase: string,
    addressType: AddressType
  ) => {
    const originKeyring = walletKeyManager.createTmpKeyring('HD Key Tree', {
      mnemonic,
      activeIndexes: [0],
      hdPath,
      passphrase
    });
    const displayedKeyring = await walletKeyManager.displayForKeyring(originKeyring, addressType, -1);
    return this.displayedKeyringToWalletKeyring(displayedKeyring, -1, false);
  };

  createTmpKeyringWithPrivateKey = async (privateKey: string, addressType: AddressType) => {
    const originKeyring = walletKeyManager.createTmpKeyring(KEYCHAIN_TYPE.SimpleKeyring, [privateKey]);
    const displayedKeyring = await walletKeyManager.displayForKeyring(originKeyring, addressType, -1);
    return this.displayedKeyringToWalletKeyring(displayedKeyring, -1, false);
  };

  removeKeyring = async (keyring: WalletKeyring) => {
    await walletKeyManager.removeKeyring(keyring.index);
    const keyrings = await this.getKeyrings();
    const nextKeyring = keyrings[keyrings.length - 1];
    if (nextKeyring) this.changeKeyring(nextKeyring);
    return nextKeyring;
  };

  getKeyringByType = (type: string) => {
    return walletKeyManager.getKeyringByType(type);
  };

  deriveNewAccountFromMnemonic = async (keyring: WalletKeyring, alianName?: string) => {
    const _keyring = walletKeyManager.keyrings[keyring.index];
    const result = await walletKeyManager.addNewAccount(_keyring);
    const currentKeyring = await this.getCurrentKeyring();
    if (!currentKeyring) throw new Error('no current keyring');
    keyring = currentKeyring;
    const account = keyring.accounts[keyring.accounts.length - 1];
    this.changeAccount(account);
    commonManager.setAccountAlianName(account.key, alianName || '');
  };

  changeAccount = (account: Account) => {
    commonManager.setCurrentAccount(account);
    this.api.setPublicKey(account.pubkey);
  };

  changeKeyring = (keyring: WalletKeyring, accountIndex = 0) => {
    commonManager.setCurrentKeyIndex(keyring.index);
    commonManager.setCurrentAccount(keyring.accounts[accountIndex]);
    this.api.setPublicKey(keyring.accounts[accountIndex].pubkey);
  };

  getAllAddresses = (keyring: WalletKeyring, index: number) => {
    const networkType = this.getNetworkType();
    const addresses: string[] = [];
    const _keyring = walletKeyManager.keyrings[keyring.index];
    if (keyring.type === KEYCHAIN_TYPE.HdKeyring) {
      const pathPubkey: { [path: string]: string } = {};
      ADDRESS_TYPES.filter((v) => v.order >= 0).forEach((v) => {
        let pubkey = pathPubkey[v.hdPath];
        if (!pubkey && _keyring.getAccountByHdPath) {
          pubkey = _keyring.getAccountByHdPath(v.hdPath, index);
        }
        const address = publicKeyToAddress(pubkey, v.value, networkType);
        addresses.push(address);
      });
    } else {
      ADDRESS_TYPES.filter((v) => v.order >= 0).forEach((v) => {
        const pubkey = keyring.accounts[index].pubkey;
        const address = publicKeyToAddress(pubkey, v.value, networkType);
        addresses.push(address);
      });
    }
    return addresses;
  };

  changeAddressType = async (addressType: AddressType) => {
    const currentAccount = await this.getCurrentAccount();
    const currentKeyIndex = commonManager.getCurrentKeyIndex();
    await walletKeyManager.changeAddressType(currentKeyIndex, addressType);
    const keyring = await this.getCurrentKeyring();
    if (!keyring) throw new Error('no current keyring');
    this.changeKeyring(keyring, currentAccount?.index);
  };

  requestKeyring = (type: string, methodName: string, keyringId: number | null, ...params) => {
    let keyring;
    if (keyringId !== null && keyringId !== undefined) {
      keyring = stashKeyrings[keyringId];
    } else {
      try {
        keyring = this._getKeyringByType(type);
      } catch {
        const Keyring = walletKeyManager.getKeyringClassForType(type);
        keyring = new Keyring();
      }
    }
    if (keyring[methodName]) {
      return keyring[methodName].call(keyring, ...params);
    }
  };

  private _getKeyringByType = (type: string): Keyring => {
    const keyring = walletKeyManager.getKeyringsByType(type)[0];

    if (keyring) {
      return keyring;
    }

    throw new Error(`No ${type} keyring found`);
  };

  private _generateAlianName = (type: string, index: number) => {
    const alianName = `${BRAND_ALIAN_TYPE_TEXT[type]} ${index}`;
    return alianName;
  };

  getNextAlianName = (keyring: WalletKeyring) => {
    return this._generateAlianName(keyring.type, keyring.accounts.length + 1);
  };

  getHighlightWalletList = () => {
    return commonManager.getWalletSavedList();
  };

  updateHighlightWalletList = (list) => {
    return commonManager.updateWalletSavedList(list);
  };

  getInitAlianNameStatus = () => {
    return commonManager.getInitAlianNameStatus();
  };

  updateInitAlianNameStatus = () => {
    commonManager.changeInitAlianNameStatus();
  };

  reportErrors = (error: string) => {
    console.error('report not implemented');
  };

  getNetworkType = () => {
    const networkType = commonManager.getNetworkType();
    return networkType;
  };

  setNetworkType = async (networkType: NetworkType) => {
    commonManager.setNetworkType(networkType);
    if (networkType === NetworkType.MAINNET) {
      this.api.setHost(OPENAPI_URL_MAINNET);
    } else {
      this.api.setHost(OPENAPI_URL_TESTNET);
    }
    const currentAccount = await this.getCurrentAccount();
    const keyring = await this.getCurrentKeyring();
    if (!keyring) throw new Error('no current keyring');
    this.changeKeyring(keyring, currentAccount?.index);
  };

  getNetworkName = () => {
    const networkType = commonManager.getNetworkType();
    return NETWORK_TYPES[networkType].name;
  };

  getAccounts = async () => {
    const keyrings = await this.getKeyrings();
    const accounts: Account[] = keyrings.reduce<Account[]>((pre, cur) => pre.concat(cur.accounts), []);
    return accounts;
  };

  displayedKeyringToWalletKeyring = (displayedKeyring: DisplayedKeryring, index: number, initName = true) => {
    const networkType = commonManager.getNetworkType();
    const addressType = displayedKeyring.addressType;
    const key = 'keyring_' + index;
    const type = displayedKeyring.type;
    const accounts: Account[] = [];
    for (let j = 0; j < displayedKeyring.accounts.length; j++) {
      const { pubkey } = displayedKeyring.accounts[j];
      const address = publicKeyToAddress(pubkey, addressType, networkType);
      const accountKey = key + '#' + j;
      const defaultName = this._generateAlianName(type, j + 1);
      const alianName = commonManager.getAccountAlianName(accountKey, defaultName);
      accounts.push({
        type,
        pubkey,
        address,
        alianName,
        index: j,
        key: accountKey
      });
    }
    const hdPath = type === KEYCHAIN_TYPE.HdKeyring ? displayedKeyring.keyring.hdPath : '';
    const alianName = commonManager.getKeyringAlianName(
      key,
      initName ? `${KEYCHAIN_TYPES[type].alianName} #${index + 1}` : ''
    );
    const keyring: WalletKeyring = {
      index,
      key,
      type,
      addressType,
      accounts,
      alianName,
      hdPath
    };
    return keyring;
  };

  getKeyrings = async (): Promise<WalletKeyring[]> => {
    const displayedKeyrings = await walletKeyManager.getAllDisplayedKeyrings();
    const keyrings: WalletKeyring[] = [];
    for (let index = 0; index < displayedKeyrings.length; index++) {
      const displayedKeyring = displayedKeyrings[index];
      if (displayedKeyring.type !== KEYCHAIN_TYPE.Empty) {
        const keyring = this.displayedKeyringToWalletKeyring(displayedKeyring, displayedKeyring.index);
        keyrings.push(keyring);
      }
    }

    return keyrings;
  };

  getCurrentKeyring = async () => {
    let currentKeyIndex = commonManager.getCurrentKeyIndex();
    const displayedKeyrings = await walletKeyManager.getAllDisplayedKeyrings();
    if (currentKeyIndex === undefined) {
      const currentAccount = commonManager.getCurrentAccount();
      for (let i = 0; i < displayedKeyrings.length; i++) {
        if (displayedKeyrings[i].type !== currentAccount?.type) {
          continue;
        }
        const found = displayedKeyrings[i].accounts.find((v) => v.pubkey === currentAccount?.pubkey);
        if (found) {
          currentKeyIndex = i;
          break;
        }
      }
      if (currentKeyIndex === undefined) {
        currentKeyIndex = 0;
      }
    }

    if (!displayedKeyrings[currentKeyIndex] || displayedKeyrings[currentKeyIndex].type === KEYCHAIN_TYPE.Empty) {
      for (let i = 0; i < displayedKeyrings.length; i++) {
        if (displayedKeyrings[i].type !== KEYCHAIN_TYPE.Empty) {
          currentKeyIndex = i;
          commonManager.setCurrentKeyIndex(currentKeyIndex);
          break;
        }
      }
    }
    const displayedKeyring = displayedKeyrings[currentKeyIndex];
    if (!displayedKeyring) return null;
    return this.displayedKeyringToWalletKeyring(displayedKeyring, currentKeyIndex);
  };

  getCurrentAccount = async () => {
    const currentKeyring = await this.getCurrentKeyring();
    if (!currentKeyring) return null;
    const account = commonManager.getCurrentAccount();
    let currentAccount: Account | undefined = undefined;
    currentKeyring.accounts.forEach((v) => {
      if (v.pubkey === account?.pubkey) {
        currentAccount = v;
      }
    });
    if (!currentAccount) {
      currentAccount = currentKeyring.accounts[0];
    }
    if (currentAccount) {
      this.api.setPublicKey(currentAccount.pubkey);
    }
    return currentAccount;
  };

  getEditingKeyring = async () => {
    const editingKeyringIndex = commonManager.getEditingKeyringIndex();
    const displayedKeyrings = await walletKeyManager.getAllDisplayedKeyrings();
    const displayedKeyring = displayedKeyrings[editingKeyringIndex];
    return this.displayedKeyringToWalletKeyring(displayedKeyring, editingKeyringIndex);
  };

  setEditingKeyring = async (index: number) => {
    commonManager.setEditingKeyringIndex(index);
  };

  getAccessSites = accessManager.getAccessSites;

  getCurrentAccessSite = (tabId: number) => {
    const { origin } = sessionManager.getSession(tabId) || {};
    return accessManager.getWithoutUpdate(origin);
  };
  updateAccessSite = (origin: string, data: AccessSite) => {
    accessManager.updateAccessSite(origin, data);
  };
  removeAccessSite = (origin: string) => {
    sessionManager.broadcastRegister('accountsChanged', [], origin);
    accessManager.removeAccessSite(origin);
  };

  setKeyringAlianName = (keyring: WalletKeyring, name: string) => {
    commonManager.setKeyringAlianName(keyring.key, name);
    keyring.alianName = name;
    return keyring;
  };

  setAccountAlianName = (account: Account, name: string) => {
    commonManager.setAccountAlianName(account.key, name);
    account.alianName = name;
    return account;
  };

  getExchangeRate = async () => {
    const result = await apiManager.getExchangeRate();
    return result;
  };

  inscribeBRC20Transfer = (address: string, tick: string, amount: string, feeRate: number, isRbf: boolean) => {
    return apiManager.inscribeBRC20Transfer(address, tick, feeRate, amount, isRbf);
  };

  getHiddenMoney = () => {
    return commonManager.getHiddenMoney();
  };
  setHiddenMoney = (hiddenMoney: boolean) => {
    return commonManager.setHiddenMoney(hiddenMoney);
  };
  getLoginSign = async (message: string) => {
    const account = await this.getCurrentAccount();
    if (!account) throw new Error('no current account');
    const signData = await walletKeyManager.signMessage(account.pubkey, message);
    return signData;
  };
  getAddressTokenBalances = async (address: string, ticker: string) => {
    return await apiManager.getAddressTokenBalances(address, ticker);
  };
  getSpSats = async (address: string) => {
    return await apiManager.getSpSats(address);
  };
  getFeeRates = async () => {
    return await this.api.getFeeRates();
  };
  getTickInfo = async (ticker: string) => {
    return await apiManager.getTickInfo(ticker);
  };
  transferAndSend = async (addr, to, tick, brc20_amount, feerate, isRbf) => {
    return await apiManager.transferAndSend(addr, to, tick, brc20_amount, feerate, isRbf);
  };
  transfer = (addr: string, id: string, rtx: string, isRbf: boolean) => {
    return apiManager.transfer(addr, id, rtx, isRbf);
  };
  getVersionInfo = async () => {
    let versionInfo = commonManager.getVersionInfo();
    let versionData: any = {};
    try{
      versionData = await apiManager.getVersion();
    }catch(err) {
      console.log(err);
    }
    if (!versionData.version) {
      return {read: true, force_upgrade: '0'};
    }
    if (versionData.version !== versionInfo.version) {
      versionData.read = false;
    }
    commonManager.setVersionInfo(versionData);
    versionInfo = commonManager.getVersionInfo();
    return versionInfo;
  };
  updateVersioInfoRead = () => {
    commonManager.updateVersioInfoRead();
  }
}

export default new WalletController();
