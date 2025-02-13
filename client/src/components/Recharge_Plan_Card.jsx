/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FaTimes, FaDatabase, FaPhoneAlt, FaSms } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function Recharge_Plan_Card({ plan, isLoggedIn, mNumber, onModalOpen }) {
    const [mobileNumber, setMobileNumber] = useState(mNumber);
    const [showMore, setShowMore] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);

    const toggleMore = () => setShowMore(!showMore);
    const handleBuyClick = () => {
        setShowBuyModal(true);
        onModalOpen(true); // Notify parent that modal is open
    };

    const handleCloseModal = () => {
        setShowBuyModal(false);
        onModalOpen(false); // Notify parent that modal is closed
    };

    return (
        <motion.div
            className="bg-[#1e1e1e] shadow-lg rounded-lg p-6 m-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-20"
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#ffffff]">{plan.platform} {plan.category}</h2>
                {isLoggedIn && (
                    <button
                        className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white rounded-md px-4 py-2 hover:from-[#50c878] hover:to-[#6a11cb] transition-all duration-200"
                        onClick={handleBuyClick}
                    >
                        Buy
                    </button>
                )}
            </div>

            <p className="text-lg text-[#ffffff] mt-2">
                <span className="font-bold">₹{plan.price}</span> - 
                <span className="italic"> Valid for {plan.validity} days</span>
            </p>

            <div className="flex items-center mt-2 text-[#ffffff]">
                <FaDatabase className="mr-2 text-[#50c878]" />
                <p>Data: {plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData} GB`}</p>
            </div>
            <div className="flex items-center mt-1 text-[#ffffff]">
                <FaPhoneAlt className="mr-2 text-[#50c878]" />
                <p>Calls: <span className="font-medium">{plan.calls}</span></p>
            </div>
            <div className="flex items-center mt-1 text-[#ffffff]">
                <FaSms className="mr-2 text-[#50c878]" />
                <p>SMS: <span className="font-medium">{plan.sms}</span></p>
            </div>

            <button
                className="text-[#50c878] mt-4 underline text-md hover:text-[#6a11cb] transition-colors"
                onClick={toggleMore}
            >
                {showMore ? "See less" : "See more"}
            </button>

            {showMore && (
                <div className="mt-4 text-[#ffffff]">
                    <h4 className="text-md font-medium underline">Extra Benefits:</h4>
                    <ul className="list-disc ml-5">
                        {plan.extraBenefits.map((benefit, index) => (
                            <li key={index} className="mt-1">{benefit.description}</li>
                        ))}
                    </ul>
                    <p>{plan.additionalDetails}</p>
                </div>
            )}

            <AnimatePresence>
                {showBuyModal && (
                    <>
                        {/* Full-Screen Blur Overlay */}
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Centered Plan Details Box */}
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="bg-[#1e1e1e] rounded-lg shadow-2xl p-8 w-full max-w-2xl relative">
                                <button
                                    className="absolute top-4 right-4 text-[#ffffff] hover:text-[#50c878]"
                                    onClick={handleCloseModal}
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                                <h2 className="text-2xl font-bold mb-6 text-[#ffffff]">Plan Information</h2>
                                <div className="space-y-4 text-[#ffffff]">
                                    <p><b>Plan:</b> {plan.platform} - {plan.category}</p>
                                    <p><b>Price:</b> ₹{plan.price}</p>
                                    <p><b>Data:</b> {plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData} GB`}</p>
                                    <p><b>Calls:</b> {plan.calls}</p>
                                    <p><b>SMS:</b> {plan.sms}</p>
                                    <p><b>Validity:</b> {plan.validity} days</p>
                                </div>
                                <div className="mt-6">
                                    <h4 className="text-lg font-semibold underline">Extra Benefits:</h4>
                                    <ul className="list-disc ml-5">
                                        {plan.extraBenefits.map((benefit, index) => (
                                            <li key={index} className="mt-1">{benefit.description}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-8">
                                    <p className="mb-2"><b>Mobile Number:</b></p>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-[#333333] bg-[#1e1e1e] text-[#ffffff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#50c878]"
                                        value={mobileNumber || ""}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                                <div className="flex justify-end mt-8 space-x-4">
                                    <button
                                        className="bg-[#333333] text-[#ffffff] px-6 py-3 rounded-md hover:bg-[#444444] transition-colors"
                                        onClick={handleCloseModal}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white px-6 py-3 rounded-md hover:from-[#50c878] hover:to-[#6a11cb] transition-all"
                                        onClick={() => {
                                            if (!mobileNumber) {
                                                alert("Please enter a mobile number.");
                                                return;
                                            }
                                            alert(`Payment successful for ${mobileNumber}`);
                                            handleCloseModal();
                                        }}
                                    >
                                        Pay
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Recharge_Plan_Card;