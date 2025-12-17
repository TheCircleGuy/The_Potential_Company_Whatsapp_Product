import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { X, Plus, MessageSquare, GitBranch, Clock, Globe, Calculator } from 'lucide-react';
import { useFlowStore } from '@/stores/flowStore';
import type { NodeType } from '@/types/flow';

const quickInsertNodes: { type: NodeType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'sendText', label: 'Send Text', icon: <MessageSquare size={14} />, color: '#3b82f6' },
  { type: 'waitForReply', label: 'Wait Reply', icon: <MessageSquare size={14} />, color: '#8b5cf6' },
  { type: 'condition', label: 'Condition', icon: <GitBranch size={14} />, color: '#6366f1' },
  { type: 'delay', label: 'Delay', icon: <Clock size={14} />, color: '#f59e0b' },
  { type: 'setVariable', label: 'Set Variable', icon: <Calculator size={14} />, color: '#64748b' },
  { type: 'apiCall', label: 'API Call', icon: <Globe size={14} />, color: '#f97316' },
];

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteEdge = useFlowStore((state) => state.deleteEdge);
  const insertNodeOnEdge = useFlowStore((state) => state.insertNodeOnEdge);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 0, // Sharp 90-degree corners
  });

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteEdge(id);
    },
    [id, deleteEdge]
  );

  const handleInsertClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInsertMenu((prev) => !prev);
  }, []);

  const handleInsertNode = useCallback(
    (nodeType: NodeType) => {
      insertNodeOnEdge(id, nodeType);
      setShowInsertMenu(false);
      setIsHovered(false);
    },
    [id, insertNodeOnEdge]
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowInsertMenu(false);
      }
    };
    if (showInsertMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInsertMenu]);

  return (
    <>
      {/* Invisible wider path for easier hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => !showInsertMenu && setIsHovered(false)}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: isHovered ? '#3b82f6' : '#9ca3af',
          strokeWidth: 2,
          transition: 'stroke 0.15s ease',
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => !showInsertMenu && setIsHovered(false)}
        >
          {(isHovered || showInsertMenu) && (
            <div className="relative">
              <div className="flex gap-1">
                <button
                  onClick={handleInsertClick}
                  className={`w-6 h-6 rounded-full text-white flex items-center justify-center transition-colors shadow-md ${
                    showInsertMenu ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                  title="Insert node"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  title="Delete edge"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Insert menu dropdown */}
              {showInsertMenu && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-50">
                  {quickInsertNodes.map((node) => (
                    <button
                      key={node.type}
                      onClick={() => handleInsertNode(node.type)}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span style={{ color: node.color }}>{node.icon}</span>
                      <span>{node.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
