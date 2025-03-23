require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./DBConnection/connect");
const userRoutes = require("./Router/route");
const cors = require("cors");
const feedbackRoutes = require("./Router/feedbackRoutes");
const cron = require("node-cron");
const autoRecharge = require("./Controllers/AutoRecharge_Controller");
const User = require("./Models/User");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", feedbackRoutes);
app.use('/Mobile-Recharge-Portal', userRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
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