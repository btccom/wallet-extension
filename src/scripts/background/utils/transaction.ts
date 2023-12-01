import { Transaction } from 'bitcoinjs-lib';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

import { AddressType } from '@/common/types';
import { BufferBE2LE } from '@/scripts/background/utils';

bitcoin.initEccLib(ecc);

export function getNetworkType(network: bitcoin.Network) {
  return network == bitcoin.networks.bitcoin ? 'livenet' : network == bitcoin.networks.testnet ? 'testnet' : 'regtest';
}
export async function createSendBTC({
  scriptPubKey,
  addressType,
  txHex,
  wallet,
  network,
  inputs
}: {
  scriptPubKey: string;
  addressType: any;
  txHex: string;
  wallet: any;
  network: any;
  inputs: any[];
}) {
  try {
    const tx = Transaction.fromHex(txHex);
    const psbt = new bitcoin.Psbt({ network: network });
    tx.ins.forEach((v, index) => {
      if (addressType === AddressType.P2PKH) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = true;
      }
      //Buffer BE to LE
      const hash = BufferBE2LE(v.hash);

      const input_keys = `${hash.toString('hex')}:${v.index}`;
      if (!inputs[input_keys]) {
        throw new Error('Exception inputs!');
      }
      psbt.addInput({
        hash: v.hash,
        index: v.index,
        sequence: v.sequence,
        witnessUtxo: {
          value: Number(inputs[input_keys]),
          script: Buffer.from(scriptPubKey, 'hex')
        }
      });
    });
    tx.outs.forEach((v) => {
      let address;
      try {
        address = bitcoin.address.fromOutputScript(v.script, network);
      } catch (e) {
        //
        console.log(e);
      }
      psbt.addOutput({
        value: v.value,
        address
      });
    });
    await wallet.signPsbt(psbt);
    const rawtx = psbt.extractTransaction().toHex();
    return rawtx;
  } catch (e: any) {
    console.log(e);
    throw new Error(e.message);
  }
}

export async function createScriptPubKeyByPublicKey(address: string, network: bitcoin.Network) {
  const scriptOut = bitcoin.address.toOutputScript(address, network);
  return scriptOut.toString('hex');
}
