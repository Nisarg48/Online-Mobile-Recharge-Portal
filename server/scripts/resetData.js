/*
 * One-time data reset for the Phase 2 schema migration.
 *
 * The Phase 2 models changed core field types (String -> ObjectId refs,
 * formatted date strings -> native Date, extraBenefits strings -> objects).
 * The development database only held test data, so rather than a risky
 * in-place migration we drop the affected collections and re-seed in Phase 3.
 *
 * Users are kept (accounts), but any references to dropped plans are cleared.
 *
 * Usage: npm run reset-data
 */
require("dotenv").config();
const mongoose = require("mongoose");

const COLLECTIONS = ["transactions", "cards", "recharge_plans", "otps", "queries", "feedbacks"];

const run = async () => {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Connected to", mongoose.connection.name);

    for (const name of COLLECTIONS) {
        const exists = await mongoose.connection.db.listCollections({ name }).hasNext();
        if (exists) {
            await mongoose.connection.db.dropCollection(name);
            console.log(`Dropped collection: ${name}`);
        } else {
            console.log(`Skipped (not present): ${name}`);
        }
    }

    // Clear plan references on users so nothing points at dropped plans.
    const result = await mongoose.connection.db.collection("users").updateMany(
        {},
        {
            $set: { autoRechargeEnabled: false },
            $unset: { selectedPlan: "", planExpiryDate: "" },
        }
    );
    console.log(`Cleared plan references on ${result.modifiedCount} user(s)`);

    await mongoose.disconnect();
    console.log("Done. Run the Phase 3 seed next to populate plans and demo data.");
};

run().catch((error) => {
    console.error("Reset failed:", error);
    process.exit(1);
});
