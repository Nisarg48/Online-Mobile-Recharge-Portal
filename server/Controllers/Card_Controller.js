const Card = require("../Models/Card.js");
const OTP = require("../Models/OTP.js");
const Transaction = require("../Models/Transaction.js");
const Plan = require("../Models/Recharge_Plan.js");
require("dotenv").config();
const twilio = require("twilio");
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

        console.log(req.body);

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
        const formattedDate = currentDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        const formattedTime = currentDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const transaction_date_time = `Date: ${formattedDate}, Time: ${formattedTime}`;

        let planExpiryDate = null;
        if (transactionType === "recharge" && plan && plan.validity) {
            const expiryDate = new Date(currentDate);
            expiryDate.setMinutes(expiryDate.getMinutes() + plan.validity);

            const formattedExpiryDate = expiryDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            const formattedExpiryTime = expiryDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            planExpiryDate = `Date: ${formattedExpiryDate}, Time: ${formattedExpiryTime}`;
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
            transaction_date_time,
        });

        await newTransaction.save();

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        const expiryTime = new Date(Date.now() + 300 * 1000);

        const newOtp = new OTP({
            transaction_id: newTransaction._id,
            user_id,
            otp: otpCode,
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

        console.log("OTP Message:", messageBody);

        // Uncomment the following code to send OTP via Twilio (ensure Twilio credentials are set up)
        /*
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        const mobileNumber = "+91" + mobile_number;
        client.messages
            .create({
                body: messageBody,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: mobileNumber,
            })
            .then((message) => console.log("Message SID:", message.sid))
            .catch((error) => console.error("Twilio Error:", error));
        */

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
    console.log("Request Body:", req.body);
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

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: "Incorrect OTP! Try again." });
        }

        const transaction = await Transaction.findById(transaction_id);
        if (!transaction) {
            return res.status(400).json({ message: "Transaction not found!" });
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
            user.wallet += transaction.amount_to_pay;
            await user.save();
        }

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
