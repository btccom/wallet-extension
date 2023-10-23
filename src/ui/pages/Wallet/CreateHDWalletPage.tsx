import { Button } from 'antd';
import bitcore from 'bitcore-lib';
import Mnemonic from 'bitcore-mnemonic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ADDRESS_TYPES } from '@/common/constant';
import { AddressType } from '@/common/types';
import { Grid, Header, Input } from '@/ui/components';
import { AddressTypeCard } from '@/ui/components/AddressTypeCard';
import { Footer } from '@/ui/components/Footer';
import { Icon } from '@/ui/components/Icon';
import { SelectInput } from '@/ui/components/SelectInput';
import { TabBar } from '@/ui/components/TabBar';
import { useNavigate } from '@/ui/router';
import { useCreateAccountCallback } from '@/ui/store/common/hook';
import { copyToClipboard, useWallet, shuffleArray } from '@/ui/utils';
import { useHelper } from '@/ui/utils/HelperContext';
import { CloseOutlined } from '@ant-design/icons';

function Step1_Create({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const wallet = useWallet();
  const helper = useHelper();

  const init = async () => {
    const _mnemonics = (await wallet.getPreMnemonics()) || (await wallet.generatePreMnemonic());
    updateContextData({
      mnemonics: _mnemonics,
      step1Completed: true
    });
  };

  useEffect(() => {
    init();
  }, []);

  function copy(str: string) {
    copyToClipboard(str).then(() => {
      helper.toast('Copied', 'success');
    });
  }

  const btnClick = () => {
    updateContextData({
      tabType: TabType.STEP2
    });
  };

  const words = contextData.mnemonics.split(' ');
  return (
    <div className="flex-col gap-xl">
      <div className="text font-bold font-lg align-center">Secret Recovery Phrase</div>
      <div>
        <div className="text skyblue-dark align-center font-xs">
          This phrase is the ONLY way to recover your wallet. Do not share it with anyone! Write down your Secret
          Recovery Phrase and store it securely offline.
        </div>
      </div>
      <div className="flex-row-center">
        <Grid columns={2} style={{ gap: '24px 40px' }}>
          {words.map((v, index) => {
            return (
              <div className="flex-row-center" key={index}>
                <div className="text" style={{ width: 20 }}>
                  {`${index + 1}. `}
                </div>
                <div className="card2" style={{ width: 80, minHeight: 25 }}>
                  <div className="text select-text align-center">{v}</div>
                </div>
              </div>
            );
          })}
        </Grid>
      </div>
      <div
        className="flex-row-center"
        onClick={(e) => {
          copy(contextData.mnemonics);
          helper.toast('Copied', 'success');
        }}>
        <Icon icon="copy" color="black-muted" />
        <div className="text black-muted pointer">Copy to clipboard</div>
      </div>

      <Footer preset="fixed">
        <Button className="primary-btn full-x" onClick={btnClick}>
          I have written down
        </Button>
      </Footer>
    </div>
  );
}

function Step2_Check({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const wallet = useWallet();
  const helper = useHelper();

  const [words, setWords] = useState<string[]>([]);
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const [mnemonicsChecked, setMnemonicsChecked] = useState<boolean[]>([]);
  const [selectIndex, setSelectIndex] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(false);

  const init = async () => {
    const _mnemonics = await wallet.getPreMnemonics();
    updateContextData({
      mnemonics: _mnemonics,
      step1Completed: true
    });
    setWords(new Array(_mnemonics.split(' ').length).fill(''));
    const arrMnemonics = shuffleArray(_mnemonics.split(' '));
    setMnemonics(shuffleArray(_mnemonics.split(' ')));
    setMnemonicsChecked(new Array(arrMnemonics.length).fill(false));
  };

  useEffect(() => {
    init();
  }, []);

  function copy(str: string) {
    copyToClipboard(str).then(() => {
      helper.toast('Copied', 'success');
    });
  }

  const btnClick = () => {
    updateContextData({
      tabType: TabType.STEP3
    });
  };

  const labelStyle = { width: 22, minWidth: 22 };
  const textStyle = { width: 80, minHeight: 25, padding: 0 };
  const rowStyle = { gap: '14px 26px', gridTemplateCols: '1fr 1fr 1fr' };
  const borderRadirius = {
    lg: '15px',
    md: '10px',
    sm: '5px',
    xs: '3px'
  };
  const handlerClick = (word, index: number) => {
    if (word) {
      setWords(words.map((w, i) => (i === index ? '' : w)));
      setMnemonics(
        mnemonics.map((m, i) => {
          if (m === word) {
            setMnemonicsChecked(mnemonicsChecked.map((b, j) => (i === j ? !b : b)));
          }
          return m;
        })
      );
    }
    setSelectIndex(index);
  };
  const handlerClickMnemonics = (word, index: number) => {
    if (!mnemonicsChecked[index]) {
      const data = words.map((w, i) => (i === selectIndex ? word : w));
      setWords(data);

      //choise all mnemonics and check it
      const wordsIndex = data.indexOf('');
      if (wordsIndex === -1) {
        checkMnemonics(data);
      }
      setSelectIndex(wordsIndex);
    } else {
      const changeWords = words.map((w, i) => {
        if (w === word) {
          setSelectIndex(i);
          return '';
        }
        return w;
      });
      setWords(changeWords);
      setEnabled(false);
    }
    setMnemonicsChecked(mnemonicsChecked.map((b, i) => (i === index ? !b : b)));
  };
  const checkMnemonics = async (words) => {
    const _mnemonics = contextData.mnemonics;
    const enabled = words.join(' ') === _mnemonics;
    setEnabled(enabled);
    setError(!enabled);
  };
  const getBorderStyle = useCallback(() => {
    return words.indexOf('') === -1 && error ? 'red' : enabled ? 'green' : 'gray';
  }, [words, error, enabled]);
  return (
    <div className="flex-col gap-xl">
      <div className="text font-bold font-lg align-center">Verify Secret Recovery Phrase</div>
      <div className="text font-xs skyblue-dark align-center">
        Input your Secret Recovery Phrase in the correct order
      </div>
      <div className="flex-row-center">
        <Grid
          columns={2}
          className={`border-${getBorderStyle()}`}
          style={{
            gap: '14px 40px',
            borderWidth: '1px',
            borderStyle: 'solid',
            padding: '25px',
            borderRadius: borderRadirius.md
          }}>
          {words.map((v, index) => {
            return (
              <div
                key={index}
                className="flex-row items-center pointer"
                onClick={(e) => {
                  handlerClick(v, index);
                }}>
                <div className="text" style={labelStyle}>{`${index + 1}. `}</div>
                <div
                  className="card2"
                  style={{
                    ...textStyle,
                    border: `1px solid #2B323B`,
                    borderRadius: borderRadirius.xs,
                    backgroundColor: 'transparent',
                    borderColor: selectIndex === index ? '#1a7ee3' : '#2B323B'
                  }}>
                  <div className="text select-text black-color align-center">{v}</div>
                </div>
              </div>
            );
          })}
        </Grid>
      </div>
      <div className="flex-row-center">
        <Grid columns={3} style={rowStyle}>
          {mnemonics.map((v, index) => {
            return (
              <div
                key={index}
                className="flex-row items-center"
                style={{ borderRadius: borderRadirius.sm }}
                onClick={(e) => {
                  handlerClickMnemonics(v, index);
                }}>
                <div
                  className={`card2 ${mnemonicsChecked[index] ? 'bg-selected-text' : ''}`}
                  style={{
                    ...textStyle,
                    borderRadius: borderRadirius.xs
                  }}>
                  <div
                    className={`text select-text align-center pointer ${
                      mnemonicsChecked[index] ? 'selected-text' : ''
                    }`}>
                    {v}
                  </div>
                </div>
              </div>
            );
          })}
        </Grid>
      </div>
      <Footer preset="fixed">
        <Button className="primary-btn full-x" onClick={btnClick} disabled={!enabled}>
          Next
        </Button>
      </Footer>
    </div>
  );
}
function Step1_Import({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const [keys, setKeys] = useState<Array<string>>(new Array(12).fill(''));
  const [curInputIndex, setCurInputIndex] = useState(0);
  const [hover, setHover] = useState(999);
  const [disabled, setDisabled] = useState(true);
  const [mnemonicList, setMnemonicList] = useState<Array<string>>([]);

  const handleEventPaste = (event, index: number) => {
    const copyText = event.clipboardData?.getData('text/plain');
    const textArr = copyText.trim().split(' ');
    const newKeys = [...keys];
    if (textArr) {
      for (let i = 0; i < keys.length - index; i++) {
        if (textArr.length == i) {
          break;
        }
        newKeys[index + i] = textArr[i];
      }
      setKeys(newKeys);
    }

    event.preventDefault();
  };

  const onChange = (value: any, index: any) => {
    const newKeys = [...keys];
    newKeys.splice(index, 1, value);
    setKeys(newKeys);
  };

  useEffect(() => {
    setDisabled(true);

    const hasEmpty =
      keys.filter((key) => {
        return key == '';
      }).length > 0;
    if (hasEmpty) {
      return;
    }

    const mnemonic = keys.join(' ');
    if (!Mnemonic.isValid(mnemonic)) {
      return;
    }

    setDisabled(false);
  }, [keys]);

  useEffect(() => {
    //todo
  }, [hover]);

  useEffect(() => {
    setMnemonicList(Mnemonic.Words.ENGLISH);
  }, []);

  const onNext = () => {
    const mnemonics = keys.join(' ');
    updateContextData({ mnemonics, tabType: TabType.STEP3 });
  };
  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      onNext();
    }
  };

  return (
    <div className="flex-col gap-lg">
      <div className="text font-bold font-lg align-center">Import Secret Recovery Phrase</div>
      <div className="text sub align-center skyblue-dark">
        Import an existing wallet with your 12 word Secret Recovery Phrase
      </div>
      <div className="flex-row-center">
        <Grid columns={2}>
          {keys.map((_, index) => {
            return (
              <div key={index}>
                <div className="card gap-md" style={{ backgroundColor: 'transparent' }}>
                  <div className="flex-row-center">
                    <div style={{ width: 25, textAlign: 'right' }} className="text textDim">{`${index + 1}. `}</div>
                    <SelectInput
                      ikey={`input-${index}`}
                      value={_}
                      onPaste={(e) => {
                        handleEventPaste(e, index);
                      }}
                      onChange={(e) => {
                        onChange(e.target.value, index);
                      }}
                      options={mnemonicList}
                      onSelect={(value) => {
                        onChange(value, index);
                      }}
                      onFocus={(e) => {
                        setCurInputIndex(index);
                      }}
                      onBlur={(e) => {
                        setCurInputIndex(999);
                      }}
                      onKeyUp={(e) => handleOnKeyUp(e)}
                      autoFocus={index == curInputIndex}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </Grid>
      </div>

      <Footer preset="fixed">
        <Button
          className="primary-btn full-x"
          onClick={() => {
            onNext();
          }}
          disabled={disabled}>
          Continue
        </Button>
      </Footer>
    </div>
  );
}

function Step2({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const wallet = useWallet();
  const helper = useHelper();

  const hdPathOptions = useMemo(() => {
    return ADDRESS_TYPES.filter((v) => {
      if (v.order < 0) {
        return false;
      }
      return true;
    })
      .sort((a, b) => a.order - b.order)
      .map((v) => {
        return {
          label: v.name,
          hdPath: v.hdPath,
          addressType: v.value
        };
      });
  }, [contextData]);

  const [previewAddresses, setPreviewAddresses] = useState<string[]>(hdPathOptions.map((v) => ''));

  const [error, setError] = useState('');

  const createAccount = useCreateAccountCallback();
  const navigate = useNavigate();

  const [pathText, setPathText] = useState(contextData.customHdPath);

  useEffect(() => {
    const option = hdPathOptions[contextData.addressTypeIndex];
    updateContextData({ addressType: option.addressType });
  }, [contextData.addressTypeIndex]);

  const generateAddress = async () => {
    const addresses: string[] = [];
    for (let i = 0; i < hdPathOptions.length; i++) {
      const options = hdPathOptions[i];
      try {
        const keyring = await wallet.createTmpKeyringWithMnemonics(
          contextData.mnemonics,
          contextData.customHdPath || options.hdPath,
          contextData.passphrase,
          options.addressType
        );
        const address = keyring.accounts[0].address;
        addresses.push(address);
      } catch (e) {
        console.log(e);
        setError((e as any).message);
        return;
      }
    }
    setPreviewAddresses(addresses);
  };

  useEffect(() => {
    generateAddress();
  }, [contextData.passphrase, contextData.customHdPath]);

  const submitCustomHdPath = () => {
    if (contextData.customHdPath === pathText) return;
    const isValid = bitcore.HDPrivateKey.isValidPath(pathText);
    if (!isValid) {
      setError('Invalid derivation path.');
      return;
    }
    updateContextData({
      customHdPath: pathText
    });
  };

  const resetCustomHdPath = () => {
    updateContextData({
      customHdPath: ''
    });
    setError('');
    setPathText('');
  };

  const onNext = async () => {
    try {
      const option = hdPathOptions[contextData.addressTypeIndex];
      const hdPath = contextData.customHdPath || option.hdPath;

      await createAccount(contextData.mnemonics, hdPath, contextData.passphrase, contextData.addressType);
      navigate('HomePage');
    } catch (e) {
      helper.toast((e as any).message, 'error');
    }
  };

  return (
    <div className="flex-col">
      <div className="text font-bold">Address Type</div>
      {hdPathOptions.map((item, index) => {
        const address = previewAddresses[index];
        const hdPath = (contextData.customHdPath || item.hdPath) + '/0';
        return (
          <AddressTypeCard
            checkBalance={false}
            key={index}
            label={`${item.label} (${hdPath})`}
            address={address}
            checked={index == contextData.addressTypeIndex}
            onClick={() => {
              updateContextData({
                addressTypeIndex: index,
                addressType: item.addressType
              });
            }}
          />
        );
      })}

      <div className="text font-bold mt-lg">Custom HdPath (Optional)</div>

      <div className="flex-col">
        <Input
          placeholder={'Custom HD Wallet Derivation Path'}
          value={pathText}
          onChange={async (e) => {
            setError('');
            setPathText(e.target.value);
          }}
          onBlur={(e) => {
            submitCustomHdPath();
          }}
        />
        {contextData.customHdPath && (
          <Icon
            onClick={() => {
              resetCustomHdPath();
            }}>
            <CloseOutlined />
          </Icon>
        )}
      </div>
      {error && <div className="text error">{error}</div>}

      <div className="text font-bold mt-lg">Phrase (Optional)</div>
      <Input
        placeholder={'Passphrase'}
        defaultValue={contextData.passphrase}
        onChange={async (e) => {
          updateContextData({
            passphrase: e.target.value
          });
        }}
      />

      <Footer preset="fixed">
        <Button
          className="primary-btn full-x"
          onClick={() => {
            onNext();
          }}>
          Continue
        </Button>
      </Footer>
    </div>
  );
}

enum TabType {
  STEP1 = 'STEP1',
  STEP2 = 'STEP2',
  STEP3 = 'STEP3'
}

interface ContextData {
  mnemonics: string;
  hdPath: string;
  passphrase: string;
  addressType: AddressType;
  step1Completed: boolean;
  tabType: TabType;
  isRestore: boolean;
  isCustom: boolean;
  customHdPath: string;
  addressTypeIndex: number;
}

interface UpdateContextDataParams {
  mnemonics?: string;
  hdPath?: string;
  passphrase?: string;
  addressType?: AddressType;
  step1Completed?: boolean;
  tabType?: TabType;
  isCustom?: boolean;
  customHdPath?: string;
  addressTypeIndex?: number;
}

export default function CreateHDWalletPage() {
  const navigate = useNavigate();

  const { state } = useLocation();
  const { isImport, fromUnlock } = state as {
    isImport: boolean;
    fromUnlock: boolean;
  };

  const [contextData, setContextData] = useState<ContextData>({
    mnemonics: '',
    hdPath: '',
    passphrase: '',
    addressType: AddressType.P2WPKH,
    step1Completed: false,
    tabType: TabType.STEP1,
    isRestore: isImport,
    isCustom: false,
    customHdPath: '',
    addressTypeIndex: 0
  });

  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  const items = useMemo(() => {
    if (contextData.isRestore) {
      return [
        {
          key: TabType.STEP1,
          label: 'Step 1',
          children: <Step1_Import contextData={contextData} updateContextData={updateContextData} />
        },
        {
          key: TabType.STEP3,
          label: 'Step 2',
          children: <Step2 contextData={contextData} updateContextData={updateContextData} />
        }
      ];
    } else {
      return [
        {
          key: TabType.STEP1,
          label: 'Step 1',
          children: <Step1_Create contextData={contextData} updateContextData={updateContextData} />
        },
        {
          key: TabType.STEP2,
          label: 'Step 2',
          children: <Step2_Check contextData={contextData} updateContextData={updateContextData} />
        },
        {
          key: TabType.STEP3,
          label: 'Step 3',
          children: <Step2 contextData={contextData} updateContextData={updateContextData} />
        }
      ];
    }
  }, [contextData, updateContextData]);

  const currentChildren = useMemo(() => {
    const item = items.find((v) => v.key === contextData.tabType);
    return item?.children;
  }, [items, contextData.tabType]);

  return (
    <div className="container">
      <Header
        onBack={() => {
          if (fromUnlock) {
            navigate('Welcome');
          } else {
            window.history.go(-1);
          }
        }}
        title={contextData.isRestore ? 'Restore from mnemonics' : 'Create a new HD Wallet'}
      />
      <div className="view">
        <div className="flex-row-center">
          <TabBar
            progressEnabled
            defaultActiveKey={contextData.tabType}
            activeKey={contextData.tabType}
            items={items.map((v) => ({
              key: v.key,
              label: v.label
            }))}
            onTabClick={(key) => {
              const toTabType = key as TabType;
              if (toTabType === TabType.STEP2) {
                if (!contextData.step1Completed) {
                  setTimeout(() => {
                    updateContextData({ tabType: contextData.tabType });
                  }, 200);
                  return;
                }
              }
              updateContextData({ tabType: toTabType });
            }}
          />
        </div>

        {currentChildren}
      </div>
    </div>
  );
}
