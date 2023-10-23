import { useCallback } from 'react';

import { BtcTransaction, InscribeTransferPushTxResult, RawTxInfo, ToAddressInfo } from '@/common/types';
import { numberAdd, numberMinus } from '@/common/utils';
import { sleep, useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

import { AppState } from '..';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useAccountAddress } from '../ui/hooks';
import { uiActions } from '../ui/reducer';
import { transactionsActions } from './reducer';

export function useTransactionsState(): AppState['transactions'] {
  return useAppSelector((state) => state.transactions);
}

export function useBitcoinTx() {
  const transactionsState = useTransactionsState();
  return transactionsState.bitcoinTx;
}

export function useCreateBitcoinTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  return useCallback(
    async (toAddressInfo: ToAddressInfo, toAmount: number | number, feeRate?: number, autoAdjust = false) => {
      if (!feeRate) {
        const FeeRates = await wallet.getFeeRates();
        feeRate = FeeRates[1].feerate;
      }
      try {
        const btcTransactionInfo: BtcTransaction = await wallet.sendBTC({
          to: toAddressInfo.address,
          amount: toAmount,
          feeRate,
          autoAdjust
        });
        const rawTxInfo: RawTxInfo = {
          txHex: btcTransactionInfo.rtx,
          toAddressInfo,
          fee: Number(btcTransactionInfo.fee),
          deduction: autoAdjust ? toAmount : numberAdd(Number(btcTransactionInfo.fee), Number(toAmount)),
          receiveAmount: autoAdjust ? numberMinus(toAmount, Number(btcTransactionInfo.fee)) : toAmount,
          inputs: btcTransactionInfo.inputs
        };
        return rawTxInfo;
      } catch (e: any) {
        console.log(e);
        throw new Error(e.message);
      }
    },
    [dispatch, wallet, fromAddress]
  );
}

export function usePushBitcoinTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const helper = useHelper();
  return useCallback(
    async (rawtx: string) => {
      const ret = {
        success: false,
        txid: '',
        error: ''
      };
      try {
        helper.loading(true);
        const txid = await wallet.pushTx(rawtx);
        await sleep(3); // Wait for transaction synchronization
        helper.loading(false);
        dispatch(transactionsActions.updateBitcoinTx({ txid }));
        dispatch(uiActions.expireBalance());
        setTimeout(() => {
          dispatch(uiActions.expireBalance());
        }, 2000);
        setTimeout(() => {
          dispatch(uiActions.expireBalance());
        }, 5000);

        ret.success = true;
        ret.txid = txid;
      } catch (e) {
        ret.error = (e as Error).message;
        console.log(e);
        helper.loading(false);
      }

      return ret;
    },
    [dispatch, wallet]
  );
}

export function usePushInscribeTransferTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const helper = useHelper();
  return useCallback(
    async (oid: string, rawtx: string) => {
      const defaultPushTxResult: InscribeTransferPushTxResult = {
        txid: '',
        reveal: '',
        sats_in_inscriptions: '',
        tick: '',
        brc20_amount: ''
      };
      const ret = {
        success: false,
        result: defaultPushTxResult,
        error: ''
      };
      try {
        helper.loading(true);
        const pushTxResult = await wallet.pushInscribeTransferTx(oid, rawtx);
        await sleep(3); // Wait for transaction synchronization
        helper.loading(false);
        dispatch(transactionsActions.updateBitcoinTx({ txid: pushTxResult.txid }));
        dispatch(uiActions.expireBalance());
        setTimeout(() => {
          dispatch(uiActions.expireBalance());
        }, 2000);
        setTimeout(() => {
          dispatch(uiActions.expireBalance());
        }, 5000);

        ret.success = true;
        ret.result = pushTxResult;
      } catch (e) {
        ret.error = (e as Error).message;
        helper.loading(false);
      }

      return ret;
    },
    [dispatch, wallet]
  );
}
export function useOrdinalsTx() {
  const transactionsState = useTransactionsState();
  return transactionsState.ordinalsTx;
}

