const mongoose = require("mongoose");

const Transaction_Schema = new mongoose.Schema({
    user_id: { type: String, required: true },
    mobile_number: { type: String, required: true },
    plan_id: { type: String, required: true },
    plan: {
        platform: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        validity: { type: Number, required: true },
        data: {
            dailyLimit: { type: Number, required: true },
            totalData: { type: Number, required: false },
            postLimitSpeed: { type: String, required: true },
        },
        calls: { type: String, required: true },
        sms: { type: String, required: true },
        extraBenefits: [
            {
                type: { type: String, required: true },
                description: { type: String, required: false },
                icon: { type: String, required: false },
            },
        ],
        additionalDetails: { type: String, required: false },
    },
    transaction_date_time: { type: String, required: false },
    status: { type: String, required: true, enum:['Success', 'Pending', 'Failed'] },
    payment_method: { type: String, required: false },
});

const Transaction = mongoose.model("Transaction", Transaction_Schema);
module.exports = Transaction;