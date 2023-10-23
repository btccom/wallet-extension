import { Button, Modal } from 'antd';

export function MixedCoinCheck({ open, onCancel, onConfirm, tags }) {
  return (
    <Modal
      className="modal"
      centered
      open={open}
      getContainer={() => document.getElementById('root')!}
      onCancel={onCancel}
      footer={false}
      width={280}>
      <div className="flex-col">
        <div className="text align-center" style={{ marginTop: '30px' }}>
          {`This transaction contains  `}
          {tags.map((tag, i) => (
            <div key={tag} className="inline-block">
              <div className="iblue inline-block" key="tag">
                {tag}
              </div>{' '}
              {i < tags.length - 1 ? ' and ' : ','}
            </div>
          ))}
          {` which will be transferred after clicking CONFIRM!`}
        </div>

        <div className="flex-row-center full mt-lg mb-xl">
          <Button type="primary" className="primary-btn" style={{ width: '120px' }} onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
