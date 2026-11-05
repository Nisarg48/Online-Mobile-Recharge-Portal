const { sendMail } = require("./mailer");

// Best-effort recharge receipt email. Uses the mailer's console fallback when
// SMTP is not configured, and never throws into the payment flow.
const notifyRechargeSuccess = async (user, transaction) => {
    if (!user?.email) return false;

    try {
        const plan = transaction.plan || {};
        const lines = [
            `Hi ${user.name || "there"},`,
            "",
            `Your recharge of ₹${transaction.amount_to_pay} for ${transaction.mobile_number} was successful.`,
            `Plan: ${plan.platform || "-"} ${plan.category ? `- ${plan.category}` : ""}`.trim(),
            `Validity: ${plan.validity || "-"} days`,
        ];

        if (transaction.discount_amount > 0) {
            lines.push(
                `Coupon ${transaction.coupon_code}: saved ₹${transaction.discount_amount}`
            );
        }

        lines.push(
            `Transaction ID: ${transaction._id}`,
            "",
            "Thank you for recharging with us!"
        );

        return await sendMail({
            to: user.email,
            subject: "Recharge successful",
            text: lines.join("\n"),
        });
    } catch (error) {
        console.error("[notifications] recharge success email failed:", error.message);
        return false;
    }
};

// Tells the user why auto-recharge could not run, and whether it was disabled
// after repeated failures.
const notifyAutoRechargeFailure = async (user, plan, reason, disabled) => {
    if (!user?.email) return false;

    try {
        const lines = [
            `Hi ${user.name || "there"},`,
            "",
            "We could not auto-recharge your plan.",
            `Plan: ${plan?.platform || "-"} ${plan?.category ? `- ${plan.category}` : ""}`.trim(),
            `Reason: ${reason}`,
            "",
            disabled
                ? "Auto-recharge has been turned off. Top up your wallet and enable it again from your profile."
                : "We will try again on the next scheduled check.",
            "",
            "Thank you for using our service!",
        ];

        return await sendMail({
            to: user.email,
            subject: "Auto-recharge failed",
            text: lines.join("\n"),
        });
    } catch (error) {
        console.error("[notifications] auto-recharge failure email failed:", error.message);
        return false;
    }
};

module.exports = { notifyRechargeSuccess, notifyAutoRechargeFailure };
