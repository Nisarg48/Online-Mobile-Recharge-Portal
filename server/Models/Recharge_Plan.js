const mongoose = require("mongoose");

const Recharge_Plan_Schema = new mongoose.Schema({
    platform: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    planId: { type: String, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    validity: { type: Number, required: true, min: 0 }, // days
    data: {
        dailyLimit: { type: Number, default: null },   // GB/day, null if not applicable
        totalData: { type: Number, default: null },    // GB total, null if unlimited
        postLimitSpeed: { type: String, default: null },
    },
    calls: { type: String, required: true, trim: true },
    sms: { type: String, required: true, trim: true },
    extraBenefits: [{
        type: { type: String, default: "" },
        description: { type: String, default: "" },
        icon: { type: String, default: "" },
    }],
    additionalDetails: { type: String, default: "" },
}, { timestamps: true });

Recharge_Plan_Schema.index({ platform: 1, category: 1 });

// Normalize legacy/loose input: generate a planId and coerce string
// extra benefits into the { type, description, icon } shape.
Recharge_Plan_Schema.pre("validate", function (next) {
    if (!this.planId) {
        this.planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    if (Array.isArray(this.extraBenefits)) {
        this.extraBenefits = this.extraBenefits
            .map((benefit) =>
                typeof benefit === "string"
                    ? { type: "", description: benefit.trim(), icon: "" }
                    : benefit
            )
            .filter((benefit) => benefit && (benefit.description || benefit.type));
    }
    next();
});

module.exports = mongoose.model("Recharge_Plan", Recharge_Plan_Schema);
