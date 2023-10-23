import { Footer, Header } from '@/ui/components';
import { CardItem } from '@/ui/components/CardItem';
import { NavTabBar } from '@/ui/components/NavTabBar';

const appSummary = {
  services: [
    {
      tag: 'Services',
      list: [
        {
          title: 'Inscribe',
          value: 'Support Ethereum payment.',
          url: 'https://ordinals.btc.com/en/inscribe/brc20',
          logo: ''
        },
        {
          title: 'Market',
          value: 'To sell your BRC-20.',
          url: 'https://market.slothx.io/en',
          logo: ''
        },
        {
          title: 'Explorer',
          value: 'View hot BRC-20 and all BRC-20 inscriptions.',
          url: 'https://ordinals.btc.com/en',
          logo: ''
        }
      ]
    }
  ]
};

export default function ServicePage() {
  return (
    <div className="container">
      <Header />
      <div className="view">
        <div className="flex-col gap-lg">
          {appSummary.services.map(({ tag, list }) => (
            <div className="flex-col" key={tag}>
              <div className="text font-bold">{tag}</div>
              {list.map((v) => (
                <CardItem key={v.title} item={v} onClick={() => window.open(v.url)} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <Footer className="padding-zero" preset="fixed">
        <NavTabBar tab="service" />
      </Footer>
    </div>
  );
}
