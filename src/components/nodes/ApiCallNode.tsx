import { memo } from 'react';
import { Globe } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, ApiCallConfig } from '@/types/flow';

interface ApiCallNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function ApiCallNodeComponent({ data, selected }: ApiCallNodeProps) {
  const config = data.config as ApiCallConfig;

  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<Globe size={16} />}
      color="#f97316"
      sourceHandles={[{ id: 'success', label: 'Success' }, { id: 'error', label: 'Error' }]}
    >
      <div className="text-xs text-gray-500">
        <div className="font-mono">{config.method || 'GET'}</div>
        <div className="truncate max-w-[160px]">{config.url || 'No URL'}</div>
      </div>
    </BaseNode>
  );
}

export const ApiCallNode = memo(ApiCallNodeComponent);
