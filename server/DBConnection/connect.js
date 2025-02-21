const mongoos = require("mongoose");

const connectDB = async (url) => {
    try {
        const conn = await mongoos.connect(url);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDB;