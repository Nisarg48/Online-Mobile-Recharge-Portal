const nodemailer = require("nodemailer");

let transporter = null;

const isConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
};

// Sends an email when SMTP is configured; otherwise logs the content so
// developers can still complete flows (e.g. password reset) locally.
const sendMail = async ({ to, subject, text }) => {
    if (!isConfigured()) {
        console.log(`[mailer] EMAIL not configured. Intended email to ${to}: "${subject}"\n${text}`);
        return false;
    }
    try {
        await getTransporter().sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });
        return true;
    } catch (error) {
        console.error("[mailer] Failed to send email:", error.message);
        console.log(`[mailer] Fallback content for ${to}: "${subject}"\n${text}`);
        return false;
    }
};

module.exports = { sendMail, isConfigured };
