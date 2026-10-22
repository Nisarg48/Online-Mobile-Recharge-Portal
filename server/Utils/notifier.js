const { sendMail, isConfigured: mailConfigured } = require("./mailer");

// Deliver an OTP over the best available channel.
//
// Real SMS delivery is intentionally NOT implemented yet — no free provider has
// been chosen. Until then the code is always written to the server log so the
// flow can be completed locally, and emailed to the user when a mail account is
// configured. The OTP is never returned to the browser.
// Returns the channel used: "email" | "log".
const sendOtp = async ({ mobile_no, email, otp, message }) => {
    console.log(`[OTP] code for ${mobile_no || email || "unknown"}: ${otp}`);

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

module.exports = { sendOtp };
