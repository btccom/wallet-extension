import { NETWORK_TYPES } from '@/common/constant';
import { Header, Icon } from '@/ui/components';
import { useChangeNetworkTypeCallback, useNetworkType } from '@/ui/store/ui/hooks';

export default function NetworkTypePage() {
  const networkType = useNetworkType();
  const changeNetworkType = useChangeNetworkTypeCallback();
  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Switch Network"
      />
      <div className="view">
        <div className="flex-col">
          {NETWORK_TYPES.map((item, index) => {
            return (
              <div
                className="card "
                key={index}
                onClick={async () => {
                  await changeNetworkType(item.value);
                  window.location.reload();
                }}>
                <div className="flex-row full justify-between items-center">
                  <div className="flex-row items-center">
                    <div className="text font-bold">{item.label}</div>
                  </div>
                  <div className="flex-col">{item.value == networkType && <Icon icon="check" />}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
