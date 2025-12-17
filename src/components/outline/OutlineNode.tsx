import { useState, useCallback } from 'react';
import {
  ChevronRight,
  GripVertical,
  Zap,
  MessageSquare,
  GitBranch,
  Clock,
  Globe,
  Calculator,
  Image,
  Video,
  Music,
  FileText,
  MapPin,
  Users,
  Smile,
  Phone,
  User,
  Flag,
  Hash,
  Shuffle,
  Calendar,
  Type,
  CheckCircle,
  CreditCard,
  StopCircle,
  Repeat,
} from 'lucide-react';
import { useFlowStore } from '@/stores/flowStore';
import type { FlowTreeNode } from './FlowOutline';
import type { NodeType, SendTextConfig, ConditionConfig, DelayConfig } from '@/types/flow';

const nodeIcons: Record<NodeType, { icon: React.ReactNode; color: string }> = {
  trigger: { icon: <Zap size={14} />, color: '#22c55e' },
  sendText: { icon: <MessageSquare size={14} />, color: '#3b82f6' },
  sendTextEnhanced: { icon: <MessageSquare size={14} />, color: '#3b82f6' },
  sendImage: { icon: <Image size={14} />, color: '#3b82f6' },
  sendVideo: { icon: <Video size={14} />, color: '#3b82f6' },
  sendAudio: { icon: <Music size={14} />, color: '#3b82f6' },
  sendDocument: { icon: <FileText size={14} />, color: '#3b82f6' },
  sendLocation: { icon: <MapPin size={14} />, color: '#3b82f6' },
  sendContact: { icon: <Users size={14} />, color: '#3b82f6' },
  sendSticker: { icon: <Smile size={14} />, color: '#3b82f6' },
  sendButtons: { icon: <MessageSquare size={14} />, color: '#3b82f6' },
  sendList: { icon: <MessageSquare size={14} />, color: '#3b82f6' },
  waitForReply: { icon: <MessageSquare size={14} />, color: '#8b5cf6' },
  condition: { icon: <GitBranch size={14} />, color: '#6366f1' },
  setVariable: { icon: <Calculator size={14} />, color: '#64748b' },
  apiCall: { icon: <Globe size={14} />, color: '#f97316' },
  delay: { icon: <Clock size={14} />, color: '#f59e0b' },
  loop: { icon: <Repeat size={14} />, color: '#6366f1' },
  end: { icon: <StopCircle size={14} />, color: '#ef4444' },
  getCustomerPhone: { icon: <Phone size={14} />, color: '#0891b2' },
  getCustomerName: { icon: <User size={14} />, color: '#0891b2' },
  getCustomerCountry: { icon: <Flag size={14} />, color: '#0891b2' },
  getMessageTimestamp: { icon: <Clock size={14} />, color: '#0891b2' },
  formatPhoneNumber: { icon: <Phone size={14} />, color: '#64748b' },
  randomChoice: { icon: <Shuffle size={14} />, color: '#64748b' },
  dateTime: { icon: <Calendar size={14} />, color: '#64748b' },
  mathOperation: { icon: <Hash size={14} />, color: '#64748b' },
  textOperation: { icon: <Type size={14} />, color: '#64748b' },
  markAsRead: { icon: <CheckCircle size={14} />, color: '#64748b' },
  sendStampCard: { icon: <CreditCard size={14} />, color: '#3b82f6' },
};

function getNodePreview(node: FlowTreeNode['node']): string | null {
  const config = node.data.config;
  const nodeType = node.data.nodeType;

  switch (nodeType) {
    case 'sendText':
      return (config as SendTextConfig)?.message?.slice(0, 30) || null;
    case 'condition':
      const condConfig = config as ConditionConfig;
      return `${condConfig?.conditions?.length || 0} condition(s)`;
    case 'delay':
      return `${(config as DelayConfig)?.delaySeconds || 0}s`;
    default:
      return null;
  }
}

interface OutlineNodeProps {
  treeNode: FlowTreeNode;
  depth: number;
  parentId?: string | null;
  branchHandle?: string | null;
  onDragStart?: (nodeId: string, parentId: string | null, branchHandle: string | null) => void;
  onDrop?: (targetNodeId: string, position: 'before' | 'after' | 'inside') => void;
}

