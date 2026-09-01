const express = require('express');
const routes = require('./routes/webhook.route');

const app = express();

// Increase JSON body payload size limit to 50MB to support base64 attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/', routes);

module.exports = app;
