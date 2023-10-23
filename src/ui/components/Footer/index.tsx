import React, { CSSProperties } from 'react';

export type FooterProps = {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  preset?: string;
};
function BaseFooter({ children, className, style }: FooterProps) {
  return (
    <div className={`footer bg-blue-light ${className}`} style={{ ...style }}>
      {children}
    </div>
  );
}
export function Footer({ children, style, preset, className = '' }: FooterProps) {
  return preset === 'fixed' ? (
    <div className="flex-col">
      <div className="flex-row" style={{ height: 60 }}>
        &nbsp;
      </div>
      <BaseFooter className={`${className} footer-fixed`} style={style}>
        {children}
      </BaseFooter>
    </div>
  ) : (
    <BaseFooter className={className} style={style}>
      {children}
    </BaseFooter>
  );
}
