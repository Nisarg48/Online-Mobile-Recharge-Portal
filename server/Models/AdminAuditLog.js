const mongoose = require("mongoose");

// Append-only record of sensitive admin actions (role/status/wallet/refund).
const AdminAuditLogSchema = new mongoose.Schema(
    {
        actor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        actor_name: { type: String, default: "" },
        action: { type: String, required: true, trim: true, maxlength: 60 },
        target_type: { type: String, default: "", trim: true, maxlength: 40 },
        target_id: { type: String, default: "", trim: true, maxlength: 80 },
        details: { type: String, default: "", trim: true, maxlength: 500 },
    },
    { timestamps: true }
);

AdminAuditLogSchema.index({ createdAt: -1 });
AdminAuditLogSchema.index({ actor_id: 1, createdAt: -1 });
AdminAuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AdminAuditLog", AdminAuditLogSchema);
