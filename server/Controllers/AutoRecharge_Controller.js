const mongoose = require("mongoose");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");
const Recharge_Plan = require("../Models/Recharge_Plan");
const AutoRechargeLog = require("../Models/AutoRechargeLog");
const { notifyRechargeSuccess, notifyAutoRechargeFailure } = require("../Utils/notifications");

// After this many consecutive failures we stop retrying and disable the
// feature, so a wallet that is never topped up doesn't get checked forever.
const MAX_FAILURES = 3;

const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

// Records the outcome for the user's history and updates their last-attempt
// fields. Logging must never break the recharge itself.
const record = async (user, status, reason, extra = {}) => {
    try {
        await AutoRechargeLog.create({
            user_id: user._id,
            status,
            reason,
            plan_id: extra.plan?._id || null,
            amount: extra.amount || 0,
            transaction_id: extra.transaction || null,
        });
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    autoRechargeLastAttempt: new Date(),
                    autoRechargeLastStatus: status,
                },
            }
        );
    } catch (error) {
        console.error("Failed to write auto-recharge log:", error.message);
    }
};

// The plan to renew and the date the current plan expires. Prefers the fields
// kept on the user (the "Date model"); falls back to the last completed
// recharge for accounts created before those fields were maintained.
const resolvePlan = async (user) => {
    let plan = user.selectedPlan ? await Recharge_Plan.findById(user.selectedPlan) : null;
    let expiryDate = user.planExpiryDate ? new Date(user.planExpiryDate) : null;

    if (!plan || !expiryDate) {
        const last = await Transaction.findOne({
            user_id: user._id,
            status: "Success",
            transactionType: "recharge",
            plan_id: { $ne: null },
        }).sort({ transaction_date_time: -1 });

        if (last) {
            if (!plan) plan = await Recharge_Plan.findById(last.plan_id);
            if (!expiryDate) {
                if (last.planExpiryDate) {
                    expiryDate = new Date(last.planExpiryDate);
                } else if (last.transaction_date_time && plan?.validity) {
                    expiryDate = addDays(new Date(last.transaction_date_time), plan.validity);
                }
            }
        }
    }

    return { plan, expiryDate };
};

