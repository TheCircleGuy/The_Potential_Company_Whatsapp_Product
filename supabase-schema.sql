-- WhatsApp Flow Builder - Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- WhatsApp API configurations (max 2 numbers)
CREATE TABLE IF NOT EXISTS whatsapp_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone_number_id VARCHAR(50) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    access_token TEXT NOT NULL,
    verify_token VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flow definitions
CREATE TABLE IF NOT EXISTS flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    whatsapp_config_id UUID REFERENCES whatsapp_configs(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    trigger_type VARCHAR(50) NOT NULL DEFAULT 'keyword',
    trigger_value VARCHAR(200),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nodes in a flow
CREATE TABLE IF NOT EXISTS flow_nodes (
    id VARCHAR(100) PRIMARY KEY,
    flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL,
    label VARCHAR(200),
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'
);

-- Edges connecting nodes
CREATE TABLE IF NOT EXISTS flow_edges (
    id VARCHAR(100) PRIMARY KEY,
    flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
    source_node_id VARCHAR(100) REFERENCES flow_nodes(id) ON DELETE CASCADE,
    target_node_id VARCHAR(100) REFERENCES flow_nodes(id) ON DELETE CASCADE,
    source_handle VARCHAR(50) DEFAULT 'default'
);

-- Active conversation executions
CREATE TABLE IF NOT EXISTS flow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
    customer_id VARCHAR(50) NOT NULL,
    whatsapp_config_id UUID REFERENCES whatsapp_configs(id) ON DELETE SET NULL,
    current_node_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'running',
    variables JSONB DEFAULT '{}',
    waiting_for VARCHAR(50),
    wait_timeout_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Execution logs
CREATE TABLE IF NOT EXISTS execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES flow_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(100),
    action VARCHAR(50),
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotency table for processed messages
CREATE TABLE IF NOT EXISTS processed_messages (
    message_id VARCHAR(100) PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flows_config ON flows(whatsapp_config_id);
CREATE INDEX IF NOT EXISTS idx_flows_active ON flows(is_active, is_published);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_flow ON flow_nodes(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_edges_flow ON flow_edges(flow_id);
CREATE INDEX IF NOT EXISTS idx_executions_customer ON flow_executions(customer_id, whatsapp_config_id, status);
CREATE INDEX IF NOT EXISTS idx_executions_flow ON flow_executions(flow_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_execution ON execution_logs(execution_id);

-- Cleanup old processed messages (run periodically)
-- DELETE FROM processed_messages WHERE processed_at < NOW() - INTERVAL '7 days';

-- Enable RLS (Row Level Security) - adjust policies as needed
ALTER TABLE whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_messages ENABLE ROW LEVEL SECURITY;

-- Service role policy (allows full access for backend)
CREATE POLICY "Service role full access" ON whatsapp_configs FOR ALL USING (true);
CREATE POLICY "Service role full access" ON flows FOR ALL USING (true);
CREATE POLICY "Service role full access" ON flow_nodes FOR ALL USING (true);
CREATE POLICY "Service role full access" ON flow_edges FOR ALL USING (true);
CREATE POLICY "Service role full access" ON flow_executions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON execution_logs FOR ALL USING (true);
CREATE POLICY "Service role full access" ON processed_messages FOR ALL USING (true);
