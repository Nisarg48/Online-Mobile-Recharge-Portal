require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./DBConnection/connect");
const userRoutes = require("./Router/route");
const cors = require("cors");
const feedbackRoutes = require("./Router/feedbackRoutes");

const app = express();
const port = process.env.PORT || 5000; // Changed to 5000 to match your client config

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", feedbackRoutes);
app.use('/Mobile-Recharge-Portal', userRoutes);

// Home route for testing
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Start server
const start = async () => {
    try {
        await connectDB(process.env.CONNECTION_STRING);
        console.log("Connected to the database");
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.error("Failed to connect to DB", error);
        process.exit(1);
    }
};

start();