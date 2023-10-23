interface EmptyProps {
  value?: string;
}
export function Empty(props: EmptyProps) {
  const { value } = props;
  const data = value || 'No Data';
  return (
    <div
      style={{
        alignSelf: 'center'
      }}>
      <span className="sub align-center">{data}</span>
    </div>
  );
}
