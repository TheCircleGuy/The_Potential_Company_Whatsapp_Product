import { memo } from 'react';
import { Variable } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, SetVariableConfig } from '@/types/flow';

interface SetVariableNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function SetVariableNodeComponent({ data, selected }: SetVariableNodeProps) {
  const config = data.config as SetVariableConfig;
  const assignmentCount = config.assignments?.length || 0;

  return (
    <BaseNode data={data} selected={selected} icon={<Variable size={16} />} color="#14b8a6">
      <div className="text-xs text-gray-500">
        {assignmentCount} assignment{assignmentCount !== 1 ? 's' : ''}
      </div>
    </BaseNode>
  );
}

export const SetVariableNode = memo(SetVariableNodeComponent);
