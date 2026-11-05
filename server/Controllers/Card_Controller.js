const Card = require("../Models/Card.js");
const OTP = require("../Models/OTP.js");
const Transaction = require("../Models/Transaction.js");
const Plan = require("../Models/Recharge_Plan.js");
require("dotenv").config();
const { sendOtp } = require("../Utils/notifier.js");
const {
    PLATFORM_CHARGE,
    findUsableCoupon,
    computeDiscount,
    consumeCoupon,
} = require("../Utils/coupons.js");
const { notifyRechargeSuccess } = require("../Utils/notifications.js");
const User = require("../Models/User.js");

// Verify Card Details
const verify_card_details = async (req, res) => {
    try {
        const {
            mobile_number,
            plan_id,
            amount_to_pay,
            cardNumber,
            expiryDate,
            cvv,
            cardholderName,
            transactionType,
            coupon_code,
        } = req.body;

        if (
            !cardNumber ||
            !expiryDate ||
            !cvv ||
            !cardholderName ||
            !transactionType
        ) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        const card = await Card.findOne({
            cardNumber,
            expiryDate,
            cvv,
            cardholderName,
        });
        if (!card) {
            return res.status(400).json({ message: "Invalid card details!" });
        }

        const user_id = req.user.userId;
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        const mobile_number_to_use = transactionType === "recharge" ? mobile_number : user.mobile_no;

        let plan = null;
        let platformCharge = 0;
        let baseAmount;

        if (transactionType === "recharge") {
            if (!plan_id) {
                return res.status(400).json({ message: "Plan ID is required for recharge transactions!" });
            }
            plan = await Plan.findById(plan_id);
            if (!plan) {
                return res.status(400).json({ message: "Plan not found!" });
            }
            // Derive the amount server-side; never trust the client's total.
            platformCharge = PLATFORM_CHARGE;
            baseAmount = plan.price + platformCharge;
        } else {
            baseAmount = Number(amount_to_pay);
            if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
                return res.status(400).json({ message: "Invalid amount!" });
            }
            if (coupon_code) {
                return res.status(400).json({ message: "Coupons are only valid on recharges." });
            }
        }

        let coupon = null;
        let discount = 0;
        if (coupon_code) {
            const usable = await findUsableCoupon(coupon_code, user_id, baseAmount);
            if (usable.error) {
                return res.status(400).json({ message: usable.error });
            }
            coupon = usable.coupon;
            discount = computeDiscount(coupon, baseAmount);
        }

        const amountToPay = Math.max(0, baseAmount - discount);

        if (card.balance < amountToPay) {
            return res.status(400).json({ message: "Insufficient balance!" });
        }

        const currentDate = new Date();

        // Plan validity is expressed in days.
        let planExpiryDate = null;
        if (transactionType === "recharge" && plan && plan.validity) {
            planExpiryDate = new Date(currentDate);
            planExpiryDate.setDate(planExpiryDate.getDate() + plan.validity);
        }

        const newTransaction = new Transaction({
            user_id,
            mobile_number: mobile_number_to_use,
            plan_id: transactionType === "recharge" ? plan_id : null,
            plan: transactionType === "recharge" ? plan : null, // Include plan for recharge
            platformCharge,
            amount_to_pay: amountToPay,
            original_amount: baseAmount,
            discount_amount: discount,
            coupon_code: coupon ? coupon.code : null,
            status: "Pending",
            transactionType,
            planExpiryDate,
            transaction_date_time: currentDate,
        });

        await newTransaction.save();

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        const expiryTime = new Date(Date.now() + 300 * 1000);

        const newOtp = new OTP({
            transaction_id: newTransaction._id,
            user_id,
            otp: String(otpCode),
            expiresAt: expiryTime,
        });

        await newOtp.save();

        console.log("OTP saved successfully in DB!");

        // Prepare OTP message based on transaction type
        let messageBody;
        if (transactionType === "recharge") {
            const couponNote = discount > 0 ? ` (coupon ${coupon.code} saved ₹${discount})` : "";
            messageBody = `Your OTP for the recharge of ₹${amountToPay}${couponNote} (Plan: ${plan.platform} - ${plan.category}) is ${otpCode}. Please do not share this OTP with anyone. It is valid for 5 minutes. - Mobile Recharge Portal`;
        } else if (transactionType === "wallet") {
            messageBody = `Your OTP for adding ₹${amountToPay} to your wallet is ${otpCode}. Please do not share this OTP with anyone. It is valid for 5 minutes. - Mobile Recharge Portal`;
        }

        // Deliver the OTP over the best available channel (SMS -> email -> log).
        await sendOtp({
            mobile_no: mobile_number_to_use,
            email: user.email,
            otp: otpCode,
            message: messageBody,
        });

        // The OTP is never returned to the browser. It is delivered out-of-band
        // (SMS/email) or, when no channel is configured, written to the server log.
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully!",
            transaction_id: newTransaction._id,
            amount_to_pay: amountToPay,
            original_amount: baseAmount,
            discount_amount: discount,
        });
    } catch (error) {
        console.error("Payment Error:", error);
        return res.status(500).json({ message: "Server error, please try again." });
    }
};

