import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import type { Flow, NodeType, NodeConfig, FlowNodeData } from '@/types/flow';

interface FlowState {
  // Current flow
  flow: Flow | null;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];

  // UI state
  selectedNodeId: string | null;
  isDirty: boolean;

  // Actions
  setFlow: (flow: Flow | null) => void;
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeConfig: (nodeId: string, config: Partial<NodeConfig>) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setDirty: (dirty: boolean) => void;
  resetFlow: () => void;
}

const getDefaultConfig = (type: NodeType): NodeConfig => {
  switch (type) {
    case 'trigger':
      return { keywords: ['START'], caseSensitive: false };
    case 'sendText':
      return { message: 'Hello {{name}}!' };
    case 'sendImage':
      return { imageUrl: '', caption: '' };
    case 'sendButtons':
      return {
        bodyText: 'Choose an option:',
        buttons: [{ id: 'btn_1', title: 'Option 1' }],
      };
    case 'sendList':
      return {
        bodyText: 'Select from menu:',
        buttonText: 'View Options',
        sections: [{ title: 'Section 1', rows: [{ id: 'row_1', title: 'Item 1' }] }],
      };
    case 'waitForReply':
      return { variableName: 'user_input', expectedType: 'text' };
    case 'condition':
      return {
        conditions: [{ variable: 'user_input', operator: 'equals', value: 'yes', outputHandle: 'true' }],
        defaultHandle: 'false',
      };
    case 'setVariable':
      return { assignments: [{ variableName: 'myVar', valueType: 'static', value: '' }] };
    case 'apiCall':
      return {
        method: 'GET',
        url: 'https://api.example.com',
        headers: {},
        responseMapping: [],
        timeoutMs: 5000,
      };
    case 'delay':
      return { delaySeconds: 5 };
    case 'loop':
      return { loopType: 'count', maxIterations: 10 };
    case 'end':
      return { endType: 'complete' };
    default:
      return {} as NodeConfig;
  }
};

const getNodeLabel = (type: NodeType): string => {
  const labels: Record<NodeType, string> = {
    trigger: 'Trigger',
    sendText: 'Send Text',
    sendImage: 'Send Image',
    sendButtons: 'Send Buttons',
    sendList: 'Send List',
    waitForReply: 'Wait for Reply',
    condition: 'Condition',
    setVariable: 'Set Variable',
    apiCall: 'API Call',
    delay: 'Delay',
    loop: 'Loop',
    end: 'End',
  };
  return labels[type];
};

let nodeIdCounter = 0;

export const useFlowStore = create<FlowState>((set, get) => ({
  flow: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,

  setFlow: (flow) => set({ flow }),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<FlowNodeData>[],
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
      isDirty: true,
    });
  },

  addNode: (type, position) => {
    const id = `node_${++nodeIdCounter}_${Date.now()}`;
    const newNode: Node<FlowNodeData> = {
      id,
      type,
      position,
      data: {
        label: getNodeLabel(type),
        nodeType: type,
        config: getDefaultConfig(type),
      },
    };
    set({
      nodes: [...get().nodes, newNode],
      isDirty: true,
    });
  },

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: { ...(node.data.config as NodeConfig), ...config },
              },
            }
          : node
      ),
      isDirty: true,
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
      ),
      isDirty: true,
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      isDirty: true,
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setDirty: (dirty) => set({ isDirty: dirty }),

  resetFlow: () =>
    set({
      flow: null,
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,
    }),
}));
