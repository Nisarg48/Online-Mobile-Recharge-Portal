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
    alternate_mobile: {
        type: String,
        match: /^[6-9]\d{9}$/
    },
    address: { type: String, trim: true, maxlength: 250 },
    avatar: { type: String, trim: true, maxlength: 500 },
    // Location for regional analytics. `region` is an Indian state/UT, `city`
    // is free text; both are optional so older accounts keep working.
    region: { type: String, trim: true, maxlength: 60 },
    city: { type: String, trim: true, maxlength: 60 },
    password: { type: String, required: true, minLength: 8, select: false },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // Version of the demo dataset last generated for this account. The seed
    // script regenerates a demo account's activity only when this is stale,
    // so re-running `npm run seed` is idempotent but upgrades old demo data.
    demoSeedVersion: { type: Number, default: 0, min: 0 },

    wallet: { type: Number, default: 0 },
    autoRechargeEnabled: { type: Boolean, default: false },
    // Consecutive failed auto-recharge attempts (reset on success). Three in a
    // row disables auto-recharge so we stop retrying a wallet that never tops up.
    autoRechargeFailures: { type: Number, default: 0, min: 0 },
    autoRechargeLastAttempt: { type: Date, default: null },
    autoRechargeLastStatus: { type: String, default: null },
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