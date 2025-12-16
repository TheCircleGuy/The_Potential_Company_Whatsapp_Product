import { memo } from 'react';
import { Timer } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, DelayConfig } from '@/types/flow';

interface DelayNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function DelayNodeComponent({ data, selected }: DelayNodeProps) {
  const config = data.config as DelayConfig;

  return (
    <BaseNode data={data} selected={selected} icon={<Timer size={16} />} color="#78716c">
      <div className="text-xs text-gray-500">
        Wait {config.delaySeconds || 0} seconds
      </div>
    </BaseNode>
  );
}

export const DelayNode = memo(DelayNodeComponent);
