const { formatEmailAlert } = require('../utils/formatMessage');
const { sendTelegramMessage } = require('../services/telegram.service');

/**
 * Handles incoming email alert webhook from Power Automate.
 */
async function handleEmailAlert(req, res) {
  try {
    const { subject, from, body, receivedTime } = req.body || {};

    if (!subject || !from) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request: "subject" and "from" fields are required.',
      });
    }

    const formattedText = formatEmailAlert({ subject, from, body, receivedTime });
    await sendTelegramMessage(formattedText);

    return res.status(200).json({
      success: true,
      message: 'Alert notification successfully sent to Telegram.',
    });
  } catch (error) {
    console.error('[Webhook Controller Error]:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to send Telegram alert.',
      error: error.message,
    });
  }
}

module.exports = {
  handleEmailAlert,
};
