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
    `🚨 *EMAIL ALERT*\n` +
    `━━━━━━━━━━━━━━━\n` +
    `📌 *${escapeMarkdown(subject || '-')}*\n` +
    `👤 ${escapeMarkdown(from || '-')}\n` +
    `🕒 ${escapeMarkdown(formattedDate)}\n`;

  const parsedKeys = Object.keys(parsedFields);

  if (parsedKeys.length > 0) {
    // Kasus 1: body punya pola terstruktur (misal alert atomIQ)
    message += `━━━━━━━━━━━━━━━\n`;

    const priorityOrder = [
      'Severity', 'Status', 'Value', 'Lob', 'Application',
      'Monitor', 'Metric', 'Group', 'Origin', 'Received time'
    ];

    const displayedKeys = new Set();

    // Tampilkan field sesuai prioritas
    for (const key of priorityOrder) {
      const matchedKey = parsedKeys.find((k) => k.toLowerCase() === key.toLowerCase());
      if (matchedKey && parsedFields[matchedKey]) {
        const emoji = fieldEmoji(matchedKey);
        message += `${emoji} *${matchedKey}:* ${escapeMarkdown(parsedFields[matchedKey])}\n`;
        displayedKeys.add(matchedKey);
      }
    }

    // Tampilkan field terstruktur lain yang belum masuk priorityOrder
    for (const key of parsedKeys) {
      if (!displayedKeys.has(key) && key.toLowerCase() !== 'alert description' && parsedFields[key]) {
        const emoji = fieldEmoji(key);
        message += `${emoji} *${key}:* ${escapeMarkdown(parsedFields[key])}\n`;
      }
    }

    // Tampilkan detail/deskripsi jika ada
    const alertDescKey = parsedKeys.find((k) => k.toLowerCase() === 'alert description');
    if (alertDescKey && parsedFields[alertDescKey]) {
      message += `\n📋 *Detail:*\n${escapeMarkdown(truncate(parsedFields[alertDescKey], 500))}\n`;
    }
  } else {
    // Kasus 2: body tidak terstruktur (email biasa)
    const displayBody = cleanBody.length > 0
      ? truncate(cleanBody, 800)
      : '_Tidak ada isi pesan (email kosong atau hanya berisi gambar/attachment)_';
    message += `━━━━━━━━━━━━━━━\n💬 ${escapeMarkdown(displayBody)}\n`;
  }

  return message;
}

// Bersihkan noise dan HTML tag dari body email
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

// Ekstrak field terstruktur ala "Key: Value" dari body alert (pemisah koma atau baris baru)
function extractAlertFields(text) {
  const fields = {};
  const knownKeys = [
    'Severity', 'Status', 'Value', 'Lob', 'Application',
    'Monitor', 'Metric', 'Group', 'Origin', 'Received time',
    'Alert Description', 'Additional Description', 'Raw_data', 'Insight'
  ];

  for (const key of knownKeys) {
    // Match "Key: value" baik dipisah koma maupun newline
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

function escapeMarkdown(text) {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

module.exports = { formatEmailAlert };