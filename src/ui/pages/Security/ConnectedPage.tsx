import { Image } from 'antd';
import { useEffect, useState } from 'react';

import { AccessSite } from '@/common/types';
import { Icon, Header } from '@/ui/components';
import { Empty } from '@/ui/components/Empty';
import { sleep, useWallet } from '@/ui/utils';

export default function ConnectedPage() {
  const wallet = useWallet();

  const [sites, setSites] = useState<AccessSite[]>([]);

  const getSites = async () => {
    const sites = await wallet.getAccessSites();
    setSites(sites);
  };

  useEffect(() => {
    getSites();
  }, []);

  const handleRemove = async (origin: string) => {
    await wallet.removeAccessSite(origin);
    await sleep(0.1);
    getSites();
  };
  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Connected Sites"
      />
      <div className="view">
        <div className="flex-col">
          {sites.length > 0 ? (
            sites.map((item, index) => {
              return (
                <div className="card rounded" key={item.origin}>
                  <div className="flex-row-between items-center full">
                    <div className="flex-row items-center">
                      <Image src={item.icon} preview={false} width={32} />
                      <div className="text sub">{item.origin}</div>
                    </div>
                    <div className="flex-col justify-center">
                      <Icon
                        icon="close"
                        onClick={() => {
                          handleRemove(item.origin);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </div>
  );
}
