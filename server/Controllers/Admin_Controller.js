const User = require("../Models/User");
const Transaction = require("../Models/Transaction");
const AdminAuditLog = require("../Models/AdminAuditLog");
const { recordAudit } = require("../Utils/audit");

const PLATFORMS = ["Jio", "Airtel", "Vi"];
const STATUSES = ["Success", "Pending", "Failed"];

const parseRange = (query) => {
    const from = query.from ? new Date(query.from) : null;
    const to = query.to ? new Date(query.to) : null;
    const validFrom = from && !Number.isNaN(from.getTime()) ? from : null;
    const validTo = to && !Number.isNaN(to.getTime()) ? to : null;
    return { from: validFrom, to: validTo };
};

const dateMatch = (from, to) => {
    const match = {};
    if (from || to) {
        match.transaction_date_time = {};
        if (from) match.transaction_date_time.$gte = from;
        if (to) {
            // Include the whole "to" day.
            const end = new Date(to);
            end.setHours(23, 59, 59, 999);
            match.transaction_date_time.$lte = end;
        }
    }
    return match;
};

// Platform-wide analytics for the admin dashboard. Optional query params:
//   from, to (ISO dates) and platform (Jio|Airtel|Vi).
const getDashboard = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        const platform = PLATFORMS.includes(req.query.platform) ? req.query.platform : null;

        const txnMatch = { ...dateMatch(from, to) };
        if (platform) txnMatch["plan.platform"] = platform;

        const [totalUsers, adminUsers, activeUsers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ isActive: true }),
        ]);

        const newUserWindowStart = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newUserMatch = { createdAt: { $gte: newUserWindowStart } };
        if (to) newUserMatch.createdAt.$lte = new Date(to);
        const newUsers = await User.countDocuments(newUserMatch);

        const [totalTransactions, successCount, failedCount, pendingCount] = await Promise.all([
            Transaction.countDocuments(txnMatch),
            Transaction.countDocuments({ ...txnMatch, status: "Success" }),
            Transaction.countDocuments({ ...txnMatch, status: "Failed" }),
            Transaction.countDocuments({ ...txnMatch, status: "Pending" }),
        ]);

        const revenueMatch = {
            ...txnMatch,
            status: "Success",
            transactionType: "recharge",
        };
        const revenueResult = await Transaction.aggregate([
            { $match: revenueMatch },
            { $group: { _id: null, total: { $sum: "$amount_to_pay" } } },
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const successRate =
            totalTransactions > 0 ? ((successCount / totalTransactions) * 100).toFixed(2) : 0;
        const arpu = activeUsers > 0 ? Number((totalRevenue / activeUsers).toFixed(2)) : 0;

        // Most popular plans by completed recharges.
        const popularPlansRaw = await Transaction.aggregate([
            {
                $match: {
                    ...revenueMatch,
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

        // Failed recharges grouped by platform (a lightweight "failure reason" view).
        const failedByPlatformRaw = await Transaction.aggregate([
            { $match: { ...txnMatch, status: "Failed", transactionType: "recharge" } },
            {
                $group: {
                    _id: { $ifNull: ["$plan.platform", "Unknown"] },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        const failedByPlatform = failedByPlatformRaw.map((row) => ({
            platform: row._id || "Unknown",
            count: row.count,
        }));

        // Revenue over time (defaults to the last 30 days when no range is given).
        const trendFrom = from || new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
        const trendTo = to || new Date();
        const trendMatch = {
            ...revenueMatch,
            transaction_date_time: { $gte: trendFrom, $lte: trendTo },
        };
        const revenueTrendRaw = await Transaction.aggregate([
            { $match: trendMatch },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$transaction_date_time" } },
                    revenue: { $sum: "$amount_to_pay" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const revenueTrend = revenueTrendRaw.map((row) => ({
            date: row._id,
            revenue: row.revenue,
            count: row.count,
        }));

        const recentTransactions = await Transaction.find(txnMatch)
            .sort({ transaction_date_time: -1 })
            .limit(10)
            .populate("user_id", "name email mobile_no role")
            .populate("plan_id", "platform category price");

        const walletTopups = await Transaction.countDocuments({
            ...txnMatch,
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
                    new: newUsers,
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
                    arpu,
                },
                popularPlans,
                failedByPlatform,
                revenueTrend,
                recentTransactions,
                filters: {
                    from: from ? from.toISOString().slice(0, 10) : null,
                    to: to ? to.toISOString().slice(0, 10) : null,
                    platform,
                },
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

// Paginated transaction explorer for admins.
const listAdminTransactions = async (req, res) => {
    try {
        const filter = {};
        if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
        if (["recharge", "wallet"].includes(req.query.type)) filter.transactionType = req.query.type;
        if (PLATFORMS.includes(req.query.platform)) filter["plan.platform"] = req.query.platform;

        Object.assign(filter, dateMatch(
            req.query.from ? new Date(req.query.from) : null,
            req.query.to ? new Date(req.query.to) : null
        ));

        if (req.query.search) {
            const safe = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.mobile_number = { $regex: safe, $options: "i" };
        }
        if (req.query.refunded === "true") filter.refunded = true;
        if (req.query.refunded === "false") filter.refunded = { $ne: true };

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));

        const [items, total] = await Promise.all([
            Transaction.find(filter)
                .sort({ transaction_date_time: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("user_id", "name email mobile_no role region city")
                .populate("plan_id", "platform category price validity"),
            Transaction.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                items,
                total,
                page,
                pages: Math.ceil(total / limit) || 1,
                limit,
            },
        });
    } catch (error) {
        console.error("Admin transactions error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Credit or debit a user's wallet with a required reason (audited).
const adjustUserWallet = async (req, res) => {
    try {
        const { id } = req.params;
        const amount = Number(req.body.amount);
        const reason = String(req.body.reason || "").trim();

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.wallet + amount < 0) {
            return res.status(400).json({
                success: false,
                message: "Adjustment would make the wallet negative",
            });
        }

        const updated = await User.findByIdAndUpdate(
            id,
            { $inc: { wallet: amount } },
            { new: true }
        );

        await recordAudit(req, {
            action: amount > 0 ? "wallet.credit" : "wallet.debit",
            targetType: "user",
            targetId: id,
            details: `₹${amount} for "${reason}" (new balance ₹${updated.wallet})`,
        });

        return res.status(200).json({
            success: true,
            data: { wallet: updated.wallet },
            message: "Wallet updated",
        });
    } catch (error) {
        console.error("Adjust wallet error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Refund a successful recharge by crediting the user's wallet exactly once.
const refundTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const reason = String(req.body.reason || "").trim() || "Admin refund";

        const txn = await Transaction.findById(id);
        if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
        if (txn.transactionType !== "recharge" || txn.status !== "Success") {
            return res.status(400).json({
                success: false,
                message: "Only successful recharges can be refunded",
            });
        }
        if (txn.refunded) {
            return res.status(409).json({ success: false, message: "Transaction already refunded" });
        }

        // Claim the refund atomically so two admins can't double-credit.
        const claimed = await Transaction.findOneAndUpdate(
            { _id: id, refunded: { $ne: true } },
            {
                $set: {
                    refunded: true,
                    refundedAt: new Date(),
                    refundedAmount: txn.amount_to_pay,
                    refundReason: reason,
                },
            },
            { new: true }
        );
        if (!claimed) {
            return res.status(409).json({ success: false, message: "Transaction already refunded" });
        }

        const user = await User.findByIdAndUpdate(
            txn.user_id,
            { $inc: { wallet: txn.amount_to_pay } },
            { new: true }
        );
        if (!user) {
            // Roll the claim back if the user vanished.
            await Transaction.findByIdAndUpdate(id, {
                $set: { refunded: false, refundedAt: null, refundedAmount: 0, refundReason: null },
            });
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await recordAudit(req, {
            action: "transaction.refund",
            targetType: "transaction",
            targetId: id,
            details: `₹${txn.amount_to_pay} refunded to ${user.email} — "${reason}"`,
        });

        return res.status(200).json({
            success: true,
            data: {
                refundedAmount: txn.amount_to_pay,
                wallet: user.wallet,
                transaction: claimed,
            },
            message: "Refund credited to the user's wallet",
        });
    } catch (error) {
        console.error("Refund error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Recent sensitive admin actions.
const listAuditLogs = async (req, res) => {
    try {
        const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
        const filter = {};
        if (req.query.action) filter.action = String(req.query.action);
        const items = await AdminAuditLog.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error("Audit list error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getDashboard,
    getRegions,
    listAdminTransactions,
    adjustUserWallet,
    refundTransaction,
    listAuditLogs,
};
