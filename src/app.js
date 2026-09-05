const express = require('express');
const webhookRoute = require('./routes/webhook.route');
const teamsRoute = require('./routes/teams.route');

const app = express();

// Increase JSON body payload size limit to 50MB to support base64 attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/', webhookRoute);
app.use('/', teamsRoute);

// Root endpoint GET /
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email Alert Bot Service is running.',
    endpoints: {
      health: '/health',
      webhookEmailAlert: 'POST /webhook/email-alert',
      teamsAlert: 'POST /webhook/teams-alert',
    },
  });
});

// Fallback 404 handler for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

module.exports = app;


