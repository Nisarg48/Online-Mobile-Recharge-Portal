const Joi = require("joi");

const email = Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required();
const mobileNo = Joi.string().pattern(/^[6-9]\d{9}$/).required();
const password = Joi.string().min(8).max(72).required();
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

// Auth
const region = Joi.string().trim().max(60).allow(null, "");
const city = Joi.string().trim().max(60).allow(null, "");

const signupSchema = Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
    email,
    mobile_no: mobileNo,
    password,
    region,
    city,
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
    alternate_mobile: Joi.string().pattern(/^[6-9]\d{9}$/).allow(null, ""),
    address: Joi.string().trim().max(250).allow(null, ""),
    avatar: Joi.string().trim().max(500).allow(null, ""),
    region,
    city,
}).min(1);

const toggleAutoRechargeSchema = Joi.object({
    autoRechargeEnabled: Joi.boolean().required(),
});

const changeUserRoleSchema = Joi.object({
    role: Joi.string().valid("user", "admin").required(),
});

// Admin wallet adjustment: positive credits, negative debits, never zero.
const walletAdjustSchema = Joi.object({
    amount: Joi.number().required().invalid(0).custom((value, helpers) => {
        if (Math.abs(value) > 100000) {
            return helpers.message("Amount must be between -100000 and 100000");
        }
        return value;
    }),
    reason: Joi.string().trim().min(3).max(200).required(),
});

const refundSchema = Joi.object({
    reason: Joi.string().trim().max(200).allow(null, ""),
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

// Coupon (admin create/update)
const couponSchema = Joi.object({
    code: Joi.string().trim().uppercase().max(24).required(),
    description: Joi.string().trim().max(120).allow(null, ""),
    type: Joi.string().valid("percent", "flat").required(),
    value: Joi.number().min(0).required(),
    maxDiscount: Joi.number().min(0).default(0),
    minAmount: Joi.number().min(0).default(0),
    active: Joi.boolean().default(true),
    expiresAt: Joi.date().allow(null),
    usageLimit: Joi.number().min(0).default(0),
    perUserLimit: Joi.number().min(0).default(1),
});

// Partial update schema for coupons: every field optional so admins can
// change just one value (e.g. toggle `active`) without re-sending everything.
const updateCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().max(24),
    description: Joi.string().trim().max(120).allow(null, ""),
    type: Joi.string().valid("percent", "flat"),
    value: Joi.number().min(0),
    maxDiscount: Joi.number().min(0),
    minAmount: Joi.number().min(0),
    active: Joi.boolean(),
    expiresAt: Joi.date().allow(null),
    usageLimit: Joi.number().min(0),
    perUserLimit: Joi.number().min(0),
}).min(1);

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
    amount_to_pay: Joi.number().min(0).required(),
    cardNumber: Joi.string().trim().required(),
    expiryDate: Joi.string().trim().required(),
    cvv: Joi.string().trim().required(),
    cardholderName: Joi.string().trim().required(),
    transactionType: Joi.string().valid("recharge", "wallet").required(),
    coupon_code: Joi.string().trim().uppercase().max(24).allow(null, ""),
});

const validateCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().max(24).required(),
    plan_id: objectId.required(),
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
    transaction_id: Joi.string().hex().length(24).allow(null, ""),
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
    walletAdjustSchema,
    refundSchema,
    rechargePlanSchema,
    verifyCardDetailsSchema,
    validateCouponSchema,
    verifyOtpSchema,
    cancelTransactionSchema,
    submitQuerySchema,
    updateQuerySchema,
    createFeedbackSchema,
    couponSchema,
    updateCouponSchema,
};
