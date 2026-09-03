// Hilangkan tag HTML dasar dari body pesan Teams, sisakan teks yang bisa dibaca
function htmlToText(html) {
  if (!html) return '';

  let raw = html;
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.content || '';
  } else if (typeof raw === 'string' && raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.content !== 'undefined') {
        raw = parsed.content;
      }
    } catch (e) {
      // bukan JSON valid, gunakan string asli
    }
  }

  if (typeof raw !== 'string') return '';

  return raw
    .replace(/<at[^>]*>(.*?)<\/at>/gi, '@$1')  // <at>Nama</at> -> @Nama
    .replace(/<br\s*\/?>/gi, '\n')              // <br> -> newline
    .replace(/<\/p>/gi, '\n')                   // penutup paragraf -> newline
    .replace(/<[^>]+>/g, '')                    // hapus semua tag HTML sisanya
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

module.exports = { htmlToText };
