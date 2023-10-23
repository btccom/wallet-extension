import BigNumber from 'bignumber.js';

const format = (str, ...args) => {
  return args.reduce((m, n) => m.replace('_s_', n), str);
};

export function satoshisToAmount(val) {
  const num = new BigNumber(val);
  return num.dividedBy(100000000).toFixed(8);
}
export function amountToSatoshis(val) {
  const num = new BigNumber(val);
  return num.multipliedBy(100000000).toNumber();
}

export function satoshisMinus(val: number, satoshis: number) {
  const num = new BigNumber(val);
  return num.minus(new BigNumber(satoshis)).toNumber();
}
export function numberAdd(...numbers: any) {
  try {
    return numbers.reduce(
      (total: number | string, num: number | string) => new BigNumber(total).plus(new BigNumber(num)).toString(),
      0
    );
  } catch (err) {
    console.log(err);
  }
}

export function numberMinus(num1: any, num2: any) {
  try {
    return new BigNumber(num1).minus(new BigNumber(num2)).toNumber();
  } catch (err) {
    console.log(err);
  }
  return 1;
}

export function formatDate(date: Date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
  for (const k in o)
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length));
  return fmt;
}
export function getDateShowdate(date: Date) {
  if (date.getTime() < 100) {
    return 'unconfirmed';
  } else {
    const old = Date.now() - date.getTime();
    if (old < 60 * 1000) {
      return `${Math.floor(old / 1000)} secs ago`;
    }
    if (old < 1000 * 60 * 60) {
      return `${Math.floor(old / 60000)} mins ago`;
    }
    if (old < 1000 * 60 * 60 * 24) {
      return `${Math.floor(old / 3600000)} hours ago`;
    }
    if (old < 1000 * 60 * 60 * 24 * 30) {
      return `${Math.floor(old / 86400000)} days ago`;
    }
  }
  return formatDate(date, 'yyyy-MM-dd');
}

export { format };
