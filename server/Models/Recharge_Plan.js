const mongoose = require("mongoose");

const Recharge_Plan_Schema = new mongoose.Schema({
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
});

const Recharge_Plan = mongoose.model("Recharge_Plan", Recharge_Plan_Schema);
module.exports = Recharge_Plan;