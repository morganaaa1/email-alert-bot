process.env.NTBA_FIX_350 = '1';
process.env.NTBA_FIX_319 = '1';

const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN, CHAT_ID } = require('../config/env');

const bot = new TelegramBot(BOT_TOKEN);

async function sendTelegramMessage(text) {
  return bot.sendMessage(CHAT_ID, text, { parse_mode: 'HTML' });
}

async function sendTelegramDocument(base64Content, filename, caption = null) {
  const buffer = Buffer.from(base64Content, 'base64');
  const options = {};
  if (caption) {
    options.caption = caption;
    options.parse_mode = 'HTML';
  }
  return bot.sendDocument(
    CHAT_ID,
    buffer,
    options,
    {
      filename: filename || 'attachment',
      contentType: 'application/octet-stream',
    }
  );
}

module.exports = { sendTelegramMessage, sendTelegramDocument };
