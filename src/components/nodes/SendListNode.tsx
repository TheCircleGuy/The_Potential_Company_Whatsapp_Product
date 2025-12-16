import { memo } from 'react';
import { List } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, SendListConfig } from '@/types/flow';

interface SendListNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function SendListNodeComponent({ data, selected }: SendListNodeProps) {
  const config = data.config as SendListConfig;
  const sectionCount = config.sections?.length || 0;

  return (
    <BaseNode data={data} selected={selected} icon={<List size={16} />} color="#ec4899">
      <div className="text-xs text-gray-500">
        <div className="truncate max-w-[160px]">{config.bodyText || 'No body'}</div>
        <div className="mt-1">{sectionCount} section{sectionCount !== 1 ? 's' : ''}</div>
      </div>
    </BaseNode>
  );
}

export const SendListNode = memo(SendListNodeComponent);
