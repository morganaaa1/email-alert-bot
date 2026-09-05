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

  const severityUpper = (parsedFields['Severity'] || 'ALERT').toUpperCase();

  let message =
    `<b>[ALERT] [${escapeHTML(severityUpper)}] ${escapeHTML(subject || '-')}</b>\n` +
    `========================================\n` +
    `TIMESTAMP   : ${escapeHTML(formattedDate)}\n` +
    `SENDER      : ${escapeHTML(from || '-')}\n`;

  const parsedKeys = Object.keys(parsedFields);

  if (parsedKeys.length > 0) {
    const priorityOrder = [
      'Severity', 'Status', 'Value', 'Lob', 'Application',
      'Monitor', 'Metric', 'Group', 'Origin', 'Received time'
    ];

    for (const key of priorityOrder) {
      if (parsedFields[key] && key !== 'Received time') {
        const paddedKey = key.toUpperCase().padEnd(11, ' ');
        message += `${escapeHTML(paddedKey)} : ${escapeHTML(parsedFields[key])}\n`;
      }
    }

    message += `========================================\n`;

    if (parsedFields['Alert Description']) {
      message += `ALERT DETAIL:\n${escapeHTML(truncate(parsedFields['Alert Description'], 1000))}\n`;
    }
  } else {
    const displayBody = cleanBody.length > 0
      ? escapeHTML(truncate(cleanBody, 1000))
      : 'No text content available in email body.';
    message += `========================================\n${displayBody}\n`;
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
    .replace(/&quot;/g, '"')
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
    { key: 'Value', regex: /(?:Value\s*:?)\s*([^\n,;\r]+)/i },
    { key: 'Lob', regex: /Lob\s*:\s*([^\n,;\r]+)/i },
    { key: 'Application', regex: /Application\s*:\s*([^\n,;\r]+)/i },
    { key: 'Monitor', regex: /Monitor\s*:\s*([^\n,;\r]+)/i },
    { key: 'Metric', regex: /Metric\s*:\s*([^\n,;\r]+)/i },
    { key: 'Group', regex: /Group\s*:\s*([^\n,;\r]+)/i },
    { key: 'Origin', regex: /Origin\s*:\s*([^\n,;\r]+)/i },
    { key: 'Received time', regex: /Received\s+time\s*:\s*([^\n,;\r]+)/i },
    { key: 'Alert Description', regex: /Alert\s+Description\s*:\s*([\s\S]*?)(?=(?:,\s*\n?Raw_data:|\nRaw_data:|\nSeverity|\nStatus|\nValue|\nInsight:|$))/i },
  ];

  for (const { key, regex } of fieldPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      let val = match[1].trim().replace(/,$/, '').trim();
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