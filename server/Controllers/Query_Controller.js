const Query = require("../Models/Query");
const User = require("../Models/User");
const { sendMail } = require("../Utils/mailer");

// Submit a new query (User)
const submitQuery = async (req, res) => {
    try {
        const { subject, message } = req.body;

        const user_id = req.user?.userId;

        if (!user_id) {
            return res.status(400).json({ message: "User ID missing" });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

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

// Get a single query by ID (owner or admin only)
const getQueryById = async (req, res) => {
    try {
        const query = await Query.findById(req.params.id);
        if (!query) return res.status(404).json({ error: "Query not found" });

        const isOwner = String(query.user_id) === String(req.user.userId);
        if (!isOwner && req.user.role !== "admin") {
            return res.status(403).json({ error: "You are not allowed to view this query" });
        }

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

        // Update query
        if (status) query.status = status;
        if (admin_response) query.admin_response = admin_response;

        await query.save();

        // Email the query's actual owner (best-effort: the reply is already saved,
        // so a mail failure must not fail the request).
        if (admin_response) {
            const user = await User.findById(query.user_id);
            if (user) {
                await sendMail({
                    to: user.email,
                    subject: `Response to Your Query: ${query.subject}`,
                    text: `Dear ${user.name},\n\nYour query: "${query.message}"\n\nAdmin Response: ${admin_response}\n\nThank you for reaching out!\nBest regards,\nSupport Team`,
                });
            }
        }

        res.status(200).json({ success: true, message: "Query updated successfully", query });

    } catch (error) {
        console.error("Error in updateQuery:", error);
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

// Fetch User Queries and it's Replies
const fetchUserQueries = async (req, res) => {
    try {
        const user_id = req.user?.userId;
        const queries = await Query.find({ user_id }).sort({ created_at: -1 });
        res.status(200).json(queries);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

module.exports = { 
    submitQuery, 
    getAllQueries, 
    getQueryById, 
    updateQuery, 
    deleteQuery,
    fetchUserQueries
};