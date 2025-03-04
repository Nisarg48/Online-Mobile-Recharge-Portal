/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FaDatabase, FaPhoneAlt, FaSms, FaThumbsUp, FaStar, FaFire, FaGem, FaAward, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../Utils/API';
import Swal from "sweetalert2";

function Recharge_Plan_Card({ plan, mobileNumber, role, suggestionType }) {
    const [showMore, setShowMore] = useState(false);
    const navigate = useNavigate();
    const accessToken = localStorage.getItem('accessToken');

    const toggleMore = () => setShowMore(!showMore);

    const handleBuyClick = () => {
        navigate(`/NetworkProvider/${plan.platform}/buy`, {
            state: {
                plan: plan,
                mNumber: mobileNumber,
            },
        });
    };

    const deleteRechargePlan = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!"
        }).then((result) => {
            if (result.isConfirmed) {
                API.delete(`/deleteRecharge_Plan/${id}`)
                    .then(() => {
                        Swal.fire({
                            title: "Deleted!",
                            text: "The recharge plan has been deleted.",
                            icon: "success"
                        }).then(() => {
                            window.location.reload();
                        });
                    })
                    .catch(() => {
                        Swal.fire({
                            title: "Error!",
                            text: "Something went wrong. Please try again.",
                            icon: "error"
                        });
                    });
            }
        });
    };

    // Get suggestion badge details based on type
    const getSuggestionBadge = () => {
        if (!suggestionType) return null;

        const badges = {
            "Similar to Your Last Recharge": {
                color: "bg-blue-600",
                icon: <FaHeart className="mr-1" />,
                text: "Based on Your History"
            },
            "Recommended Upgrade": {
                color: "bg-purple-600",
                icon: <FaGem className="mr-1" />,
                text: "Recommended Upgrade"
            },
            "Better Value": {
                color: "bg-teal-500",
                icon: <FaAward className="mr-1" />,
                text: "Better Value"
            },
            "Most Popular": {
                color: "bg-amber-500",
                icon: <FaStar className="mr-1" />,
                text: "Most Popular"
            },
            "Best Seller": {
                color: "bg-red-500",
                icon: <FaFire className="mr-1" />,
                text: "Best Seller"
            },
            "Trending": {
                color: "bg-green-500",
                icon: <FaThumbsUp className="mr-1" />,
                text: "Trending"
            }
        };

        // Map the suggestionType to a badge, or use a default
        const badgeKey = Object.keys(badges).find(key =>
            suggestionType.includes(key) ||
            (suggestionType.includes("Similar") && key === "Similar to Your Last Recharge") ||
            (suggestionType.includes("Recommended") && key === "Recommended Upgrade")
        ) || "Most Popular";

        return badges[badgeKey];
    };

    const badge = getSuggestionBadge();

    return (
        <motion.div
            className="bg-[#1e1e1e] shadow-lg rounded-lg p-6 m-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-20 flex flex-col relative border border-gray-700"
            whileHover={{ scale: 1.02 }}
        >
            {/* Suggestion Badge */}
            {badge && (
                <div className={`absolute -top-2 -right-2 ${badge.color} text-white text-xs font-medium px-3 py-1 rounded-full shadow-md flex items-center`}>
                    {badge.icon}
                    {badge.text}
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{plan.category}</h2>
                <div className='flex space-x-5'>
                    {accessToken && role === 'admin' && (
                        <button
                            className="text-white text-md border-4 rounded-md border-white px-4 py-1 hover:border-blue hover:text-black hover:bg-white hover:font-bold transition-all duration-200"
                            onClick={() => navigate(`/NetworkProvider/${plan.platform}/edit_plan/${plan._id}`)}
                        >
                            Edit
                        </button>
                    )}

                    {accessToken && role === 'admin' && (
                        <button
                            className="text-white text-md border-4 rounded-md border-red-500 px-4 py-1 hover:border-blue hover:text-white hover:bg-red-700 hover:font-bold transition-all duration-200"
                            onClick={() => deleteRechargePlan(plan._id)}
                        >
                            Delete
                        </button>
                    )}

                    {accessToken && (
                        <button
                            className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white font-bold rounded-md px-4 py-2 hover:from-[#6a11cb] hover:to-[#50c878] transition-all duration-200"
                            onClick={handleBuyClick}
                        >
                            Buy
                        </button>
                    )}
                </div>
            </div>

            <p className="text-xl text-white mb-2">
                <span className="font-bold">₹{plan.price}</span> -
                <span className="italic"> Valid for {plan.validity} days</span>
            </p>

            <div className="text-white space-y-1">
                <div className="flex items-center">
                    <FaDatabase className="mr-2 text-[#50c878]" />
                    <p>Data: {plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData || 0} GB`}</p>
                </div>
                <div className="flex items-center">
                    <FaPhoneAlt className="mr-2 text-[#50c878]" />
                    <p>Calls: <span className="font-medium">{plan.calls}</span></p>
                </div>
                <div className="flex items-center">
                    <FaSms className="mr-2 text-[#50c878]" />
                    <p>SMS: <span className="font-medium">{plan.sms}</span></p>
                </div>
            </div>

            {/* Suggestion Reason - Show only for suggested plans */}
            {suggestionType && (
                <div className="mt-3 text-sm">
                    <p className="text-gray-300 italic">
                        {suggestionType.includes("Similar")
                            ? "This plan is similar to what you've used before"
                            : suggestionType.includes("Recommended")
                                ? "This plan offers better value than your previous recharges"
                                : suggestionType.includes("Popular") || suggestionType.includes("Best Seller")
                                    ? "This plan is popular among our users"
                                    : "This plan is recommended based on user preferences"}
                    </p>
                </div>
            )}

            {plan.extraBenefits && plan.extraBenefits.length > 0 && (
                <>
                    <button
                        className="text-[#50c878] mt-4 underline text-md hover:text-[#6a11cb] transition-colors text-left"
                        onClick={toggleMore}
                    >
                        {showMore ? "See less" : "See more"}
                    </button>

                    {showMore && (
                        <div className="mt-4 text-white">
                            <h4 className="text-md font-medium underline">Extra Benefits:</h4>
                            <ul className="list-disc ml-5">
                                {plan.extraBenefits.map((benefit, index) => (
                                    <li key={index} className="mt-1">{benefit}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}

export default Recharge_Plan_Card;