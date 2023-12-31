/* eslint-disable indent */
import * as bitcoin from 'bitcoinjs-lib';
import { address as PsbtAddress } from 'bitcoinjs-lib';

import { AddressType, UTXO } from '@/common/types';

import apiManager from './libs/manager/apiManager';
import commonManager from './libs/manager/commonManager';
import walletKeyManager, { ToSignInput } from './libs/manager/walletKeyManager';
import { getPsbtNetworkType, toXOnly } from './utils';
import { createScriptPubKeyByPublicKey, createSendBTC } from './utils/transaction';
import walletController from './walletController';

class TransactionController {
  signTransaction = async (type: string, from: string, psbt: bitcoin.Psbt, inputs: ToSignInput[]) => {
    const keyring = await walletKeyManager.getKeyringForAccount(from, type);
    return walletKeyManager.signTransaction(keyring, psbt, inputs);
  };

  getTransactionByPsbt  = async (psbtHex: string) => {
    const networkType = walletController.getNetworkType();
    const psbtNetwork = getPsbtNetworkType(networkType);
    const account = await walletController.getCurrentAccount();
    if (!account) throw new Error('no current account');
    const keyring = await walletController.getCurrentKeyring();
    if (!keyring) throw new Error('no current keyring');
    const psbtObj = bitcoin.Psbt.fromHex(psbtHex, {network: psbtNetwork});
    const transactionData: any = {
      inputs: [],
      outputs: [],
      totalInputValue: 0,
      totalOutputValue: 0,
      networkFee: 0,
      hex: ''
    }
    psbtObj.data.inputs.forEach((v, index) => {
      let script: any = null;
      let value = 0;
      if (v.witnessUtxo) {
        script = v.witnessUtxo.script;
        value = v.witnessUtxo.value;
      } else if (v.nonWitnessUtxo) {
        const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
        const output = tx.outs[psbtObj.txInputs[index].index];
        script = output.script;
        value = output.value;
      }
      let address = '';
      try {
        address = PsbtAddress.fromOutputScript(script, psbtNetwork);
      } catch (e: any) {
        console.log(e.message, 'error');
        throw new Error(e.message);
      }
      transactionData.inputs.push({
        address,
        value,
        toSign: address === account.address
      });
      transactionData.totalInputValue+=value;
    });
    psbtObj.txOutputs.forEach((v, index) => {
      transactionData.outputs.push({
        address: PsbtAddress.fromOutputScript(v.script, psbtNetwork),
        value: v.value
      });
      transactionData.totalOutputValue+=v.value;
    });

    transactionData.networkFee = transactionData.totalInputValue - transactionData.totalOutputValue;
    transactionData.hex = psbtObj.data.getTransaction().toString('hex');
    return transactionData;
  }
  signPsbt = async (psbt: any, options?: any) => {

    const networkType = walletController.getNetworkType();
    const psbtNetwork = getPsbtNetworkType(networkType);
    if (typeof psbt === 'string') {
      psbt = bitcoin.Psbt.fromHex(psbt, {network: psbtNetwork});
    }
    const account = await walletController.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const keyring = await walletController.getCurrentKeyring();
    if (!keyring) throw new Error('no current keyring');
    const _keyring = walletKeyManager.keyrings[keyring.index];

    const toSignInputs: ToSignInput[] = [];
    psbt.data.inputs.forEach((v, index) => {
      let script: any = null;
      let value = 0;
      if (v.witnessUtxo) {
        script = v.witnessUtxo.script;
        value = v.witnessUtxo.value;
      } else if (v.nonWitnessUtxo) {
        const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
        const output = tx.outs[psbt.txInputs[index].index];
        script = output.script;
        value = output.value;
      }
      const isSigned = v.finalScriptSig || v.finalScriptWitness;
      if (script && !isSigned) {
        let address = account.address;
        try {
          address = PsbtAddress.fromOutputScript(script, psbtNetwork);
        } catch (e: any) {
          throw new Error(e.message);
        }
        if (account.address === address) {
          toSignInputs.push({
            index,
            publicKey: account.pubkey,
            sighashTypes: v.sighashType ? [v.sighashType] : undefined
          });
          if (keyring.addressType === AddressType.P2TR && !v.tapInternalKey) {
            v.tapInternalKey = toXOnly(Buffer.from(account.pubkey, 'hex'));
          }
        }
      }
    });
    psbt = await walletKeyManager.signTransaction(_keyring, psbt, toSignInputs);
    if (options && options.autoFinalized == false) {
      // do not finalize
    } else {
      toSignInputs.forEach((v) => {
        psbt.finalizeInput(v.index);
      });
    }

    return psbt;
  };
  sendBTC = async ({
    to,
    amount,
    utxos,
    receiverToPayFee,
    feeRate,
    autoAdjust,
    isRbf
  }: {
    to: string;
    amount: number;
    utxos: UTXO[];
    receiverToPayFee: boolean;
    feeRate: number | number;
    autoAdjust: boolean;
    isRbf: boolean;
  }) => {
    const account = commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const btcTransactionInfo = await apiManager.sendBTC(account.address, to, amount, feeRate, autoAdjust, isRbf);

    return btcTransactionInfo;
  };

  sendInscription = async ({ to, inscriptionId, feeRate, isRbf }: { to: string; inscriptionId: string; feeRate: number;isRbf:boolean }) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');
    const btcTransactionInfo = await apiManager.sendInscription(account.address, to, [inscriptionId], feeRate, isRbf);
    return btcTransactionInfo;
  };

  sendInscriptions = async ({
    to,
    inscriptionIds,
    feeRate,
    isRbf
  }: {
    to: string;
    inscriptionIds: string[];
    feeRate: number;
    isRbf: boolean;
  }) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const btcTransactionInfo = await apiManager.sendInscription(account.address, to, inscriptionIds, feeRate, isRbf);
    return btcTransactionInfo;
  };
  sendBrc20 = async ({
    to,
    inscriptionIds,
    feeRate,
    tick,
    isRbf
  }: {
    to: string;
    inscriptionIds: string[];
    feeRate: number;
    tick: string;
    isRbf: boolean;
  }) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const btcTransactionInfo = await apiManager.sendBrc20(account.address, to, tick, inscriptionIds, feeRate, isRbf);
    return btcTransactionInfo;
  };

  sendSpsat = async ({ to, name, feeRate, isRbf }: { to: string; name: string; feeRate: string, isRbf: boolean }) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const btcTransactionInfo = await apiManager.send_spsat(account.address, to, name, feeRate, isRbf);
    return btcTransactionInfo;
  };

  pushTx = async (rawtx: string) => {
    const { txid } = await apiManager.pushTx(rawtx);
    return txid;
  };
  signTx = async (txHex: string, inputs) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');
    const networkType = commonManager.getNetworkType();
    const psbtNetwork = getPsbtNetworkType(networkType);

    const scriptPubKey = await createScriptPubKeyByPublicKey(account.address, psbtNetwork);

    const currentKeyring = await walletController.getCurrentKeyring();
    let addressType = AddressType.P2WPKH;
    if (currentKeyring) {
      addressType = currentKeyring.addressType;
    }
    const rawtx = await createSendBTC({
      scriptPubKey,
      addressType,
      txHex,
      wallet: this,
      network: psbtNetwork,
      inputs
    });
    return rawtx;
  };
  pushInscribeTransferTx = async (oid: string, rawtx: string, isRbf: boolean) => {
    try {
      const result = await apiManager.sendInscribeTransferRawtx(oid, rawtx, isRbf);
      return result;
    } catch (e: any) {
      throw new Error(e.message);
    }
  };
}

export default new TransactionController();
