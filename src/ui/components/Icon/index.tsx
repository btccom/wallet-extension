import React, { CSSProperties } from 'react';

export const svgRegistry = {
  down: './images/icons/down.svg',
  github: './images/icons/github.svg',
  user: '/images/icons/user-solid.svg',
  wallet: '/images/icons/wallet-solid.svg',
  compass: './images/icons/compass-solid.svg',
  settings: './images/icons/gear-solid.svg',
  grid: './images/icons/grid-solid.svg',
  success: '/images/icons/success.svg',
  check: '/images/icons/check.svg',
  eye: '/images/icons/eye.svg',
  'eye-slash': '/images/icons/eye-slash.svg',
  copy: './images/icons/icon-copy.svg',
  close: './images/icons/xmark.svg',
  'circle-check': '/images/icons/circle-check.svg',
  moreoutline: '/images/icons/more-outline.svg'
};

const iconImgList: Array<IconTypes> = ['success'];

export type IconTypes = keyof typeof svgRegistry;
interface IconProps {
  icon?: IconTypes;
  color?: string;
  size?: number | string;
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
  className?: string;
}

export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    className,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    onClick,
    children
  } = props;
  if (!icon) {
    return (
      <div
        className={`${color || 'text-color'} ${className || ''}`}
        onClick={onClick}
        style={Object.assign(
          {},
          {
            fontSizes: size ? size : '14',
            display: 'flex'
          } as CSSProperties,
          $containerStyleOverride,
          $imageStyleOverride || {},
          onClick ? { cursor: 'pointer' } : {}
        )}>
        {children}
      </div>
    );
  }
  const iconPath = svgRegistry[icon as IconTypes];
  if (iconImgList.includes(icon)) {
    return (
      <img
        src={iconPath}
        alt=""
        style={Object.assign({}, $containerStyleOverride, {
          width: size || 14,
          height: size || 14
        })}
      />
    );
  }
  if (iconPath) {
    return (
      <div style={$containerStyleOverride}>
        <div
          onClick={onClick}
          className={`${color || 'text-color'} ${color ? 'bg-' + color : 'bg-text-color'}`}
          style={Object.assign(
            {},
            {
              width: `${size || 14}px`,
              height: `${size || 14}px`,
              maskImage: `url(${iconPath})`,
              maskSize: 'cover',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: `url(${iconPath})`,
              WebkitMaskSize: 'cover',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            },
            $imageStyleOverride || {},
            onClick ? { cursor: 'pointer' } : {}
          )}
        />
      </div>
    );
  } else {
    return <div />;
  }
}
