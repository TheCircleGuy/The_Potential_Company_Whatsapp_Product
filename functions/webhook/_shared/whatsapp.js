// WhatsApp Cloud API helpers

const WA_API_VERSION = 'v23.0';
const WA_API_BASE = 'https://graph.facebook.com';

/**
 * Send a text message
 */
export async function sendText(accessToken, phoneNumberId, to, text) {
  const url = `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  return response.json();
}

/**
 * Send an image message
 */
export async function sendImage(accessToken, phoneNumberId, to, imageUrl, caption) {
  const url = `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`;

  const imagePayload = { link: imageUrl };
  if (caption) imagePayload.caption = caption;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: imagePayload,
    }),
  });

  return response.json();
}

/**
 * Send interactive buttons message (max 3 buttons)
 */
export async function sendButtons(accessToken, phoneNumberId, to, bodyText, buttons, headerText, footerText) {
  const url = `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`;

  const interactive = {
    type: 'button',
    body: { text: bodyText },
    action: {
      buttons: buttons.slice(0, 3).map((btn) => ({
        type: 'reply',
        reply: {
          id: btn.id,
          title: btn.title.substring(0, 20), // Max 20 chars
        },
      })),
    },
  };

  if (headerText) {
    interactive.header = { type: 'text', text: headerText };
  }
  if (footerText) {
    interactive.footer = { text: footerText };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive,
    }),
  });

  return response.json();
}

/**
 * Send interactive list message
 */
export async function sendList(accessToken, phoneNumberId, to, bodyText, buttonText, sections, headerText, footerText) {
  const url = `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`;

  const interactive = {
    type: 'list',
    body: { text: bodyText },
    action: {
      button: buttonText.substring(0, 20), // Max 20 chars
      sections: sections.map((section) => ({
        title: section.title?.substring(0, 24), // Max 24 chars
        rows: section.rows.slice(0, 10).map((row) => ({
          id: row.id,
          title: row.title.substring(0, 24), // Max 24 chars
          description: row.description?.substring(0, 72), // Max 72 chars
        })),
      })),
    },
  };

  if (headerText) {
    interactive.header = { type: 'text', text: headerText };
  }
  if (footerText) {
    interactive.footer = { text: footerText };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive,
    }),
  });

  return response.json();
}

/**
 * Mark message as read
 */
export async function markAsRead(accessToken, phoneNumberId, messageId) {
  const url = `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

/**
 * Extract message content from webhook payload
 */
export function extractMessageContent(message) {
  const result = {
    type: message.type,
    text: null,
    buttonId: null,
    listRowId: null,
  };

  switch (message.type) {
    case 'text':
      result.text = message.text?.body;
      break;
    case 'interactive':
      if (message.interactive?.type === 'button_reply') {
        result.buttonId = message.interactive.button_reply?.id;
        result.text = message.interactive.button_reply?.title;
      } else if (message.interactive?.type === 'list_reply') {
        result.listRowId = message.interactive.list_reply?.id;
        result.text = message.interactive.list_reply?.title;
      }
      break;
    case 'image':
      result.text = message.image?.caption || '[Image]';
      break;
    case 'document':
      result.text = message.document?.caption || '[Document]';
      break;
    case 'audio':
      result.text = '[Audio]';
      break;
    case 'video':
      result.text = message.video?.caption || '[Video]';
      break;
    case 'location':
      result.text = `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
      break;
    default:
      result.text = `[${message.type}]`;
  }

  return result;
}
