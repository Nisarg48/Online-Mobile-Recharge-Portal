const mongoose = require("mongoose");

const Otp_Schema = new mongoose.Schema({
    transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 300 } } 
});

module.exports = mongoose.model("OTP", Otp_Schema);
