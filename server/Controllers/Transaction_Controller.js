const Transaction = require("../Models/Transaction");
const RechargePlan = require("../Models/Recharge_Plan");

const isOwnerOrAdmin = (transaction, user) =>
    user.role === "admin" || String(transaction.user_id) === String(user.userId);

// Loads a transaction only if the requester owns it (or is an admin).
const findAccessibleTransaction = async (id, user) => {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
        return { status: 404, message: "Transaction not found" };
    }
    if (!isOwnerOrAdmin(transaction, user)) {
        return { status: 403, message: "You are not allowed to access this transaction" };
    }
    return { transaction };
};

// Get Transaction (own; admins may pass ?userId=)
const getUserTransaction_List = async (req, res) => {
    try {
        const userId = req.user.role === "admin" && req.query.userId
            ? req.query.userId
            : req.user.userId;

        const Transaction_List = await Transaction
            .find({ user_id: userId })
            .populate("plan_id");
        res.status(200).json(Transaction_List);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Last Transaction for a User
const getLastTransaction = async (req, res) => {
    try {
        const userId = req.user.userId;
        const mobileNumber = req.query.mobileNumber;

        const lastTransaction = await Transaction.findOne({
            user_id: userId,
            mobile_number: mobileNumber,
            status: "Success",
            transactionType: "recharge",
        }).sort({ createdAt: -1 });

        if (!lastTransaction) {
            return res.status(404).json({ message: "No recharge transaction found" });
        }

        res.status(200).json(lastTransaction);
    } catch (error) {
        console.error("Error fetching last transaction:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get Transaction by ID (owner or admin only)
const getTransactionById = async (req, res) => {
    try {
        const { transaction, status, message } = await findAccessibleTransaction(req.params.id, req.user);
        if (!transaction) return res.status(status).json({ message });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Transaction (owner or admin only)
const deleteFromTransaction_List = async (req, res) => {
    try {
        const { transaction, status, message } = await findAccessibleTransaction(req.params.id, req.user);
        if (!transaction) return res.status(status).json({ message });

        await transaction.deleteOne();
        res.status(200).json({ message: "Transaction Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Transaction (admin only; restricted fields)
const updateTransaction = async (req, res) => {
    try {
        const allowedFields = ["status", "payment_method", "transactionType"];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json(updatedTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Function to get the most popular plans based on past transactions
const getPopularPlans = async (provider) => {
    try {
        const transactions = await Transaction.find({ "plan.platform": provider });
        const planCount = {};

        transactions.forEach(transaction => {
            if (transaction.plan_id) {
                planCount[transaction.plan_id] = (planCount[transaction.plan_id] || 0) + 1;
            }
        });

        const sortedPlanIds = Object.keys(planCount).sort((a, b) => planCount[b] - planCount[a]).slice(0, 3);

        const popularPlans = await RechargePlan.find({ _id: { $in: sortedPlanIds } });
        return popularPlans;
    } catch (error) {
        console.error("Error fetching popular plans:", error);
        return [];
    }
};

// Function to get the recommended plan based on the user's last transaction
const getRecommendedPlan = async (userId, provider) => {
    try {
        const lastTransaction = await Transaction.findOne({ user_id: userId, "plan.platform": provider }).sort({ transaction_date_time: -1 });
        if (lastTransaction) {
            const lastPlan = await RechargePlan.findById(lastTransaction.plan_id);
            if (lastPlan) {
                const similarPlans = await RechargePlan.find({
                    platform: provider,
                    category: lastPlan.category,
                    price: { $gte: lastPlan.price - 50, $lte: lastPlan.price + 50 },
                    _id: { $ne: lastPlan._id }
                }).limit(3);
                return similarPlans;
            }
        }
        return [];
    } catch (error) {
        console.error("Error fetching recommended plans:", error);
        return [];
    }
};

// Function to get suggested plans (combines recommended and popular plans)
const getSuggestedPlans = async (req, res) => {
    try {
        const userId = req.user.userId;
        const provider = req.query.provider;

        if (!provider) {
            return res.status(400).json({ error: "Provider is required" });
        }

        const recommendedPlans = await getRecommendedPlan(userId, provider);
        const popularPlans = await getPopularPlans(provider);

        const response = {
            suggestedFromHistory: recommendedPlans,
            popularPlans: popularPlans,
            hasTransactionHistory: recommendedPlans.length > 0
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching suggested plans:", error);
        res.status(500).json({ error: "Error fetching suggested plans" });
    }
};

module.exports = {
    getUserTransaction_List,
    getLastTransaction,
    getTransactionById,
    deleteFromTransaction_List,
    updateTransaction,
    getSuggestedPlans,
};
