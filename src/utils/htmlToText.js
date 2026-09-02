// Hilangkan tag HTML dasar dari body pesan Teams, sisakan teks yang bisa dibaca
function htmlToText(html) {
  if (!html) return '';

  return html
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
