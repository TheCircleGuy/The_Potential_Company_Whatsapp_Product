import type { Node, Edge, BuiltInNode } from '@xyflow/react';

// Node types
export type NodeType =
  | 'trigger'
  | 'sendText'
  | 'sendImage'
  | 'sendButtons'
  | 'sendList'
  | 'waitForReply'
  | 'condition'
  | 'setVariable'
  | 'apiCall'
  | 'delay'
  | 'loop'
  | 'end';

// Node configurations
export interface TriggerConfig {
  keywords: string[];
  caseSensitive: boolean;
}

export interface SendTextConfig {
  message: string;
}

export interface SendImageConfig {
  imageUrl: string;
  caption: string;
}

export interface ButtonItem {
  id: string;
  title: string;
}

export interface SendButtonsConfig {
  bodyText: string;
  headerText?: string;
  footerText?: string;
  buttons: ButtonItem[];
}

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  title: string;
  rows: ListRow[];
}

export interface SendListConfig {
  bodyText: string;
  buttonText: string;
  sections: ListSection[];
}

export interface WaitForReplyConfig {
  variableName: string;
  expectedType: 'text' | 'button' | 'list' | 'image' | 'any';
  timeoutSeconds?: number;
}

export interface ConditionRule {
  variable: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'regex' | 'exists' | 'not_exists';
  value: string;
  outputHandle: string;
}

export interface ConditionConfig {
  conditions: ConditionRule[];
  defaultHandle: string;
}

export interface VariableAssignment {
  variableName: string;
  valueType: 'static' | 'expression' | 'from_variable';
  value: string;
}

export interface SetVariableConfig {
  assignments: VariableAssignment[];
}

export interface ResponseMapping {
  jsonPath: string;
  variableName: string;
}

export interface ApiCallConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: string;
  responseMapping: ResponseMapping[];
  timeoutMs: number;
}

export interface DelayConfig {
  delaySeconds: number;
}

export interface LoopConfig {
  loopType: 'count' | 'while' | 'foreach';
  maxIterations: number;
  collection?: string;
  itemVariable?: string;
}

export interface EndConfig {
  endType: 'complete' | 'error';
}

export type NodeConfig =
  | TriggerConfig
  | SendTextConfig
  | SendImageConfig
  | SendButtonsConfig
  | SendListConfig
  | WaitForReplyConfig
  | ConditionConfig
  | SetVariableConfig
  | ApiCallConfig
  | DelayConfig
  | LoopConfig
  | EndConfig;

// Flow node data - must extend Record<string, unknown> for React Flow
export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  nodeType: NodeType;
  config: NodeConfig;
}

// Custom node types for React Flow
export type TriggerNodeType = Node<FlowNodeData, 'trigger'>;
export type SendTextNodeType = Node<FlowNodeData, 'sendText'>;
export type SendImageNodeType = Node<FlowNodeData, 'sendImage'>;
export type SendButtonsNodeType = Node<FlowNodeData, 'sendButtons'>;
export type SendListNodeType = Node<FlowNodeData, 'sendList'>;
export type WaitForReplyNodeType = Node<FlowNodeData, 'waitForReply'>;
export type ConditionNodeType = Node<FlowNodeData, 'condition'>;
export type SetVariableNodeType = Node<FlowNodeData, 'setVariable'>;
export type ApiCallNodeType = Node<FlowNodeData, 'apiCall'>;
export type DelayNodeType = Node<FlowNodeData, 'delay'>;
export type LoopNodeType = Node<FlowNodeData, 'loop'>;
export type EndNodeType = Node<FlowNodeData, 'end'>;

export type FlowNode =
  | TriggerNodeType
  | SendTextNodeType
  | SendImageNodeType
  | SendButtonsNodeType
  | SendListNodeType
  | WaitForReplyNodeType
  | ConditionNodeType
  | SetVariableNodeType
  | ApiCallNodeType
  | DelayNodeType
  | LoopNodeType
  | EndNodeType
  | BuiltInNode;

export type FlowEdge = Edge;

// Flow definition
export interface Flow {
  id: string;
  name: string;
  description?: string;
  whatsappConfigId?: string;
  isActive: boolean;
  isPublished: boolean;
  triggerType: 'keyword' | 'any_message';
  triggerValue?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// WhatsApp config
export interface WhatsAppConfig {
  id: string;
  name: string;
  phoneNumberId: string;
  phoneNumber: string;
  accessToken: string;
  verifyToken: string;
  isActive: boolean;
  createdAt: string;
}
