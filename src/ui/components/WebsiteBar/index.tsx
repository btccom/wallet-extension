import { Image } from 'antd';

const WebsiteHeader = ({ session }: { session: { origin: string; icon: string; name: string } }) => {
  return (
    <div className="card2 self-items-center align-self-center mt-xl">
      <div className="flex-row items-center">
        <Image src={session.icon} width={32} preview={false} />
        <div className="text">{session.origin}</div>
      </div>
    </div>
  );
};

export default WebsiteHeader;
