const mongoose = require("mongoose");

const User_Schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    mobile_no: {
        type: String,
        required: true,
        unique: true,
        match: /^[6-9]\d{9}$/
    },
    password: { type: String, required: true, minLength: 8, select: false },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    wallet: { type: Number, default: 0 },
    autoRechargeEnabled: { type: Boolean, default: false },
    selectedPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Recharge_Plan" },
    planExpiryDate: { type: Date },

    // Refresh-token session (hashed) and password-reset token (hashed)
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

User_Schema.virtual("userId").get(function () {
    return this._id.toHexString();
});

User_Schema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    await this.save();
};

const User = mongoose.model("User", User_Schema);
module.exports = User;