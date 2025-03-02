const Card = require("../Models/Card.js");
const OTP = require("../Models/OTP.js");
const Transaction = require("../Models/Transaction.js");
const Plan = require("../Models/Recharge_Plan.js");
require("dotenv").config();
const twilio = require("twilio");

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
        } = req.body;

        if (
            !mobile_number ||
            !plan_id ||
            !platformCharge ||
            !amount_to_pay ||
            !cardNumber ||
            !expiryDate ||
            !cvv ||
            !cardholderName
        ) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        // Validate Card
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

        const plan = await Plan.findById(plan_id);
        const user_id = req.user.userId;

        // Create new transaction with 'Pending' status
        const newTransaction = new Transaction({
            user_id,
            mobile_number,
            plan_id,
            plan,
            platformCharge,
            status: "Pending",
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

        // const client = twilio(
        //     process.env.TWILIO_ACCOUNT_SID,
        //     process.env.TWILIO_AUTH_TOKEN
        // );
        // const mobileNumber = "+91" + card.mobile_number;
        // const messageBody = `Your OTP for the payment of ₹${amount_to_pay} is ${otpCode}. Please do not share this OTP with anyone. It is valid for 5 minutes. - Mobile Recharge Portal`;


        // client.messages
        //     .create({
        //         body: messageBody,
        //         from: process.env.TWILIO_PHONE_NUMBER,
        //         to: mobileNumber,
        //     })
        //     .then((message) => console.log("Message SID:", message.sid))
        //     .catch((error) => console.error("Twilio Error:", error));

        return res
            .status(200)
            .json({
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
        const { transaction_id, otp } = req.body;

        if (!transaction_id || !otp) {
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

        // If OTP is correct → Success
        await Transaction.findByIdAndUpdate(transaction_id, { status: "Success" });
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
