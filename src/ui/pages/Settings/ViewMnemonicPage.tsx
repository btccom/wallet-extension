import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { WalletKeyring } from '@/common/types';
import { Footer, Grid, Header } from '@/ui/components';
import { Input } from '@/ui/components/Input';
import { useWallet } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

enum Step {
  VERIFY,
  SHOW
}

export default function ViewMnemonicPage() {
  const { state } = useLocation();
  const { keyring }: { keyring: WalletKeyring } = state;
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [showMnemonics, setShowMnemonics] = useState(false);
  const [step, setStep] = useState(Step.VERIFY);
  const [mnemonics, setMnemonics] = useState<any>([]);

  const wallet = useWallet();
  const helper = useHelper();

  const btnClick = async () => {
    // run(password);
    try {
      await wallet.verifyPassword(password);
      const { mnemonic, hdPath, passphrase } = await wallet.getMnemonics(password, keyring);
      setMnemonics(mnemonic.split(' '));

      setStep(Step.SHOW);
    } catch (e) {
      console.log(e);
      helper.toast('PASSWORD ERROR', 'error');
    }
  };
  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      btnClick();
    }
  };
  useEffect(() => {
    if (password) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [password]);

  const goBack = () => {
    window.history.go(-1);
  };
  return (
    <div className="container">
      <Header
        onBack={() => {
          goBack();
        }}
        title="View Secret Recovery Phrase"
      />
      <div className="view">
        {Step.VERIFY === step && (
          <>
            <div className="flex-col full-x">
              <div className="flex-col justify-center mt-xxl mb-xxl">
                <div className="text font-bold skyblue-dark align-center">
                  Enter your password to reveal your Secret Recovery Phrase
                </div>
              </div>

              <div className="flex-col gap-xl">
                <div className="text font-bold font-md">Password</div>
                <Input
                  preset="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => handleOnKeyUp(e)}
                  autoFocus={true}
                />
              </div>
            </div>
            <Footer preset="fixed">
              <Button disabled={disabled} type="primary" className="primary-btn full-x" onClick={btnClick}>
                Continue
              </Button>
            </Footer>
          </>
        )}
        {Step.SHOW === step && (
          <>
            <div className="flex-col full-x">
              <div className="flex-row justify-center">
                <div className="text font-bold align-center skyblue-dark">
                  Write down your Secret Recovery Phrase and make sure to keep it private. This is the unique key to
                  your wallet.
                </div>
              </div>

              <div className="flex-col gap-xl mt-xl">
                <div className="flex-col-center">
                  <div
                    className={showMnemonics ? 'rounded' : 'relative rounded'}
                    style={{ border: '1px solid rgb(214,214,214)' }}>
                    {!showMnemonics && (
                      <div
                        className="flex-row justify-center border-active"
                        onClick={() => {
                          setShowMnemonics(true);
                        }}
                        style={{
                          position: 'absolute',
                          zIndex: 11,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          padding: '10px 20px',
                          borderRadius: '25px',
                          width: '150px',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          cursor: 'pointer'
                        }}>
                        <EyeInvisibleOutlined className="font-sm" />
                        <div className="text font-sm">Show</div>
                      </div>
                    )}
                    <Grid
                      className={showMnemonics ? '' : `recovery-blur`}
                      columns={2}
                      style={{ gap: '20px 40px', padding: '20px' }}>
                      {mnemonics.map((v, index) => {
                        return (
                          <div className="flex-row items-center" key={index}>
                            <div className="text" style={{ width: 20 }}>{`${index + 1}. `}</div>
                            <div className="card2" style={{ width: 80, minHeight: 25 }}>
                              <div className="text slecte-text">{v}</div>
                            </div>
                          </div>
                        );
                      })}
                    </Grid>
                  </div>
                  {showMnemonics && (
                    <div
                      className="flex-row items-center pointer"
                      onClick={() => {
                        setShowMnemonics(false);
                      }}>
                      <EyeOutlined className="font-sm" />
                      <div className="text">Hide</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Footer preset="fixed">
              <Button
                disabled={!showMnemonics}
                className="primary-btn full-x"
                type="primary"
                onClick={() => {
                  goBack();
                }}>
                I have written down
              </Button>
            </Footer>
          </>
        )}
      </div>
    </div>
  );
}
