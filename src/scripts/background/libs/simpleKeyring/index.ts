import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import ecpair from 'ecpair';
import { EventEmitter } from 'events';
import * as ecc from 'tiny-secp256k1';

import { publicKeyToAddress, toLocalNetworkType, toXOnly } from '@/scripts/background/utils';
import { AddressType } from '@/common/types';
const { Signer } = require('bip322-js');

const { isTaprootInput } = require('bitcoinjs-lib/src/psbt/bip371');

bitcoin.initEccLib(ecc);
const ECPair = ecpair(ecc);
const type = 'Simple Key Pair';
function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return bitcoin.crypto.taggedHash('TapTweak', Buffer.concat(h ? [pubKey, h] : [pubKey]));
}
function tweakSigner(signer: bitcoin.Signer, opts: any = {}): bitcoin.Signer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey: Uint8Array | undefined = signer.privateKey!;
  if (!privateKey) {
    throw new Error('Private key is required for tweaking signer!');
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(privateKey, tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash));
  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!');
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network
  });
}
export class SimpleKeyring extends EventEmitter {
  type: string;
  network: bitcoin.networks.Network;
  wallets: any[];
  static type: string;
  constructor(opts) {
    super();
    this.type = type;
    this.network = bitcoin.networks.bitcoin;
    this.wallets = [];
    if (opts) {
      this.deserialize(opts);
    }
  }
  async serialize() {
    return new Promise((resolve, reject) => {
      const data = this.wallets.map((wallet) => wallet.privateKey.toString('hex'));
      resolve(data);
    });
  }
  async deserialize(opts: any) {
    const privateKeys = opts;
    this.wallets = privateKeys.map((key) => {
      let buf;
      if (key.length === 64) {
        // privateKey
        buf = Buffer.from(key, 'hex');
        return ECPair.fromPrivateKey(buf);
      } else {
        //wif
        return ECPair.fromWIF(key);
      }
    });
  }
  addAccounts(n = 1) {
    const newWallets: any = [];
    for (let i = 0; i < n; i++) {
      newWallets.push(ECPair.makeRandom());
    }
    this.wallets = this.wallets.concat(newWallets);
    const hexWallets = newWallets.map(({ publicKey }) => publicKey.toString('hex'));
    return hexWallets;
  }
  async getAccounts() {
    return this.wallets.map(({ publicKey }) => publicKey.toString('hex'));
  }
  async signTransaction(psbt, inputs, opts) {
    inputs.forEach((input) => {
      const keyPair = this._getPrivateKeyFor(input.publicKey);
      if (isTaprootInput(psbt.data.inputs[input.index])) {
        const signer = tweakSigner(keyPair, opts);
        psbt.signInput(input.index, signer, input.sighashTypes);
      } else {
        const signer = keyPair;
        psbt.signInput(input.index, signer, input.sighashTypes);
      }
    });
    return psbt;
  }
  async exportAccount(publicKey: string) {
    const wallet = this._getWalletForAccount(publicKey);
    return wallet.privateKey.toString('hex');
  }
  removeAccount(publicKey: string) {
    if (!this.wallets.map((wallet) => wallet.publicKey.toString('hex')).includes(publicKey)) {
      throw new Error(`PublicKey ${publicKey} not found in this keyring`);
    }
    this.wallets = this.wallets.filter((wallet) => wallet.publicKey.toString('hex') !== publicKey);
  }
  _getPrivateKeyFor(publicKey: string) {
    if (!publicKey) {
      throw new Error('Must specify publicKey.');
    }
    const wallet = this._getWalletForAccount(publicKey);
    return wallet;
  }
  _getWalletForAccount(publicKey: string) {
    const wallet = this.wallets.find((wallet) => wallet.publicKey.toString('hex') == publicKey);
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching publicKey.');
    }
    return wallet;
  }
  async signMessage(publicKey: string, message: string, addressType: AddressType) {
    const wallet = this._getWalletForAccount(publicKey);
    const ecpair = ECPair.fromPrivateKey(wallet.privateKey);

    const privateKey = ecpair.toWIF()
    const localNetwork = toLocalNetworkType(this.network);
    const address = publicKeyToAddress(publicKey, addressType, localNetwork);
    let signature = Signer.sign(privateKey, address, message);
    if (Buffer.isBuffer(signature)) {
      signature = signature.toString('base64');
    }
    return {
      message,
      address,
      signature
    };
  }
}
SimpleKeyring.type = type;
