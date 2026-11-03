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

module.exports = { notifyRechargeSuccess };
