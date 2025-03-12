const Feedback = require('../Models/Feedback');

const submitFeedback = async (req, res) => {
    // Extract message from request body, default user to "Anonymous" if not provided
    const { message } = req.body;
    const user = req.body.user || "Anonymous";

    try {
        const newFeedback = new Feedback({ message, user });
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ message: 'Error submitting feedback', error: error.message });
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

const replyToFeedback = async (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;

    try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        feedback.replies.push(reply);
        feedback.read = true; // Mark as read when a reply is sent
        await feedback.save();

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error replying to feedback', error: error.message });
    }
};

module.exports = { submitFeedback, getFeedback, markFeedbackAsRead, replyToFeedback };