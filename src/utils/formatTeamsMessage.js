const { htmlToText } = require('./htmlToText');

function formatTeamsMessage({ senderName, channelName, teamName, content, createdDateTime }) {
  const cleanContent = htmlToText(content || '');
  const displayContent = cleanContent.length > 0
    ? truncate(cleanContent, 800)
    : '_Pesan tidak memiliki konten teks (mungkin berupa gambar/file saja)_';

  const date = new Date(createdDateTime);
  const formattedDate = date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    `💬 *TEAMS MESSAGE*\n` +
    `━━━━━━━━━━━━━━━\n` +
    `👤 *${escapeMarkdown(senderName || 'Unknown')}*\n` +
    `📂 ${escapeMarkdown(teamName || '-')} / ${escapeMarkdown(channelName || '-')}\n` +
    `🕒 ${escapeMarkdown(formattedDate)}\n` +
    `━━━━━━━━━━━━━━━\n` +
    `${escapeMarkdown(displayContent)}\n`
  );
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

// PENTING: fungsi ini WAJIB diterapkan ke SEMUA variabel dinamis
// yang dimasukkan ke pesan, termasuk hasil formatting tanggal.
// Kelalaian escape sekecil apapun (misal titik di jam "05.25")
// akan membuat SELURUH pesan gagal terkirim oleh Telegram (error 400).
function escapeMarkdown(text) {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

module.exports = { formatTeamsMessage };
