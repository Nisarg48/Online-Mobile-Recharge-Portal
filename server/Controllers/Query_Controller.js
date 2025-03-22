const Query = require("../Models/Query");
const User = require("../Models/User");

// Submit a new query (User)
const submitQuery = async (req, res) => {
    try {
        const { subject, message } = req.body;

        console.log("Request body:", req.body); // Debugging

        const user_id = req.user?.userId;
        console.log("User ID:", user_id);

        if (!user_id) {
            return res.status(400).json({ message: "User ID missing" });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User found:", user);

        const newQuery = new Query({
            user_id,
            username: user.name,
            email: user.email,
            subject,
            message
        });

        await newQuery.save();
        console.log("Query saved successfully!");

        res.status(201).json({ message: "Query submitted successfully", query: newQuery });

    } catch (error) {
        console.error("Error in submitQuery:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Get all queries (Admin)
const getAllQueries = async (req, res) => {
    try {
        const queries = await Query.find().sort({ created_at: -1 });
        res.status(200).json(queries);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Get a single query by ID
const getQueryById = async (req, res) => {
    try {
        const query = await Query.findById(req.params.id);
        if (!query) return res.status(404).json({ error: "Query not found" });

        res.status(200).json(query);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Update query status and admin response (Admin)
const updateQuery = async (req, res) => {
    try {
        const { status, admin_response } = req.body;

        const query = await Query.findById(req.params.id);
        if (!query) return res.status(404).json({ error: "Query not found" });

        if (status) query.status = status;
        if (admin_response) query.admin_response = admin_response;

        await query.save();
        res.status(200).json({ message: "Query updated successfully", query });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Delete a query (Optional, if needed)
const deleteQuery = async (req, res) => {
    try {
        const query = await Query.findByIdAndDelete(req.params.id);
        if (!query) return res.status(404).json({ error: "Query not found" });

        res.status(200).json({ message: "Query deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

module.exports = { 
                    submitQuery, 
                    getAllQueries, 
                    getQueryById, 
                    updateQuery, 
                    deleteQuery 
                };