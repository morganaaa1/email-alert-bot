const { htmlToText } = require('./htmlToText');

function formatTeamsMessage({ senderName, channelName, teamName, content, createdDateTime }) {
  const cleanContent = htmlToText(content || '');
  const displayContent = cleanContent.length > 0
    ? truncate(cleanContent, 3500)
    : '<i>Pesan tidak memiliki konten teks (mungkin berupa gambar/file saja)</i>';

  const date = new Date(createdDateTime);
  const formattedDate = isNaN(date.getTime())
    ? (createdDateTime || '-')
    : date.toLocaleString('id-ID', {
        timeZone: process.env.TIMEZONE || 'Asia/Jakarta',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

  return (
    `<b>[TEAMS MESSAGE] ${escapeHTML(teamName || '-')} / ${escapeHTML(channelName || '-')}</b>\n` +
    `========================================\n` +
    `TIMESTAMP   : ${escapeHTML(formattedDate)}\n` +
    `SENDER      : ${escapeHTML(senderName || 'Unknown')}\n` +
    `========================================\n` +
    `${cleanContent.length > 0 ? escapeHTML(displayContent) : displayContent}\n`
  );
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

module.exports = { formatTeamsMessage };

