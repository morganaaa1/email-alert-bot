process.env.NTBA_FIX_350 = '1';
process.env.NTBA_FIX_319 = '1';

const dotenv = require('dotenv');

dotenv.config();

const requiredEnvVars = ['BOT_TOKEN', 'CHAT_ID', 'WEBHOOK_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`[Config Error] Missing required environment variable: ${envVar}`);
  }
}

module.exports = {
  PORT: process.env.PORT || 3000,
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHAT_ID: process.env.CHAT_ID,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
};
