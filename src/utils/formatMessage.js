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

    const displayedKeys = new Set();

    for (const key of priorityOrder) {
      const matchedKey = parsedKeys.find((k) => k.toLowerCase() === key.toLowerCase());
      if (matchedKey && parsedFields[matchedKey]) {
        const emoji = fieldEmoji(matchedKey);
        message += `${emoji} <b>${escapeHTML(matchedKey)}:</b> ${escapeHTML(parsedFields[matchedKey])}\n`;
        displayedKeys.add(matchedKey);
      }
    }

    for (const key of parsedKeys) {
      if (!displayedKeys.has(key) && key.toLowerCase() !== 'alert description' && parsedFields[key]) {
        const emoji = fieldEmoji(key);
        message += `${emoji} <b>${escapeHTML(key)}:</b> ${escapeHTML(parsedFields[key])}\n`;
      }
    }

    const alertDescKey = parsedKeys.find((k) => k.toLowerCase() === 'alert description');
    if (alertDescKey && parsedFields[alertDescKey]) {
      message += `\n📋 <b>Detail:</b>\n${escapeHTML(truncate(parsedFields[alertDescKey], 500))}\n`;
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
  const knownKeys = [
    'Severity', 'Status', 'Value', 'Lob', 'Application',
    'Monitor', 'Metric', 'Group', 'Origin', 'Received time',
    'Alert Description', 'Additional Description', 'Raw_data', 'Insight'
  ];

  for (const key of knownKeys) {
    const regex = new RegExp(
      `(?:^|[\\n,;])\\s*${key}\\s*:\\s*([^\\n,;]+|(?:[^\\n]+?(?=\\s*(?:${knownKeys.join('|')})\\s*:|$)))`,
      'i'
    );
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
  const matched = Object.keys(map).find((k) => k.toLowerCase() === String(key).toLowerCase());
  return matched ? map[matched] : '•';
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