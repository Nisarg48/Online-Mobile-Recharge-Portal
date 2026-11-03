/*
 * Idempotent seed script.
 *
 * Populates a fresh database with:
 *   - the 60 recharge plans (Vi / Jio / Airtel) from ./plans.json
 *   - demo accounts (1 admin + 2 users)
 *   - a few mock cards so the (simulated) payment form works
 *   - sample recharge/wallet transactions, feedback, queries, and coupons
 *
 * Safe to run repeatedly: plans upsert by planId, users by email, cards by
 * cardNumber, and sample activity is only created when it's missing.
 *
 * Usage: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const RechargePlan = require("../Models/Recharge_Plan");
const Transaction = require("../Models/Transaction");
const Card = require("../Models/Card");
const User = require("../Models/User");
const Feedback = require("../Models/Feedback");
const Query = require("../Models/Query");
const Coupon = require("../Models/Coupon");

const plans = require("./plans.json");

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const addDays = (date, n) => new Date(date.getTime() + n * DAY);

const DEMO_PASSWORD = "User@1234";
const ADMIN_PASSWORD = "Admin@1234";

const buildPlanSnapshot = (plan) => ({
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
});

const seedPlans = async () => {
    const operations = plans.map((plan) => ({
        updateOne: {
            filter: { planId: plan.planId },
            update: { $set: plan },
            upsert: true,
        },
    }));
    const result = await RechargePlan.bulkWrite(operations);
    console.log(
        `Plans: ${result.upsertedCount} inserted, ${result.modifiedCount} updated ` +
        `(${plans.length} total)`
    );
};

const upsertUser = async ({ name, email, mobile_no, password, role, wallet }) => {
    const existing = await User.findOne({ email }).select("+password");
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
        existing.name = name;
        existing.mobile_no = mobile_no;
        existing.role = role;
        existing.wallet = wallet;
        existing.isActive = true;
        // Refresh the password so the seeded credentials always work.
        existing.set("password", passwordHash);
        await existing.save();
        return existing;
    }

    return User.create({ name, email, mobile_no, password: passwordHash, role, wallet });
};

const seedUsers = async () => {
    const admin = await upsertUser({
        name: "Admin User",
        email: "admin@recharge.test",
        mobile_no: "9000000010",
        password: ADMIN_PASSWORD,
        role: "admin",
        wallet: 5000,
    });
    const rahul = await upsertUser({
        name: "Rahul Sharma",
        email: "user@recharge.test",
        mobile_no: "9000000002",
        password: DEMO_PASSWORD,
        role: "user",
        wallet: 1200,
    });
    const priya = await upsertUser({
        name: "Priya Verma",
        email: "priya@recharge.test",
        mobile_no: "9000000003",
        password: DEMO_PASSWORD,
        role: "user",
        wallet: 800,
    });

    console.log(`Users: admin + ${rahul.name} + ${priya.name} ready`);
    return { admin, rahul, priya };
};

const CARDS = [
    {
        cardNumber: "4111111111111111",
        expiryDate: "12/28",
        cvv: "123",
        cardholderName: "Rahul Sharma",
        bankName: "HDFC Bank",
        balance: 50000,
        mobile_number: "9000000002",
    },
    {
        cardNumber: "5555555555554444",
        expiryDate: "09/27",
        cvv: "456",
        cardholderName: "Priya Verma",
        bankName: "ICICI Bank",
        balance: 25000,
        mobile_number: "9000000003",
    },
];

const seedCards = async () => {
    for (const card of CARDS) {
        await Card.updateOne({ cardNumber: card.cardNumber }, { $set: card }, { upsert: true });
    }
    console.log(`Cards: ${CARDS.length} demo cards ready`);
};

const seedTransactions = async (user) => {
    const existing = await Transaction.countDocuments({ user_id: user._id });
    if (existing > 0) {
        console.log(`Transactions: ${user.name} already has data, skipping`);
        return;
    }

    const plansById = await RechargePlan.find({ planId: { $in: ["vi_001", "jio_001", "airtel_002"] } });
    const byId = Object.fromEntries(plansById.map((plan) => [plan.planId, plan]));

    const recharges = [
        { plan: byId.vi_001, when: daysAgo(40), platformCharge: 2 },
        { plan: byId.jio_001, when: daysAgo(20), platformCharge: 0 },
        { plan: byId.airtel_002, when: daysAgo(5), platformCharge: 2 },
    ];

    for (const { plan, when, platformCharge } of recharges) {
        if (!plan) continue;
        await Transaction.create({
            user_id: user._id,
            mobile_number: user.mobile_no,
            plan_id: plan._id,
            plan: buildPlanSnapshot(plan),
            platformCharge,
            amount_to_pay: plan.price + platformCharge,
            status: "Success",
            payment_method: "Card",
            transactionType: "recharge",
            transaction_date_time: when,
            planExpiryDate: addDays(when, plan.validity),
        });
    }

    await Transaction.create({
        user_id: user._id,
        mobile_number: user.mobile_no,
        plan_id: null,
        plan: null,
        platformCharge: 0,
        amount_to_pay: 500,
        status: "Success",
        payment_method: "Card",
        transactionType: "wallet",
        transaction_date_time: daysAgo(15),
        planExpiryDate: null,
    });

    console.log(`Transactions: seeded ${recharges.length + 1} sample entries for ${user.name}`);
};

const seedFeedback = async () => {
    const existing = await Feedback.countDocuments();
    if (existing > 0) {
        console.log("Feedback: already present, skipping");
        return;
    }

    const rahul = await User.findOne({ email: "user@recharge.test" });
    const priya = await User.findOne({ email: "priya@recharge.test" });
    if (!rahul || !priya) return;

    await Feedback.create([
        {
            message: "Super quick recharge and the plan suggestions were spot on. Highly recommended!",
            rating: 5,
            user: { _id: rahul._id, name: rahul.name },
            createdAt: daysAgo(6),
        },
        {
            message: "Clean interface and the receipt download is a nice touch. Works great on mobile.",
            rating: 4,
            user: { _id: priya._id, name: priya.name },
            createdAt: daysAgo(3),
        },
    ]);
    console.log("Feedback: seeded 2 sample entries");
};

const seedQueries = async () => {
    const existing = await Query.countDocuments();
    if (existing > 0) {
        console.log("Queries: already present, skipping");
        return;
    }

    const rahul = await User.findOne({ email: "user@recharge.test" });
    if (!rahul) return;

    await Query.create([
        {
            user_id: rahul._id,
            username: rahul.name,
            email: rahul.email,
            subject: "Recharge receipt not received",
            message: "I recharged yesterday but did not get the receipt email. Can you check?",
            status: "Pending",
            created_at: daysAgo(2),
        },
        {
            user_id: rahul._id,
            username: rahul.name,
            email: rahul.email,
            subject: "Auto-recharge eligibility",
            message: "How much wallet balance do I need to keep for auto-recharge to work?",
            status: "Resolved",
            admin_response: "Keep at least the plan price in your wallet; auto-recharge checks every 2 hours.",
            created_at: daysAgo(9),
            updated_at: daysAgo(8),
        },
    ]);
    console.log("Queries: seeded 2 sample entries");
};

const seedCoupons = async () => {
    const coupons = [
        {
            code: "WELCOME10",
            description: "10% off your recharge (max ₹50)",
            type: "percent",
            value: 10,
            maxDiscount: 50,
            minAmount: 100,
            active: true,
            usageLimit: 0,
            perUserLimit: 1,
        },
        {
            code: "FLAT25",
            description: "₹25 off recharges of ₹199 or more",
            type: "flat",
            value: 25,
            minAmount: 199,
            active: true,
            usageLimit: 500,
            perUserLimit: 1,
        },
        {
            code: "SAVE15",
            description: "15% off (max ₹75) on recharges of ₹250+",
            type: "percent",
            value: 15,
            maxDiscount: 75,
            minAmount: 250,
            active: true,
            usageLimit: 200,
            perUserLimit: 1,
        },
    ];

    let created = 0;
    let updated = 0;
    for (const coupon of coupons) {
        const result = await Coupon.updateOne(
            { code: coupon.code },
            { $set: coupon },
            { upsert: true }
        );
        if (result.upsertedCount) created += 1;
        else updated += 1;
    }
    console.log(`Coupons: ${created} created, ${updated} updated`);
};

const run = async () => {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Connected to", mongoose.connection.name);

    await seedPlans();
    const { rahul } = await seedUsers();
    await seedCards();
    await seedTransactions(rahul);
    await seedFeedback();
    await seedQueries();
    await seedCoupons();

    await mongoose.disconnect();
    console.log("\nSeed complete.");
    console.log("Admin:  admin@recharge.test / Admin@1234");
    console.log("User:   user@recharge.test / User@1234");
    console.log("User:   priya@recharge.test / User@1234");
};

run().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
});
