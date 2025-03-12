const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    user: {
        type: String,
        default: "Anonymous"  // Set default value to "Anonymous"
    },
    read: {
        type: Boolean,
        default: false
    },
    replies: [{
        type: String,
        default: []
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);