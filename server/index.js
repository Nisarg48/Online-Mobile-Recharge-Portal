require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./DBConnection/connect");
const userRoutes = require("./Router/route");
const cron = require("node-cron");
const autoRecharge = require("./Controllers/AutoRecharge_Controller");
const User = require("./Models/User");
const { generalLimiter } = require("./Middleware/rateLimit");

const app = express();
const port = process.env.PORT || 5000;

// Security & parsing middleware
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

// localhost or a private LAN address (used when opening the app on a phone
// through `vite --host`).
const isPrivateHost = (hostname) =>
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

app.use(cors({
    origin(origin, callback) {
        // Allow same-origin/tooling requests (no Origin header) and allowlisted origins.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);

        // Outside production, also trust localhost/LAN origins so the site works
        // when opened from a phone on the same network without listing every IP.
        if (!isProduction) {
            try {
                if (isPrivateHost(new URL(origin).hostname)) return callback(null, true);
            } catch {
                // Malformed Origin header: fall through to rejection.
            }
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(generalLimiter);

// API Routes
app.use('/Mobile-Recharge-Portal', userRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err && err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "Origin not allowed" });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});

const start = async () => {
    try {
        await connectDB(process.env.CONNECTION_STRING);
        console.log("Connected to the database");

        // Schedule the auto-recharge job to run every 2 hours
        cron.schedule('0 */2 * * *', async () => {
            console.log("\n--- Running auto-recharge job ---");
            try {
                const users = await User.find({ autoRechargeEnabled: true });

                console.log(`Found ${users.length} users with auto-recharge enabled`);

                for (const user of users) {
                    console.log("\nProcessing user:", user._id);
                    await autoRecharge(user._id);
                }
            } catch (error) {
                console.error("Error in auto-recharge job:", error);
            }
        });

        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.error("Failed to connect to DB", error);
        process.exit(1);
    }
};

start();
