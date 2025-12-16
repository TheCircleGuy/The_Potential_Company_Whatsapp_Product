import { memo } from 'react';
import { Repeat } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, LoopConfig } from '@/types/flow';

interface LoopNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function LoopNodeComponent({ data, selected }: LoopNodeProps) {
  const config = data.config as LoopConfig;

  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<Repeat size={16} />}
      color="#a855f7"
      sourceHandles={[{ id: 'loop', label: 'Loop' }, { id: 'done', label: 'Done' }]}
    >
      <div className="text-xs text-gray-500">
        <div>Type: {config.loopType || 'count'}</div>
        <div>Max: {config.maxIterations || 10}</div>
      </div>
    </BaseNode>
  );
}

export const LoopNode = memo(LoopNodeComponent);
