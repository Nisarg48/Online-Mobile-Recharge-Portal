const express = require('express');
const { submitFeedback, getFeedback, markFeedbackAsRead } = require('../Controllers/feedbackController'); 




const router = express.Router();

// Submit feedback
router.post('/feedback', submitFeedback);

// Fetch all feedback
router.get('/feedback', getFeedback);

// Mark feedback as read
router.put('/feedbacks/markAsRead/:id', markFeedbackAsRead); 

module.exports = router;
