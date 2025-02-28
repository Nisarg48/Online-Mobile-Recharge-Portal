const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;