import { createContext, ReactNode, useContext } from 'react';

import {
  BitcoinBalance,
  Inscription,
  NetworkType,
  AddressType,
  WalletKeyring,
  Account,
  TokenBalance,
  SpSatsData,
  FeeRates,
  BtcTransaction,
  InscriptionTransaction,
  InscribeTransferPushTxResult,
  Brc20Transaction,
  SpsatTransaction,
  Utxos,
  ExchangeRate,
  AccessSite
} from '@/common/types';

export interface WalletController {
  sendSpsat(arg0: { to: string; name: string; feeRate: number }): SpsatTransaction;
  sendBrc20(arg0: { to: string; inscriptionIds: string[]; feeRate: number; tick: string }): Brc20Transaction;
  pushInscribeTransferTx(oid: string, rawtx: string): InscribeTransferPushTxResult;
  signTx(txHex: string, inputs: any): string;

  boot(password: string): Promise<void>;
  isBooted(): Promise<boolean>;

  getNotice(): Promise<any>;
  resolveNotice(data?: any, data2?: any): Promise<void>;
  rejectNotice(data?: any, data2?: any, data3?: any): Promise<void>;

  hasVault(): Promise<boolean>;

  verifyPassword(password: string): Promise<void>;
  changePassword: (password: string, newPassword: string) => Promise<void>;

  unlock(password: string): Promise<void>;
  isUnlocked(): Promise<boolean>;

  lockWallet(): Promise<void>;
  setPopupOpen(isOpen: boolean): void;
  isReady(): Promise<boolean>;

  getAddressBalance(address: string): Promise<BitcoinBalance>;
  getAddressCacheBalance(address: string): Promise<BitcoinBalance>;

  getAddressInscriptions(
    address: string,
    cursor?: number,
    size?: number
  ): Promise<{ list: Inscription[]; utxos: Utxos[]; total: number }>;

  getPrivateKey(password: string, account: { address: string; type: string }): Promise<{ hex: string; wif: string }>;
  getMnemonics(
    password: string,
    keyring: WalletKeyring
  ): Promise<{
    hdPath: string;
    mnemonic: string;
    passphrase: string;
  }>;
  createKeyringWithPrivateKey(data: string, addressType: AddressType, alianName?: string): Promise<Account[]>;
  getPreMnemonics(): Promise<any>;
  generatePreMnemonic(): Promise<string>;
  removePreMnemonics(): void;
  createKeyringWithMnemonics(
    mnemonic: string,
    hdPath: string,
    passphrase: string,
    addressType: AddressType
  ): Promise<{ address: string; type: string }[]>;

  createTmpKeyringWithPrivateKey(privateKey: string, addressType: AddressType): Promise<WalletKeyring>;

  createTmpKeyringWithMnemonics(
    mnemonic: string,
    hdPath: string,
    passphrase: string,
    addressType: AddressType
  ): Promise<WalletKeyring>;
  removeKeyring(keyring: WalletKeyring): Promise<WalletKeyring>;
  deriveNewAccountFromMnemonic(keyring: WalletKeyring, alianName?: string): Promise<string[]>;

  changeAccount(account: Account): Promise<void>;
  getCurrentAccount(): Promise<Account>;
  getAccounts(): Promise<Account[]>;
  getNextAlianName: (keyring: WalletKeyring) => Promise<string>;

  getCurrentKeyringAccounts(): Promise<Account[]>;
  sendBTC(data: { to: string; amount: number; feeRate: number | string; autoAdjust: boolean }): Promise<BtcTransaction>;

  sendInscription(data: { to: string; inscriptionId: string; feeRate: number }): Promise<InscriptionTransaction>;

  sendInscriptions(data: {
    to: string;
    inscriptionIds: string[];
    feeRate: number | string;
  }): Promise<InscriptionTransaction>;
  pushTx(rawtx: string): Promise<string>;

  getNetworkType(): Promise<NetworkType>;
  setNetworkType(type: NetworkType): Promise<void>;

  getAccessSites(): Promise<AccessSite[]>;
  removeAccessSite(origin: string): Promise<void>;
  getCurrentAccessSite(id: string): Promise<AccessSite>;

  getCurrentKeyring(): Promise<WalletKeyring>;
  getKeyrings(): Promise<WalletKeyring[]>;
  changeKeyring(keyring: WalletKeyring): Promise<void>;
  getAllAddresses(keyring: WalletKeyring, index: number): Promise<string[]>;

  setKeyringAlianName(keyring: WalletKeyring, name: string): Promise<WalletKeyring>;
  changeAddressType(addressType: AddressType): Promise<void>;

  setAccountAlianName(account: Account, name: string): Promise<Account>;
  getFeeRates(): Promise<FeeRates[]>;

  setEditingKeyring(keyringIndex: number): Promise<void>;
  getEditingKeyring(): Promise<WalletKeyring>;

  inscribeBRC20Transfer(
    address: string,
    tick: string,
    amount: string,
    feeRate: number
  ): Promise<InscriptionTransaction>;

  getHiddenMoney(): Promise<boolean>;
  setHiddenMoney(value: boolean): Promise<void>;

  getAddressTokenBalances(address: string, ticker: string): Promise<TokenBalance>;
  getSpSats(address: string): Promise<SpSatsData>;
  getExchangeRate(): Promise<ExchangeRate>;
  getTickInfo(ticker: string): Promise<any>;
  transferAndSend(addr, to, tick, brc20_amount, feerate): Promise<any>;
  transfer(addr: string, id: string, rtx: string): Promise<any>;
  getVersionInfo(): Promise<any>;
  updateVersioInfoRead(): void;
}

const WalletContext = createContext<{
  wallet: WalletController;
} | null>(null);

const WalletProvider = ({ children, wallet }: { children?: ReactNode; wallet: WalletController }) => (
  <WalletContext.Provider value={{ wallet }}>{children}</WalletContext.Provider>
);

const useWallet = () => {
  const { wallet } = useContext(WalletContext) as {
    wallet: WalletController;
  };

  return wallet;
};

export { WalletProvider, useWallet };
