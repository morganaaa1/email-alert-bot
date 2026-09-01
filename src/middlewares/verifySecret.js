const env = require('../config/env');

/**
 * Middleware to verify webhook secret token from headers.
 */
function verifySecret(req, res, next) {
  const secretHeader = req.headers['x-webhook-secret'];

  if (!secretHeader || secretHeader !== env.WEBHOOK_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing webhook secret header.',
    });
  }

  next();
}

module.exports = verifySecret;
