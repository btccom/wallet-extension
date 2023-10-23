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

  signPsbt = async (psbt: bitcoin.Psbt, options?: any) => {
    const account = await walletController.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const keyring = await walletController.getCurrentKeyring();
    if (!keyring) throw new Error('no current keyring');
    const _keyring = walletKeyManager.keyrings[keyring.index];

    const networkType = walletController.getNetworkType();
    const psbtNetwork = getPsbtNetworkType(networkType);

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
      const isSigned = false; //v.finalScriptSig || v.finalScriptWitness;
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
    autoAdjust
  }: {
    to: string;
    amount: number;
    utxos: UTXO[];
    receiverToPayFee: boolean;
    feeRate: number | number;
    autoAdjust: boolean;
  }) => {
    const account = commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const btcTransactionInfo = await apiManager.sendBTC(account.address, to, amount, feeRate, autoAdjust);

    return btcTransactionInfo;
  };

  sendInscription = async ({ to, inscriptionId, feeRate }: { to: string; inscriptionId: string; feeRate: number }) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');
    const btcTransactionInfo = await apiManager.sendInscription(account.address, to, [inscriptionId], feeRate);
    return btcTransactionInfo;
  };

  sendInscriptions = async ({
    to,
    inscriptionIds,
    feeRate
  }: {
    to: string;
    inscriptionIds: string[];
    feeRate: number;
  }) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const btcTransactionInfo = await apiManager.sendInscription(account.address, to, inscriptionIds, feeRate);
    return btcTransactionInfo;
  };
  sendBrc20 = async ({
    to,
    inscriptionIds,
    feeRate,
    tick
  }: {
    to: string;
    inscriptionIds: string[];
    feeRate: number;
    tick: string;
  }) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const btcTransactionInfo = await apiManager.sendBrc20(account.address, to, tick, inscriptionIds, feeRate);
    return btcTransactionInfo;
  };

  sendSpsat = async ({ to, name, feeRate }: { to: string; name: string; feeRate: string }) => {
    const account = await commonManager.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const btcTransactionInfo = await apiManager.send_spsat(account.address, to, name, feeRate);
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
  pushInscribeTransferTx = async (oid: string, rawtx: string) => {
    try {
      const result = await apiManager.sendInscribeTransferRawtx(oid, rawtx);
      return result;
    } catch (e: any) {
      throw new Error(e.message);
    }
  };
}

export default new TransactionController();
