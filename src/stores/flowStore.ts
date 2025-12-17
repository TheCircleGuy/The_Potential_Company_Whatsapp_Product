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
import { autoLayout as autoLayoutFn, reorderFlow } from '@/utils/autoLayout';

interface HistoryState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
}

interface FlowState {
  // Current flow
  flow: Flow | null;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];

  // History for undo/redo
  past: HistoryState[];
  future: HistoryState[];

  // UI state
  selectedNodeId: string | null;
  isDirty: boolean;
  outlinePanelOpen: boolean;

  // Computed
  canUndo: () => boolean;
  canRedo: () => boolean;

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
  deleteEdge: (edgeId: string) => void;
  insertNodeOnEdge: (edgeId: string, nodeType: NodeType) => void;
  selectNode: (nodeId: string | null) => void;
  setDirty: (dirty: boolean) => void;
  toggleOutlinePanel: () => void;
  autoLayout: () => void;
  moveNode: (nodeId: string, newParentId: string | null, newBranchHandle: string | null, insertAfterNodeId: string | null) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
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
        defaultHandle: 'else',
        showDefaultHandle: true,
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
    // New send message nodes
    case 'sendTextEnhanced':
      return { bodyText: 'Hello!', headerText: '', footerText: '' };
    case 'sendVideo':
      return { videoUrl: '', caption: '' };
    case 'sendAudio':
      return { audioUrl: '' };
    case 'sendDocument':
      return { documentUrl: '', filename: '', caption: '' };
    case 'sendLocation':
      return { latitude: '', longitude: '', name: '', address: '' };
    case 'sendContact':
      return { contacts: [{ name: '', phone: '' }] };
    case 'sendSticker':
      return { stickerUrl: '' };
    // User data nodes
    case 'getCustomerPhone':
      return { variableName: 'phone', format: 'e164' };
    case 'getCustomerName':
      return { variableName: 'name' };
    case 'getCustomerCountry':
      return { variableName: 'country' };
    case 'getMessageTimestamp':
      return { variableName: 'timestamp' };
    // Utility nodes
    case 'formatPhoneNumber':
      return { sourceVariable: 'customer_phone', variableName: 'formatted_phone', format: 'e164' };
    case 'randomChoice':
      return { choices: ['a', 'b'], variableName: 'choice' };
    case 'dateTime':
      return { variableName: 'datetime', operation: 'now', format: 'iso' };
    case 'mathOperation':
      return { variableName: 'result', operation: 'add', valueA: '0', valueB: '0' };
    case 'textOperation':
      return { variableName: 'result', operation: 'uppercase', text: '' };
    case 'markAsRead':
      return {};
    // Stamp card
    case 'sendStampCard':
      return {
        stampServerUrl: 'http://localhost:3000',
        stampCount: '{{stamp_count}}',
        customerName: '{{customer_name}}',
        title: '',
        subtitle: '',
        useCustomTemplate: false,
        customHtml: '',
        customStyle: '',
        caption: '',
      };
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
    // New send message nodes
    sendTextEnhanced: 'Text + Header/Footer',
    sendVideo: 'Send Video',
    sendAudio: 'Send Audio',
    sendDocument: 'Send Document',
    sendLocation: 'Send Location',
    sendContact: 'Send Contact',
    sendSticker: 'Send Sticker',
    // User data nodes
    getCustomerPhone: 'Get Phone',
    getCustomerName: 'Get Name',
    getCustomerCountry: 'Get Country',
    getMessageTimestamp: 'Get Timestamp',
    // Utility nodes
    formatPhoneNumber: 'Format Phone',
    randomChoice: 'Random Choice',
    dateTime: 'Date/Time',
    mathOperation: 'Math',
    textOperation: 'Text Transform',
    markAsRead: 'Mark as Read',
    // Stamp card
    sendStampCard: 'Send Stamp Card',
  };
  return labels[type];
};

let nodeIdCounter = 0;

const MAX_HISTORY_LENGTH = 50;

export const useFlowStore = create<FlowState>((set, get) => ({
  flow: null,
  nodes: [],
  edges: [],
  past: [],
  future: [],
  selectedNodeId: null,
  isDirty: false,
  outlinePanelOpen: false,

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  saveToHistory: () => {
    const { nodes, edges, past } = get();
    const newPast = [...past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
    // Limit history length
    if (newPast.length > MAX_HISTORY_LENGTH) {
      newPast.shift();
    }
    set({ past: newPast, future: [] });
  },

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
    get().saveToHistory();
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
    get().saveToHistory();
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      isDirty: true,
    });
  },

  deleteEdge: (edgeId) => {
    get().saveToHistory();
    set({
      edges: get().edges.filter((edge) => edge.id !== edgeId),
      isDirty: true,
    });
  },

  insertNodeOnEdge: (edgeId, nodeType) => {
    get().saveToHistory();
    const { nodes, edges } = get();
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    // Calculate midpoint position
    const midX = (sourceNode.position.x + targetNode.position.x) / 2;
    const midY = (sourceNode.position.y + targetNode.position.y) / 2;

    // Create new node
    const newNodeId = `node_${++nodeIdCounter}_${Date.now()}`;
    const newNode: Node<FlowNodeData> = {
      id: newNodeId,
      type: nodeType,
      position: { x: midX, y: midY },
      data: {
        label: getNodeLabel(nodeType),
        nodeType: nodeType,
        config: getDefaultConfig(nodeType),
      },
    };

    // Create new edges
    const newEdges = [
      // Source to new node (preserve sourceHandle if any)
      {
        id: `edge_${Date.now()}_1`,
        source: edge.source,
        target: newNodeId,
        sourceHandle: edge.sourceHandle,
      },
      // New node to target
      {
        id: `edge_${Date.now()}_2`,
        source: newNodeId,
        target: edge.target,
      },
    ];

    set({
      nodes: [...nodes, newNode],
      edges: [...edges.filter((e) => e.id !== edgeId), ...newEdges],
      selectedNodeId: newNodeId,
      isDirty: true,
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setDirty: (dirty) => set({ isDirty: dirty }),

  toggleOutlinePanel: () => set({ outlinePanelOpen: !get().outlinePanelOpen }),

  autoLayout: () => {
    get().saveToHistory();
    const { nodes, edges } = get();
    const layoutedNodes = autoLayoutFn(nodes, edges);
    set({
      nodes: layoutedNodes,
      isDirty: true,
    });
  },

  moveNode: (nodeId, newParentId, newBranchHandle, insertAfterNodeId) => {
    get().saveToHistory();
    const { nodes, edges } = get();
    const result = reorderFlow(nodes, edges, nodeId, newParentId, newBranchHandle, insertAfterNodeId);

    // Apply auto-layout after reordering
    const layoutedNodes = autoLayoutFn(result.nodes, result.edges);

    set({
      nodes: layoutedNodes,
      edges: result.edges,
      isDirty: true,
    });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      nodes: previous.nodes,
      edges: previous.edges,
      future: [{ nodes, edges }, ...future],
      isDirty: true,
    });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, { nodes, edges }],
      nodes: next.nodes,
      edges: next.edges,
      future: newFuture,
      isDirty: true,
    });
  },

  resetFlow: () =>
    set({
      flow: null,
      nodes: [],
      edges: [],
      past: [],
      future: [],
      selectedNodeId: null,
      isDirty: false,
      outlinePanelOpen: false,
    }),
}));
