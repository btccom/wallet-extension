import React, { CSSProperties } from 'react';

export function Grid(props: {
  style?: CSSProperties;
  children: React.ReactNode;
  columns?: number;
  className?: string;
}) {
  const { children, style: $style = {}, columns } = props;
  if (columns) {
    $style['gridTemplateColumns'] = `repeat(${columns}, minmax(0, 1fr))`;
  }

  return (
    <div className={`grid ${props.className}`} style={$style}>
      {children}
    </div>
  );
}
