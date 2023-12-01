/* eslint-disable quotes */

/* constants pool */
import { AddressType, NetworkType } from './types';

export enum KEYCHAIN_TYPE {
  HdKeyring = 'HD Key Tree',
  SimpleKeyring = 'Simple Key Pair',
  Empty = 'Empty'
}

export const BRAND_ALIAN_TYPE_TEXT = {
  [KEYCHAIN_TYPE.HdKeyring]: 'Account',
  [KEYCHAIN_TYPE.SimpleKeyring]: 'Private Key'
};

export const KEYCHAIN_TYPES: {
  [key: string]: {
    name: string;
    alianName: string;
  };
} = {
  'HD Key Tree': {
    name: 'HD Key Tree',
    alianName: 'HD Wallet'
  },
  'Simple Key Pair': {
    name: 'Simple Key',
    alianName: 'Single Wallet'
  }
};

export const IS_WINDOWS = /windows/i.test(navigator.userAgent);

export const ADDRESS_TYPES: {
  value: AddressType;
  label: string;
  name: string;
  hdPath: string;
  order: number;
}[] = [
  {
    value: AddressType.P2WPKH,
    label: 'P2WPKH',
    name: 'Native Segwit (P2WPKH)',
    hdPath: "m/84'/0'/0'/0",
    order: 0
  },
  {
    value: AddressType.P2TR,
    label: 'P2TR',
    name: 'Taproot (P2TR)',
    hdPath: "m/86'/0'/0'/0",
    order: 2
  },
  {
    value: AddressType.P2PKH,
    label: 'P2PKH',
    name: 'Legacy (P2PKH)',
    hdPath: "m/44'/0'/0'/0",
    order: 3
  }
];

export const LOGIN_ADDRESS_TYPES_HDPATH = {
  hdPath: "m/86'/1'/0'/0",
  index: 0
};

export const NETWORK_TYPES = [
  { value: NetworkType.MAINNET, label: 'LIVENET', name: 'livenet', validNames: [0, 'livenet', 'mainnet'] },
  { value: NetworkType.TESTNET, label: 'TESTNET', name: 'testnet', validNames: ['testnet'] },
  { value: NetworkType.REGTEST, label: 'REGTEST', name: 'regtest', validNames: ['regtest'] }
];

export const EVENTS = {
  broadcastToExtension: 'broadcastToExtension',
  broadcastToBackground: 'broadcastToBackground',
  SIGN_FINISHED: 'SIGN_FINISHED'
};

export const PORT_EVENT = {
  prefix: 'BTCCOM_EVENT'
};

export const GITHUB_URL = 'https://github.com/btccom/wallet-extension';
export const BRC20_EXPLORER_URL = 'https://ordi.btc.com';
export const PERMISSION_ORIGIN = '';

export const OPENAPI_URL_MAINNET = 'https://wallet.api.btc.com';
export const OPENAPI_URL_TESTNET = 'http://10.10.10.3:8081';
export const OPENAPI_URL_TEST_TRANSACT = 'http://10.10.10.3:12347';
export const VERSION = process.env.release!;
export const MANIFEST_VERSION = process.env.manifest!;

export const SEND_LIMIT = 546;
