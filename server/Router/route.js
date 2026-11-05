const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/authMiddleware");
const { isAdmin } = require("../Middleware/authMiddleware");
const validate = require("../Middleware/validate");
const { contentLimiter } = require("../Middleware/rateLimit");
const {
    updateUserSchema,
    toggleAutoRechargeSchema,
    changeUserRoleSchema,
    rechargePlanSchema,
    verifyCardDetailsSchema,
    validateCouponSchema,
    verifyOtpSchema,
    cancelTransactionSchema,
    submitQuerySchema,
    updateQuerySchema,
    createFeedbackSchema,
    changePasswordSchema,
    couponSchema,
    updateCouponSchema,
} = require("../Validation/schemas");

const {
    getRecharge_Plan,
    getRecharge_PlanById,
    addRecharge_Plan,
    updateRecharge_Plan,
    deleteRecharge_Plan,
} = require("../Controllers/Recharge_Plan_Controller");

const {
    getUserTransaction_List,
    getLastTransaction,
    getTransactionById,
    deleteFromTransaction_List,
    updateTransaction,
    getSuggestedPlans,
} = require("../Controllers/Transaction_Controller");

const {
    getAllUsers,
    getUser,
    updateUser,
    changePassword,
    deleteUser,
    changeUserRole,
    toggleUserStatus,
    updateLastLogin,
    toggleAutoRecharge,
} = require("../Controllers/User_Controller");

const {
    verify_card_details,
    verify_otp,
    cancel_transaction,
} = require("../Controllers/Card_Controller");

const {
    listAutoRechargeLogs,
    runAutoRecharge,
} = require("../Controllers/AutoRecharge_Controller");

const {
    submitQuery,
    getAllQueries,
    getQueryById,
    updateQuery,
    deleteQuery,
    fetchUserQueries,
} = require("../Controllers/Query_Controller");

const {
    createFeedback,
    getMyFeedback,
    getPublicFeedback,
    getAllFeedback,
} = require("../Controllers/Feedback_Controller");

const {
    validateCoupon,
    listAvailableCoupons,
    listCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
} = require("../Controllers/Coupon_Controller");

const { getDashboard } = require("../Controllers/Admin_Controller");

// Auth Routes
const authRoutes = require("./authRoute");
router.use('/auth', authRoutes);

// Recharge Plan
router.get('/getRecharge_Plan', getRecharge_Plan);
router.get('/getRecharge_PlanById/:id', verifyToken, getRecharge_PlanById);
router.post('/addRecharge_Plan', verifyToken, isAdmin, validate(rechargePlanSchema), addRecharge_Plan);
router.put('/updateRecharge_Plan/:id', verifyToken, isAdmin, validate(rechargePlanSchema), updateRecharge_Plan);
router.delete('/deleteRecharge_Plan/:id', verifyToken, isAdmin, deleteRecharge_Plan);

// Transaction
router.get('/transactions/getUserTransaction_List', verifyToken, getUserTransaction_List);
router.get('/transactions/getLastTransaction', verifyToken, getLastTransaction);
router.get('/transactions/getTransactionById/:id', verifyToken, getTransactionById);
router.delete('/transactions/deleteFromTransaction_List/:id', verifyToken, deleteFromTransaction_List);
router.put('/transactions/updateTransaction/:id', verifyToken, isAdmin, updateTransaction);
router.get('/transactions/getSuggestedPlans', verifyToken, getSuggestedPlans);

// User
router.get('/users/getAllUsers', verifyToken, isAdmin, getAllUsers);
router.get('/user/getUser', verifyToken, getUser);
router.put('/user/updateUser', verifyToken, validate(updateUserSchema), updateUser);
router.put('/user/changePassword', verifyToken, validate(changePasswordSchema), changePassword);
router.put('/user/updateLastLogin', verifyToken, updateLastLogin);
router.put('/user/toggleAutoRecharge', verifyToken, validate(toggleAutoRechargeSchema), toggleAutoRecharge);
router.get('/autoRecharge/logs', verifyToken, listAutoRechargeLogs);
router.post('/autoRecharge/run', verifyToken, isAdmin, runAutoRecharge);

// Admin Dashboard
router.get('/admin/dashboard', verifyToken, isAdmin, getDashboard);

// Admin Routes
router.delete('/user/deleteUser/:id', verifyToken, isAdmin, deleteUser);
router.put('/user/changeUserRole/:id', verifyToken, isAdmin, validate(changeUserRoleSchema), changeUserRole);
router.put('/user/toggleUserStatus/:id', verifyToken, isAdmin, toggleUserStatus);

// Coupons (preview only; checkout re-validates server-side)
router.post('/coupon/validate', verifyToken, validate(validateCouponSchema), validateCoupon);

// Coupons available to users (browse + copy code at checkout)
router.get('/coupon/available', verifyToken, listAvailableCoupons);

// Coupon management (admin)
router.get('/coupon/list', verifyToken, isAdmin, listCoupons);
router.post('/coupon/add', verifyToken, isAdmin, validate(couponSchema), addCoupon);
router.put('/coupon/update/:id', verifyToken, isAdmin, validate(updateCouponSchema), updateCoupon);
router.delete('/coupon/delete/:id', verifyToken, isAdmin, deleteCoupon);

// Card Payment
router.post('/verify_card_details', verifyToken, validate(verifyCardDetailsSchema), verify_card_details);
router.post('/verify_otp', verifyToken, validate(verifyOtpSchema), verify_otp);
router.post('/cancel_transaction', verifyToken, validate(cancelTransactionSchema), cancel_transaction);

// Query
router.post('/query/submitQuery', verifyToken, contentLimiter, validate(submitQuerySchema), submitQuery);
router.get('/query/getAllQueries', verifyToken, isAdmin, getAllQueries);
router.get('/query/getQueryById/:id', verifyToken, getQueryById);
router.put('/query/updateQuery/:id', verifyToken, isAdmin, validate(updateQuerySchema), updateQuery);
router.delete('/query/deleteQuery/:id', verifyToken, isAdmin, deleteQuery);
router.get('/query/fetchUserQueries', verifyToken, fetchUserQueries);

// Feedback
router.get('/feedback/public', getPublicFeedback);
router.get('/feedback/myFeedback', verifyToken, getMyFeedback);
router.post('/feedback/createFeedback', verifyToken, contentLimiter, validate(createFeedbackSchema), createFeedback);
router.get('/feedback/getAllFeedback', verifyToken, isAdmin, getAllFeedback);

module.exports = router;
