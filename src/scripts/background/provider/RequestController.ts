

import wallet from '../walletController';
import transaction from '../transactionController';
import { ethErrors } from 'eth-rpc-errors';
import accessManager from '@/scripts/background/libs/manager/accessManager';
import sessionManager from '@/scripts/background/libs/manager/sessionManager';

import walletKeyManager from '@/scripts/background/libs/manager/walletKeyManager';


const initSessionInfo = ({
  data: {
    params: { origin, name, icon }
  },
  session
}) => {
  session.setAttributes({ origin, name, icon });
};


const keepAlive = () => {
  return 'keep alive~';
};

export const InsideRequest = {
  initSessionInfo,
  keepAlive
};


class RequestController {
  requestAccounts = async ({ session: { origin } }) => {
    if (!accessManager.hasPermission(origin)) {
      throw ethErrors.provider.unauthorized();
    }
    const _account = await wallet.getCurrentAccount();
    const account = _account ? [_account.address] : [];
    sessionManager.broadcastRegister('accountsChanged', account);
    return account
  };

  @Reflect.metadata('SAFE', true)
    getAccounts = async ({ session: { origin } }) => {
      if (!accessManager.hasPermission(origin)) {
        return [];
      }

      const _account = await wallet.getCurrentAccount();
      const account = _account ? [_account.address] : [];
      return account
    };
  @Reflect.metadata('SAFE', true)
    disconnected = async ({ session: { origin } }) => {
      try{
        await accessManager.removeAccessSite(origin);
        const data = accessManager.getAccessSite(origin);
        sessionManager.broadcastRegister('accountsChanged', []);
        return !data;
      }catch(e) {
        return false;
      }
    }
    @Reflect.metadata('SAFE', true)
      getLoginSign = async ({ data: { params: { message } } }) => {
        const data = await wallet.getLoginSign(message);
        if(!data) return ''
        return data;
      };


  @Reflect.metadata('NOTICE', ['Deposit', (req) => {
    const { data: { params: { toAddress, satoshis } } } = req;
  }])
    deposit = async ({noticeRes}) => {
      const rawTx = await transaction.signTx(noticeRes?.txHex || '', noticeRes?.inputs);
      const txid = await transaction.pushTx(rawTx);
      return txid;
    }

    @Reflect.metadata('NOTICE', ['SignTransaction', (req) => {
      const { data: { params: { toAddress, satoshis } } } = req;
    }])
      signTransaction = async ({noticeRes}) => {
        try{
          const psbt = await transaction.signPsbt(noticeRes?.psbt || '');
          const rawtx = psbt.extractTransaction().toHex();
          const txid = await transaction.pushTx(rawtx);
          return txid;
        }catch(err: any){
          console.log(err);
          return '';
        }
      }
}

export default new RequestController();
