import { memo } from 'react';
import { GitBranch } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, ConditionConfig } from '@/types/flow';

interface ConditionNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function ConditionNodeComponent({ data, selected }: ConditionNodeProps) {
  const config = data.config as ConditionConfig;
  const conditionCount = config.conditions?.length || 0;

  // Build handles from conditions
  const handles = [
    ...(config.conditions?.map((c) => ({ id: c.outputHandle, label: c.outputHandle })) || []),
    { id: config.defaultHandle || 'false', label: config.defaultHandle || 'false' },
  ];

  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<GitBranch size={16} />}
      color="#6366f1"
      sourceHandles={handles}
    >
      <div className="text-xs text-gray-500">
        <div>{conditionCount} condition{conditionCount !== 1 ? 's' : ''}</div>
        <div className="flex gap-2 mt-1">
          {handles.map((h) => (
            <span key={h.id} className="px-1 bg-gray-100 rounded">{h.label}</span>
          ))}
        </div>
      </div>
    </BaseNode>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
