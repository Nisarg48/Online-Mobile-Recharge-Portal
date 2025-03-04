const Transaction = require("../Models/Transaction");
const RechargePlan = require("../Models/Recharge_Plan");

// Get Transaction
const getUserTransaction_List = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(userId);
        const Transaction_List = await Transaction.find({ user_id: userId });
        console.log(Transaction_List);
        res.status(200).json(Transaction_List);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Get Transaction by ID
const getTransactionById = async (req, res) => {
    try {
        const id = req.params.id;
        const transaction = await Transaction.findById(id);
        res.status(200).json(transaction);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Add in Transaction
const addInTransaction_List = async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

// Delete from Transaction
const deleteFromTransaction_List = async (req, res) => {
    try {
        const id = req.params.id;
        await Transaction.findByIdAndDelete(id);
        res.status(200).json({ message: "Transaction Deleted Successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Update Transaction
const updateTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedTransaction);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Function to get the most popular plans based on past transactions
const getPopularPlans = async (provider) => {
    try {
        const transactions = await Transaction.find({ "plan.platform": provider });
        const planCount = {};

        // Count how many times each plan was purchased
        transactions.forEach(transaction => {
            if (transaction.plan_id) {
                planCount[transaction.plan_id] = (planCount[transaction.plan_id] || 0) + 1;
            }
        });

        // Sort plans by popularity and get the top 3
        const sortedPlanIds = Object.keys(planCount).sort((a, b) => planCount[b] - planCount[a]).slice(0, 3);

        // Fetch details of the popular plans
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
                // Find similar plans based on the last plan's category and price range
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

        console.log("Fetching suggested plans for user:", userId, "and provider:", provider);

        // Fetch recommended plans based on user's last transaction
        const recommendedPlans = await getRecommendedPlan(userId, provider);
        console.log("Recommended Plans:", recommendedPlans);

        // Fetch popular plans based on all users' transactions
        const popularPlans = await getPopularPlans(provider);
        console.log("Popular Plans:", popularPlans);

        // Prepare the response
        const response = {
            suggestedFromHistory: recommendedPlans,
            popularPlans: popularPlans,
            hasTransactionHistory: recommendedPlans.length > 0
        };

        console.log("Final Response:", response);

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching suggested plans:", error);
        res.status(500).json({ error: "Error fetching suggested plans" });
    }
};

module.exports = { 
                    getUserTransaction_List,
                    getTransactionById, 
                    addInTransaction_List, 
                    deleteFromTransaction_List, 
                    updateTransaction,
                    getSuggestedPlans
                };