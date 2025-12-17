import { useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, List, LayoutGrid, Undo2, Redo2 } from 'lucide-react';
import { useFlowStore } from '@/stores/flowStore';
import { OutlineNode } from './OutlineNode';
import type { Node, Edge } from '@xyflow/react';
import type { FlowNodeData } from '@/types/flow';

interface FlowTreeNode {
  id: string;
  node: Node<FlowNodeData>;
  children: FlowTreeNode[];
  branchLabel?: string;
}

function buildFlowTree(
  nodes: Node<FlowNodeData>[],
  edges: Edge[],
  visited: Set<string> = new Set()
): FlowTreeNode[] {
  // Find root nodes (trigger nodes or nodes with no incoming edges)
  const nodesWithIncoming = new Set(edges.map((e) => e.target));
  const rootNodes = nodes.filter(
    (n) => n.data.nodeType === 'trigger' || !nodesWithIncoming.has(n.id)
  );

  // If no roots found, just use all nodes
  const startNodes = rootNodes.length > 0 ? rootNodes : nodes;

  function traverse(nodeId: string, branchLabel?: string): FlowTreeNode | null {
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    // Find outgoing edges from this node
    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    const children: FlowTreeNode[] = [];

    // For condition nodes, group children by sourceHandle
    if (node.data.nodeType === 'condition') {
      outgoingEdges.forEach((edge) => {
        const childTree = traverse(edge.target, edge.sourceHandle || 'default');
        if (childTree) {
          children.push(childTree);
        }
      });
    } else {
      // For regular nodes, just follow the edges
      outgoingEdges.forEach((edge) => {
        const childTree = traverse(edge.target);
        if (childTree) {
          children.push(childTree);
        }
      });
    }

    return {
      id: nodeId,
      node,
      children,
      branchLabel,
    };
  }

  const trees: FlowTreeNode[] = [];
  startNodes.forEach((startNode) => {
    const tree = traverse(startNode.id);
    if (tree) {
      trees.push(tree);
    }
  });

  return trees;
}

// Helper to find parent info from tree
function findNodeInTree(
  trees: FlowTreeNode[],
  nodeId: string,
  parentId: string | null = null,
  branchHandle: string | null = null
): { parentId: string | null; branchHandle: string | null } | null {
  for (const tree of trees) {
    if (tree.id === nodeId) {
      return { parentId, branchHandle };
    }
    for (const child of tree.children) {
      const found = findNodeInTree([child], nodeId, tree.id, child.branchLabel || null);
      if (found) return found;
    }
  }
  return null;
}

export function FlowOutline() {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const outlinePanelOpen = useFlowStore((state) => state.outlinePanelOpen);
  const toggleOutlinePanel = useFlowStore((state) => state.toggleOutlinePanel);
  const autoLayout = useFlowStore((state) => state.autoLayout);
  const moveNode = useFlowStore((state) => state.moveNode);
  const undo = useFlowStore((state) => state.undo);
  const redo = useFlowStore((state) => state.redo);
  const canUndo = useFlowStore((state) => state.canUndo);
  const canRedo = useFlowStore((state) => state.canRedo);

  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const flowTrees = useMemo(() => {
    return buildFlowTree(nodes, edges);
  }, [nodes, edges]);

  const handleDragStart = useCallback(
    (nodeId: string) => {
      setDraggedNodeId(nodeId);
    },
    []
  );

  const handleDrop = useCallback(
    (targetNodeId: string, position: 'before' | 'after' | 'inside') => {
      if (!draggedNodeId || draggedNodeId === targetNodeId) {
        setDraggedNodeId(null);
        return;
      }

      // Find the target node's parent
      const targetInfo = findNodeInTree(flowTrees, targetNodeId);

      if (position === 'before' || position === 'after') {
        // Insert relative to target
        const newParentId = targetInfo?.parentId || null;
        const insertAfter = position === 'after' ? targetNodeId : null;
        moveNode(draggedNodeId, newParentId, null, insertAfter);
      } else if (position === 'inside') {
        // Insert as child of condition node
        moveNode(draggedNodeId, targetNodeId, 'default', null);
      }

      setDraggedNodeId(null);
    },
    [draggedNodeId, flowTrees, moveNode]
  );

  return (
    <div
      className={`h-full bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        outlinePanelOpen ? 'w-72' : 'w-10'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleOutlinePanel}
        className="flex items-center justify-center h-10 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        title={outlinePanelOpen ? 'Collapse outline' : 'Expand outline'}
      >
        {outlinePanelOpen ? (
          <ChevronRight size={18} className="text-gray-500" />
        ) : (
          <ChevronLeft size={18} className="text-gray-500" />
        )}
      </button>

      {outlinePanelOpen && (
        <>
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List size={16} className="text-gray-500" />
              <span className="font-medium text-sm text-gray-700">Flow Outline</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 size={16} />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button
                onClick={autoLayout}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                title="Auto-layout nodes"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          {/* Flow tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {flowTrees.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-4">
                No nodes in flow
              </div>
            ) : (
              <div className="space-y-1">
                {flowTrees.map((tree) => (
                  <OutlineNode
                    key={tree.id}
                    treeNode={tree}
                    depth={0}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Drag hint */}
          {draggedNodeId && (
            <div className="px-3 py-2 border-t border-gray-200 bg-blue-50 text-xs text-blue-600">
              Drag to reorder...
            </div>
          )}
        </>
      )}
    </div>
  );
}

export type { FlowTreeNode };
