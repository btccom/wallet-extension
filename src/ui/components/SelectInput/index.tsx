import { useRef, useState, useEffect, CSSProperties } from 'react';

import './index.less';

export interface InputProps {
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
  disabled?: boolean;
  suffix?: React.ReactNode;
}
export interface SelectProps {
  onPaste?: any;
  options?: string[];
  onSelect?: (value: string) => void;
  ikey?: string;
}
export function SelectInput(props: InputProps & SelectProps) {
  const popupRef: any = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState<any>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const selectedOptionRef = useRef<any>(null);
  const inputRef = useRef<any>(null);

  const handleOptionChange = (event: any, option) => {
    if (onSelect) onSelect(option);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [popupRef]);

  useEffect(() => {
    if (selectedOptionRef.current) {
      selectedOptionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : searchOptions.length - 1));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex < searchOptions.length - 1 ? prevIndex + 1 : 0));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchOptions]);
  const { placeholder, disabled, autoFocus, onChange, onSelect, options, ikey, ...rest } = props;
  const value = rest.value || '';

  useEffect(() => {
    setSearchOptions(
      options?.filter((o) => {
        return o.indexOf(String(value)) >= 0;
      })
    );
  }, [options, value]);

  useEffect(() => {
    searchOptions.map((o, index) => {
      if (o === value) {
        setSelectedIndex(index);
      }
    });
  }, [searchOptions]);
  return (
    <div key={ikey} className="input-container select-input-container relative" ref={popupRef}>
      {dropdownOpen && (
        <ul className="dropdown-list">
          {searchOptions.length > 0 ? (
            searchOptions?.map((option: string, index: number) => {
              return (
                <li
                  key={`${option}`}
                  className={selectedIndex === index ? 'selected' : ''}
                  ref={selectedIndex === index ? selectedOptionRef : null}
                  onClick={(event: any) => {
                    handleOptionChange(event, option);
                  }}>
                  {option}
                </li>
              );
            })
          ) : (
            <li className="empty">No Result</li>
          )}
        </ul>
      )}
      <input
        className={`input-self rounded align-center ${disabled ? 'textDim' : ''}`}
        ref={inputRef}
        onChange={onChange}
        onClick={() => {
          // setDropdownOpen(true);
        }}
        onInput={(event: any) => {
          const val = event.target.value.trim();
          if (val.length > 0) {
            setDropdownOpen(true);
          } else {
            setDropdownOpen(false);
          }
          event.target.value = val;
        }}
        onKeyDown={(event: any) => {
          if (event.key === 'Tab') {
            setDropdownOpen(false);
          }
        }}
        onKeyUpCapture={(event: any) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleOptionChange(event, searchOptions[selectedIndex]);
          }
        }}
        placeholder={placeholder}
        type={'text'}
        disabled={disabled}
        autoFocus={autoFocus}
        spellCheck={false}
        {...rest}
      />
    </div>
  );
}
