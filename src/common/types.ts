export enum SP_SATS_TYPE {
  MYTHIC = 'M',
  LEGENDARY = 'L',
  EPIC = 'E',
  RARE = 'R',
  UNCOMMON = 'U',
  COMMON = 'C',
  INSCRIPTION = 'IN',
  BRC20 = 'BR'
}
export enum AddressType {
  P2WPKH,
  P2TR,
  P2PKH
}

export enum NetworkType {
  MAINNET,
  TESTNET,
  REGTEST
}

export enum ALL_CHAINS {
  BTC = 'BTC'
}

export interface BitcoinBalance {
  sats: number;
  satsInBtc: number;
  satsInInscriptions: number;
  satsInSpsats: number | string;
  brc20: Brc20Ticks[] | null;
}

export interface AddressAssets {
  total_btc: string;
  satoshis?: number;
  total_inscription: number;
}

export interface Inscription {
  content?: string;
  address?: string;
  id: string;
  number: number;
  amount: number;
  txid: string;
  index: number;
  offset: number;
  timestamp: number;
  preview?: string;
  hasSpSat?: boolean;
  spSatsTag?: string[];
  hasInscription?: boolean;
  hasBrc20?: boolean;
}

export interface FeeRates {
  title: string;
  desc?: string;
  feerate: number;
  blocks?: number;
}

export interface UTXO {
  txId: string;
  outputIndex: number;
  satoshis: number;
  scriptPk: string;
  addressType: AddressType;
  inscriptions: {
    id: string;
    num: number;
    offset: number;
  }[];
}

export enum TxType {
  SEND_BITCOIN,
  SEND_INSCRIPTION,
  SEND_BRC20,
  TRANSFER_BRC20,
  INSCRIBE_TRANSFER,
  SEND_SATS
}

export const TxTypeTitle = {
  [TxType.SEND_INSCRIPTION]: 'Send Inscription',
  [TxType.SEND_SATS]: 'Send Rare Sats',
  [TxType.SEND_BITCOIN]: 'Send BTC',
  [TxType.TRANSFER_BRC20]: 'Transfer',
  [TxType.SEND_BRC20]: 'Send',
  [TxType.INSCRIBE_TRANSFER]: 'Inscribe Transfer'
};
export interface ToSignInput {
  index: number;
  publicKey: string;
  sighashTypes?: number[];
}
export type WalletKeyring = {
  key: string;
  index: number;
  type: string;
  addressType: AddressType;
  accounts: Account[];
  alianName: string;
  hdPath: string;
};

export interface Account {
  type: string;
  pubkey: string;
  address: string;
  brandName?: string;
  alianName?: string;
  displayBrandName?: string;
  index?: number;
  balance?: number;
  key: string;
}
export interface TokenBalance {
  tick: string;
  available: string;
  transferable: string;
  transferableUtxo: any[];
}

export interface TokenInfo {
  totalSupply: string;
  totalMinted: string;
}

export enum TokenInscriptionType {
  INSCRIBE_TRANSFER,
  INSCRIBE_MINT
}
export interface TickTransfer {
  satsIn?: string | number | undefined;
  tick?: string;
  amount: string;
  id: string;
  number: number;
  timestamp: number;
}

export interface AddressTokenSummary {
  tokenInfo: TokenInfo;
  tokenBalance: TokenBalance;
  historyList: TickTransfer[];
  transferableList: TickTransfer[];
}

export interface ToAddressInfo {
  address: string;
  domain?: string;
  inscription?: Inscription;
}

export interface RawTxInfo {
  txHex: string;
  toAddressInfo?: ToAddressInfo;
  fee: number;
  deduction: number;
  receiveAmount: number;
  inscription?: any;
  brc20?: { tick: string; amount: string; satsIn: string };
  brc20Utxos?: TickTransfer[];
  spsat?: {
    id: number;
    rarity: string;
    height: number;
    name: string;
    satsIn: string;
  };
  inputs?: any;
  selectBrc20?: TickTransfer[];
  id?: string;
  next?: string;
  serviceFee?: string;
}

