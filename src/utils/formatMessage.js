/**
 * Escapes special HTML characters to prevent parsing issues in Telegram HTML parse mode.
 * @param {string} text 
 * @returns {string}
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Formats incoming email alert payload into Telegram HTML message format.
 * @param {Object} emailData
 * @param {string} emailData.subject
 * @param {string} emailData.from
 * @param {string} [emailData.body]
 * @param {string} [emailData.receivedTime]
 * @returns {string} Formatted Telegram message
 */
function formatEmailAlert({ subject, from, body, receivedTime }) {
  const safeSubject = escapeHtml(subject || 'No Subject');
  const safeFrom = escapeHtml(from || 'Unknown Sender');
  const safeBody = escapeHtml(body || 'No content');
  const safeTime = receivedTime ? escapeHtml(new Date(receivedTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })) : 'N/A';

  return [
    `🚨 <b>EMAIL ALERT NOTIFICATION</b>`,
    `----------------------------------------`,
    `📌 <b>Subject:</b> ${safeSubject}`,
    `👤 <b>From:</b> ${safeFrom}`,
    `🕒 <b>Received:</b> ${safeTime}`,
    `----------------------------------------`,
    `📝 <b>Message:</b>`,
    `<code>${safeBody}</code>`
  ].join('\n');
}

module.exports = {
  formatEmailAlert,
  escapeHtml,
};
