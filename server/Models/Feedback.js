const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }  // ✅ Added 'read' field
});

module.exports = mongoose.model('Feedback', feedbackSchema);
