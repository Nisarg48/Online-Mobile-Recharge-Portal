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
        },
        calls: { type: String, required: true },
        sms: { type: String, required: true },
        extraBenefits: [{ type: String, required: false }],
    },
    platformCharge: { type: Number, required: true },
    transaction_date_time: { 
        type: String, 
        required: true, 
        default: () => {
            const now = new Date();
            return `Date :- ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}, Time:- ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        } 
    },
    status: { type: String, required: true, enum: ['Success', 'Pending', 'Failed'], default: 'Pending' },
    payment_method: { type: String, required: false, default: 'Card' },
});


const Transaction = mongoose.model("Transaction", Transaction_Schema);
module.exports = Transaction;