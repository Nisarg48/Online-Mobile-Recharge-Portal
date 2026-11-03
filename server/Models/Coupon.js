const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            maxlength: 24,
        },
        description: { type: String, trim: true, maxlength: 120, default: "" },
        type: { type: String, enum: ["percent", "flat"], required: true },
        // percent: 1-100, flat: rupees off.
        value: { type: Number, required: true, min: 0 },
        // Only applies to percent coupons (0 = no cap).
        maxDiscount: { type: Number, min: 0, default: 0 },
        minAmount: { type: Number, min: 0, default: 0 },
        active: { type: Boolean, default: true },
        expiresAt: { type: Date, default: null },
        // 0 = unlimited.
        usageLimit: { type: Number, min: 0, default: 0 },
        usedCount: { type: Number, min: 0, default: 0 },
        // 0 = unlimited per user.
        perUserLimit: { type: Number, min: 0, default: 1 },
        redeemedBy: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            default: [],
        },
    },
    { timestamps: true }
);

couponSchema.pre("validate", function (next) {
    if (this.code) this.code = this.code.toUpperCase();
    next();
});

couponSchema.index({ active: 1, expiresAt: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
