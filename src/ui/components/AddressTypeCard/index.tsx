import { ReactEventHandler } from 'react';

import { CheckCircleFilled } from '@ant-design/icons';

import { AddressBalance } from '../AddressBalance';
import { CopyableAddress } from '../CopyableAddress';
import { Icon } from '../Icon';

interface AddressTypeCardProps {
  label: string;
  address: string;
  checked: boolean;
  onClick?: ReactEventHandler<HTMLDivElement>;
  checkBalance?: boolean;
}
export function AddressTypeCard(props: AddressTypeCardProps) {
  const { onClick, label, address, checked, checkBalance = true } = props;
  return (
    <div className="card flex-row padding-zero gap-zero rounded pointer" onClick={onClick}>
      <div className="flex-row-center px-md">
        {checked ? (
          <Icon size={20}>
            <CheckCircleFilled className="font-xl iblue" />
          </Icon>
        ) : (
          <div className="uncheck"></div>
        )}
      </div>
      <div className="flex-col full gap-zero">
        <div className="flex-row-between pt-md ">
          <div className="flex-col-center">
            <div className="text font-xs">{label}</div>
          </div>
        </div>
        <div className="flex-row-between textDim" style={{ minHeight: 28 }}>
          <CopyableAddress address={address} color="black-muted" />
        </div>
        {checkBalance && <AddressBalance address={address} />}
        <div className=" mb-md "></div>
      </div>
    </div>
  );
}
