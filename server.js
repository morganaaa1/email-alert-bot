const env = require('./src/config/env');
const app = require('./src/app');

app.listen(env.PORT, () => {
  console.log(`🚀 Email Alert Telegram Bot server running on port ${env.PORT}`);
});
