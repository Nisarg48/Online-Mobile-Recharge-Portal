const express = require("express");
const router = express.Router();
const userController = require("../Controllers/User_Controller");
const verifyToken = require("../Middleware/authMiddleware");


const { getRecharge_Plan,
        getRecharge_PlanById,
        addRecharge_Plan,
        updateRecharge_Plan,
        deleteRecharge_Plan } = require("../Controllers/Recharge_Plan_Controller");

const { getUserTransaction_List,
        getTransactionById,
        addInTransaction_List,
        deleteFromTransaction_List,
        updateTransaction,
        getSuggestedPlans } = require("../Controllers/Transaction_Controller");

const { getUser,
        updateUser,
        forgetPassword } = require("../Controllers/User_Controller");

const { verify_card_details,
        verify_otp, 
        cancel_transaction } = require("../Controllers/Card_Controller");

// Auth Routes
const authRoutes = require("./authRoute");
router.use('/auth', authRoutes);

const { submitFeedback, getFeedback } = require('../Controllers/feedbackController'); 
router.post('/feedback', submitFeedback);

// Fetch all feedback
router.get('/feedback', getFeedback);

// Recharge Plan
router.get('/getRecharge_Plan', getRecharge_Plan);
router.get('/getRecharge_PlanById/:id', verifyToken, getRecharge_PlanById);
router.post('/addRecharge_Plan', verifyToken, addRecharge_Plan);
router.put('/updateRecharge_Plan/:id', verifyToken, updateRecharge_Plan);
router.delete('/deleteRecharge_Plan/:id', verifyToken, deleteRecharge_Plan);

// Transaction
router.get('/transactions/getUserTransaction_List', verifyToken, getUserTransaction_List);
router.get('/transactions/getTransactionById/:id', verifyToken, getTransactionById);
router.post('/transactions/addInTransaction_List', verifyToken, addInTransaction_List);
router.delete('/transactions/deleteFromTransaction_List/:id', verifyToken, deleteFromTransaction_List);
router.put('/transactions/updateTransaction/:id', verifyToken, updateTransaction);
router.get('/transactions/getSuggestedPlans', verifyToken, getSuggestedPlans);

// User
router.get('/user/getUser', verifyToken, getUser);
router.put('/user/updateUser', verifyToken, updateUser);
router.put('/user/forgetPassword', forgetPassword);

// Card Paymet
router.post('/verify_card_details', verifyToken, verify_card_details);
router.post('/verify_otp', verifyToken, verify_otp);
router.post('/cancel_transaction', verifyToken, cancel_transaction);

module.exports = router;