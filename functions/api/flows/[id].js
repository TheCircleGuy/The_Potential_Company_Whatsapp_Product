// GET /api/flows/:id - Get single flow with nodes and edges
// PUT /api/flows/:id - Update flow
// DELETE /api/flows/:id - Delete flow

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

export async function onRequestGet(context) {
  const { env, params } = context;
  const flowId = params.id;

  try {
    const supabase = getSupabaseClient(env);

    // Get flow
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select(`
        *,
        whatsapp_configs (
          id,
          name,
          phone_number
        )
      `)
      .eq('id', flowId)
      .single();

    if (flowError) throw flowError;
    if (!flow) {
      return Response.json({ error: 'Flow not found' }, { status: 404 });
    }

    // Get nodes
    const { data: nodes, error: nodesError } = await supabase
      .from('flow_nodes')
      .select('*')
      .eq('flow_id', flowId);

    if (nodesError) throw nodesError;

    // Get edges
    const { data: edges, error: edgesError } = await supabase
      .from('flow_edges')
      .select('*')
      .eq('flow_id', flowId);

    if (edgesError) throw edgesError;

    // Transform nodes to React Flow format
    const reactFlowNodes = nodes.map((node) => ({
      id: node.id,
      type: node.node_type,
      position: { x: node.position_x, y: node.position_y },
      data: {
        label: node.label,
        nodeType: node.node_type,
        config: node.config,
      },
    }));

    // Transform edges to React Flow format
    const reactFlowEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source_node_id,
      target: edge.target_node_id,
      sourceHandle: edge.source_handle,
    }));

    return Response.json({
      flow,
      nodes: reactFlowNodes,
      edges: reactFlowEdges,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function onRequestPut(context) {
  const { env, params, request } = context;
  const flowId = params.id;

  try {
    const supabase = getSupabaseClient(env);
    const body = await request.json();

    const { name, whatsapp_config_id, trigger_type, trigger_value, is_active, nodes, edges } = body;

    // Update flow metadata
    const updateData = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (whatsapp_config_id !== undefined) updateData.whatsapp_config_id = whatsapp_config_id;
    if (trigger_type !== undefined) updateData.trigger_type = trigger_type;
    if (trigger_value !== undefined) updateData.trigger_value = trigger_value;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .update(updateData)
      .eq('id', flowId)
      .select()
      .single();

    if (flowError) throw flowError;

    // Update nodes if provided
    if (nodes !== undefined) {
      // Delete existing nodes
      await supabase.from('flow_nodes').delete().eq('flow_id', flowId);

      // Insert new nodes
      if (nodes.length > 0) {
        const nodeInserts = nodes.map((node) => ({
          id: node.id,
          flow_id: flowId,
          node_type: node.type,
          label: node.data?.label,
          position_x: node.position?.x || 0,
          position_y: node.position?.y || 0,
          config: node.data?.config || {},
        }));

        const { error: nodesError } = await supabase
          .from('flow_nodes')
          .insert(nodeInserts);

        if (nodesError) throw nodesError;
      }
    }

    // Update edges if provided
    if (edges !== undefined) {
      // Delete existing edges
      await supabase.from('flow_edges').delete().eq('flow_id', flowId);

      // Insert new edges
      if (edges.length > 0) {
        const edgeInserts = edges.map((edge) => ({
          id: edge.id,
          flow_id: flowId,
          source_node_id: edge.source,
          target_node_id: edge.target,
          source_handle: edge.sourceHandle || 'default',
        }));

        const { error: edgesError } = await supabase
          .from('flow_edges')
          .insert(edgeInserts);

        if (edgesError) throw edgesError;
      }
    }

    return Response.json({ flow });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const flowId = params.id;

  try {
    const supabase = getSupabaseClient(env);

    // Delete flow (cascade will handle nodes and edges)
    const { error } = await supabase
      .from('flows')
      .delete()
      .eq('id', flowId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