// Verify OTP
const verify_otp = async (req, res) => {
    try {
        const { transaction_id, otp, card_details, transactionType } = req.body;

        if (!transaction_id || !otp || !card_details || !transactionType) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        const otpRecord = await OTP.findOne({ transaction_id });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid transaction!" });
        }

        if (otpRecord.expiresAt < new Date()) {
            await Transaction.findByIdAndUpdate(transaction_id, { status: "Failed" });
            return res
                .status(400)
                .json({ message: "OTP expired! Transaction failed." });
        }

        if (String(otpRecord.otp) !== String(otp)) {
            return res.status(400).json({ message: "Incorrect OTP! Try again." });
        }

        const transaction = await Transaction.findById(transaction_id);
        if (!transaction) {
            return res.status(400).json({ message: "Transaction not found!" });
        }

        // A completed/cancelled transaction must never be processed again —
        // otherwise a replayed OTP could double-charge the card or double-credit
        // the wallet.
        if (transaction.status !== "Pending") {
            return res
                .status(400)
                .json({ message: `Transaction already ${transaction.status.toLowerCase()}.` });
        }

        // Validate amount_to_pay (0 is valid when a coupon makes it free).
        if (!Number.isFinite(transaction.amount_to_pay) || transaction.amount_to_pay < 0) {
            return res.status(400).json({ message: "Invalid transaction amount!" });
        }

        const owner = await User.findById(transaction.user_id);
        if (!owner) {
            await Transaction.findByIdAndUpdate(transaction_id, { status: "Failed" });
            return res.status(400).json({ message: "User not found!" });
        }

        const card = await Card.findOne({
            cardNumber: card_details.cardNumber,
            expiryDate: card_details.expiryDate,
            cvv: card_details.cvv,
            cardholderName: card_details.cardholderName,
        });

        if (!card) {
            return res.status(400).json({ message: "Card not found!" });
        }

        // Validate card balance
        if (!card.balance || isNaN(card.balance)) {
            return res.status(400).json({ message: "Invalid card balance!" });
        }

        if (card.balance < transaction.amount_to_pay) {
            await Transaction.findByIdAndUpdate(transaction_id, { status: "Failed" });
            return res.status(400).json({ message: "Insufficient balance!" });
        }

        // Reserve the coupon only when the payment is about to complete, so an
        // abandoned OTP does not burn a use. If it just ran out, fail cleanly.
        if (transaction.coupon_code) {
            const consumed = await consumeCoupon(transaction.coupon_code, transaction.user_id);
            if (!consumed) {
                await Transaction.findByIdAndUpdate(transaction_id, { status: "Failed" });
                return res.status(400).json({ message: "This coupon is no longer available." });
            }
        }

        // Deduct amount from card
        card.balance -= transaction.amount_to_pay;
        await card.save();

        // Update transaction status
        await Transaction.findByIdAndUpdate(transaction_id, { status: "Success" });

        // Handle transaction based on the stored type (not client input).
        if (transaction.transactionType === "wallet") {
            owner.wallet += transaction.amount_to_pay;
            owner.autoRechargeFailures = 0;
            await owner.save();
        } else if (transaction.transactionType === "recharge") {
            // Keep the user's "current plan" fields in step with the Date model
            // the auto-recharge scheduler and profile rely on.
            if (transaction.plan_id) {
                owner.selectedPlan = transaction.plan_id;
                owner.planExpiryDate = transaction.planExpiryDate || null;
            }
            owner.autoRechargeFailures = 0;
            await owner.save();
            await notifyRechargeSuccess(owner, transaction);
        }

        // Burn the OTP so the same code cannot be replayed.
        await OTP.deleteOne({ _id: otpRecord._id });

        return res
            .status(200)
            .json({ success: true, message: "Transaction successful!" });
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return res.status(500).json({ message: "Server error, please try again." });
    }
};

// Cancel transaction
const cancel_transaction = async (req, res) => {
    try {
        const { transaction_id } = req.body;

        if (!transaction_id) {
            return res.status(400).json({ message: "Transaction ID required!" });
        }

        await Transaction.findByIdAndUpdate(transaction_id, { status: "Failed" });
        return res
            .status(200)
            .json({ success: true, message: "Transaction cancelled!" });
    } catch (error) {
        console.error("Cancel Transaction Error:", error);
        return res.status(500).json({ message: "Server error, please try again." });
    }
};

module.exports = { verify_card_details, verify_otp, cancel_transaction };
