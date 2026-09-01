function formatEmailAlert({ subject, from, body, receivedTime }) {
  const cleanBody = cleanText(body || '');
  const parsedFields = extractAlertFields(cleanBody);

  const date = new Date(receivedTime);
  const formattedDate = date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message =
    `🚨 *EMAIL ALERT*\n` +
    `━━━━━━━━━━━━━━━\n` +
    `📌 *${escapeMarkdown(subject || '-')}*\n` +
    `👤 ${escapeMarkdown(from || '-')}\n` +
    `🕒 ${escapeMarkdown(formattedDate)}\n`;

  if (Object.keys(parsedFields).length > 0) {
    // Kasus 1: body punya pola terstruktur (misal alert atomIQ)
    message += `━━━━━━━━━━━━━━━\n`;

    const priorityOrder = [
      'Severity', 'Status', 'Value', 'Lob', 'Application',
      'Monitor', 'Metric', 'Group', 'Origin', 'Received time'
    ];

    for (const key of priorityOrder) {
      if (parsedFields[key]) {
        const emoji = fieldEmoji(key);
        message += `${emoji} *${key}:* ${escapeMarkdown(parsedFields[key])}\n`;
      }
    }

    if (parsedFields['Alert Description']) {
      message += `\n📋 *Detail:*\n${escapeMarkdown(truncate(parsedFields['Alert Description'], 400))}\n`;
    }
  } else {
    // Kasus 2: body tidak terstruktur (email biasa, misal dari Monica)
    const displayBody = cleanBody.length > 0
      ? truncate(cleanBody, 600)
      : '_Tidak ada isi pesan (email kosong atau hanya berisi gambar/attachment)_';
    message += `━━━━━━━━━━━━━━━\n💬 ${escapeMarkdown(displayBody)}\n`;
  }

  return message;
}

// Bersihkan noise dari body preview email (backtick, newline berlebih, dll)
function cleanText(text) {
  return text
    .replace(/`/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

// Ekstrak field terstruktur ala "Key: Value," dari body alert
function extractAlertFields(text) {
  const fields = {};
  const knownKeys = [
    'Received time', 'Lob', 'Application', 'Monitor', 'Metric',
    'Group', 'Origin', 'Alert Description', 'Additional Description',
    'Raw_data', 'Severity', 'Status', 'Value', 'Insight'
  ];

  for (const key of knownKeys) {
    const regex = new RegExp(
      `${key}\\s*:\\s*([^,\\n]+(?:,(?!\\s*(?:${knownKeys.join('|')})\\s*:)[^,\\n]*)*)`,
      'i'
    );
    const match = text.match(regex);
    if (match && match[1]) {
      fields[key] = match[1].trim().replace(/,$/, '');
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

function escapeMarkdown(text) {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

module.exports = { formatEmailAlert };