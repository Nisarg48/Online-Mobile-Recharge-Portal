const { sendMail, isConfigured: mailConfigured } = require("./mailer");

const smsConfigured = () =>
    Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_PHONE_NUMBER
    );

// Deliver an OTP over the best available channel, preferring SMS, then email,
// then the server log. The log fallback means local development works with no
// paid provider configured at all. Returns the channel used: "sms" | "email" | "log".
const sendOtp = async ({ mobile_no, email, otp, message }) => {
    // Always log so a developer can read the code from the terminal.
    console.log(`[OTP] code for ${mobile_no || email || "unknown"}: ${otp}`);

    if (smsConfigured()) {
        try {
            // Lazy-require so `twilio` stays an optional dependency.
            const twilio = require("twilio");
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: String(mobile_no).startsWith("+") ? mobile_no : `+91${mobile_no}`,
            });
            return "sms";
        } catch (error) {
            console.error("[notifier] Twilio SMS failed:", error.message);
        }
    }

    if (email && mailConfigured()) {
        const delivered = await sendMail({
            to: email,
            subject: "Your Mobile Recharge Portal OTP",
            text: message,
        });
        if (delivered) return "email";
    }

    return "log";
};

module.exports = { sendOtp, smsConfigured };
