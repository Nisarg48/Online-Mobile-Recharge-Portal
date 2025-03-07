const mongoose = require("mongoose");

const User_Schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    mobile_no: {
        type: String,
        required: true,
        unique: true,
        match: /^[6-9]\d{9}$/
    },
    password: { type: String, required: true, minLength: 8 },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

User_Schema.virtual("userId").get(function () {
    return this._id.toHexString();
});

User_Schema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    await this.save();
};

const User = mongoose.model("User", User_Schema);
module.exports = User;