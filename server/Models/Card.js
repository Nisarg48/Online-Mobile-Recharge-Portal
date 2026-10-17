const mongoose = require("mongoose");

const Card_Schema = new mongoose.Schema({
    cardNumber: { type: String, required: true, unique: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true },
    cardholderName: { type: String, required: true },
    bankName: { type: String, required: true },
    balance: { type: Number, required: true, min: 0 },
    mobile_number: { type: String, required: true, match: /^[6-9]\d{9}$/ },
});

const Card = mongoose.model("Card", Card_Schema);
module.exports = Card;