const autoRecharge = async (userId) => {
    let user = null;
    try {
        user = await User.findById(userId);
        if (!user) return { status: "Skipped", reason: "User not found" };
        if (!user.autoRechargeEnabled) {
            return { status: "Skipped", reason: "Auto-recharge is disabled" };
        }

        const { plan, expiryDate } = await resolvePlan(user);

        if (!plan) {
            await record(user, "Skipped", "No plan to renew");
            return { status: "Skipped", reason: "No plan to renew" };
        }
        if (!expiryDate || Number.isNaN(expiryDate.getTime())) {
            await record(user, "Skipped", "No plan expiry on file", { plan });
            return { status: "Skipped", reason: "No plan expiry on file" };
        }

        const now = new Date();
        if (expiryDate > now) {
            // Normal state: nothing to do, and logging every run would bury
            // the meaningful success/failure history.
            return { status: "Skipped", reason: "Plan is still active" };
        }

        if (!Number.isFinite(plan.price) || plan.price <= 0) {
            await record(user, "Failed", "Invalid plan price", { plan });
            return { status: "Failed", reason: "Invalid plan price" };
        }
        if (!Number.isFinite(plan.validity) || plan.validity <= 0) {
            await record(user, "Failed", "Invalid plan validity", { plan });
            return { status: "Failed", reason: "Invalid plan validity" };
        }

        if (user.wallet < plan.price) {
            const failures = (user.autoRechargeFailures || 0) + 1;
            const disabled = failures >= MAX_FAILURES;
            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        autoRechargeFailures: failures,
                        autoRechargeEnabled: disabled ? false : user.autoRechargeEnabled,
                    },
                }
            );

            const reason = disabled
                ? `Wallet balance ₹${user.wallet} is below the plan price ₹${plan.price}; disabled after ${failures} failed attempts`
                : `Wallet balance ₹${user.wallet} is below the plan price ₹${plan.price}`;

            await record(user, "Failed", reason, { plan, amount: plan.price });
            await notifyAutoRechargeFailure(user, plan, reason, disabled);
            return { status: "Failed", reason };
        }

        // Atomically debit only if the wallet still covers the plan and the
        // feature is still enabled (protects against overlapping runs).
        const nowDate = new Date();
        const planExpiryDate = addDays(nowDate, plan.validity);
        const debited = await User.findOneAndUpdate(
            {
                _id: user._id,
                autoRechargeEnabled: true,
                wallet: { $gte: plan.price },
            },
            {
                $inc: { wallet: -plan.price },
                $set: {
                    selectedPlan: plan._id,
                    planExpiryDate,
                    autoRechargeFailures: 0,
                },
            },
            { new: true }
        );

        if (!debited) {
            await record(user, "Skipped", "Wallet changed before the recharge ran", { plan });
            return { status: "Skipped", reason: "Wallet changed before the recharge ran" };
        }

        const transaction = new Transaction({
            user_id: user._id,
            mobile_number: user.mobile_no,
            plan_id: plan._id,
            plan: {
                platform: plan.platform,
                category: plan.category,
                price: plan.price,
                validity: plan.validity,
                data: {
                    dailyLimit: plan.data?.dailyLimit,
                    totalData: plan.data?.totalData,
                    postLimitSpeed: plan.data?.postLimitSpeed,
                },
                calls: plan.calls,
                sms: plan.sms,
                extraBenefits: plan.extraBenefits,
                additionalDetails: plan.additionalDetails,
            },
            platformCharge: 0,
            transaction_date_time: nowDate,
            planExpiryDate,
            status: "Success",
            payment_method: "Wallet",
            transactionType: "recharge",
            amount_to_pay: plan.price,
        });

        try {
            await transaction.save();
        } catch (error) {
            // Refund the debit if the transaction could not be written.
            await User.updateOne({ _id: user._id }, { $inc: { wallet: plan.price } });
            await record(user, "Failed", "Could not save the recharge transaction", {
                plan,
                amount: plan.price,
            });
            return { status: "Failed", reason: "Could not save the recharge transaction" };
        }

        await record(user, "Success", "Auto-recharged successfully", {
            plan,
            amount: plan.price,
            transaction: transaction._id,
        });
        await notifyRechargeSuccess(debited, transaction);

        console.log(`Auto recharge successful for ${user.mobile_no}`);
        return { status: "Success", transaction_id: transaction._id };
    } catch (error) {
        console.error("Error in autoRecharge:", error);
        if (user) {
            await record(user, "Failed", `Unexpected error: ${error.message}`, {});
        }
        return { status: "Failed", reason: "Unexpected error" };
    }
};

// Used by the cron job. Returns a small summary for the logs.
const processDueAutoRecharges = async () => {
    const users = await User.find({ autoRechargeEnabled: true }).select("_id").lean();
    const summary = { total: users.length, success: 0, failed: 0, skipped: 0 };

    for (const user of users) {
        const result = await autoRecharge(user._id);
        const key = result.status.toLowerCase();
        if (summary[key] !== undefined) summary[key] += 1;
    }

    return summary;
};

// GET /autoRecharge/logs (own; admin may pass ?userId=)
const listAutoRechargeLogs = async (req, res) => {
    try {
        const userId =
            req.user.role === "admin" && req.query.userId
                ? req.query.userId
                : req.user.userId;

        const logs = await AutoRechargeLog.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error("Error fetching auto-recharge logs:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /autoRecharge/run (admin): run now for one user or all enabled users.
const runAutoRecharge = async (req, res) => {
    try {
        if (req.query.userId) {
            if (!mongoose.isValidObjectId(req.query.userId)) {
                return res.status(400).json({ success: false, message: "Invalid user id" });
            }
            const result = await autoRecharge(req.query.userId);
            return res.status(200).json({ success: true, result });
        }

        const summary = await processDueAutoRecharges();
        return res.status(200).json({ success: true, summary });
    } catch (error) {
        console.error("Error running auto-recharge:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    autoRecharge,
    processDueAutoRecharges,
    listAutoRechargeLogs,
    runAutoRecharge,
};