export function useCreateOrdinalsTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  return useCallback(
    async (toAddressInfo: ToAddressInfo, inscriptionId: string, feeRate: number, outputValue: number) => {
      const oInscriptionTransaction = await wallet.sendInscription({
        to: toAddressInfo.address,
        inscriptionId,
        feeRate
      });
      const rawTxInfo: RawTxInfo = {
        txHex: oInscriptionTransaction.rtx,
        deduction: numberAdd(oInscriptionTransaction.fee, oInscriptionTransaction.sats_in_inscription),
        fee: Number(oInscriptionTransaction.fee),
        receiveAmount: outputValue,
        toAddressInfo,
        inscription: {
          amount: oInscriptionTransaction.sats_in_inscription,
          id: oInscriptionTransaction.id,
          number: Number(oInscriptionTransaction.number),
          timestamp: Number(oInscriptionTransaction.timestamp),
          preview: oInscriptionTransaction.preview
        },
        inputs: oInscriptionTransaction.inputs
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress]
  );
}
export function useCreateSpsatsTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  return useCallback(
    async (toAddressInfo: ToAddressInfo, name: string, feeRate: number, outputValue: number) => {
      const oSpsatTransaction = await wallet.sendSpsat({
        to: toAddressInfo.address,
        name,
        feeRate
      });
      const rawTxInfo: RawTxInfo = {
        txHex: oSpsatTransaction.rtx,
        deduction: numberAdd(oSpsatTransaction.fee, oSpsatTransaction.sats_in_spsat),
        fee: Number(oSpsatTransaction.fee),
        receiveAmount: outputValue,
        toAddressInfo,
        spsat: {
          id: Number(oSpsatTransaction.id),
          rarity: oSpsatTransaction.rarity,
          height: Number(oSpsatTransaction.height),
          name: oSpsatTransaction.name,
          satsIn: oSpsatTransaction.sats_in_spsat
        },
        inputs: oSpsatTransaction.inputs
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress]
  );
}

export function useCreateMultiBrc20TxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  return useCallback(
    async (toAddressInfo: ToAddressInfo, inscriptionIds: string[], tick: string, feeRate?: number) => {
      if (!feeRate) {
        const feeRates = await wallet.getFeeRates();
        feeRate = feeRates[1].feerate;
      }
      const oBrc20Transaction = await wallet.sendBrc20({
        to: toAddressInfo.address,
        inscriptionIds,
        feeRate,
        tick
      });
      const rawTxInfo: RawTxInfo = {
        txHex: oBrc20Transaction.rtx,
        deduction: numberAdd(oBrc20Transaction.fee, oBrc20Transaction.sats_in_brc20),
        fee: Number(oBrc20Transaction.fee),
        receiveAmount: Number(oBrc20Transaction.sats_in_brc20),
        toAddressInfo,
        brc20: {
          tick: tick,
          amount: oBrc20Transaction.brc20_amount,
          satsIn: oBrc20Transaction.sats_in_brc20
        },
        inputs: oBrc20Transaction.inputs
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress]
  );
}

export function useCreateSendBrc20TxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  return useCallback(
    async (toAddressInfo: ToAddressInfo, amount: string | number, tick: string, feeRate?: number) => {
      if (!feeRate) {
        const feeRates = await wallet.getFeeRates();
        feeRate = feeRates[1].feerate;
      }
      const oResult = await wallet.transferAndSend(fromAddress, toAddressInfo.address, tick, amount, feeRate);
      if (oResult.code !== '0') {
        return oResult;
      }
      const oBrc20Transaction = oResult.data;
      const rawTxInfo: RawTxInfo = {
        txHex: oBrc20Transaction.rtx,
        deduction: numberAdd(oBrc20Transaction.fee, oBrc20Transaction.output_amount),
        fee: Number(oBrc20Transaction.fee),
        receiveAmount: Number(oBrc20Transaction.output_amount),
        toAddressInfo,
        brc20Utxos: oBrc20Transaction.brc20_utxos.map((v) => {
          return {
            tick: v.tick,
            amount: v.brc20amount,
            satsIn: v.sats_in_inscription,
            number: Number(v.number),
            timestamp: v.timestamp
          };
        }),
        inputs: oBrc20Transaction.inputs,
        id: oBrc20Transaction.id,
        next: oBrc20Transaction.next,
        serviceFee: oBrc20Transaction.service_fee
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress]
  );
}
export function usePushOrdinalsTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const helper = useHelper();
  return useCallback(
    async (rawtx: string) => {
      const ret = {
        success: false,
        txid: '',
        error: ''
      };
      try {
        helper.loading(true);
        const txid = await wallet.pushTx(rawtx);
        await sleep(3); // Wait for transaction synchronization
        helper.loading(false);
        dispatch(transactionsActions.updateOrdinalsTx({ txid }));

        dispatch(uiActions.expireBalance());
        setTimeout(() => {
          dispatch(uiActions.expireBalance());
        }, 2000);
        setTimeout(() => {
          dispatch(uiActions.expireBalance());
        }, 5000);

        ret.success = true;
        ret.txid = txid;
      } catch (e) {
        console.log(e);
        ret.error = (e as Error).message;
        helper.loading(false);
      }

      return ret;
    },
    [dispatch, wallet]
  );
}
