// GET /api/configs/:id - Get single config
// PUT /api/configs/:id - Update config
// DELETE /api/configs/:id - Delete config

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

export async function onRequestGet(context) {
  const { env, params } = context;
  const configId = params.id;

  try {
    const supabase = getSupabaseClient(env);

    const { data: config, error } = await supabase
      .from('whatsapp_configs')
      .select('id, name, phone_number_id, phone_number, verify_token, is_active, created_at')
      .eq('id', configId)
      .single();

    if (error) throw error;
    if (!config) {
      return Response.json({ error: 'Config not found' }, { status: 404 });
    }

    return Response.json({ config });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function onRequestPut(context) {
  const { env, params, request } = context;
  const configId = params.id;

  try {
    const supabase = getSupabaseClient(env);
    const body = await request.json();

    const { name, phone_number_id, phone_number, access_token, verify_token, is_active } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone_number_id !== undefined) updateData.phone_number_id = phone_number_id;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (access_token !== undefined) updateData.access_token = access_token;
    if (verify_token !== undefined) updateData.verify_token = verify_token;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: config, error } = await supabase
      .from('whatsapp_configs')
      .update(updateData)
      .eq('id', configId)
      .select('id, name, phone_number_id, phone_number, is_active, created_at')
      .single();

    if (error) throw error;

    return Response.json({ config });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const configId = params.id;

  try {
    const supabase = getSupabaseClient(env);

    // Check if any flows are using this config
    const { data: flows, error: flowsError } = await supabase
      .from('flows')
      .select('id, name')
      .eq('whatsapp_config_id', configId);

    if (flowsError) throw flowsError;

    if (flows && flows.length > 0) {
      return Response.json(
        {
          error: 'Cannot delete config with associated flows',
          flows: flows.map((f) => ({ id: f.id, name: f.name })),
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('whatsapp_configs')
      .delete()
      .eq('id', configId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
