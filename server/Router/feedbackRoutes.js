// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../Controllers/feedbackController');

router.post('/submit', feedbackController.submitFeedback);
router.get('/', feedbackController.getFeedback);

module.exports = router;