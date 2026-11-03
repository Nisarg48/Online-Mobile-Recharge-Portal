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

module.exports = { validateCoupon };
