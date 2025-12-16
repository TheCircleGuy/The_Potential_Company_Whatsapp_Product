import { memo } from 'react';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, TriggerConfig } from '@/types/flow';

interface TriggerNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function TriggerNodeComponent({ data, selected }: TriggerNodeProps) {
  const config = data.config as TriggerConfig;

  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<Zap size={16} />}
      color="#22c55e"
      showTargetHandle={false}
    >
      <div className="text-xs text-gray-500">
        Keywords: {config.keywords?.join(', ') || 'None'}
      </div>
    </BaseNode>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
