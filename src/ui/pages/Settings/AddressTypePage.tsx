import { useEffect, useMemo, useState } from 'react';

import { ADDRESS_TYPES, KEYCHAIN_TYPE } from '@/common/constant';
import { Header } from '@/ui/components';
import { AddressTypeCard } from '@/ui/components/AddressTypeCard';
import { useCurrentAccount, useCurrentKeyring } from '@/ui/store/ui/hooks';
import { useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

export default function AddressTypePage() {
  const wallet = useWallet();
  const currentKeyring = useCurrentKeyring();
  const account = useCurrentAccount();

  const [addresses, setAddresses] = useState<string[]>([]);
  const helper = useHelper();
  const loadAddresses = async () => {
    helper.loading(true);
    try {
      const _res = await wallet.getAllAddresses(currentKeyring, account.index || 0);
      setAddresses(_res);
    } catch (err) {
      console.log(err);
    }
    helper.loading(false);
  };

  useEffect(() => {
    if (currentKeyring.type) loadAddresses();
  }, [currentKeyring]);

  const addressTypes = useMemo(() => {
    if (currentKeyring.type === KEYCHAIN_TYPE.HdKeyring) {
      return ADDRESS_TYPES.filter((v) => {
        if (v.order < 0) {
          return false;
        }
        return true;
      }).sort((a, b) => a.order - b.order);
    } else {
      return ADDRESS_TYPES.filter((v) => v.order >= 0).sort((a, b) => a.order - b.order);
    }
  }, [currentKeyring.type, addresses]);

  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Address Type"
      />
      <div className="view">
        <div className="flex-col">
          {addressTypes.map((item, index) => {
            const address = addresses[item.value];
            return (
              <AddressTypeCard
                key={index}
                label={`${item.name} (${item.hdPath}/${account.index})`}
                address={address}
                checked={item.value == currentKeyring.addressType}
                onClick={async () => {
                  await wallet.changeAddressType(item.value);
                  window.location.reload();
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
