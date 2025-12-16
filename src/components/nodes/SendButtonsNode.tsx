import { memo } from 'react';
import { MousePointerClick } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, SendButtonsConfig } from '@/types/flow';

interface SendButtonsNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function SendButtonsNodeComponent({ data, selected }: SendButtonsNodeProps) {
  const config = data.config as SendButtonsConfig;
  const buttonCount = config.buttons?.length || 0;

  return (
    <BaseNode data={data} selected={selected} icon={<MousePointerClick size={16} />} color="#f59e0b">
      <div className="text-xs text-gray-500">
        <div className="truncate max-w-[160px]">{config.bodyText || 'No body'}</div>
        <div className="mt-1">{buttonCount} button{buttonCount !== 1 ? 's' : ''}</div>
      </div>
    </BaseNode>
  );
}

export const SendButtonsNode = memo(SendButtonsNodeComponent);
