const User = require("../Models/User");
const Transaction = require("../Models/Transaction");
const Recharge_Plan = require("../Models/Recharge_Plan");

const autoRecharge = async (userId) => {
    try {
        console.log("\n--- Starting auto-recharge for user:", userId, "---");

        const user = await User.findById(userId);
        if (!user || !user.autoRechargeEnabled) {
            console.log("User not found or auto-recharge disabled");
            return;
        }

        // Fetch the last successful transaction
        const lastTransaction = await Transaction.findOne({ 
            user_id: user._id,
            mobile_number: user.mobile_no,
            status: "Success" 
        }).sort({ transaction_date_time: -1 });

        console.log("Last Transaction ID:", lastTransaction?._id);
        
        if (!lastTransaction) {
            console.log("No last transaction found");
            return;
        }

        // transaction_date_time is stored as a native Date.
        const createdAt = new Date(lastTransaction.transaction_date_time);
        if (isNaN(createdAt.getTime())) {
            console.error("Invalid transaction_date_time value:", lastTransaction.transaction_date_time);
            return;
        }

        const plan = await Recharge_Plan.findById(lastTransaction.plan_id);
        if (!plan) {
            console.log("Plan not found");
            return;
        }

        // Log important plan details
        console.log("Plan Details:", {
            platform: plan.platform,
            category: plan.category,
            price: plan.price,
            validity: plan.validity,
        });

        // Ensure `plan.validity` is a valid number
        if (isNaN(plan.validity) || plan.validity <= 0) {
            console.error("Invalid plan validity:", plan.validity);
            return;
        }

        // Calculate the next recharge date based on the plan's validity (in days)
        const nextRechargeDate = new Date(createdAt);
        nextRechargeDate.setDate(nextRechargeDate.getDate() + plan.validity); // Add days to the date

        // Format dates for logging
        const currentDateTime = formatDateTime(new Date());
        const nextRechargeDateTime = formatDateTime(nextRechargeDate);

        console.log("Current Date and Time:", currentDateTime);
        console.log("Next Recharge Date and Time:", nextRechargeDateTime);
        console.log("Plan Expired:", new Date() >= nextRechargeDate);

        // Check if the next recharge date is today or in the past
        if (new Date() >= nextRechargeDate) {
            // Check if wallet has enough balance
            if (user.wallet < plan.price) {
                console.log("Insufficient wallet balance for auto-recharge");
                return;
            }

            // Deduct balance from wallet
            user.wallet -= plan.price;
            await user.save();

            // Create new transaction entry
            const now = new Date();
            const planExpiryDate = new Date(now);
            planExpiryDate.setDate(planExpiryDate.getDate() + plan.validity);

            const newTransaction = new Transaction({
                user_id: user._id,
                mobile_number: user.mobile_no,
                plan_id: plan._id,
                plan: {
                    platform: plan.platform,
                    category: plan.category,
                    price: plan.price,
                    validity: plan.validity,
                    data: {
                        dailyLimit: plan.data.dailyLimit,
                        totalData: plan.data.totalData,
                        postLimitSpeed: plan.data.postLimitSpeed,
                    },
                    calls: plan.calls,
                    sms: plan.sms,
                    extraBenefits: plan.extraBenefits,
                    additionalDetails: plan.additionalDetails,
                },
                platformCharge: 0,
                transaction_date_time: now,
                planExpiryDate,
                status: "Success",
                payment_method: "Wallet",
                transactionType: "recharge",
                amount_to_pay: plan.price,
            });

            await newTransaction.save();

            console.log(`Auto recharge successful for ${user.mobile_no}`);
            console.log("New Transaction ID:", newTransaction._id);
        } else {
            console.log("Plan is still active. Next recharge at:", nextRechargeDateTime);
        }
    } catch (error) {
        console.error("Error in autoRecharge:", error);
    }
};

const formatDateTime = (date) => {
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    return `Date: ${formattedDate}, Time: ${formattedTime}`;
};

module.exports = autoRecharge;