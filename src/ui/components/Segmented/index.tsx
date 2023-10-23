import { SegmentedOptions, SegmentedProps } from '@/common/types';

const TabItem = ({
  text,
  active,
  onClick,
  rounded
}: {
  rounded?: string;
  text: string;
  active: boolean;
  onClick?: () => void;
}) => {
  const $styles = { width: '100px', padding: '5px 10px' };
  return (
    <div
      className={`flex-col justify-center pointer ${active ? 'bg-iblue' : 'bg-white'} ${rounded}`}
      style={$styles}
      onClick={onClick}>
      <div className={`text align-center font-bold ${active ? 'white-color' : 'black-color'}`}>{text}</div>
    </div>
  );
};
export const Segmented = ({ options, activeKey, onChange }: SegmentedProps) => {
  return (
    <div className="flex-row justify-center gap-zero">
      {options.map((v: SegmentedOptions, i) => (
        <TabItem
          rounded={i === 0 ? 'round-left' : i === options.length - 1 ? 'round-right' : ''}
          key={v.label}
          text={v.label}
          active={activeKey === v.value}
          onClick={() => {
            onChange && onChange(v.value);
          }}
        />
      ))}
    </div>
  );
};
export default Segmented;
