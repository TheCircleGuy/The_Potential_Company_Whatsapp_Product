// POST /api/flows/:id/publish - Publish or unpublish a flow

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

export async function onRequestPost(context) {
  const { env, params, request } = context;
  const flowId = params.id;

  try {
    const supabase = getSupabaseClient(env);
    const body = await request.json();
    const { publish } = body;

    // Get flow to validate it has a trigger node
    const { data: nodes, error: nodesError } = await supabase
      .from('flow_nodes')
      .select('*')
      .eq('flow_id', flowId)
      .eq('node_type', 'trigger');

    if (nodesError) throw nodesError;

    if (publish && (!nodes || nodes.length === 0)) {
      return Response.json(
        { error: 'Flow must have a trigger node to be published' },
        { status: 400 }
      );
    }

    // Update flow publish status
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .update({
        is_published: publish,
        is_active: publish,
        updated_at: new Date().toISOString(),
      })
      .eq('id', flowId)
      .select()
      .single();

    if (flowError) throw flowError;

    return Response.json({ flow });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
