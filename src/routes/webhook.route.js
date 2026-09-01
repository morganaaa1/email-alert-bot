const express = require('express');
const verifySecret = require('../middlewares/verifySecret');
const { handleEmailAlert } = require('../controllers/webhook.controller');

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * Webhook endpoint for Power Automate email alerts
 */
router.post('/webhook/email-alert', verifySecret, handleEmailAlert);

module.exports = router;
