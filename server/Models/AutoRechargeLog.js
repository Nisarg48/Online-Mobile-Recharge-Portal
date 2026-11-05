const mongoose = require("mongoose");

const autoRechargeLogSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["Success", "Failed", "Skipped"],
            required: true,
        },
        reason: { type: String, default: "", maxlength: 300 },
        plan_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recharge_Plan",
            default: null,
        },
        amount: { type: Number, default: 0 },
        transaction_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            default: null,
        },
    },
    { timestamps: true }
);

autoRechargeLogSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model("AutoRechargeLog", autoRechargeLogSchema);
