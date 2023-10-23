import { RouteTypes, useNavigate } from '@/ui/router';

import { Icon, IconTypes } from '../Icon';

const TabNavList = [
  { name: 'home', icon: 'wallet', routeName: 'HomePage' },
  { name: 'mint', icon: 'compass', routeName: 'InscriptionPage' },
  { name: 'service', icon: 'grid', routeName: 'ServicePage' }
];
export function NavTabBar({ tab }: { tab: any }) {
  const navigate = useNavigate();
  const tabWidth = `${100 / TabNavList.length}%`;
  return (
    <div className="flex-row justify-around gap-zero bg2 full-x" style={{ height: '67.5px' }}>
      {TabNavList.map((item) => {
        return (
          <div
            key={item.name}
            className="flex-col-center pointer"
            style={{ width: tabWidth }}
            onClick={(e) => {
              navigate(item.routeName as RouteTypes);
            }}>
            <Icon icon={item.icon as IconTypes} color={item.name === tab ? 'iblue' : 'black-muted'} />
          </div>
        );
      })}
    </div>
  );
}
