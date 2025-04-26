const Feedback = require('../Models/Feedback');
const User = require('../Models/User');

const createFeedback = async (req, res) => {
    try {
        const { message, rating } = req.body;
        const userId = req.user.userId;

        let name = User.findById(userId).select('name');

        if (rating < 1) {
            return res.status(400).json({ success: false, message: "Rating must be at least 1" });
        }

        const newFeedback = new Feedback({
            message,
            rating,
            user: {
                _id: userId,
                name: name
            },
            createdAt: new Date()
        });

        await newFeedback.save();
        return res.status(201).json({ success: true, data: newFeedback });
    } catch (err) {
        console.error("Error creating feedback:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ timestamp: -1 });
        return res.status(200).json({ success: true, data: feedbacks });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createFeedback,
    getAllFeedback
};