const { formatEmailAlert } = require('../utils/formatMessage');
const { sendTelegramMessage, sendTelegramDocument } = require('../services/telegram.service');

async function handleEmailAlert(req, res) {
  const { subject, from, body, receivedTime } = req.body || {};
  let { attachments } = req.body || {};

  if (!subject || !from) {
    return res.status(400).json({ success: false, message: 'Field subject dan from wajib diisi.' });
  }

  // Attachments kadang datang sebagai string JSON (bukan array asli) dari Power Automate
  if (typeof attachments === 'string') {
    try {
      attachments = JSON.parse(attachments);
    } catch (e) {
      console.warn('Gagal parse attachments string, dianggap tidak ada attachment:', e.message);
      attachments = [];
    }
  }

  try {
    const message = formatEmailAlert({ subject, from, body, receivedTime });

    // Filter attachment yang valid (bukan inline logo/signature)
    const validAttachments = Array.isArray(attachments)
      ? attachments.filter((file) => !file.isInline && file.contentBytes && file.name)
      : [];

    if (validAttachments.length > 0) {
      // Kirim attachment pertama bersamanya isi pesan teks sebagai caption (1 bubble chat)
      await sendTelegramDocument(validAttachments[0].contentBytes, validAttachments[0].name, message);

      // Jika ada attachment tambahan, kirim sisa file tanpa caption
      for (let i = 1; i < validAttachments.length; i++) {
        await sendTelegramDocument(validAttachments[i].contentBytes, validAttachments[i].name);
      }
    } else {
      // Jika tidak ada attachment, kirim pesan teks biasa
      await sendTelegramMessage(message);
    }

    res.status(200).json({ success: true, message: 'Alert delivered.' });
  } catch (err) {
    console.error('Failed to process email alert:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to send Telegram alert.',
      error: err.message,
    });
  }
}

module.exports = { handleEmailAlert };
