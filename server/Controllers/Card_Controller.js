const Card = require("../Models/Card.js");
const OTP = require("../Models/OTP.js");
const Transaction = require("../Models/Transaction.js");
const Plan = require("../Models/Recharge_Plan.js");
require("dotenv").config();
const { sendOtp } = require("../Utils/notifier.js");
const User = require("../Models/User.js");

// Verify Card Details
const verify_card_details = async (req, res) => {
    try {
        const {
            mobile_number,
            plan_id,
            platformCharge,
            amount_to_pay,
            cardNumber,
            expiryDate,
            cvv,
            cardholderName,
            transactionType,
        } = req.body;

        if (
            !amount_to_pay ||
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

        if (card.balance < amount_to_pay) {
            return res.status(400).json({ message: "Insufficient balance!" });
        }

        const user_id = req.user.userId;
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        const mobile_number_to_use = transactionType === "recharge" ? mobile_number : user.mobile_no;

        let plan = null;
        if (transactionType === "recharge") {
            if (!plan_id) {
                return res.status(400).json({ message: "Plan ID is required for recharge transactions!" });
            }
            plan = await Plan.findById(plan_id);
            if (!plan) {
                return res.status(400).json({ message: "Plan not found!" });
            }
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
            platformCharge: transactionType === "recharge" ? platformCharge : 0,
            amount_to_pay,
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
            messageBody = `Your OTP for the recharge of ₹${amount_to_pay} (Plan: ${plan.platform} - ${plan.category}) is ${otpCode}. Please do not share this OTP with anyone. It is valid for 5 minutes. - Mobile Recharge Portal`;
        } else if (transactionType === "wallet") {
            messageBody = `Your OTP for adding ₹${amount_to_pay} to your wallet is ${otpCode}. Please do not share this OTP with anyone. It is valid for 5 minutes. - Mobile Recharge Portal`;
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

        // Validate amount_to_pay
        if (!transaction.amount_to_pay || isNaN(transaction.amount_to_pay)) {
            return res.status(400).json({ message: "Invalid transaction amount!" });
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

        // Deduct amount from card
        card.balance -= transaction.amount_to_pay;
        await card.save();

        // Update transaction status
        await Transaction.findByIdAndUpdate(transaction_id, { status: "Success" });

        // Handle transaction based on type
        if (transactionType === "wallet") {
            // Add amount to user's wallet
            const user = await User.findById(transaction.user_id);
            if (!user) {
                return res.status(400).json({ message: "User not found!" });
            }
            user.wallet += transaction.amount_to_pay;
            await user.save();
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
