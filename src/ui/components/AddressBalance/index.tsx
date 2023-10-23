import { useEffect } from 'react';

import { useFetchBalanceByAddressCallback, useBalanceByAddress } from '@/ui/store/ui/hooks';

export function AddressBalance({ address }) {
  const fetchBalanceByAddress = useFetchBalanceByAddressCallback();
  const AddressBalance = useBalanceByAddress(address);
  useEffect(() => {
    const init = async (address: string) => {
      if (address) {
        try {
          await fetchBalanceByAddress(address);
        } catch (e: any) {
          console.log(e.message);
        }
      }
    };
    init(address);
  }, [address]);
  return (
    <>
      {Number(AddressBalance.amount) > 0 && (
        <div className="flex-row-between full-x items-center">
          <div className="text iblue font-xs py-xxxs ">{`${AddressBalance.amount} BTC`}</div>
        </div>
      )}
    </>
  );
}
