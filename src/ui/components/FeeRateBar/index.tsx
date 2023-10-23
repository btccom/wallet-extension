import { useEffect, useState } from 'react';

import { FeeRates } from '@/common/types';
import { useWallet } from '@/ui/utils';

import { Input } from '../Input';
import LoadingIcon from '../LoadingIcon';

export enum FeeRateType {
  SLOW,
  AVG,
  FAST,
  CUSTOM
}

export function FeeRateBar({
  onChange,
  optIndex = FeeRateType.AVG,
  feeRate = ''
}: {
  onChange: (val: number, optIndex: number) => void;
  optIndex?: number;
  feeRate?: string;
}) {
  const wallet = useWallet();
  const [feeOptions, setFeeOptions] = useState<FeeRates[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wallet.getFeeRates().then((feeRates: FeeRates[]) => {
      setFeeOptions([...feeRates, { title: 'Custom', feerate: 0 }]);
      setLoading(false);
    });
  }, []);

  const [feeOptionIndex, setFeeOptionIndex] = useState(optIndex);
  const [feeRateInputVal, setFeeRateInputVal] = useState(feeRate);

  useEffect(() => {
    const defaultOption = feeOptions[1];
    const defaultVal = defaultOption ? defaultOption.feerate : 0;

    let val = defaultVal;
    if (feeOptionIndex === FeeRateType.CUSTOM) {
      val = parseInt(feeRateInputVal) || 0;
    } else if (feeOptions.length > 0) {
      val = feeOptions[feeOptionIndex].feerate;
    }
    onChange(val, feeOptionIndex);
  }, [feeOptions, feeOptionIndex, feeRateInputVal]);

  const adjustFeeRateInput = (inputVal: string) => {
    let val = parseInt(inputVal);
    if (!val) {
      setFeeRateInputVal('');
      return;
    }
    const defaultOption = feeOptions[1];
    const defaultVal = defaultOption ? defaultOption.feerate : 1;
    if (val <= 0) {
      val = Number(defaultVal);
    }
    setFeeRateInputVal(val.toString());
  };
  if (loading) {
    return (
      <div className="flex-col">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-row justify-between">
        {feeOptions.map((v, index) => {
          const selected = index === feeOptionIndex;
          return (
            <div
              key={v.title}
              onClick={() => {
                setFeeOptionIndex(index);
              }}
              className={`${selected ? 'bg-primary-color' : 'bg-white-color'}`}
              style={{
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                height: 75,
                width: 75,
                textAlign: 'center',
                padding: 4,
                borderRadius: 5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
              <div className={`text align-center ${selected ? 'white-color' : 'black-color'}`}>{v.title}</div>
              {v.title !== 'Custom' && (
                <div
                  className={`text align-center font-xxs ${
                    selected ? 'white-color' : 'black-color'
                  }`}>{`${v.feerate} sat/vB`}</div>
              )}
              {v.title !== 'Custom' && (
                <div
                  className={`text align-center font-xxs ${
                    selected ? 'selected-color' : 'black-muted'
                  }`}>{`${v.desc}`}</div>
              )}
            </div>
          );
        })}
      </div>
      {feeOptionIndex === FeeRateType.CUSTOM && (
        <Input
          preset="amount"
          placeholder="Fee"
          value={feeRateInputVal}
          onChange={async (e) => {
            adjustFeeRateInput(e.target.value);
          }}
          suffix={<div className="text textDim">{'sat/vB'}</div>}
          autoFocus={true}
        />
      )}
    </div>
  );
}
