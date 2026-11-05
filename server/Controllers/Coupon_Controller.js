const mongoose = require("mongoose");
const Coupon = require("../Models/Coupon");
const RechargePlan = require("../Models/Recharge_Plan");
const {
    PLATFORM_CHARGE,
    findUsableCoupon,
    computeDiscount,
} = require("../Utils/coupons");

// Previews a coupon against a plan without consuming it. The checkout endpoint
// re-validates and computes the final amount server-side, so a tampered client
// cannot choose its own discount.
const validateCoupon = async (req, res) => {
    try {
        const { code, plan_id } = req.body;
        const userId = req.user.userId;

        const plan = await RechargePlan.findById(plan_id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found." });
        }

        const baseAmount = plan.price + PLATFORM_CHARGE;
        const { coupon, error } = await findUsableCoupon(code, userId, baseAmount);
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const discount = computeDiscount(coupon, baseAmount);
        return res.status(200).json({
            success: true,
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            baseAmount,
            discount,
            finalAmount: Math.max(0, baseAmount - discount),
        });
    } catch (error) {
        console.error("Coupon validation error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Available coupons for users (public view — no internal redemption fields).
const listAvailableCoupons = async (_req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            active: true,
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
        })
            .select("code description type value minAmount maxDiscount expiresAt")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        console.error("List available coupons error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// List all coupons (admin).
const listCoupons = async (_req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        console.error("List coupons error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Add a new coupon (admin).
const addCoupon = async (req, res) => {
    try {
        const exists = await Coupon.findOne({ code: req.body.code });
        if (exists) {
            return res.status(400).json({ success: false, message: "Coupon code already exists." });
        }
        const coupon = await Coupon.create(req.body);
        return res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        console.error("Add coupon error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Coupon code already exists." });
        }
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update a coupon (admin).
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid coupon id." });
        }
        const coupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }
        return res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        console.error("Update coupon error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Coupon code already exists." });
        }
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete a coupon (admin).
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid coupon id." });
        }
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }
        return res.status(200).json({ success: true, message: "Coupon deleted." });
    } catch (error) {
        console.error("Delete coupon error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    validateCoupon,
    listCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
};
