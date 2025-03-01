const Feedback = require('../Models/Feedback');

// Submit feedback
const submitFeedback = async (req, res) => {
    const { message } = req.body;
    if (!message || message.length < 10 || message.length > 500) {
        return res.status(400).json({ error: 'Feedback must be between 10 and 500 characters.' });
    }

    try {
        const newFeedback = new Feedback({ message });
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (error) {
        res.status(500).json({ error: 'Error saving feedback.' });
    }
};

// Fetch all feedback
const getFeedback = async (req, res) => {
    try {
        const feedbackList = await Feedback.find().sort({ timestamp: -1 });
        res.status(200).json(feedbackList);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching feedback.' });
    }
};

// Mark feedback as read
const markFeedbackAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        // Update the read status only if it's currently unread
        if (!feedback.read) {
            feedback.read = true;
            await feedback.save();
        }

        res.json({ success: true, message: "Marked as read" });
    } catch (error) {
        console.error("Error marking feedback as read:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Export all functions properly
module.exports = { submitFeedback, getFeedback, markFeedbackAsRead };