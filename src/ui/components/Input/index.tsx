import bitcore from 'bitcore-lib';
import React, { CSSProperties, useEffect, useState } from 'react';

import { Inscription } from '@/common/types';
import { useWallet } from '@/ui/utils';

import { CopyableAddress } from '../CopyableAddress';
import { Icon } from '../Icon';
import './index.less';

export interface InputProps {
  preset?: Presets;
  placeholder?: string;
  children?: React.ReactNode;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
  autoFocus?: boolean;
  defaultValue?: string;
  value?: string;
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  addressInputData?: { address: string; domain: string };
  onAddressInputChange?: (params: { address: string; domain: string; inscription?: Inscription }) => void;
  disabled?: boolean;
  suffix?: React.ReactNode;
}

type Presets = keyof typeof $inputPresets;
const $inputPresets = {
  password: {},
  amount: {},
  address: {},
  text: {},
  select: {}
};

const $baseContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'white',
  borderColor: '',
  paddingLeft: 15.2,
  paddingRight: 15.2,
  paddingTop: 11,
  paddingBottom: 11,
  borderRadius: 5,
  minHeight: '46px',
  alignSelf: 'stretch'
};

const $baseInputStyle: CSSProperties = Object.assign(
  {},
  {
    display: 'flex',
    flex: 1,
    borderWidth: 0,
    outlineWidth: 0,
    backgroundColor: 'white',
    alignSelf: 'stretch'
  }
);

function PasswordInput(props: InputProps) {
  const { placeholder, style: $inputStyleOverride, ...rest } = props;
  const [type, setType] = useState<'password' | 'text'>('password');
  return (
    <div style={$baseContainerStyle}>
      <input
        placeholder={placeholder || 'Password'}
        type={type}
        style={Object.assign({}, $baseInputStyle, $inputStyleOverride)}
        {...rest}
      />
      {type === 'password' && (
        <Icon icon="eye-slash" style={{ marginLeft: 4 }} onClick={() => setType('text')} color="textDim" />
      )}
      {type === 'text' && <Icon icon="eye" style={{ marginLeft: 4 }} onClick={() => setType('password')} />}
    </div>
  );
}

function AmountInput(props: InputProps) {
  const { placeholder, disabled, style: $inputStyleOverride, suffix, containerStyle, ...rest } = props;
  const $style = Object.assign({}, $baseInputStyle, $inputStyleOverride, disabled ? { color: '#222' } : {});
  return (
    <div style={Object.assign({}, $baseContainerStyle, containerStyle)}>
      <input placeholder={placeholder || 'Amount'} type={'number'} style={$style} disabled={disabled} {...rest} />
      {suffix && suffix}
    </div>
  );
}

export const AddressInput = (props: InputProps) => {
  const { placeholder, onAddressInputChange, addressInputData, style: $inputStyleOverride, ...rest } = props;

  if (!addressInputData || !onAddressInputChange) {
    return <div />;
  }
  const [validAddress, setValidAddress] = useState(addressInputData.address);
  const [parseAddress, setParseAddress] = useState(addressInputData.domain ? addressInputData.address : '');
  const [parseError, setParseError] = useState('');
  const [formatError, setFormatError] = useState('');

  const [inputVal, setInputVal] = useState(addressInputData.domain || addressInputData.address);

  const [inscription, setInscription] = useState<Inscription>();

  const wallet = useWallet();

  useEffect(() => {
    onAddressInputChange({
      address: validAddress,
      domain: parseAddress ? inputVal : '',
      inscription
    });
  }, [validAddress]);

  const handleInputAddress = (e) => {
    const inputAddress = e.target.value;
    setInputVal(inputAddress);

    if (parseError) {
      setParseError('');
    }
    if (parseAddress) {
      setParseAddress('');
    }
    if (formatError) {
      setFormatError('');
    }

    if (validAddress) {
      setValidAddress('');
    }

    const isValid = bitcore.Address.isValid(inputAddress);
    if (!isValid) {
      setFormatError('Recipient address is invalid');
      return;
    }
    setValidAddress(inputAddress);
  };

  return (
    <div style={{ alignSelf: 'stretch' }}>
      <div style={Object.assign({}, $baseContainerStyle, { flexDirection: 'column', minHeight: '46px' })}>
        <input
          placeholder={'Enter Bitcoin Address'}
          type={'text'}
          style={Object.assign({}, $baseInputStyle, $inputStyleOverride)}
          onChange={async (e) => {
            handleInputAddress(e);
          }}
          defaultValue={inputVal}
          {...rest}
        />

        {validAddress && inscription && (
          <div className="flex-row full items-center mt-sm">
            <CopyableAddress address={parseAddress} />
            <div
              className="text link pointer"
              onClick={() => {
                window.open(`https://ordi.btc.com/inscription/${inscription.id}`);
              }}>{`By inscription #${inscription.number}`}</div>
          </div>
        )}
      </div>

      {parseError && <div className="text error">{parseError}</div>}
      <div className="text error">{formatError}</div>
    </div>
  );
};

function TextInput(props: InputProps) {
  const { placeholder, containerStyle, style: $inputStyleOverride, disabled, autoFocus, suffix, ...rest } = props;
  const $disabledStyle = disabled ? { backgroundColor: '#ececec' } : {};
  return (
    <div style={Object.assign({}, $baseContainerStyle, containerStyle, $disabledStyle)}>
      <input
        placeholder={placeholder}
        type={'text'}
        disabled={disabled}
        autoFocus={autoFocus}
        style={Object.assign(
          {},
          $baseInputStyle,
          $inputStyleOverride,
          disabled ? { color: '#222' } : {},
          $disabledStyle
        )}
        {...rest}
      />
      {suffix && suffix}
    </div>
  );
}
export function Input(props: InputProps) {
  const { preset } = props;

  if (preset === 'password') {
    return <PasswordInput {...props} />;
  } else if (preset === 'amount') {
    return <AmountInput {...props} />;
  } else if (preset === 'address') {
    return <AddressInput {...props} />;
  } else {
    return <TextInput {...props} />;
  }
}
