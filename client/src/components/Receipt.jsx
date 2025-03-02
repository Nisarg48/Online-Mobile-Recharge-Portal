/* eslint-disable react-hooks/rules-of-hooks */
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Utils/API";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function Receipt() {
    const location = useLocation();
    const navigate = useNavigate();
    const transaction_id = location.state.transaction_id;
    const [transactionData, setTransactionData] = useState({
        transaction_id: transaction_id,
        user_id: '',
        mobile_number: '',
        plan_id: '',
        plan: {
            platform: '',
            category: '',
            price: '',
            validity: '',
            data: {
                dailyLimit: '',
                totalData: '',
            },
            calls: '',
            sms: '',
            extraBenefits: '',
        },
        platformCharge: '',
        transaction_date_time: '',
        status: '',
        payment_method: '',
    });

    if (!transaction_id) {
        navigate("/");
        return null;
    }

    useEffect(() => {
        const fetchTransactionData = async () => {
            try {
                const response = await API.get(`/transactions/getTransactionById/${transaction_id}`);
                console.log(response.data);
                setTransactionData(response.data);
            } catch (error) {
                    console.error(error);
            }
        }

        fetchTransactionData();
    }, []);

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Receipt Card */}
            <div className="bg-[#1e1e1e] rounded-lg shadow-2xl p-8 w-full max-w-2xl border border-gray-700">
                
                {/* Payment Success Message */}
                <div className="text-center text-[#50c878] text-2xl font-bold mb-4">
                    ✅ Payment Successful!
                </div>

                <h2 className="text-xl font-bold mb-6 text-center text-[#ffffff]">Transaction Receipt</h2>

                <div className="space-y-4 text-[#ffffff]">
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>Plan:</b></p>
                        <p>{transactionData.plan.platform} - {transactionData.plan.category}</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>Price:</b></p>
                        <p>₹{transactionData.plan.price}</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>Data:</b></p>
                        <p>{transactionData.plan.data.dailyLimit ? `${transactionData.plan.data.dailyLimit} GB/day` : `${transactionData.plan.data.totalData} GB`}</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>Calls:</b></p>
                        <p>{transactionData.plan.calls}</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>SMS:</b></p>
                        <p>{transactionData.plan.sms}</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>Validity:</b></p>
                        <p>{transactionData.plan.validity} days</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>Mobile Number:</b></p>
                        <p>{transactionData.mobile_number}</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>Transaction ID:</b></p>
                        <p>{transaction_id}</p>
                    </div>
                    <div className="flex justify-between">
                        <p><b>Date:</b></p>
                        <p>{transactionData.transaction_date_time}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all"
                        onClick={() => navigate("/NetworkProvider")}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default Receipt;
