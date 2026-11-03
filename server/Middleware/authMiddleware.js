const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid or expired token" });

        try {
            // Confirming the session on every request means logout / password
            // change / deactivation take effect immediately, not just when the
            // short-lived access token happens to expire.
            const user = await User.findById(decoded.userId)
                .select("+refreshTokenHash isActive role");

            if (!user || !user.isActive) {
                return res.status(401).json({ message: "Session is no longer valid" });
            }
            if (!user.refreshTokenHash) {
                return res.status(401).json({ message: "Session ended. Please sign in again." });
            }

            req.user = { userId: user._id.toString(), role: user.role };
            return next();
        } catch (error) {
            console.error("Auth session check failed:", error);
            return res.status(401).json({ message: "Session is no longer valid" });
        }
    });
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

module.exports = verifyToken;
module.exports.isAdmin = isAdmin;
