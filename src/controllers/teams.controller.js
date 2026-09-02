const { formatTeamsMessage } = require('../utils/formatTeamsMessage');
const { sendTelegramMessage } = require('../services/telegram.service');

async function handleTeamsMessage(req, res) {
  const { senderName, channelName, teamName, content, createdDateTime } = req.body;

  if (!content && !senderName) {
    return res.status(400).json({
      success: false,
      message: 'Payload tidak valid: minimal salah satu dari senderName atau content harus ada.',
    });
  }

  try {
    const message = formatTeamsMessage({ senderName, channelName, teamName, content, createdDateTime });
    await sendTelegramMessage(message);

    res.status(200).json({ success: true, message: 'Teams message delivered.' });
  } catch (err) {
    console.error('Failed to process Teams message:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to send Telegram alert.',
      error: err.message,
    });
  }
}

module.exports = { handleTeamsMessage };
