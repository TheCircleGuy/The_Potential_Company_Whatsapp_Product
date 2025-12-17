import type { Node, Edge } from '@xyflow/react';
import type { FlowNodeData } from '@/types/flow';

// Layout constants
const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const VERTICAL_GAP = 80;
const HORIZONTAL_GAP = 250;
const START_X = 400;
const START_Y = 50;

interface LayoutNode {
  id: string;
  node: Node<FlowNodeData>;
  children: LayoutNode[];
  branchLabel?: string;
  branchIndex?: number;
}

/**
 * Build a tree structure from nodes and edges
 */
function buildLayoutTree(
  nodes: Node<FlowNodeData>[],
  edges: Edge[],
  visited: Set<string> = new Set()
): LayoutNode[] {
  // Find root nodes (trigger nodes or nodes with no incoming edges)
  const nodesWithIncoming = new Set(edges.map((e) => e.target));
  const rootNodes = nodes.filter(
    (n) => n.data.nodeType === 'trigger' || !nodesWithIncoming.has(n.id)
  );

  const startNodes = rootNodes.length > 0 ? rootNodes : nodes.slice(0, 1);

  function traverse(nodeId: string, branchLabel?: string, branchIndex?: number): LayoutNode | null {
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    // Find outgoing edges from this node
    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    const children: LayoutNode[] = [];

    // For condition nodes, create branches
    if (node.data.nodeType === 'condition') {
      outgoingEdges.forEach((edge, index) => {
        const childTree = traverse(edge.target, edge.sourceHandle || 'default', index);
        if (childTree) {
          children.push(childTree);
        }
      });
    } else {
      // For regular nodes, follow edges
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
      branchIndex,
    };
  }

  const trees: LayoutNode[] = [];
  startNodes.forEach((startNode) => {
    const tree = traverse(startNode.id);
    if (tree) {
      trees.push(tree);
    }
  });

  return trees;
}

/**
 * Calculate positions for all nodes in the tree
 */
function calculatePositions(
  tree: LayoutNode,
  x: number,
  y: number,
  positions: Map<string, { x: number; y: number }>
): { maxY: number; maxX: number } {
  // Set position for current node
  positions.set(tree.id, { x, y });

  let currentY = y + NODE_HEIGHT + VERTICAL_GAP;
  let maxY = currentY;
  let maxX = x;

  if (tree.children.length === 0) {
    return { maxY: y + NODE_HEIGHT, maxX: x + NODE_WIDTH };
  }

  // Check if current node is a condition
  const isCondition = tree.node.data.nodeType === 'condition';

  if (isCondition && tree.children.length > 0) {
    // Position branches horizontally
    const totalBranches = tree.children.length;
    const totalWidth = (totalBranches - 1) * HORIZONTAL_GAP;
    const startX = x - totalWidth / 2;

    tree.children.forEach((child, index) => {
      const branchX = startX + index * HORIZONTAL_GAP;
      const result = calculatePositions(child, branchX, currentY, positions);
      maxY = Math.max(maxY, result.maxY);
      maxX = Math.max(maxX, result.maxX);
    });
  } else {
    // Position children vertically (single column)
    tree.children.forEach((child) => {
      const result = calculatePositions(child, x, currentY, positions);
      currentY = result.maxY + VERTICAL_GAP;
      maxY = Math.max(maxY, result.maxY);
      maxX = Math.max(maxX, result.maxX);
    });
  }

  return { maxY, maxX };
}

/**
 * Auto-layout all nodes based on flow structure
 */
export function autoLayout(
  nodes: Node<FlowNodeData>[],
  edges: Edge[]
): Node<FlowNodeData>[] {
  if (nodes.length === 0) return nodes;

  const trees = buildLayoutTree(nodes, edges);
  const positions = new Map<string, { x: number; y: number }>();

  let currentY = START_Y;

  trees.forEach((tree) => {
    const result = calculatePositions(tree, START_X, currentY, positions);
    currentY = result.maxY + VERTICAL_GAP * 2;
  });

  // Apply positions to nodes
  return nodes.map((node) => {
    const pos = positions.get(node.id);
    if (pos) {
      return {
        ...node,
        position: pos,
      };
    }
    return node;
  });
}

/**
 * Get the flow order (linear sequence) from nodes and edges
 */
export function getFlowOrder(
  nodes: Node<FlowNodeData>[],
  edges: Edge[]
): { nodeId: string; parentId: string | null; branchHandle: string | null }[] {
  const order: { nodeId: string; parentId: string | null; branchHandle: string | null }[] = [];
  const visited = new Set<string>();

  // Find root nodes
  const nodesWithIncoming = new Set(edges.map((e) => e.target));
  const rootNodes = nodes.filter(
    (n) => n.data.nodeType === 'trigger' || !nodesWithIncoming.has(n.id)
  );

  function traverse(nodeId: string, parentId: string | null, branchHandle: string | null) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    order.push({ nodeId, parentId, branchHandle });

    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    outgoingEdges.forEach((edge) => {
      traverse(edge.target, nodeId, edge.sourceHandle || null);
    });
  }

  rootNodes.forEach((node) => traverse(node.id, null, null));

  // Add any unvisited nodes (disconnected)
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      order.push({ nodeId: node.id, parentId: null, branchHandle: null });
    }
  });

  return order;
}

/**
 * Reorder nodes based on new flow order
 * Returns new edges array to match the new order
 */
export function reorderFlow(
  nodes: Node<FlowNodeData>[],
  edges: Edge[],
  nodeId: string,
  newParentId: string | null,
  newBranchHandle: string | null,
  insertAfterNodeId: string | null
): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  // Find the node to move
  const nodeToMove = nodes.find((n) => n.id === nodeId);
  if (!nodeToMove) return { nodes, edges };

  // Remove all edges connected to this node
  let newEdges = edges.filter(
    (e) => e.source !== nodeId && e.target !== nodeId
  );

  // Find the old incoming edge to preserve the chain
  const oldIncomingEdge = edges.find((e) => e.target === nodeId);
  const oldOutgoingEdges = edges.filter((e) => e.source === nodeId);

  // Reconnect old parent to old children (bypass the moved node)
  if (oldIncomingEdge && oldOutgoingEdges.length > 0) {
    // Connect old parent directly to first old child
    const bypassEdge = {
      id: `edge_${Date.now()}_bypass`,
      source: oldIncomingEdge.source,
      target: oldOutgoingEdges[0].target,
      sourceHandle: oldIncomingEdge.sourceHandle,
    };
    newEdges.push(bypassEdge);
  }

  // Create new incoming edge
  if (newParentId) {
    const newIncomingEdge = {
      id: `edge_${Date.now()}_in`,
      source: newParentId,
      target: nodeId,
      sourceHandle: newBranchHandle || undefined,
    };
    newEdges.push(newIncomingEdge);
  }

  // If inserting after a specific node, connect to its children
  if (insertAfterNodeId) {
    const afterNodeOutgoing = edges.filter((e) => e.source === insertAfterNodeId);

    // Remove the edge from insertAfterNodeId to its first child
    if (afterNodeOutgoing.length > 0) {
      const edgeToRemove = afterNodeOutgoing[0];
      newEdges = newEdges.filter((e) => e.id !== edgeToRemove.id);

      // Connect moved node to that child
      const newOutgoingEdge = {
        id: `edge_${Date.now()}_out`,
        source: nodeId,
        target: edgeToRemove.target,
      };
      newEdges.push(newOutgoingEdge);
    }
  }

  return { nodes, edges: newEdges };
}
