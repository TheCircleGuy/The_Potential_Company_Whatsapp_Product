import { memo, type ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowNodeData } from '@/types/flow';

interface BaseNodeProps {
  data: FlowNodeData;
  selected?: boolean;
  icon: ReactNode;
  color: string;
  children?: ReactNode;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  sourceHandles?: { id: string; label?: string; color?: string }[];
}

function BaseNodeComponent({
  data,
  selected,
  icon,
  color,
  children,
  showSourceHandle = true,
  showTargetHandle = true,
  sourceHandles,
}: BaseNodeProps) {
  return (
    <div
      className={`
        min-w-[180px] rounded-lg border-2 bg-white shadow-md
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
      `}
    >
      {/* Target handle */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-lg"
        style={{ backgroundColor: color }}
      >
        <span className="text-white">{icon}</span>
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>

      {/* Content */}
      {children && <div className="px-3 py-2 text-sm text-gray-600">{children}</div>}

      {/* Source handles */}
      {showSourceHandle && !sourceHandles && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}

      {/* Multiple source handles for conditions */}
      {sourceHandles?.map((handle, index) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Bottom}
          id={handle.id}
          className="!w-3 !h-3 !border-2 !border-white"
          style={{
            left: `${((index + 1) / (sourceHandles.length + 1)) * 100}%`,
            backgroundColor: handle.color || '#9ca3af',
          }}
        />
      ))}
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
