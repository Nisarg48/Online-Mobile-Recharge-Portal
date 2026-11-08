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

// Regional breakdown for the admin geography page. Joins successful recharges
// back to their user to attribute revenue to the user's state/city.
const getRegions = async (_req, res) => {
    try {
        const normalize = (value) => (value === null || value === undefined ? "" : String(value).trim());

        const [usersByArea, revenueByArea] = await Promise.all([
            User.aggregate([
                {
                    $group: {
                        _id: { region: "$region", city: "$city" },
                        users: { $sum: 1 },
                    },
                },
            ]),
            Transaction.aggregate([
                { $match: { status: "Success", transactionType: "recharge" } },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { region: "$user.region", city: "$user.city" },
                        recharges: { $sum: 1 },
                        revenue: { $sum: "$amount_to_pay" },
                    },
                },
            ]),
        ]);

        const areas = new Map();
        const keyFor = (region, city) => `${region}||${city}`;

        for (const row of usersByArea) {
            const region = normalize(row._id?.region) || "Unknown";
            const city = normalize(row._id?.city);
            const key = keyFor(region, city);
            const area = areas.get(key) || { region, city, users: 0, recharges: 0, revenue: 0 };
            area.users += row.users;
            areas.set(key, area);
        }

        for (const row of revenueByArea) {
            const region = normalize(row._id?.region) || "Unknown";
            const city = normalize(row._id?.city);
            const key = keyFor(region, city);
            const area = areas.get(key) || { region, city, users: 0, recharges: 0, revenue: 0 };
            area.recharges += row.recharges;
            area.revenue += row.revenue;
            areas.set(key, area);
        }

        const byCity = Array.from(areas.values())
            .map((area) => ({
                ...area,
                avgTicket: area.recharges ? Number((area.revenue / area.recharges).toFixed(2)) : 0,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        const regionMap = new Map();
        for (const area of byCity) {
            const region = regionMap.get(area.region) || {
                region: area.region,
                users: 0,
                recharges: 0,
                revenue: 0,
                cities: 0,
            };
            region.users += area.users;
            region.recharges += area.recharges;
            region.revenue += area.revenue;
            if (area.city) region.cities += 1;
            regionMap.set(area.region, region);
        }

        const byRegion = Array.from(regionMap.values())
            .map((region) => ({
                ...region,
                avgTicket: region.recharges
                    ? Number((region.revenue / region.recharges).toFixed(2))
                    : 0,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        const totalUsers = byRegion.reduce((sum, region) => sum + region.users, 0);
        const totalRevenue = byRegion.reduce((sum, region) => sum + region.revenue, 0);
        const totalRecharges = byRegion.reduce((sum, region) => sum + region.recharges, 0);

        return res.status(200).json({
            success: true,
            data: {
                byRegion,
                byCity,
                totals: {
                    users: totalUsers,
                    regions: byRegion.filter((region) => region.region !== "Unknown").length,
                    recharges: totalRecharges,
                    revenue: totalRevenue,
                    unassignedUsers:
                        byRegion.find((region) => region.region === "Unknown")?.users || 0,
                },
            },
        });
    } catch (error) {
        console.error("Regions error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getDashboard, getRegions };
