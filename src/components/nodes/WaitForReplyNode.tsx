import { memo } from 'react';
import { Clock } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, WaitForReplyConfig } from '@/types/flow';

interface WaitForReplyNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function WaitForReplyNodeComponent({ data, selected }: WaitForReplyNodeProps) {
  const config = data.config as WaitForReplyConfig;

  return (
    <BaseNode data={data} selected={selected} icon={<Clock size={16} />} color="#06b6d4">
      <div className="text-xs text-gray-500">
        <div>Save to: {config.variableName || 'unnamed'}</div>
        <div>Expect: {config.expectedType || 'any'}</div>
      </div>
    </BaseNode>
  );
}

export const WaitForReplyNode = memo(WaitForReplyNodeComponent);
