// Dynamic webhook handler per WhatsApp config
// URL: /webhook/:configId

import { createClient } from '@supabase/supabase-js';
import { FlowEngine } from './_shared/engine.js';
import { extractMessageContent, markAsRead } from './_shared/whatsapp.js';

/**
 * GET - Webhook verification (Meta callback verification)
 */
export async function onRequestGet(context) {
  const { env, params, request } = context;
  const configId = params.configId;

  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode !== 'subscribe') {
    return new Response('Invalid mode', { status: 403 });
  }

  // Get config to verify token
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  const { data: config, error } = await supabase
    .from('whatsapp_configs')
    .select('verify_token')
    .eq('id', configId)
    .single();

  if (error || !config) {
    return new Response('Config not found', { status: 404 });
  }

  if (token !== config.verify_token) {
    return new Response('Invalid verify token', { status: 403 });
  }

  return new Response(challenge, { status: 200 });
}

/**
 * POST - Handle incoming webhook messages
 */
export async function onRequestPost(context) {
  const { env, params, request } = context;
  const configId = params.configId;

  try {
    const body = await request.json();

    // Validate webhook payload
    if (body.object !== 'whatsapp_business_account') {
      return new Response('Not a WhatsApp webhook', { status: 400 });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      // No message - might be status update
      return new Response('OK', { status: 200 });
    }

    const message = value.messages[0];
    const contact = value.contacts?.[0];
    const customerId = message.from;
    const messageId = message.id;

    // Initialize engine
    const engine = new FlowEngine(env);

    // Load config
    const config = await engine.loadConfig(configId);
    if (!config) {
      console.error('Config not found or inactive:', configId);
      return new Response('Config not found', { status: 404 });
    }

    // Check for duplicate message (idempotency)
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
    const { data: existing } = await supabase
      .from('processed_messages')
      .select('message_id')
      .eq('message_id', messageId)
      .single();

    if (existing) {
      return new Response('Already processed', { status: 200 });
    }

    // Mark as processed
    await supabase.from('processed_messages').insert({ message_id: messageId });

    // Mark message as read
    await markAsRead(config.access_token, config.phone_number_id, messageId);

    // Extract message content
    const messageContent = extractMessageContent(message);

    // Store contact info in variables (will be available in flow)
    engine.variables = {
      customer_phone: customerId,
      customer_name: contact?.profile?.name || customerId,
      customer_wa_id: contact?.wa_id || customerId,
    };

    // Check for existing waiting execution
    const waitingExecution = await engine.findWaitingExecution(customerId, configId);

    if (waitingExecution) {
      // Resume existing flow
      await engine.execute(customerId, messageContent);
    } else {
      // Find matching flow
      const matchingFlow = await engine.findMatchingFlow(messageContent.text || '', configId);

      if (matchingFlow) {
        // Start new execution
        await engine.startExecution(customerId, configId, matchingFlow.id);
        await engine.execute(customerId, messageContent);
      }
      // If no matching flow, do nothing (message ignored)
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
}
