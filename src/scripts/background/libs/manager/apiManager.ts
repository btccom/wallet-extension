import { v4 as uuidv4 } from 'uuid';

import { OPENAPI_URL_MAINNET, OPENAPI_URL_TESTNET, OPENAPI_URL_TEST_TRANSACT, VERSION } from '@/common/constant';
import {
  TokenBalance,
  BitcoinBalance,
  Inscription,
  SpSatsData,
  FeeRates,
  BtcTransaction,
  InscriptionTransaction,
  Brc20Transaction,
  PushTxResult,
  InscribeTransferPushTxResult,
  SpsatTransaction,
  Utxos,
  ExchangeRate,
  SendBrc20TransactionResult,
  Version
} from '@/common/types';

import storageManager from './storageManager';

interface ApiManagerStore {
  host: string;
  publicKey: string;
  uuid: string;
}

enum API_STATUS {
  FAILED = '0',
  SUCCESS = '100',
  SUCCESSZERO = '0'
}

export class ApiManager {
  store!: ApiManagerStore;
  clientAddress = '';
  setHost = async (host: string) => {
    this.store.host = host;
    await this.init(host);
  };
  setPublicKey = async (publicKey: string) => {
    this.store.publicKey = publicKey;
  };

  getHost = () => {
    return this.store.host;
  };

  init = async (host = '') => {
    this.store = await storageManager.createStorage({
      name: 'apiManager',
      template: {
        host: host || OPENAPI_URL_MAINNET,
        uuid: uuidv4(),
        publicKey: ''
      }
    });
    if ([OPENAPI_URL_MAINNET, OPENAPI_URL_TESTNET].includes(this.store.host) === false) {
      this.store.host = OPENAPI_URL_MAINNET;
    }
    if (!this.store.uuid) {
      this.store.uuid = uuidv4();
    }
  };

  httpPostTransactOpenApi = async (route: string, params: any) => {
    const url =
      OPENAPI_URL_MAINNET === this.store.host
        ? `${OPENAPI_URL_MAINNET}/routing-brc20walletapi${route}`
        : OPENAPI_URL_TEST_TRANSACT + route;
    return this.httpPostOpenApi(route, params, url);
  };

  httpPostOpenApi = async (route: string, params: any, url?: string) => {
    url = url || this.getHost() + route;
    const headers = new Headers();
    headers.append('x-PublicKey', this.store.publicKey);
    headers.append('x-Client', 'BTC.com Wallet');
    headers.append('X-Version', VERSION);
    headers.append('x-Uid', this.store.uuid);
    headers.append('Content-Type', 'application/json');
    const res = await fetch(new Request(url), {
      method: 'POST',
      headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  };
  async getAddressBalance(address: string): Promise<BitcoinBalance> {
    const data = await this.httpPostOpenApi('/wallet/balance', {
      addr: address
    });
    if (data.code !== 0) {
      throw new Error(data.message);
    }
    return data.data;
  }

  async getAddressInscriptions(
    address: string,
    cursor?: number,
    size?: number
  ): Promise<{ list: Inscription[]; utxos: Utxos[]; total: number }> {
    const data = await this.httpPostOpenApi('/wallet/inscriptions', {
      addr: address,
      cursor,
      size
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    const inscription = data.data.inscription || [];
    const inscriptionUtxo = data.data.inscriptionUtxo || [];
    return { list: inscription, utxos: inscriptionUtxo, total: inscription.length };
  }

  async getFeeRates(): Promise<FeeRates[]> {
    const data = await this.httpPostOpenApi('/feerates', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.data.feerates;
  }
  async sendBTC(
    addr: string,
    to: string,
    amount: number,
    feerate: number,
    autoAdjust: boolean
  ): Promise<BtcTransaction> {
    const data = await this.httpPostTransactOpenApi('/wallet/send_btc', {
      addr,
      to,
      amount,
      feerate,
      max: autoAdjust ? 1 : 0
    });
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }

  async pushTx(rawtx: string): Promise<PushTxResult> {
    const data = await this.httpPostOpenApi('/sendrawtransaction', {
      rtx: rawtx
    });
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }

  async getAddressTokenBalances(address: string, ticker: string): Promise<TokenBalance> {
    const data = await this.httpPostOpenApi('/wallet/brc20', { addr: address, tick: ticker });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.data;
  }

  async getSpSats(address: string): Promise<SpSatsData> {
    const data = await this.httpPostOpenApi('/wallet/spsats', { addr: address });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.data;
  }
  async sendInscription(addr: string, to: string, ids: string[], feerate: number): Promise<InscriptionTransaction> {
    const data = await this.httpPostTransactOpenApi('/wallet/send_inscription', {
      addr,
      to,
      id: ids.join(','),
      feerate
    });
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }
  async sendBrc20(addr: string, to: string, tick: string, ids: string[], feerate: number): Promise<Brc20Transaction> {
    const data = await this.httpPostTransactOpenApi('/wallet/send_brc20', {
      addr,
      to,
      tick,
      utxos: ids.join(','),
      feerate
    });
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }
  async send_spsat(addr: string, to: string, name: string, feerate: string): Promise<SpsatTransaction> {
    const data = await this.httpPostTransactOpenApi('/wallet/send_spsat', { addr, to, name, feerate });
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }
  async inscribeBRC20Transfer(
    addr: string,
    tick: string,
    feerate: number,
    brc20_amount: number | string
  ): Promise<InscriptionTransaction> {
    const data = await this.httpPostTransactOpenApi('/wallet/inscribe_transfer', {
      addr,
      tick,
      feerate,
      brc20_amount
    });
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }

  async sendInscribeTransferRawtx(oid: string, rtx: string): Promise<InscribeTransferPushTxResult> {
    const data = await this.httpPostTransactOpenApi('/wallet/send_inscribe_transfer_rawtx', {
      oid,
      rtx
    });
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }

  async getExchangeRate(): Promise<ExchangeRate> {
    const data = await this.httpPostOpenApi('/price', {});
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }
  async getTickInfo(tick: string): Promise<any> {
    const data = await this.httpPostOpenApi('/tickinfo', { tick });
    if (data.code.toString() !== API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }
  async transferAndSend(
    addr: string,
    to: string,
    tick: string,
    brc20_amount: number | string,
    feerate: string
  ): Promise<SendBrc20TransactionResult> {
    const data = await this.httpPostTransactOpenApi('/wallet/transfer_and_send', {
      addr,
      to,
      tick,
      brc20_amount,
      feerate
    });
    return data;
  }
  async transfer(addr: string, id: string, rtx: string): Promise<SpsatTransaction> {
    const data = await this.httpPostTransactOpenApi('/wallet/transfer', { addr, id, rtx });
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }
  async getVersion(): Promise<Version> {
    const data = await this.httpPostTransactOpenApi('/wallet/version', {});
    if (data.code != API_STATUS.SUCCESSZERO) {
      throw new Error(data.message);
    }
    return data.data;
  }
}

export default new ApiManager();
