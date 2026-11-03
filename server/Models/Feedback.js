const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 200,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number (1-5)'
        }
    },
    user: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
    },
    // The completed recharge this feedback is tied to (optional for older rows).
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { 
    toJSON: { virtuals: true }
});

// Index for faster sorting
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ rating: 1 });
// One feedback per user (anti-spam); edits replace the existing entry.
feedbackSchema.index({ 'user._id': 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);