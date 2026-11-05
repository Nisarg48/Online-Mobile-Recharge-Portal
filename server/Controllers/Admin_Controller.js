const mongoose = require("mongoose");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");

// Platform-wide analytics for the admin dashboard. Every figure is computed
// straight from the database so it always reflects real data.
const getDashboard = async (_req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: "admin" });
        const activeUsers = await User.countDocuments({ isActive: true });

        const [
            totalTransactions,
            successCount,
            failedCount,
            pendingCount,
        ] = await Promise.all([
            Transaction.countDocuments(),
            Transaction.countDocuments({ status: "Success" }),
            Transaction.countDocuments({ status: "Failed" }),
            Transaction.countDocuments({ status: "Pending" }),
        ]);

        const revenueResult = await Transaction.aggregate([
            {
                $match: {
                    status: "Success",
                    transactionType: "recharge",
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount_to_pay" },
                },
            },
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const successRate =
            totalTransactions > 0 ? ((successCount / totalTransactions) * 100).toFixed(2) : 0;

        // Most popular plans by completed recharges.
        const popularPlansRaw = await Transaction.aggregate([
            {
                $match: {
                    status: "Success",
                    transactionType: "recharge",
                    plan_id: { $ne: null },
                },
            },
            {
                $group: {
                    _id: "$plan_id",
                    count: { $sum: 1 },
                    platform: { $first: "$plan.platform" },
                    category: { $first: "$plan.category" },
                    revenue: { $sum: "$amount_to_pay" },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        const popularPlans = popularPlansRaw.map((p) => ({
            plan_id: p._id,
            platform: p.platform || "-",
            category: p.category || "-",
            count: p.count,
            revenue: p.revenue,
        }));

        // Recent activity across the platform.
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user_id", "name email mobile_no role")
            .populate("plan_id", "platform category price");

        const walletTopups = await Transaction.countDocuments({
            status: "Success",
            transactionType: "wallet",
        });

        return res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    admins: adminUsers,
                    active: activeUsers,
                },
                transactions: {
                    total: totalTransactions,
                    success: successCount,
                    failed: failedCount,
                    pending: pendingCount,
                    successRate: Number(successRate),
                },
                revenue: {
                    total: totalRevenue,
                    walletTopups,
                },
                popularPlans,
                recentTransactions,
            },
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getDashboard };
