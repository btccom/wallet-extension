import BigNumber from 'bignumber.js';

import { VERSION } from '@/common/constant';

export * from './hooks';
export * from './WalletContext';
const UI_TYPE = {
  Tab: 'index',
  Pop: 'popup',
  Notification: 'notification'
};

type UiTypeCheck = {
  isTab: boolean;
  isNotification: boolean;
  isPop: boolean;
};

export const getUiType = (): UiTypeCheck => {
  const { pathname } = window.location;
  return Object.entries(UI_TYPE).reduce((m, [key, value]) => {
    m[`is${key}`] = pathname === `/${value}.html`;

    return m;
  }, {} as UiTypeCheck);
};

export const satoshisToBTC = (amount: number) => {
  return amount / 100000000;
};

export function shortAddress(address?: string, len = 5) {
  if (!address) return '';
  if (address.length <= len * 2) return address;
  return address.slice(0, len) + '...' + address.slice(address.length - len);
}

export function shortDesc(desc?: string, len = 50) {
  if (!desc) return '';
  if (desc.length <= len) return desc;
  return desc.slice(0, len) + '...';
}

export async function sleep(timeSec: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, timeSec * 1000);
  });
}

export function isValidAddress(address: string) {
  if (!address) return false;
  return true;
}

export const copyToClipboard = (textToCopy: string | number) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(textToCopy.toString());
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy.toString();
    textArea.style.position = 'absolute';
    textArea.style.opacity = '0';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise<void>((res, rej) => {
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
    });
  }
};

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function handleListAddMultTag(list: any[], utxos: any[], isSpSat = false) {
  return list.map((item) => {
    if (!isSpSat) {
      utxos = utxos.filter((utxo) => {
        return utxo.txid === item.txid && utxo.index === item.index;
      });
    } else {
      utxos = utxos.filter((utxo) => {
        const spSats = utxo.spSats.filter((v) => {
          return v.id === item.id;
        });
        return spSats?.length > 0;
      });
    }
    let hasSpSat = false;
    let hasInscription = false;
    let hasBrc20 = false;
    const oSpSatsTag: any = {};
    const spSatsCheckLength = isSpSat ? 1 : 0;
    const inscriptionCheckLength = isSpSat ? 0 : 1;
    utxos.forEach((utxoItem) => {
      if (utxoItem.spSats?.length > spSatsCheckLength) {
        hasSpSat = true;
        utxoItem.spSats.forEach((spSat: any) => {
          oSpSatsTag[spSat.rarity] = 1;
        });
      }
      if (utxoItem.inscriptions?.length > inscriptionCheckLength) {
        hasInscription = true;
      }
      if (!isSpSat && utxoItem.inscriptions.length > 1 && utxoItem.transferableBrc20.exist) {
        hasBrc20 = true;
      }
    });
    item = { ...item, spSatsTag: Object.keys(oSpSatsTag), hasSpSat, hasBrc20, hasInscription };
    return item;
  });
}

export function balanceToUsd(balance: number | string, exchangeRate: number) {
  return withCommas(new BigNumber(balance).times(new BigNumber(exchangeRate)).toNumber().toFixed(2));
}
/**
 * number comma split
 */
export const withCommas = (x: number | string = '') => {
  const parts = x.toString().split('.');
  if (parts.length > 0) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  return '';
};

export function getExplorerUrl() {
  return 'https://explorer.btc.com/btc';
}

export function getExplorerTxUrlByTxid(txid: string) {
  return `https://explorer.btc.com/btc/tx/${txid}`;
}

export function getCurrentVersion() {
  const currentVesion = VERSION;
  return {
    currentVesion
  };
}
