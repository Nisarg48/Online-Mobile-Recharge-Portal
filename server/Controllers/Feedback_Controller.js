const Feedback = require('../Models/Feedback');
const Transaction = require('../Models/Transaction');
const User = require('../Models/User');

const hasCompletedRecharge = (userId) =>
    Transaction.exists({
        user_id: userId,
        status: 'Success',
        transactionType: 'recharge',
    });

// Submit (or update) the user's feedback. A feedback is only accepted once the
// user has a completed recharge; the optional transaction_id ties the rating to
// one real recharge so it cannot be forged from thin air.
const createFeedback = async (req, res) => {
    try {
        const { message, rating, transaction_id } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId).select('name');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const existing = await Feedback.findOne({ 'user._id': userId });

        let transaction = null;
        if (transaction_id) {
            transaction = await Transaction.findOne({
                _id: transaction_id,
                user_id: userId,
                status: 'Success',
                transactionType: 'recharge',
            });
            if (!transaction) {
                return res.status(403).json({
                    success: false,
                    message: "Feedback must be linked to one of your completed recharges.",
                });
            }
        } else if (!existing) {
            const eligible = await hasCompletedRecharge(userId);
            if (!eligible) {
                return res.status(403).json({
                    success: false,
                    message: "You can share feedback after completing a recharge.",
                });
            }
        }

        const update = {
            message,
            rating,
            'user.name': user.name,
        };
        if (transaction) update.transaction = transaction._id;

        // Upsert keeps exactly one feedback per user (anti-spam) while still
        // letting a user correct a rating/message they already sent.
        const applyUpdate = (withUpsert) =>
            Feedback.findOneAndUpdate(
                { 'user._id': userId },
                { $set: update },
                { new: true, upsert: withUpsert, runValidators: true }
            );

        let feedback;
        try {
            feedback = await applyUpdate(!existing);
        } catch (err) {
            // Lost a race to another request creating the same user's feedback.
            if (err.code === 11000) {
                feedback = await applyUpdate(false);
            } else {
                throw err;
            }
        }

        return res.status(existing ? 200 : 201).json({
            success: true,
            updated: Boolean(existing),
            data: feedback,
        });
    } catch (err) {
        console.error("Error creating feedback:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Auth: the signed-in user's own feedback (null if they have not left any).
const getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ 'user._id': req.user.userId }).lean();
        return res.status(200).json({ success: true, data: feedback || null });
    } catch (err) {
        console.error("Error fetching user feedback:", err);
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
    getMyFeedback,
    getPublicFeedback,
    getAllFeedback,
};
