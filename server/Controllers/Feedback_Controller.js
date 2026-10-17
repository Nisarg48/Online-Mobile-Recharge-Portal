const Feedback = require('../Models/Feedback');
const User = require('../Models/User');

const createFeedback = async (req, res) => {
    try {
        const { message, rating } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId).select('name');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newFeedback = new Feedback({
            message,
            rating,
            user: {
                _id: userId,
                name: user.name,
            },
        });

        await newFeedback.save();
        return res.status(201).json({ success: true, data: newFeedback });
    } catch (err) {
        console.error("Error creating feedback:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Public: only top-rated feedback, minimal fields (used on the landing page).
const getPublicFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ rating: { $gte: 4 } })
            .sort({ createdAt: -1 })
            .limit(20)
            .select("message rating user.name createdAt");
        return res.status(200).json({ success: true, data: feedbacks });
    } catch (err) {
        console.error("Error fetching public feedback:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Admin: all feedback
const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: feedbacks });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createFeedback,
    getPublicFeedback,
    getAllFeedback,
};
