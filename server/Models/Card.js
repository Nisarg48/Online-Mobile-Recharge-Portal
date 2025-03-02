const mongoose = require("mongoose");

const Card_Schema = new mongoose.Schema({
    cardNumber: { type: String, required: true, unique: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true },
    cardholderName: { type: String, required: true },
    bankName: { type: String, required: true },
    balance: { type: Number, required: true },
    mobile_number: { type: Number, length: 10, required: true },
});

const Card = mongoose.model("Card", Card_Schema);
module.exports = Card;