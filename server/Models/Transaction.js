const mongoose = require("mongoose");

const extraBenefitSchema = new mongoose.Schema({
    type: { type: String, default: "" },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
}, { _id: false });

const Transaction_Schema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mobile_number: { type: String, required: true },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "Recharge_Plan", default: null },
    plan: {
        platform: { type: String },
        category: { type: String },
        price: { type: Number },
        validity: { type: Number }, // days
        data: {
            dailyLimit: { type: Number },
            totalData: { type: Number },
            postLimitSpeed: { type: String },
        },
        calls: { type: String },
        sms: { type: String },
        extraBenefits: [extraBenefitSchema],
        additionalDetails: { type: String },
    },
    platformCharge: { type: Number, default: 0 },
    transaction_date_time: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['Success', 'Pending', 'Failed'], default: 'Pending' },
    payment_method: { type: String, default: 'Card' },
    transactionType: { type: String, enum: ['recharge', 'wallet'], default: 'recharge' },
    amount_to_pay: { type: Number, required: true },
    planExpiryDate: { type: Date, default: null },
}, { timestamps: true });

Transaction_Schema.pre("validate", function (next) {
    if (this.transactionType === "recharge" && !this.plan) {
        this.invalidate("plan", "Plan details are required for recharge transactions.");
    }
    next();
});

Transaction_Schema.index({ user_id: 1, transaction_date_time: -1 });
Transaction_Schema.index({ mobile_number: 1, status: 1 });

module.exports = mongoose.model("Transaction", Transaction_Schema);
