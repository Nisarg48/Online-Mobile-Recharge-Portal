const mongoose = require("mongoose");

const Transaction_Schema = new mongoose.Schema({
    user_id: { type: String, required: true },
    mobile_number: { type: String, required: true },
    plan_id: { type: String, required: false },
    plan: {
        platform: { type: String, required: false },
        category: { type: String, required: false },
        price: { type: Number, required: false },
        validity: { type: Number, required: false }, // Validity in minutes
        data: {
            dailyLimit: { type: Number, required: false },
            totalData: { type: Number, required: false },
        },
        calls: { type: String, required: false },
        sms: { type: String, required: false },
        extraBenefits: [{ type: String, required: false }],
    },
    platformCharge: { type: Number, required: false, default: 0 },
    transaction_date_time: { 
        type: String, 
        required: true, 
        default: () => {
            const now = new Date();
            return `Date: ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}, Time: ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        }
    },
    status: { type: String, required: true, enum: ['Success', 'Pending', 'Failed'], default: 'Pending' },
    payment_method: { type: String, required: false, default: 'Card' },
    transactionType: { type: String, required: true, enum: ['recharge', 'wallet'], default: 'recharge' },
    amount_to_pay: { type: Number, required: true },
    planExpiryDate: { type: String, required: false }, // Store as string
});

Transaction_Schema.pre("validate", function (next) {
    if (this.transactionType === "recharge" && !this.plan) {
        this.invalidate("plan", "Plan details are required for recharge transactions.");
    }
    next();
});

const Transaction = mongoose.model("Transaction", Transaction_Schema);
module.exports = Transaction;