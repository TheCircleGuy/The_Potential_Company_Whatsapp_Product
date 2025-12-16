import { memo } from 'react';
import { MessageSquare } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, SendTextConfig } from '@/types/flow';

interface SendTextNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function SendTextNodeComponent({ data, selected }: SendTextNodeProps) {
  const config = data.config as SendTextConfig;
  const preview = config.message?.slice(0, 50) || 'No message';

  return (
    <BaseNode data={data} selected={selected} icon={<MessageSquare size={16} />} color="#3b82f6">
      <div className="text-xs text-gray-500 truncate max-w-[160px]">
        {preview}{config.message?.length > 50 ? '...' : ''}
      </div>
    </BaseNode>
  );
}

export const SendTextNode = memo(SendTextNodeComponent);
