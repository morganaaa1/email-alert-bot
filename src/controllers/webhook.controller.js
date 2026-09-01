const { formatEmailAlert } = require('../utils/formatMessage');
const { sendTelegramMessage, sendTelegramDocument } = require('../services/telegram.service');

async function handleEmailAlert(req, res) {
  const { subject, from, body, receivedTime } = req.body;
  let { attachments } = req.body;

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
    await sendTelegramMessage(message);

    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const file of attachments) {
        // Skip gambar inline (misal logo signature email)
        if (file.isInline) continue;

        if (file.contentBytes && file.name) {
          await sendTelegramDocument(file.contentBytes, file.name);
        }
      }
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