export function OutlineNode({
  treeNode,
  depth,
  parentId = null,
  branchHandle = null,
  onDragStart,
  onDrop,
}: OutlineNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const selectNode = useFlowStore((state) => state.selectNode);
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);

  const { node, children, branchLabel } = treeNode;
  const nodeType = node.data.nodeType as NodeType;
  const iconConfig = nodeIcons[nodeType] || { icon: <MessageSquare size={14} />, color: '#9ca3af' };
  const hasChildren = children.length > 0;
  const isCondition = nodeType === 'condition';
  const isSelected = selectedNodeId === node.id;
  const preview = getNodePreview(node);
  const isTrigger = nodeType === 'trigger';

  const handleClick = useCallback(() => {
    selectNode(node.id);
  }, [node.id, selectNode]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (isTrigger) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('application/outline-node', node.id);
      e.dataTransfer.setData('application/outline-parent', parentId || '');
      e.dataTransfer.setData('application/outline-branch', branchHandle || '');
      e.dataTransfer.effectAllowed = 'move';
      onDragStart?.(node.id, parentId, branchHandle);
    },
    [node.id, parentId, branchHandle, onDragStart, isTrigger]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;

      if (y < height * 0.3) {
        setDropPosition('before');
      } else if (y > height * 0.7) {
        setDropPosition('after');
      } else if (isCondition) {
        setDropPosition('inside');
      } else {
        setDropPosition('after');
      }
    },
    [isCondition]
  );

  const handleDragLeave = useCallback(() => {
    setDropPosition(null);
  }, []);

  const handleDropOnNode = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (dropPosition && onDrop) {
        onDrop(node.id, dropPosition);
      }
      setDropPosition(null);
    },
    [dropPosition, onDrop, node.id]
  );

  return (
    <div className="select-none">
      {/* Branch label for condition children */}
      {branchLabel && depth > 0 && (
        <div
          className="text-[10px] font-medium px-1 py-0.5 rounded mb-0.5 inline-block"
          style={{
            marginLeft: depth * 12,
            backgroundColor: branchLabel === 'else' ? '#fecaca' : '#bbf7d0',
            color: branchLabel === 'else' ? '#991b1b' : '#166534',
          }}
        >
          {branchLabel}
        </div>
      )}

      {/* Drop indicator - before */}
      {dropPosition === 'before' && (
        <div
          className="h-0.5 bg-blue-500 rounded"
          style={{ marginLeft: depth * 12 }}
        />
      )}

      {/* Node item */}
      <div
        draggable={!isTrigger}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropOnNode}
        onClick={handleClick}
        className={`flex items-center gap-1 px-1 py-1.5 rounded cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'
        } ${dropPosition === 'inside' ? 'ring-2 ring-blue-400' : ''}`}
        style={{ marginLeft: depth * 12 }}
      >
        {/* Drag handle */}
        {!isTrigger && (
          <GripVertical size={12} className="text-gray-300 cursor-grab flex-shrink-0" />
        )}
        {isTrigger && <div className="w-3" />}

        {/* Expand/collapse toggle for nodes with children */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded flex-shrink-0"
          >
            <ChevronRight
              size={12}
              className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

        {/* Node icon */}
        <span style={{ color: iconConfig.color }} className="flex-shrink-0">
          {iconConfig.icon}
        </span>

        {/* Node label and preview */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-700 truncate">{node.data.label}</div>
          {preview && (
            <div className="text-[10px] text-gray-400 truncate">{preview}</div>
          )}
        </div>
      </div>

      {/* Drop indicator - after */}
      {dropPosition === 'after' && !hasChildren && (
        <div
          className="h-0.5 bg-blue-500 rounded"
          style={{ marginLeft: depth * 12 }}
        />
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className={isCondition ? 'border-l-2 border-gray-200 ml-4' : ''}>
          {children.map((child) => (
            <OutlineNode
              key={child.id}
              treeNode={child}
              depth={depth + 1}
              parentId={node.id}
              branchHandle={child.branchLabel || null}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}

      {/* Drop indicator - after children */}
      {dropPosition === 'after' && hasChildren && isExpanded && (
        <div
          className="h-0.5 bg-blue-500 rounded"
          style={{ marginLeft: depth * 12 }}
        />
      )}
    </div>
  );
}
