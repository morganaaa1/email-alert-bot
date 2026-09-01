function formatEmailAlert({ subject, from, body, receivedTime }) {
  const cleanBody = cleanText(body || '');
  const parsedFields = extractAlertFields(cleanBody);

  const date = new Date(receivedTime);
  const formattedDate = isNaN(date.getTime())
    ? (receivedTime || '-')
    : date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  let message =
    `🚨 <b>EMAIL ALERT</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `📌 <b>${escapeHTML(subject || '-')}</b>\n` +
    `👤 ${escapeHTML(from || '-')}\n` +
    `🕒 ${escapeHTML(formattedDate)}\n`;

  const parsedKeys = Object.keys(parsedFields);

  if (parsedKeys.length > 0) {
    message += `━━━━━━━━━━━━━━━\n`;

    const priorityOrder = [
      'Severity', 'Status', 'Value', 'Lob', 'Application',
      'Monitor', 'Metric', 'Group', 'Origin', 'Received time'
    ];

    for (const key of priorityOrder) {
      if (parsedFields[key]) {
        const emoji = fieldEmoji(key);
        message += `${emoji} <b>${escapeHTML(key)}:</b> ${escapeHTML(parsedFields[key])}\n`;
      }
    }

    if (parsedFields['Alert Description']) {
      message += `\n📋 <b>Detail:</b>\n${escapeHTML(truncate(parsedFields['Alert Description'], 500))}\n`;
    }
  } else {
    const displayBody = cleanBody.length > 0
      ? escapeHTML(truncate(cleanBody, 800))
      : '<i>Tidak ada isi pesan (email kosong atau hanya berisi gambar/attachment)</i>';
    message += `━━━━━━━━━━━━━━━\n💬 ${displayBody}\n`;
  }

  return message;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/`/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function extractAlertFields(text) {
  const fields = {};

  const fieldPatterns = [
    { key: 'Severity', regex: /(?:Severity\s*:?)\s*([a-zA-Z0-9_-]+)/i },
    { key: 'Status', regex: /(?:Status\s*:?)\s*([a-zA-Z0-9_-]+)/i },
    { key: 'Value', regex: /(?:Value\s*:?)\s*([^\n,;]+)/i },
    { key: 'Lob', regex: /Lob\s*:\s*([^\n,;]+)/i },
    { key: 'Application', regex: /Application\s*:\s*([^\n,;]+)/i },
    { key: 'Monitor', regex: /Monitor\s*:\s*([^\n,;]+)/i },
    { key: 'Metric', regex: /Metric\s*:\s*([^\n,;]+)/i },
    { key: 'Group', regex: /Group\s*:\s*([^\n,;]+)/i },
    { key: 'Origin', regex: /Origin\s*:\s*([^\n,;]+)/i },
    { key: 'Received time', regex: /Received\s+time\s*:\s*([^\n,;]+)/i },
    { key: 'Alert Description', regex: /Alert\s+Description\s*:\s*([^\n]+)/i },
  ];

  for (const { key, regex } of fieldPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const val = match[1].trim().replace(/,$/, '');
      if (val) {
        fields[key] = val;
      }
    }
  }

  return fields;
}

function fieldEmoji(key) {
  const map = {
    Severity: '🔥',
    Status: '📍',
    Value: '📊',
    Lob: '🏢',
    Application: '⚙️',
    Monitor: '🖥️',
    Metric: '📈',
    Group: '📂',
    Origin: '🔗',
    'Received time': '🕐',
  };
  return map[key] || '•';
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

function escapeHTML(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { formatEmailAlert };