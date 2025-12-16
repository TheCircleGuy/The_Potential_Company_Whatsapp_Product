// GET /api/flows - List all flows
// POST /api/flows - Create new flow

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const supabase = getSupabaseClient(env);

    const { data: flows, error } = await supabase
      .from('flows')
      .select(`
        *,
        whatsapp_configs (
          id,
          name,
          phone_number
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return Response.json({ flows });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const supabase = getSupabaseClient(env);
    const body = await request.json();

    const { name, whatsapp_config_id, trigger_type, trigger_value, nodes, edges } = body;

    // Create flow
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .insert({
        name,
        whatsapp_config_id,
        trigger_type: trigger_type || 'keyword',
        trigger_value,
        is_active: false,
        is_published: false,
      })
      .select()
      .single();

    if (flowError) throw flowError;

    // Create nodes if provided
    if (nodes && nodes.length > 0) {
      const nodeInserts = nodes.map((node) => ({
        id: node.id,
        flow_id: flow.id,
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

    // Create edges if provided
    if (edges && edges.length > 0) {
      const edgeInserts = edges.map((edge) => ({
        id: edge.id,
        flow_id: flow.id,
        source_node_id: edge.source,
        target_node_id: edge.target,
        source_handle: edge.sourceHandle || 'default',
      }));

      const { error: edgesError } = await supabase
        .from('flow_edges')
        .insert(edgeInserts);

      if (edgesError) throw edgesError;
    }

    return Response.json({ flow }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
