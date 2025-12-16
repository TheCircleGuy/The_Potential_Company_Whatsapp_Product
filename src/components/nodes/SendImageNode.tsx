import { memo } from 'react';
import { Image } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { FlowNodeData, SendImageConfig } from '@/types/flow';

interface SendImageNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

function SendImageNodeComponent({ data, selected }: SendImageNodeProps) {
  const config = data.config as SendImageConfig;

  return (
    <BaseNode data={data} selected={selected} icon={<Image size={16} />} color="#8b5cf6">
      <div className="text-xs text-gray-500">
        {config.imageUrl ? 'Image set' : 'No image'}
        {config.caption && <span className="block truncate">{config.caption}</span>}
      </div>
    </BaseNode>
  );
}

export const SendImageNode = memo(SendImageNodeComponent);
