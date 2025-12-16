import { memo } from 'react';
import { CircleStop } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, EndConfig } from '@/types/flow';

interface EndNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function EndNodeComponent({ data, selected }: EndNodeProps) {
  const config = data.config as EndConfig;

  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<CircleStop size={16} />}
      color={config.endType === 'error' ? '#ef4444' : '#6b7280'}
      showSourceHandle={false}
    >
      <div className="text-xs text-gray-500">
        {config.endType === 'error' ? 'Error End' : 'Complete'}
      </div>
    </BaseNode>
  );
}

export const EndNode = memo(EndNodeComponent);
