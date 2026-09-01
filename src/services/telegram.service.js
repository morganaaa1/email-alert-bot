const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN, CHAT_ID } = require('../config/env');

const bot = new TelegramBot(BOT_TOKEN);

async function sendTelegramMessage(text) {
  return bot.sendMessage(CHAT_ID, text, { parse_mode: 'MarkdownV2' });
}

async function sendTelegramDocument(base64Content, filename) {
  const buffer = Buffer.from(base64Content, 'base64');
  return bot.sendDocument(CHAT_ID, buffer, {}, { filename });
}

module.exports = { sendTelegramMessage, sendTelegramDocument };
