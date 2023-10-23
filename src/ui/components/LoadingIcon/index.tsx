import { LoadingOutlined } from '@ant-design/icons';

export function LoadingIcon({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return <LoadingOutlined className={`iblue ${className}`} style={style} />;
}

export default LoadingIcon;
