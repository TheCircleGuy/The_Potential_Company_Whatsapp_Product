// GET /api/configs - List all WhatsApp configurations
// POST /api/configs - Create new configuration

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const supabase = getSupabaseClient(env);

    const { data: configs, error } = await supabase
      .from('whatsapp_configs')
      .select('id, name, phone_number_id, phone_number, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ configs });
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

    const { name, phone_number_id, phone_number, access_token, verify_token } = body;

    // Validate required fields
    if (!name || !phone_number_id || !phone_number || !access_token || !verify_token) {
      return Response.json(
        { error: 'Missing required fields: name, phone_number_id, phone_number, access_token, verify_token' },
        { status: 400 }
      );
    }

    // Check max 2 configs
    const { count, error: countError } = await supabase
      .from('whatsapp_configs')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if (count >= 2) {
      return Response.json(
        { error: 'Maximum of 2 WhatsApp configurations allowed' },
        { status: 400 }
      );
    }

    const { data: config, error } = await supabase
      .from('whatsapp_configs')
      .insert({
        name,
        phone_number_id,
        phone_number,
        access_token,
        verify_token,
        is_active: true,
      })
      .select('id, name, phone_number_id, phone_number, is_active, created_at')
      .single();

    if (error) throw error;

    return Response.json({ config }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
