const AdminAuditLog = require("../Models/AdminAuditLog");
const User = require("../Models/User");

// Best-effort audit write: a logging failure must never fail the admin action
// that already succeeded. The request object is passed so we can capture who
// performed the action without trusting the client.
const recordAudit = async (req, { action, targetType, targetId, details }) => {
    try {
        let actorName = req.user.name || "";
        if (!actorName) {
            const actor = await User.findById(req.user.userId).select("name");
            actorName = actor?.name || "";
        }
        await AdminAuditLog.create({
            actor_id: req.user.userId,
            actor_name: actorName,
            action,
            target_type: targetType || "",
            target_id: targetId ? String(targetId) : "",
            details: details || "",
        });
    } catch (error) {
        console.error("Audit log error:", error.message);
    }
};

module.exports = { recordAudit };
