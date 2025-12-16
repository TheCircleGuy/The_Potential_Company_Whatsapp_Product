import { useFlowStore } from '@/stores/flowStore';
import { X } from 'lucide-react';
import type {
  FlowNodeData,
  TriggerConfig,
  SendTextConfig,
  SendImageConfig,
  SendButtonsConfig,
  WaitForReplyConfig,
  ConditionConfig,
  DelayConfig,
  ApiCallConfig,
} from '@/types/flow';

export function PropertyPanel() {
  const nodes = useFlowStore((state) => state.nodes);
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const updateNodeConfig = useFlowStore((state) => state.updateNodeConfig);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const selectNode = useFlowStore((state) => state.selectNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-80 h-full bg-gray-50 border-l border-gray-200 p-4">
        <p className="text-sm text-gray-500">Select a node to edit its properties</p>
      </div>
    );
  }

  const data = selectedNode.data as FlowNodeData;

  return (
    <div className="w-80 h-full bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{data.label}</h2>
          <button
            onClick={() => selectNode(null)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Label */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Node-specific config */}
        <div className="space-y-4">
          {data.nodeType === 'trigger' && (
            <TriggerConfigForm
              config={data.config as TriggerConfig}
              onChange={(c) => updateNodeConfig(selectedNode.id, c)}
            />
          )}
          {data.nodeType === 'sendText' && (
            <SendTextConfigForm
              config={data.config as SendTextConfig}
              onChange={(c) => updateNodeConfig(selectedNode.id, c)}
            />
          )}
          {data.nodeType === 'sendImage' && (
            <SendImageConfigForm
              config={data.config as SendImageConfig}
              onChange={(c) => updateNodeConfig(selectedNode.id, c)}
            />
          )}
          {data.nodeType === 'sendButtons' && (
            <SendButtonsConfigForm
              config={data.config as SendButtonsConfig}
              onChange={(c) => updateNodeConfig(selectedNode.id, c)}
            />
          )}
          {data.nodeType === 'waitForReply' && (
            <WaitForReplyConfigForm
              config={data.config as WaitForReplyConfig}
              onChange={(c) => updateNodeConfig(selectedNode.id, c)}
            />
          )}
          {data.nodeType === 'condition' && (
            <ConditionConfigForm
              config={data.config as ConditionConfig}
              onChange={(c) => updateNodeConfig(selectedNode.id, c)}
            />
          )}
          {data.nodeType === 'delay' && (
            <DelayConfigForm
              config={data.config as DelayConfig}
              onChange={(c) => updateNodeConfig(selectedNode.id, c)}
            />
          )}
          {data.nodeType === 'apiCall' && (
            <ApiCallConfigForm
              config={data.config as ApiCallConfig}
              onChange={(c) => updateNodeConfig(selectedNode.id, c)}
            />
          )}
        </div>

        {/* Delete button */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={() => deleteNode(selectedNode.id)}
            className="w-full px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
}

// Config forms
function TriggerConfigForm({
  config,
  onChange,
}: {
  config: TriggerConfig;
  onChange: (c: Partial<TriggerConfig>) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keywords (comma-separated)
        </label>
        <input
          type="text"
          value={config.keywords?.join(', ') || ''}
          onChange={(e) =>
            onChange({ keywords: e.target.value.split(',').map((k) => k.trim()) })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="START, DEMO, HELP"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={config.caseSensitive || false}
          onChange={(e) => onChange({ caseSensitive: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="caseSensitive" className="text-sm text-gray-700">
          Case sensitive
        </label>
      </div>
    </>
  );
}

function SendTextConfigForm({
  config,
  onChange,
}: {
  config: SendTextConfig;
  onChange: (c: Partial<SendTextConfig>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Message
      </label>
      <textarea
        value={config.message || ''}
        onChange={(e) => onChange({ message: e.target.value })}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Hello {{name}}! Welcome..."
      />
      <p className="mt-1 text-xs text-gray-500">
        Use {'{{variable}}'} for dynamic content
      </p>
    </div>
  );
}

function SendImageConfigForm({
  config,
  onChange,
}: {
  config: SendImageConfig;
  onChange: (c: Partial<SendImageConfig>) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={config.imageUrl || ''}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.png"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Caption (optional)
        </label>
        <input
          type="text"
          value={config.caption || ''}
          onChange={(e) => onChange({ caption: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
}

function SendButtonsConfigForm({
  config,
  onChange,
}: {
  config: SendButtonsConfig;
  onChange: (c: Partial<SendButtonsConfig>) => void;
}) {
  const addButton = () => {
    if ((config.buttons?.length || 0) >= 3) return;
    const newButtons = [
      ...(config.buttons || []),
      { id: `btn_${Date.now()}`, title: 'New Button' },
    ];
    onChange({ buttons: newButtons });
  };

  const updateButton = (index: number, title: string) => {
    const newButtons = [...(config.buttons || [])];
    newButtons[index] = { ...newButtons[index], title };
    onChange({ buttons: newButtons });
  };

  const removeButton = (index: number) => {
    const newButtons = config.buttons?.filter((_, i) => i !== index) || [];
    onChange({ buttons: newButtons });
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body Text
        </label>
        <textarea
          value={config.bodyText || ''}
          onChange={(e) => onChange({ bodyText: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buttons (max 3)
        </label>
        <div className="space-y-2">
          {config.buttons?.map((btn, i) => (
            <div key={btn.id} className="flex gap-2">
              <input
                type="text"
                value={btn.title}
                onChange={(e) => updateButton(i, e.target.value)}
                maxLength={20}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeButton(i)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        {(config.buttons?.length || 0) < 3 && (
          <button
            onClick={addButton}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Button
          </button>
        )}
      </div>
    </>
  );
}

function WaitForReplyConfigForm({
  config,
  onChange,
}: {
  config: WaitForReplyConfig;
  onChange: (c: Partial<WaitForReplyConfig>) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variable Name
        </label>
        <input
          type="text"
          value={config.variableName || ''}
          onChange={(e) => onChange({ variableName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="user_response"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expected Type
        </label>
        <select
          value={config.expectedType || 'any'}
          onChange={(e) =>
            onChange({ expectedType: e.target.value as WaitForReplyConfig['expectedType'] })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="any">Any</option>
          <option value="text">Text</option>
          <option value="button">Button Reply</option>
          <option value="list">List Reply</option>
          <option value="image">Image</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timeout (seconds)
        </label>
        <input
          type="number"
          value={config.timeoutSeconds || ''}
          onChange={(e) => onChange({ timeoutSeconds: Number(e.target.value) || undefined })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="3600"
        />
      </div>
    </>
  );
}

function ConditionConfigForm({
  config,
  onChange,
}: {
  config: ConditionConfig;
  onChange: (c: Partial<ConditionConfig>) => void;
}) {
  const updateCondition = (index: number, field: string, value: string) => {
    const newConditions = [...(config.conditions || [])];
    newConditions[index] = { ...newConditions[index], [field]: value };
    onChange({ conditions: newConditions });
  };

  const addCondition = () => {
    const newConditions = [
      ...(config.conditions || []),
      { variable: '', operator: 'equals' as const, value: '', outputHandle: 'match' },
    ];
    onChange({ conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = config.conditions?.filter((_, i) => i !== index) || [];
    onChange({ conditions: newConditions });
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conditions
        </label>
        <div className="space-y-3">
          {config.conditions?.map((cond, i) => (
            <div key={i} className="p-3 bg-white border border-gray-200 rounded-md space-y-2">
              <input
                type="text"
                value={cond.variable}
                onChange={(e) => updateCondition(i, 'variable', e.target.value)}
                placeholder="Variable name"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <select
                value={cond.operator}
                onChange={(e) => updateCondition(i, 'operator', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="gt">Greater than</option>
                <option value="lt">Less than</option>
                <option value="regex">Regex</option>
                <option value="exists">Exists</option>
              </select>
              <input
                type="text"
                value={cond.value}
                onChange={(e) => updateCondition(i, 'value', e.target.value)}
                placeholder="Value"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cond.outputHandle}
                  onChange={(e) => updateCondition(i, 'outputHandle', e.target.value)}
                  placeholder="Output handle"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <button
                  onClick={() => removeCondition(i)}
                  className="px-2 text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addCondition}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Condition
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Handle
        </label>
        <input
          type="text"
          value={config.defaultHandle || 'false'}
          onChange={(e) => onChange({ defaultHandle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
}

function DelayConfigForm({
  config,
  onChange,
}: {
  config: DelayConfig;
  onChange: (c: Partial<DelayConfig>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Delay (seconds)
      </label>
      <input
        type="number"
        value={config.delaySeconds || 0}
        onChange={(e) => onChange({ delaySeconds: Number(e.target.value) })}
        min={0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function ApiCallConfigForm({
  config,
  onChange,
}: {
  config: ApiCallConfig;
  onChange: (c: Partial<ApiCallConfig>) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Method
        </label>
        <select
          value={config.method || 'GET'}
          onChange={(e) => onChange({ method: e.target.value as ApiCallConfig['method'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          type="text"
          value={config.url || ''}
          onChange={(e) => onChange({ url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://api.example.com/endpoint"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body (JSON)
        </label>
        <textarea
          value={config.body || ''}
          onChange={(e) => onChange({ body: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder='{"key": "{{value}}"}'
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timeout (ms)
        </label>
        <input
          type="number"
          value={config.timeoutMs || 5000}
          onChange={(e) => onChange({ timeoutMs: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
}
