import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const style = {
  padding: 10,
  background: '#fff',
  border: '1px solid #ddd',
};

const BiDirectionalNode = ({ data }: NodeProps) => {
  return (
    <div style={style}>
      <Handle type="source" position={Position.Top} id="top" />
      {data?.label}
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
};

export default memo(BiDirectionalNode);
