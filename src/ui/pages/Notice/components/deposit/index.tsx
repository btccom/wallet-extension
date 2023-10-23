import DepositBRC20 from './DepositBRC20';
import DepositBitcoin from './DepositBitcoin';

export interface DepositProps {
  params: {
    session: {
      origin: string;
      icon: string;
      name: string;
    };
    data: {
      toAddress: string;
      amount: string;
      type: string;
      tick?: string;
    };
  };
}
export default function Deposit({ params: { session, data } }: DepositProps) {
  const type = data.type || 'btc';
  return (
    <>
      {type === 'btc' && <DepositBitcoin params={{ session, data }} />}
      {type === 'brc20' && <DepositBRC20 params={{ session, data }} />}
    </>
  );
}
