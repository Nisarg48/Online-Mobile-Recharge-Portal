const Joi = require("joi");

const email = Joi.string().email().lowercase().trim().required();
const mobileNo = Joi.string().pattern(/^[6-9]\d{9}$/).required();
const password = Joi.string().min(8).max(72).required();
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

// Auth
const signupSchema = Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
    email,
    mobile_no: mobileNo,
    password,
});

const loginSchema = Joi.object({
    email,
    password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
    email,
});

const resetPasswordSchema = Joi.object({
    email,
    token: Joi.string().trim().required(),
    newPassword: password,
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: password,
});

// User
const updateUserSchema = Joi.object({
    name: Joi.string().trim().min(2).max(60),
    email: Joi.string().email().lowercase().trim(),
    mobile_no: Joi.string().pattern(/^[6-9]\d{9}$/),
}).min(1);

const toggleAutoRechargeSchema = Joi.object({
    autoRechargeEnabled: Joi.boolean().required(),
});

const changeUserRoleSchema = Joi.object({
    role: Joi.string().valid("user", "admin").required(),
});

// Recharge Plan
const rechargePlanSchema = Joi.object({
    platform: Joi.string().trim().required(),
    category: Joi.string().trim().required(),
    planId: Joi.string().trim(),
    price: Joi.number().min(0).required(),
    validity: Joi.number().min(0).required(), // days
    data: Joi.object({
        dailyLimit: Joi.number().allow(null),
        totalData: Joi.number().allow(null),
        postLimitSpeed: Joi.string().allow(null, ""),
    }).unknown(true),
    calls: Joi.string().allow(null, ""),
    sms: Joi.string().allow(null, ""),
    extraBenefits: Joi.array().items(Joi.alternatives().try(
        Joi.string(),
        Joi.object({
            type: Joi.string().allow(""),
            description: Joi.string().allow(""),
            icon: Joi.string().allow(""),
        }).unknown(true)
    )),
    additionalDetails: Joi.string().allow(null, ""),
}).unknown(true);

// Payment / OTP
const cardDetailsSchema = Joi.object({
    cardNumber: Joi.string().trim().required(),
    expiryDate: Joi.string().trim().required(),
    cvv: Joi.string().trim().required(),
    cardholderName: Joi.string().trim().required(),
});

const verifyCardDetailsSchema = Joi.object({
    mobile_number: Joi.string().pattern(/^[6-9]\d{9}$/).allow(null, ""),
    plan_id: objectId.allow(null, ""),
    platformCharge: Joi.number().min(0).default(0),
    amount_to_pay: Joi.number().positive().required(),
    cardNumber: Joi.string().trim().required(),
    expiryDate: Joi.string().trim().required(),
    cvv: Joi.string().trim().required(),
    cardholderName: Joi.string().trim().required(),
    transactionType: Joi.string().valid("recharge", "wallet").required(),
});

const verifyOtpSchema = Joi.object({
    transaction_id: objectId.required(),
    otp: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    card_details: cardDetailsSchema.required(),
    transactionType: Joi.string().valid("recharge", "wallet").required(),
});

const cancelTransactionSchema = Joi.object({
    transaction_id: objectId.required(),
});

// Query & Feedback
const submitQuerySchema = Joi.object({
    subject: Joi.string().trim().min(3).max(120).required(),
    message: Joi.string().trim().min(5).max(1000).required(),
});

const updateQuerySchema = Joi.object({
    status: Joi.string().valid("Pending", "Resolved"),
    admin_response: Joi.string().trim().max(1000),
}).min(1);

const createFeedbackSchema = Joi.object({
    message: Joi.string().trim().min(10).max(200).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
});

module.exports = {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    updateUserSchema,
    toggleAutoRechargeSchema,
    changeUserRoleSchema,
    rechargePlanSchema,
    verifyCardDetailsSchema,
    verifyOtpSchema,
    cancelTransactionSchema,
    submitQuerySchema,
    updateQuerySchema,
    createFeedbackSchema,
};
