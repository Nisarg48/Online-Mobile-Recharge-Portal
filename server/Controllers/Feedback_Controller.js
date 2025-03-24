const Feedback = require('../Models/Feedback');

const createFeedback = async (req, res) => {
    try {
        const { message, rating } = req.body;
        const user = req.user ? req.user._id : null; 

        // Create a new feedback entry including rating
        const newFeedback = new Feedback({
            message,
            rating,
            user: user
        });
        await newFeedback.save();
        return res.status(201).json({ success: true, data: newFeedback });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        // You can modify the query to filter, sort, or paginate the results as needed.
        // For example, sorting by newest feedback first:
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