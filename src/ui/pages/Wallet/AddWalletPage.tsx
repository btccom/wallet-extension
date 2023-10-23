import { Header } from '@/ui/components';
import { useNavigate } from '@/ui/router';

export default function AddWalletPage() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Create a new wallet"
      />
      <div className="view">
        <div className="flex-col">
          <div className="text font-bold">Create Wallet</div>

          <div
            className="card justify-center pointer"
            onClick={(e) => {
              navigate('CreateHDWalletPage', { isImport: false });
            }}>
            <div className="flex-col-center full ">
              <div className="text font-sm">Create with mnemonics (12-words)</div>
            </div>
          </div>
          <div className="text font-bold mt-lg">Restore Wallet</div>

          <div
            className="card justify-center pointer"
            onClick={(e) => {
              navigate('CreateHDWalletPage', { isImport: true });
            }}>
            <div className="flex-col-center full ">
              <div className="text font-sm">Restore from mnemonics (12-words)</div>
            </div>
          </div>

          <div
            className="card justify-center pointer"
            onClick={(e) => {
              navigate('ImportSimpleWallet');
            }}>
            <div className="flex-col-center full ">
              <div className="text font-sm">Restore from single private key</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
