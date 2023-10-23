import { Button } from 'antd';

import { RightOutlined } from '@ant-design/icons';

export function CardItem({ item, onClick, className = '' }) {
  return item.title ? (
    <div key={item.action} className={`card mt-lg pointer rounded ${className}`} onClick={onClick}>
      <div className="flex-row-between full">
        <div className="flex-col-center">
          <div className="text font-bold full-x">{item.title || item.desc}</div>
          {item.value && <div className="text sub full-x">{item.value}</div>}
        </div>

        <div className="flex-col-center align-self-center">
          {item.right && <RightOutlined style={{ transform: 'scale(1.2)', color: '#AAA' }} />}
        </div>
      </div>
    </div>
  ) : (
    <Button key={item.action} className="btn mt-lg full-x" style={{ height: 50 }} onClick={onClick}>
      {item.desc}
    </Button>
  );
}
