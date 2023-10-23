import { copyToClipboard, shortAddress } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';

import { Icon } from '../Icon';

export function CopyableAddress({ address, preset, color }: { address: string; preset?: string; color?: string }) {
  const helper = useHelper();
  color = color || 'black-address';
  return (
    <div
      className={`flex-row items-center gap-sm pointer ${
        preset === 'center' ? 'justify-center' : preset === 'start' ? 'justify-start' : 'justify-end'
      }`}>
      <div className={`text ${color}`}>{shortAddress(address, 6)}</div>
      <Icon
        icon="copy"
        color={color}
        onClick={(e) => {
          e.stopPropagation();
          copyToClipboard(address).then(() => {
            helper.toast('Copied', 'success');
          });
        }}
      />
    </div>
  );
}
