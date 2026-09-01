const TelegramBot = require('node-telegram-bot-api');
const env = require('../config/env');

let bot;

function getBotInstance() {
  if (!bot) {
    bot = new TelegramBot(env.BOT_TOKEN, { polling: false });
  }
  return bot;
}

/**
 * Sends a message to the configured Telegram chat.
 * @param {string} text - Message text (HTML formatted)
 * @param {string} [targetChatId] - Optional custom chat ID
 * @returns {Promise<Object>} Telegram API response
 */
async function sendTelegramMessage(text, targetChatId = env.CHAT_ID) {
  const instance = getBotInstance();
  return await instance.sendMessage(targetChatId, text, {
    parse_mode: 'HTML',
  });
}

module.exports = {
  sendTelegramMessage,
  getBotInstance,
};
