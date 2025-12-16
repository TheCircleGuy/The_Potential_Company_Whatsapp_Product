import { type DragEvent } from 'react';
import {
  Zap,
  MessageSquare,
  Image,
  MousePointerClick,
  List,
  Clock,
  GitBranch,
  Variable,
  Globe,
  Timer,
  Repeat,
  CircleStop,
} from 'lucide-react';
import type { NodeType } from '@/types/flow';

interface NodeDefinition {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  color: string;
  category: 'triggers' | 'messages' | 'logic' | 'actions';
}

const nodeDefinitions: NodeDefinition[] = [
  // Triggers
  { type: 'trigger', label: 'Trigger', icon: <Zap size={18} />, color: '#22c55e', category: 'triggers' },

  // Messages
  { type: 'sendText', label: 'Send Text', icon: <MessageSquare size={18} />, color: '#3b82f6', category: 'messages' },
  { type: 'sendImage', label: 'Send Image', icon: <Image size={18} />, color: '#8b5cf6', category: 'messages' },
  { type: 'sendButtons', label: 'Send Buttons', icon: <MousePointerClick size={18} />, color: '#f59e0b', category: 'messages' },
  { type: 'sendList', label: 'Send List', icon: <List size={18} />, color: '#ec4899', category: 'messages' },

  // Logic
  { type: 'waitForReply', label: 'Wait for Reply', icon: <Clock size={18} />, color: '#06b6d4', category: 'logic' },
  { type: 'condition', label: 'Condition', icon: <GitBranch size={18} />, color: '#6366f1', category: 'logic' },
  { type: 'setVariable', label: 'Set Variable', icon: <Variable size={18} />, color: '#14b8a6', category: 'logic' },
  { type: 'loop', label: 'Loop', icon: <Repeat size={18} />, color: '#a855f7', category: 'logic' },

  // Actions
  { type: 'apiCall', label: 'API Call', icon: <Globe size={18} />, color: '#f97316', category: 'actions' },
  { type: 'delay', label: 'Delay', icon: <Timer size={18} />, color: '#78716c', category: 'actions' },
  { type: 'end', label: 'End', icon: <CircleStop size={18} />, color: '#6b7280', category: 'actions' },
];

const categories = [
  { id: 'triggers', label: 'Triggers' },
  { id: 'messages', label: 'Messages' },
  { id: 'logic', label: 'Logic' },
  { id: 'actions', label: 'Actions' },
] as const;

function DraggableNode({ node }: { node: NodeDefinition }) {
  const onDragStart = (event: DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-gray-300 hover:shadow-sm transition-all"
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-md text-white"
        style={{ backgroundColor: node.color }}
      >
        {node.icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{node.label}</span>
    </div>
  );
}

export function NodePalette() {
  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Nodes
        </h2>

        {categories.map((category) => (
          <div key={category.id} className="mb-6">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              {category.label}
            </h3>
            <div className="space-y-2">
              {nodeDefinitions
                .filter((node) => node.category === category.id)
                .map((node) => (
                  <DraggableNode key={node.type} node={node} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
