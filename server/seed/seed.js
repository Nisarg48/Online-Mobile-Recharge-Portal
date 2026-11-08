/*
 * Idempotent demo seed.
 *
 * Populates a fresh database with:
 *   - the 60 recharge plans (Vi / Jio / Airtel) from ./plans.json
 *   - a demo admin + 35 demo users spread across Indian states/cities
 *   - mock cards so the (simulated) payment form works
 *   - a rich activity history: recharges + wallet top-ups spread across the
 *     last ~12 months (mixed statuses, occasional coupons), feedback, queries,
 *     and auto-recharge logs.
 *
 * Determinism: all randomness uses a fixed-seed PRNG, so the same dataset is
 * produced on every machine. Dates are relative to "now" so the dashboard
 * always looks live.
 *
 * Idempotency: demo accounts are recognised by the @recharge.test domain and
 * carry `demoSeedVersion`. Their activity is regenerated only when the version
 * changes (or `--reset` is passed), so plain `npm run seed` never duplicates.
 *
 * Usage:
 *   npm run seed            # upsert plans/users/coupons, fill missing demo activity
 *   npm run seed -- --reset # wipe + regenerate demo activity
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
const AutoRechargeLog = require("../Models/AutoRechargeLog");

const plans = require("./plans.json");

const DAY = 24 * 60 * 60 * 1000;
const DEMO_SEED_VERSION = 2;
const DEMO_DOMAIN = "@recharge.test";
const DEMO_PASSWORD = "User@1234";
const ADMIN_PASSWORD = "Admin@1234";
const FORCE_RESET = process.argv.includes("--reset");

const daysAgo = (n) => new Date(Date.now() - n * DAY);
const addDays = (date, n) => new Date(date.getTime() + n * DAY);

// Small, fast, deterministic PRNG (LCG). Same seed -> same sequence.
const makeRng = (seed) => {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
};
const randInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const pick = (rng, list) => list[Math.floor(rng() * list.length)];

const buildPlanSnapshot = (plan) => ({
    platform: plan.platform,
    category: plan.category,
    price: plan.price,
    validity: plan.validity,
    data: {
        dailyLimit: plan.data?.dailyLimit ?? null,
        totalData: plan.data?.totalData ?? null,
        postLimitSpeed: plan.data?.postLimitSpeed ?? null,
    },
    calls: plan.calls,
    sms: plan.sms,
    extraBenefits: plan.extraBenefits,
    additionalDetails: plan.additionalDetails,
});

const couponDiscount = (coupon, amount) => {
    if (!coupon || amount < (coupon.minAmount || 0)) return 0;
    let discount = coupon.type === "flat"
        ? coupon.value
        : Math.round((amount * coupon.value) / 100);
    if (coupon.type === "percent" && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
    }
    return Math.max(0, Math.min(discount, amount - 1));
};

const REGIONS = [
    { region: "Gujarat", city: "Ahmedabad" },
    { region: "Gujarat", city: "Surat" },
    { region: "Gujarat", city: "Vadodara" },
    { region: "Maharashtra", city: "Mumbai" },
    { region: "Maharashtra", city: "Pune" },
    { region: "Maharashtra", city: "Nagpur" },
    { region: "Karnataka", city: "Bengaluru" },
    { region: "Karnataka", city: "Mysuru" },
    { region: "Tamil Nadu", city: "Chennai" },
    { region: "Tamil Nadu", city: "Coimbatore" },
    { region: "Telangana", city: "Hyderabad" },
    { region: "Delhi", city: "New Delhi" },
    { region: "Uttar Pradesh", city: "Lucknow" },
    { region: "Uttar Pradesh", city: "Noida" },
    { region: "West Bengal", city: "Kolkata" },
    { region: "Rajasthan", city: "Jaipur" },
    { region: "Rajasthan", city: "Udaipur" },
    { region: "Madhya Pradesh", city: "Indore" },
    { region: "Punjab", city: "Ludhiana" },
    { region: "Haryana", city: "Gurugram" },
    { region: "Kerala", city: "Kochi" },
    { region: "Bihar", city: "Patna" },
    { region: "Odisha", city: "Bhubaneswar" },
    { region: "Assam", city: "Guwahati" },
    { region: "Jharkhand", city: "Ranchi" },
    { region: "Chhattisgarh", city: "Raipur" },
    { region: "Uttarakhand", city: "Dehradun" },
    { region: "Goa", city: "Panaji" },
    { region: "Andhra Pradesh", city: "Visakhapatnam" },
    { region: "Chandigarh", city: "Chandigarh" },
];

const FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
    "Krishna", "Ishaan", "Ananya", "Diya", "Aadhya", "Saanvi", "Pari", "Anika",
    "Navya", "Myra", "Sara", "Ira", "Rohan", "Karan", "Nikhil", "Sneha",
    "Pooja", "Kavya", "Riya", "Meera", "Dev", "Harsh", "Yash", "Tara",
];
const LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Mehta", "Desai", "Joshi", "Reddy", "Nair",
    "Iyer", "Gupta", "Agarwal", "Kulkarni", "Rao", "Chauhan", "Bhatt",
    "Singh", "Kaur", "Das", "Banerjee", "Mishra", "Pillai", "Menon",
];

const FEEDBACK_MESSAGES = [
    "Super quick recharge and the plan suggestions were spot on. Highly recommended!",
    "Clean interface and the receipt download is a nice touch. Works great on mobile.",
    "Recharge completed in seconds. The coupon discount was applied correctly.",
    "Love the plan comparison. It helped me pick a better data pack for my usage.",
    "Wallet top-up and auto-recharge saved me from a last-minute expiry. Great job!",
    "The receipt PDF is clean and useful for reimbursement. Smooth experience overall.",
    "Slightly slow on a weak network, but the recharge itself went through fine.",
    "Auto-recharge worked exactly when my plan expired. Very convenient.",
    "Nice UI and clear plan details. Would like more regional-language support.",
    "Support replied quickly to my query and resolved it the same day.",
];

const QUERY_TEMPLATES = [
    {
        subject: "Recharge receipt not received",
        message: "I recharged yesterday but did not get the receipt email. Can you check?",
        response: "Your receipt was re-sent to the registered email. Please check spam as well.",
    },
    {
        subject: "Auto-recharge eligibility",
        message: "How much wallet balance do I need to keep for auto-recharge to work?",
        response: "Keep at least the plan price in your wallet; auto-recharge checks every 2 hours.",
    },
    {
        subject: "Coupon not applying at checkout",
        message: "I tried a coupon code but the discount did not show up. What am I doing wrong?",
        response: "Coupons are recharge-only and have a minimum amount. Please retry with an eligible plan.",
    },
    {
        subject: "Wrong operator selected",
        message: "I selected the wrong operator by mistake. Can the recharge be corrected?",
        response: "We have flagged this for review. Please contact support if the balance is not restored.",
    },
    {
        subject: "Wallet top-up not credited",
        message: "My wallet top-up shows completed but the balance did not increase.",
        response: "The wallet was credited after the failed verification retry. Please refresh your profile.",
    },
    {
        subject: "Request for GST invoice",
        message: "Can I get a GST invoice for my recent recharge?",
        response: "GST invoices are available on request for recharges above ₹500. We have emailed yours.",
    },
];

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
const buildUserDefs = () => {
    const rng = makeRng(20261108);
    const defs = [
        {
            name: "Admin User",
            email: "admin@recharge.test",
            mobile_no: "9000000010",
            password: ADMIN_PASSWORD,
            role: "admin",
            wallet: 5000,
            region: "Gujarat",
            city: "Ahmedabad",
            isActive: true,
            autoRechargeEnabled: false,
            lastLoginDaysAgo: 0,
        },
        {
            name: "Rahul Sharma",
            email: "user@recharge.test",
            mobile_no: "9000000002",
            password: DEMO_PASSWORD,
            role: "user",
            wallet: 1200,
            region: "Gujarat",
            city: "Ahmedabad",
            isActive: true,
            autoRechargeEnabled: true,
            lastLoginDaysAgo: 1,
        },
        {
            name: "Priya Verma",
            email: "priya@recharge.test",
            mobile_no: "9000000003",
            password: DEMO_PASSWORD,
            role: "user",
            wallet: 800,
            region: "Maharashtra",
            city: "Pune",
            isActive: true,
            autoRechargeEnabled: false,
            lastLoginDaysAgo: 3,
        },
    ];

    const usedEmails = new Set(defs.map((d) => d.email));
    const mobileBase = 9100000100;

    for (let i = 0; i < 33; i += 1) {
        const first = pick(rng, FIRST_NAMES);
        const last = pick(rng, LAST_NAMES);
        // Round-robin across regions so every state/city appears at least once.
        const loc = REGIONS[i % REGIONS.length];
        let email = `${first}.${last}${i + 1}@recharge.test`.toLowerCase();
        if (usedEmails.has(email)) email = `${first}.${last}.${i + 1}@recharge.test`.toLowerCase();
        usedEmails.add(email);

        defs.push({
            name: `${first} ${last}`,
            email,
            mobile_no: String(mobileBase + i),
            password: DEMO_PASSWORD,
            role: "user",
            wallet: randInt(rng, 0, 3000),
            region: loc.region,
            city: loc.city,
            isActive: rng() > 0.12,
            autoRechargeEnabled: rng() > 0.68,
            lastLoginDaysAgo: randInt(rng, 0, 60),
        });
    }

    return defs;
};

const upsertUser = async (def) => {
    const passwordHash = await bcrypt.hash(def.password, 10);
    const fields = {
        name: def.name,
        mobile_no: def.mobile_no,
        role: def.role,
        wallet: def.wallet,
        region: def.region,
        city: def.city,
        isActive: def.isActive !== undefined ? def.isActive : true,
        autoRechargeEnabled: Boolean(def.autoRechargeEnabled),
        lastLogin: daysAgo(def.lastLoginDaysAgo ?? 30),
    };

    const existing = await User.findOne({ email: def.email }).select("+password");
    if (existing) {
        Object.assign(existing, fields);
        existing.set("password", passwordHash);
        await existing.save();
        return existing;
    }
    return User.create({ ...fields, email: def.email, password: passwordHash });
};

const seedUsers = async () => {
    const defs = buildUserDefs();
    const results = [];

    for (const def of defs) {
        const existing = await User.findOne({ email: def.email });
        const stale = FORCE_RESET
            || !existing
            || (existing.demoSeedVersion || 0) !== DEMO_SEED_VERSION;
        const user = await upsertUser(def);
        results.push({ user, stale, def });
    }

    console.log(`Users: ${defs.length} demo accounts ready (${defs.filter((d) => d.role === "admin").length} admin)`);
    return results;
};

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------
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
    return Coupon.find({ code: { $in: coupons.map((c) => c.code) } });
};

// ---------------------------------------------------------------------------
// Activity (transactions / feedback / queries / auto-recharge logs)
// ---------------------------------------------------------------------------
const wipeActivity = async (user) => {
    await Promise.all([
        Transaction.deleteMany({ user_id: user._id }),
        Feedback.deleteMany({ "user._id": user._id }),
        Query.deleteMany({ user_id: user._id }),
        AutoRechargeLog.deleteMany({ user_id: user._id }),
    ]);
};

const PLATFORM_WEIGHTS = [
    { platform: "Jio", weight: 0.45 },
    { platform: "Airtel", weight: 0.32 },
    { platform: "Vi", weight: 0.23 },
];

const weightedPlatform = (rng) => {
    const r = rng();
    let acc = 0;
    for (const { platform, weight } of PLATFORM_WEIGHTS) {
        acc += weight;
        if (r <= acc) return platform;
    }
    return "Jio";
};

const seedUserActivity = async ({ user, def }, plansByPlatform, coupons, seed) => {
    if (user.role === "admin") return;

    await wipeActivity(user);

    const rng = makeRng(seed);
    const successfulRecharges = [];
    const couponUsage = new Map(); // code -> { count, userIds:Set }
    const userCouponCodes = new Set();

    const rechargeCount = randInt(rng, 3, 9);

    for (let i = 0; i < rechargeCount; i += 1) {
        // Guarantee some recent activity for roughly half the accounts.
        const isRecent = i === 0 && rng() > 0.45;
        const dayOffset = isRecent ? randInt(rng, 0, 6) : randInt(rng, 1, 360);
        const when = daysAgo(dayOffset);

        const platform = weightedPlatform(rng);
        const platformPlans = plansByPlatform[platform] || plansByPlatform.Jio;
        const plan = pick(rng, platformPlans);

        let status = "Success";
        const roll = rng();
        if (roll > 0.8) status = roll > 0.93 ? "Pending" : "Failed";
        // A "pending" transaction from months ago is unrealistic; mark it failed.
        if (status === "Pending" && dayOffset > 3) status = "Failed";

        const platformCharge = pick(rng, [0, 0, 2, 2, 5]);
        const grossAmount = plan.price + platformCharge;

        let coupon = null;
        let discountAmount = 0;
        if (status === "Success" && rng() < 0.24) {
            const candidate = pick(rng, coupons);
            if (candidate && !userCouponCodes.has(candidate.code)) {
                const discount = couponDiscount(candidate, grossAmount);
                if (discount > 0) {
                    coupon = candidate;
                    discountAmount = discount;
                    userCouponCodes.add(candidate.code);
                    const entry = couponUsage.get(candidate.code) || { count: 0, userIds: new Set() };
                    entry.count += 1;
                    entry.userIds.add(String(user._id));
                    couponUsage.set(candidate.code, entry);
                }
            }
        }

        const amountToPay = grossAmount - discountAmount;

        const txn = await Transaction.create({
            user_id: user._id,
            mobile_number: user.mobile_no,
            plan_id: plan._id,
            plan: buildPlanSnapshot(plan),
            platformCharge,
            amount_to_pay: amountToPay,
            original_amount: coupon ? grossAmount : null,
            discount_amount: discountAmount,
            coupon_code: coupon ? coupon.code : null,
            status,
            payment_method: pick(rng, ["Card", "Card", "Wallet", "UPI"]),
            transactionType: "recharge",
            transaction_date_time: when,
            planExpiryDate: status === "Success" ? addDays(when, plan.validity) : null,
            createdAt: when,
            updatedAt: when,
        });

        if (status === "Success") successfulRecharges.push({ txn, when, plan });
    }

    // Wallet top-ups, also spread over the year.
    const topupCount = randInt(rng, 0, 3);
    for (let i = 0; i < topupCount; i += 1) {
        const when = daysAgo(randInt(rng, 1, 300));
        await Transaction.create({
            user_id: user._id,
            mobile_number: user.mobile_no,
            plan_id: null,
            plan: null,
            platformCharge: 0,
            amount_to_pay: pick(rng, [100, 200, 500, 500, 1000, 1500, 2000]),
            status: rng() > 0.12 ? "Success" : "Failed",
            payment_method: pick(rng, ["Card", "UPI", "Net Banking"]),
            transactionType: "wallet",
            transaction_date_time: when,
            planExpiryDate: null,
            createdAt: when,
            updatedAt: when,
        });
    }

    // Feedback for most users who actually completed a recharge.
    if (successfulRecharges.length && rng() > 0.35) {
        const latest = successfulRecharges[successfulRecharges.length - 1];
        const feedbackAt = daysAgo(randInt(rng, 0, Math.max(0, 120)));
        await Feedback.create({
            message: pick(rng, FEEDBACK_MESSAGES),
            rating: rng() > 0.35 ? 5 : 4,
            user: { _id: user._id, name: user.name },
            transaction: latest.txn._id,
            createdAt: feedbackAt,
        });
    }

    // Auto-recharge logs for users who enabled it.
    if (def.autoRechargeEnabled && successfulRecharges.length) {
        const logCount = randInt(rng, 1, 4);
        for (let i = 0; i < logCount; i += 1) {
            const when = daysAgo(randInt(rng, 1, 180));
            const outcome = rng();
            const log = outcome > 0.25
                ? {
                    status: "Success",
                    reason: "Plan expired; wallet renewal completed.",
                    amount: successfulRecharges[0].plan.price,
                }
                : outcome > 0.1
                    ? {
                        status: "Failed",
                        reason: "Insufficient wallet balance for renewal.",
                        amount: successfulRecharges[0].plan.price,
                    }
                    : {
                        status: "Skipped",
                        reason: "Plan still active; renewal not due.",
                        amount: 0,
                    };
            await AutoRechargeLog.create({
                user_id: user._id,
                status: log.status,
                reason: log.reason,
                plan_id: successfulRecharges[0].plan._id,
                amount: log.amount,
                transaction_id: log.status === "Success" ? successfulRecharges[0].txn._id : null,
                createdAt: when,
                updatedAt: when,
            });
        }
    }

    return couponUsage;
};

const seedQueries = async (users, rng) => {
    let created = 0;
    for (let i = 0; i < 16; i += 1) {
        const user = pick(rng, users);
        if (!user || user.role === "admin") continue;
        const template = pick(rng, QUERY_TEMPLATES);
        const resolved = rng() > 0.45;
        const when = daysAgo(randInt(rng, 1, 150));
        await Query.create({
            user_id: user._id,
            username: user.name,
            email: user.email,
            subject: template.subject,
            message: template.message,
            status: resolved ? "Resolved" : "Pending",
            admin_response: resolved ? template.response : "",
            created_at: when,
            updated_at: resolved ? addDays(when, randInt(rng, 0, 3)) : when,
        });
        created += 1;
    }
    console.log(`Queries: seeded ${created} entries`);
};

const applyCouponUsage = async (couponTotals) => {
    for (const [code, usage] of couponTotals.entries()) {
        await Coupon.updateOne(
            { code },
            {
                $set: {
                    usedCount: usage.count,
                    redeemedBy: Array.from(usage.userIds).map((id) => new mongoose.Types.ObjectId(id)),
                },
            }
        );
    }
};

const seedActivity = async (userEntries) => {
    const allPlans = await RechargePlan.find({});
    const plansByPlatform = { Jio: [], Airtel: [], Vi: [] };
    for (const plan of allPlans) {
        if (!plansByPlatform[plan.platform]) plansByPlatform[plan.platform] = [];
        plansByPlatform[plan.platform].push(plan);
    }

    const coupons = await Coupon.find({ active: true });
    const couponTotals = new Map();
    const rng = makeRng(424242);
    let seededUsers = 0;

    for (let index = 0; index < userEntries.length; index += 1) {
        const entry = userEntries[index];
        if (!entry.stale) continue;

        const usage = await seedUserActivity(entry, plansByPlatform, coupons, 1000 + index * 7);
        if (usage) {
            for (const [code, data] of usage.entries()) {
                const total = couponTotals.get(code) || { count: 0, userIds: new Set() };
                total.count += data.count;
                for (const id of data.userIds) total.userIds.add(id);
                couponTotals.set(code, total);
            }
        }

        await User.updateOne(
            { _id: entry.user._id },
            { $set: { demoSeedVersion: DEMO_SEED_VERSION } }
        );
        seededUsers += 1;
    }

    await applyCouponUsage(couponTotals);

    // Queries live outside the per-user activity loop, so only (re)seed them
    // when at least one demo account was regenerated. This keeps plain
    // `npm run seed` idempotent.
    if (seededUsers > 0) {
        const demoUserIds = userEntries
            .filter((entry) => entry.user.role !== "admin")
            .map((entry) => entry.user._id);
        await Query.deleteMany({ user_id: { $in: demoUserIds } });
        const rngQueries = makeRng(777);
        await seedQueries(userEntries.map((entry) => entry.user), rngQueries);
    }

    console.log(`Activity: generated history for ${seededUsers} demo users`);
    return coupons;
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
// --reset rebuilds the demo accounts themselves (plus all their activity), so
// changing the generator can never leave behind colliding emails/mobiles.
const resetDemoAccounts = async () => {
    const demoUsers = await User.find({ email: { $regex: `${DEMO_DOMAIN}$` } }).select("_id");
    const ids = demoUsers.map((user) => user._id);
    if (!ids.length) return;

    await Promise.all([
        Transaction.deleteMany({ user_id: { $in: ids } }),
        Feedback.deleteMany({ "user._id": { $in: ids } }),
        Query.deleteMany({ user_id: { $in: ids } }),
        AutoRechargeLog.deleteMany({ user_id: { $in: ids } }),
    ]);
    const result = await User.deleteMany({ _id: { $in: ids } });
    console.log(`Reset: removed ${result.deletedCount} demo users and their activity`);
};

const run = async () => {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Connected to", mongoose.connection.name);
    if (FORCE_RESET) {
        console.log("Mode: --reset (rebuilding demo accounts and activity)");
        await resetDemoAccounts();
    }

    await seedPlans();
    const userEntries = await seedUsers();
    await seedCards();
    await seedCoupons();
    await seedActivity(userEntries);

    await mongoose.disconnect();
    console.log("\nSeed complete.");
    console.log("Admin:  admin@recharge.test / Admin@1234");
    console.log("User:   user@recharge.test / User@1234");
    console.log("User:   priya@recharge.test / User@1234");
    console.log(`Demo users: ${userEntries.length} total (${DEMO_DOMAIN})`);
};

run().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
});
