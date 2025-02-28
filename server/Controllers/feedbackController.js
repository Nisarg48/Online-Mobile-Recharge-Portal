const Feedback = require("../Models/Feedback");

// Submit feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { message } = req.body;

        const feedback = new Feedback({
            message,
        });

        await feedback.save();

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback,
        });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Get all feedback
exports.getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 }); // Use createdAt if timestamps are enabled

        res.status(200).json({
            success: true,
            feedback,
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
