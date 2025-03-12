const express = require('express');
const { submitFeedback, getFeedback, markFeedbackAsRead, replyToFeedback } = require('../Controllers/feedbackController');
const router = express.Router();

// Submit feedback
router.post('/feedback', submitFeedback);

// Fetch all feedback
router.get('/feedback', getFeedback);

// Mark feedback as read
router.put('/feedback/markAsRead/:id', markFeedbackAsRead);

// Reply to feedback
router.post('/feedback/reply/:id', replyToFeedback);

module.exports = router;