import * as bitcoin from 'bitcoinjs-lib';
import bitcore from 'bitcore-lib';
import bitcore_mnemonic from 'bitcore-mnemonic';
import ecpair from 'ecpair';
import * as ecc from 'tiny-secp256k1';

import { SimpleKeyring } from '../simpleKeyring';

const crypto = require('crypto');

bitcoin.initEccLib(ecc);
const ECPair = ecpair(ecc);
const hdPathString = "m/44'/0'/0'/0";
const type = 'HD Key Tree';


export interface AccountInfo {
  address: string;
  index: number;
}

export interface DeserializeOption {
  hdPath?: string;
  mnemonic?: string;
  activeIndexes?: number[];
  passphrase?: string;
}

const getNetworkType = (network: bitcoin.Network) =>
  network == bitcoin.networks.bitcoin ? 'livenet' : network == bitcoin.networks.testnet ? 'testnet' : 'regtest';
export class HdKeyring extends SimpleKeyring {
  mnemonic: '';
  hdPath: string;
  root: any;
  _index2wallet: any;
  activeIndexes: any[];
  page: number;
  perPage: number;
  passphrase: any;
  hdWallet: any;
  /* PUBLIC METHODS */
  constructor(opts: DeserializeOption) {
    super(null);
    this.type = type;
    this.mnemonic = '';
    this.network = bitcoin.networks.bitcoin;
    this.hdPath = hdPathString;
    this.root = null;
    this.wallets = [];
    this._index2wallet = {};
    this.activeIndexes = [];
    this.page = 0;
    this.perPage = 5;
    this.deserialize(opts);
  }
  serialize = () => {
    return new Promise((resolve, reject) => {
      const data: DeserializeOption = {
        mnemonic: this.mnemonic,
        activeIndexes: this.activeIndexes,
        hdPath: this.hdPath,
        passphrase: this.passphrase
      };
      resolve(data);
    });
  };
  async deserialize(_opts: DeserializeOption = {}) {
    if (this.root) {
      throw new Error('Btc-Hd-Keyring: Secret recovery phrase already provided');
    }
    const opts = _opts;
    this.wallets = [];
    this.mnemonic = '';
    this.root = null;
    this.hdPath = opts.hdPath || hdPathString;
    if (opts.passphrase) {
      this.passphrase = opts.passphrase;
    }
    if (opts.mnemonic) {
      this.initFromMnemonic(opts.mnemonic);
    }
    if (opts.activeIndexes) {
      this.activeAccounts(opts.activeIndexes);
    }
  }
  initFromMnemonic(mnemonic) {
    if (this.root) {
      throw new Error('Btc-Hd-Keyring: Secret recovery phrase already provided');
    }
    this.mnemonic = mnemonic;
    this._index2wallet = {};
    this.hdWallet = new bitcore_mnemonic(mnemonic);
    this.root = this.hdWallet.toHDPrivateKey(this.passphrase, getNetworkType(this.network)).deriveChild(this.hdPath);
  }
  changeHdPath(hdPath) {
    this.hdPath = hdPath;
    this.root = this.hdWallet.toHDPrivateKey(this.passphrase, getNetworkType(this.network)).deriveChild(this.hdPath);
    const indexes = this.activeIndexes;
    this._index2wallet = {};
    this.activeIndexes = [];
    this.wallets = [];
    this.activeAccounts(indexes);
  }
  getAccountByHdPath(hdPath, index) {
    const root = this.hdWallet.toHDPrivateKey(this.passphrase, getNetworkType(this.network)).deriveChild(hdPath);
    const child = root.deriveChild(index);
    const ecpair = ECPair.fromPrivateKey(child.privateKey.toBuffer());
    const address = ecpair.publicKey.toString('hex');
    return address;
  }
  addAccounts(numberOfAccounts = 1) {
    if (!this.root) {
      this.initFromMnemonic(new bitcore_mnemonic().toString());
    }
    let count = numberOfAccounts;
    let currentIdx = 0;
    const newWallets: any = [];
    while (count) {
      const [, wallet] = this._addressFromIndex(currentIdx);
      if (this.wallets.includes(wallet)) {
        currentIdx++;
      } else {
        this.wallets.push(wallet);
        newWallets.push(wallet);
        this.activeIndexes.push(currentIdx);
        count--;
      }
    }
    const hexWallets = newWallets.map((w) => {
      return w.publicKey.toString('hex');
    });
    return Promise.resolve(hexWallets);
  }
  activeAccounts(indexes: number[]) {
    const accounts: string[] = [];
    for (const index of indexes) {
      const [address, wallet] = this._addressFromIndex(index);
      this.wallets.push(wallet);
      this.activeIndexes.push(index);
      accounts.push(address);
    }
    return accounts;
  }
  getAddresses(start, end) {
    const from = start;
    const to = end;
    const accounts: AccountInfo[] = [];
    for (let i = from; i < to; i++) {
      const [address] = this._addressFromIndex(i);
      accounts.push({
        address,
        index: i + 1
      });
    }
    return accounts;
  }
  async __getPage(increment) {
    this.page += increment;
    if (!this.page || this.page <= 0) {
      this.page = 1;
    }
    const from = (this.page - 1) * this.perPage;
    const to = from + this.perPage;
    const accounts: AccountInfo[] = [];
    for (let i = from; i < to; i++) {
      const [address] = this._addressFromIndex(i);
      accounts.push({
        address,
        index: i + 1
      });
    }
    return accounts;
  }
  async getAccounts() {
    return this.wallets.map((w) => {
      return w.publicKey.toString('hex');
    });
  }
  getIndexByAddress(address) {
    for (const key in this._index2wallet) {
      if (this._index2wallet[key][0] === address) {
        return Number(key);
      }
    }
    return null;
  }
  _addressFromIndex(i) {
    if (!this._index2wallet[i]) {
      const child = this.root.deriveChild(i);
      const ecpair = ECPair.fromPrivateKey(child.privateKey.toBuffer());
      const address = ecpair.publicKey.toString('hex');
      this._index2wallet[i] = [address, ecpair];
    }
    return this._index2wallet[i];
  }
  signMessageByHdPath(hdPath: string, index: string | number, message: any) {
    let publicKey = '';
    let signature = '';
    try {
      const root = this.hdWallet.toHDPrivateKey(this.passphrase, getNetworkType(this.network)).deriveChild(hdPath);
      const child = root.deriveChild(index);
      const ecpair = ECPair.fromPrivateKey(child.privateKey.toBuffer());

      const oHash = crypto.createHash('sha256');
      oHash.update(message);
      const hash = oHash.digest();
      // use private key to sign hash of message
      const oSignature = bitcore.crypto.ECDSA.sign(hash, new bitcore.PrivateKey(ecpair.privateKey));

      // signature to DER format
      const derSignature = oSignature.toDER();
      const bufPublicKey = ecpair.publicKey;

      publicKey = bufPublicKey.toString('hex');
      signature = derSignature.toString('hex');
    } catch (e) {
      console.log(e);
    }
    return {
      publicKey: publicKey,
      signature: signature
    };
  }
}
HdKeyring.type = type;
