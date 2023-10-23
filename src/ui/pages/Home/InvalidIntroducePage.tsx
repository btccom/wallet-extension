import { Header } from '@/ui/components';

export default function InvalidIntroducePage() {
  return (
    <div className="container">
      <Header
        title={' '}
        onBack={() => {
          history.go(-1);
        }}
      />
      <div className="view px-xl">
        <div className="text font-bold font-sm">{`1. What does “brc20 amount decimal 21 > 18" mean?`}</div>
        <div className="text">
          Each BRC-20 token has a decimal, if the amount is out of the decimal of this BRC-20 token. and then the system
          will alert it. You can view the decimal of the token through this website
          <div className="text link">https://ordinals.btc.com/</div>
        </div>
        <div className="text">
          <span className="font-bold">e.g.</span>you check the ordi decimal, you can view this url
          https://ordinals.btc.com/en/brc20/ordi
        </div>
        <div className="text font-bold font-sm">{`2. What does “unable to send 500 with 400 available and ['600', '18000'] transferrable" mean?`}</div>

        <div className="text">
          BRC-20 Balance Includes both available and transferrable balance. The transferable amount is the balance that
          has been inscribed into transfer inscriptions but has not yet been sent. so when you send BRC-20 to other
          wallet. the available balance need to inscribe transfer to transferrable.
        </div>
        <div className="text">
          When you send BRC-20, the system will automatically combine UTXOs according to the amount of BRC-20 that will
          be TRANSFERRED. But sometimes the amount that you enter cannot be combined by the system.
        </div>
        <div className="text">
          <span className="font-bold">e.g.</span>
          <br />
          If your all ordi balance is 30 ordi, all is transferrable, and Just 2 transfer inscriptions is 10 ordi and 20
          ordi. and then the amount that can be combined by the system is 10 ordi, 20 ordi, 30 ordi. the other amount
          that you enter is invalid amount.
        </div>
        <div className="text">
          If your all ordi balance is 30 ordi, and Just 1 transfer inscriptions is 20 ordi. Since there are only 10 ordi
          left is available, when the amount that you enter is 15 ordi, the system will alert it. In this case, If you
          want to send 15 ordi, you can send 20 ordi to your wallet address first, and then you can send 15 ordi with
          this address.
        </div>
      </div>
    </div>
  );
}
