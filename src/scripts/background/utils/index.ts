/* eslint-disable indent */
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

import { AddressType, NetworkType } from '@/common/types';
import { Network } from 'ecpair/src/networks';

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export const underline2Camelcase = (str: string) => {
  return str.replace(/_(.)/g, (m, p1) => p1.toUpperCase());
};

//Buffer BE to LE
export const BufferBE2LE = (buf: Buffer) => {
  const newBuf = Buffer.alloc(32);
  buf.copy(newBuf);
  newBuf.reverse();
  return newBuf;
};

export const validator = (pubkey: Buffer, msghash: Buffer, signature: Buffer): boolean =>
  ECPair.fromPublicKey(pubkey).verify(msghash, signature);

export function getPsbtNetworkType(networkType: NetworkType) {
  if (networkType === NetworkType.MAINNET) {
    return bitcoin.networks.bitcoin;
  } else if (networkType === NetworkType.TESTNET) {
    return bitcoin.networks.testnet;
  } else {
    return bitcoin.networks.regtest;
  }
}
export function toLocalNetworkType(networkType: Network) {
  if (networkType ===bitcoin.networks.bitcoin) {
    return  NetworkType.MAINNET;
  } else if (networkType === bitcoin.networks.testnet) {
    return NetworkType.TESTNET;
  } else {
    return NetworkType.REGTEST
  }
}

export function publicKeyToAddress(publicKey: string, type: AddressType, networkType: NetworkType) {
  const network = getPsbtNetworkType(networkType);
  if (!publicKey) return '';
  const pubkey = Buffer.from(publicKey, 'hex');
  if (type === AddressType.P2PKH) {
    const { address } = bitcoin.payments.p2pkh({
      pubkey,
      network
    });
    return address || '';
  } else if (type === AddressType.P2WPKH) {
    const { address } = bitcoin.payments.p2wpkh({
      pubkey,
      network
    });
    return address || '';
  } else if (type === AddressType.P2TR) {
    const { address } = bitcoin.payments.p2tr({
      internalPubkey: pubkey.slice(1, 33),
      network
    });
    return address || '';
  } else {
    return '';
  }
}
export const toXOnly = (pubKey: Buffer) => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));
