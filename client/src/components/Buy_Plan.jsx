/* eslint-disable no-unused-vars */
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Utils/API";

function Buy_Plan() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;
  const mNumber = location.state?.mNumber;
  const [mobileNumber, setMobileNumber] = useState(mNumber || "");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [showError, setShowError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const handlePayment = async () => {
    if (!mobileNumber) {
      setShowError("⚠ Please enter a mobile number!");
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      setShowError("⚠ Mobile number must be exactly 10 digits!");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate payment (replace with actual payment gateway integration)
      const paymentSuccess = await simulatePayment();
      if (!paymentSuccess) {
        throw new Error("Payment failed");
      }

      // Prepare transaction data
      const transactionData = {
        user_id: JSON.parse(atob(accessToken.split('.')[1])).userId,
        mobile_number: mobileNumber,
        plan_id: plan._id,
        plan: {
          platform: plan.platform,
          category: plan.category,
          price: plan.price,
          validity: plan.validity,
          data: {
            dailyLimit: plan.data.dailyLimit,
            totalData: plan.data.totalData,
          },
          calls: plan.calls,
          sms: plan.sms,
          extraBenefits: plan.extraBenefits,
        },
        status: "Success",
        payment_method: "Card",
      };

      // Save transaction to the database
      const response = await API.post("/transactions/addInTransaction_List", transactionData);
      if (!response.data) {
        throw new Error("Failed to save transaction");
      }

      // Navigate to receipt page
      navigate("/receipt", { state: { transactionData: response.data } });
    } catch (error) {
      console.error("Payment error:", error);
      setShowError("⚠ Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate payment (replace with actual payment gateway integration)
  const simulatePayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Simulate successful payment
      }, 2000);
    });
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <motion.div
        className="bg-[#111] border border-gray-800 text-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-[#50c878]"
          onClick={handleCloseModal}
        >
          <FaTimes className="text-xl" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-[#50c878]">Plan Information</h2>
        <div className="space-y-4">
          <p><b>Plan:</b> {plan.platform} - {plan.category}</p>
          <p><b>Price:</b> ₹{plan.price}</p>
          <p><b>Data:</b> {plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData} GB`}</p>
          <p><b>Calls:</b> {plan.calls}</p>
          <p><b>SMS:</b> {plan.sms}</p>
          <p><b>Validity:</b> {plan.validity} days</p>
        </div>

        <div className="mt-8">
          <p className="mb-2"><b>Mobile Number:</b></p>
          <input
            type="text"
            className="w-full px-4 py-3 border border-[#50c878] bg-[#000] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#50c878] transition-all"
            value={mobileNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setMobileNumber(value);
            }}
            placeholder="Enter mobile number"
            maxLength="10"
          />
        </div>

        <div className="flex justify-end mt-8 space-x-4">
          <button
            className="bg-[#222] text-white px-6 py-3 rounded-md hover:bg-[#333] transition-all"
            onClick={handleCloseModal}
          >
            Close
          </button>
          <button
            className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay"}
          </button>
        </div>
      </motion.div>

      {/* Error Message (if any) */}
      <AnimatePresence>
        {showError && (
          <motion.div
            className="absolute top-10 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {showError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Buy_Plan;