export interface WalletConfig {
  version: string;
}
export interface Brc20Ticks {
  tick: string;
  available: string;
  transferable: string;
  transferableUtxo: string;
}
export interface BtcBalance {
  sats: number;
  satsInInscriptions: number;
  satsInSpsats: number;
  brc20: Brc20Ticks[];
}
export interface SegmentedOptions {
  label: string;
  value: string;
}
export interface SegmentedProps {
  options: SegmentedOptions[];
  activeKey: string;
  onChange?: (value: string) => void;
}

export interface SpSatInfo {
  id: number;
  rarity: string;
  height: number;
  offset: number;
  name: string;
  sats: number;
  hasBrc20?: boolean;
  hasSpSat?: boolean;
  spSatsTag?: string[];
  hasInscription?: boolean;
}
export interface SpSatUtxo {
  txid: string;
  index: number;
  amount: string;
  isCoinbase: boolean;
  height: string;
  unlock: boolean;
  spSats: SpSatInfo[];
  spentTxid: string;
  inscriptions: any[];
  unconfirm: boolean;
  transferableBrc20: {
    tick: string;
    amount: string;
    exist: boolean;
  };
}

export interface SpSatsData {
  spSat: SpSatInfo[];
  satUtxo: SpSatUtxo[];
  useableUtxo: any[];
}

export interface BtcTransaction {
  rtx: string;
  deduction: string;
  fee: string;
  inputs?: any;
}

export interface InscriptionTransaction {
  cost: string;
  rtx: string;
  deduction: string;
  fee: string;
  sats_in_inscription: string;
  id: string;
  number: string;
  timestamp: string;
  preview: string;
  content?: string;
  inscription_fee?: string;
  service_fee?: string;
  oid?: string;
  inputs: any;
}

export interface InscribeTransferPushTxResult {
  txid: string;
  reveal: string;
  sats_in_inscriptions: string;
  tick: string;
  brc20_amount: string;
}
export interface Brc20Transaction {
  rtx: string;
  deduction: string;
  fee: string;
  sats_in_brc20: string;
  brc20_amount: string;
  inputs: any;
}
export interface SpsatTransaction {
  rtx: string;
  deduction: string;
  fee: string;
  sats_in_spsat: string;
  id: string;
  rarity: string;
  height: string;
  name: string;
  inputs: any;
}

export interface PushTxResult {
  txid: string;
}

export interface Utxos {
  txid: string;
  index: number;
  amount: number;
  isCoinbase: boolean;
  height: number;
  unlock: boolean;
  spSats: any[];
  spentTxid: string;
  inscriptions: any[];
  unconfirm: boolean;
  transferableBrc20: {
    tick: string;
    amount: string;
    exist: boolean;
    number: number;
  };
}
export interface ExchangeRatePrice {
  coin: string;
  priceUsd: string;
}
export interface ExchangeRate {
  price: ExchangeRatePrice[];
}

export interface MemStoreState {
  isUnlocked: boolean;
  keyringTypes: any[];
  keyrings: any[];
  preMnemonics: string;
}

export interface AccessSite {
  origin: string;
  icon: string;
  name: string;
  chain: string;
  e?: number;
  isSigned: boolean;
  isTop: boolean;
  order?: number;
  isConnected: boolean;
  expireTime: number;
}
export interface MessageRequestData {
  method: string;
  data: any;
  channel?: string;
  uuid?: string;
  _type?: string;
}

export interface SendBrc20TransactionResult {
  brc20_utxos: { brc20amount: string; sats_in_inscription: string; tick: string }[];
  fee: string;
  id: string;
  inputs: {
    [key: string]: any;
  }[];
  next: string;
  output_amount: string;
  rtx: string;
  service_fee: string;
}

export interface Version {
  version: string;
  desc: string;
  url: string;
  force_upgrade: string;
  new_version: string;
  read?: boolean;
}
