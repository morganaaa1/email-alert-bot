const express = require('express');
const router = express.Router();
const { handleTeamsMessage } = require('../controllers/teams.controller');
const verifySecret = require('../middlewares/verifySecret');

router.post('/webhook/teams-alert', verifySecret, handleTeamsMessage);

module.exports = router;
