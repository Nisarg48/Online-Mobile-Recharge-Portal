const Coupon = require("../Models/Coupon");

// Flat platform fee for recharges. The client shows the same value, but the
// server derives the amount itself so a tampered request cannot underpay.
const PLATFORM_CHARGE = 10;

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

const computeDiscount = (coupon, amount) => {
    if (!coupon || !Number.isFinite(amount) || amount <= 0) return 0;
    if (amount < coupon.minAmount) return 0;

    let discount =
        coupon.type === "percent"
            ? Math.floor((amount * coupon.value) / 100)
            : coupon.value;

    if (coupon.type === "percent" && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
    }

    return Math.max(0, Math.min(discount, amount));
};

// Checks everything except the atomic usage consumption and returns either
// { coupon } or { error }.
const findUsableCoupon = async (code, userId, amount) => {
    const coupon = await Coupon.findOne({ code: normalizeCode(code) });
    if (!coupon || !coupon.active) return { error: "Invalid coupon code." };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { error: "This coupon has expired." };
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return { error: "This coupon has reached its usage limit." };
    }
    if (
        coupon.perUserLimit > 0 &&
        coupon.redeemedBy.some((id) => String(id) === String(userId))
    ) {
        return { error: "You have already used this coupon." };
    }
    if (amount < coupon.minAmount) {
        return { error: `This coupon needs a minimum order of ₹${coupon.minAmount}.` };
    }
    return { coupon };
};

// Atomically consumes one use. Returns false when the coupon is no longer
// available, so concurrent redemptions cannot exceed the limit.
const consumeCoupon = async (code, userId) => {
    const coupon = await Coupon.findOne({ code: normalizeCode(code) });
    if (!coupon) return false;

    const filter = {
        _id: coupon._id,
        active: true,
        $and: [
            { $or: [{ usageLimit: 0 }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] },
            { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
        ],
    };
    const update = { $inc: { usedCount: 1 } };

    if (coupon.perUserLimit > 0) {
        // MongoDB can't combine $ne with $addToSet on the same array atomically,
        // so the guard goes in the filter.
        filter.redeemedBy = { $ne: userId };
        update.$addToSet = { redeemedBy: userId };
    }

    const result = await Coupon.updateOne(filter, update);
    return result.modifiedCount > 0;
};

module.exports = {
    PLATFORM_CHARGE,
    normalizeCode,
    computeDiscount,
    findUsableCoupon,
    consumeCoupon,
};
