const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
    admin_response: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

querySchema.pre("save", function (next) {
    this.updated_at = Date.now();
    next();
});

const Query = mongoose.model("Query", querySchema);

module.exports = Query;