require("dotenv").config();
const express = require("express");
const connectDB = require("./DBConnection/connect");
const userRoutes = require("./Router/route");
const cors = require("cors");
const feedbackRoutes = require("./Router/feedbackRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Enable JSON middleware
app.use(express.json());

app.use("/api", feedbackRoutes);


// Routes
app.use('/Mobile-Recharge-Portal', userRoutes);

const start = async () => {
    try {
        await connectDB(process.env.CONNECTION_STRING);
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.error("Failed to connect to DB", error);
        process.exit(1);
    }
};

start();
