/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaDatabase, FaPhoneAlt, FaSms, FaThumbsUp, FaStar, FaFire,
    FaGem, FaAward, FaHeart, FaRegHeart, FaBalanceScale, FaEdit, FaTrashAlt, FaChevronDown,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import API from '../Utils/api';
import { benefitLabel } from '../Utils/format';
import Swal from "sweetalert2";

function Recharge_Plan_Card({ plan, mobileNumber, role, suggestionType, onCompareToggle, isComparing }) {
    const [showMore, setShowMore] = useState(false);
    const [isFavourite, setIsFavourite] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('favouritePlans') || '[]').includes(plan._id);
        } catch {
            return false;
        }
    });
    const navigate = useNavigate();
    const accessToken = localStorage.getItem('accessToken');
    const isAdmin = accessToken && role === 'admin';

    const toggleMore = () => setShowMore(!showMore);

    const toggleFavourite = () => {
        try {
            const favs = new Set(JSON.parse(localStorage.getItem('favouritePlans') || '[]'));
            if (favs.has(plan._id)) {
                favs.delete(plan._id);
            } else {
                favs.add(plan._id);
            }
            localStorage.setItem('favouritePlans', JSON.stringify([...favs]));
            setIsFavourite(favs.has(plan._id));
        } catch {
            // Ignore storage failures (private mode etc.)
        }
    };

    const perDay = plan.validity ? (plan.price / plan.validity).toFixed(1) : null;

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
    const hasBenefits = plan.extraBenefits && plan.extraBenefits.length > 0;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="group relative flex h-full flex-col rounded-2xl border border-[#333333] bg-[#1e1e1e] p-4 shadow-lg transition-shadow duration-300 hover:border-[#50c878] hover:shadow-2xl sm:p-5"
        >
            {badge && (
                <span className={`absolute right-4 top-0 z-10 -translate-y-1/2 whitespace-nowrap ${badge.color} flex items-center rounded-full px-3 py-1 text-xs font-medium text-white shadow-md`}>
                    {badge.icon}
                    {badge.text}
                </span>
            )}

            {/* Header: platform + category, admin controls */}
            <div className="flex items-start justify-between gap-3 pr-16">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#50c878]">{plan.platform}</p>
                    <h3 className="truncate text-base font-semibold text-white sm:text-lg" title={plan.category}>
                        {plan.category}
                    </h3>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                        aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                        title={isFavourite ? "Remove from favourites" : "Add to favourites"}
                        className={`rounded-md p-2 transition hover:bg-white/10 ${
                            isFavourite ? "text-red-400" : "text-gray-300 hover:text-red-400"
                        }`}
                        onClick={toggleFavourite}
                    >
                        {isFavourite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    {onCompareToggle && (
                        <button
                            aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
                            title={isComparing ? "Remove from comparison" : "Add to comparison"}
                            className={`rounded-md p-2 transition hover:bg-white/10 ${
                                isComparing ? "text-[#50c878]" : "text-gray-300 hover:text-[#50c878]"
                            }`}
                            onClick={() => onCompareToggle(plan)}
                        >
                            <FaBalanceScale />
                        </button>
                    )}
                </div>
            </div>

            {/* Price + validity */}
            <div className="mt-4 flex items-end justify-between">
                <p className="text-2xl font-bold leading-none text-white sm:text-3xl">₹{plan.price}</p>
                <div className="text-right">
                    <span className="rounded-full bg-[#50c878]/10 px-3 py-1 text-xs font-medium text-[#50c878]">
                        {plan.validity} days
                    </span>
                    {perDay && (
                        <p className="mt-1 text-xs text-gray-400">≈ ₹{perDay}/day</p>
                    )}
                </div>
            </div>

            {/* Key specs */}
            <ul className="mt-4 space-y-2 text-sm text-gray-200">
                <li className="flex items-center">
                    <FaDatabase className="mr-2 flex-shrink-0 text-[#50c878]" />
                    <span>
                        {plan.data?.dailyLimit
                            ? `${plan.data.dailyLimit} GB/day`
                            : `${plan.data?.totalData || 0} GB total`}
                    </span>
                </li>
                <li className="flex items-center">
                    <FaPhoneAlt className="mr-2 flex-shrink-0 text-[#50c878]" />
                    <span>Calls: <span className="font-medium">{plan.calls}</span></span>
                </li>
                <li className="flex items-center">
                    <FaSms className="mr-2 flex-shrink-0 text-[#50c878]" />
                    <span>SMS: <span className="font-medium">{plan.sms}</span></span>
                </li>
            </ul>

            {/* Suggestion reason */}
            {suggestionType && (
                <p className="mt-3 text-sm italic text-gray-400">
                    {suggestionType.includes("Similar")
                        ? "Similar to what you've used before"
                        : suggestionType.includes("Recommended")
                            ? "Better value than your previous recharges"
                            : suggestionType.includes("Popular") || suggestionType.includes("Best Seller")
                                ? "Popular among our users"
                                : "Recommended based on user preferences"}
                </p>
            )}

            {/* Extra benefits */}
            {hasBenefits && (
                <div className="mt-3">
                    <button
                        className="flex items-center gap-1 text-sm text-[#50c878] hover:text-[#6a11cb]"
                        onClick={toggleMore}
                    >
                        {showMore ? "Hide benefits" : `${plan.extraBenefits.length} extra benefit${plan.extraBenefits.length > 1 ? "s" : ""}`}
                        <FaChevronDown className={`transition-transform ${showMore ? "rotate-180" : ""}`} size={12} />
                    </button>
                    {showMore && (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                            {plan.extraBenefits.map((benefit, index) => (
                                <li key={index}>{benefitLabel(benefit)}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Footer action pinned to the bottom for equal-height cards */}
            <div className="mt-auto pt-5">
                {accessToken ? (
                    <button
                        className="w-full rounded-lg bg-gradient-to-r from-[#50c878] to-[#6a11cb] py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
                        onClick={handleBuyClick}
                    >
                        Recharge ₹{plan.price}
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="block w-full rounded-lg border border-[#50c878] py-2.5 text-center font-semibold text-[#50c878] transition hover:bg-[#50c878] hover:text-black"
                    >
                        Login to recharge
                    </Link>
                )}

                {isAdmin && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => navigate(`/NetworkProvider/${plan.platform}/edit_plan/${plan._id}`)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-[#333333] bg-[#262626] py-2 text-sm font-medium text-[#cfcfcf] transition hover:border-[#50c878] hover:text-[#50c878]"
                        >
                            <FaEdit size={14} /> Edit
                        </button>
                        <button
                            onClick={() => deleteRechargePlan(plan._id)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-[#333333] bg-[#262626] py-2 text-sm font-medium text-[#cfcfcf] transition hover:border-red-400 hover:text-red-400"
                        >
                            <FaTrashAlt size={14} /> Delete
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default Recharge_Plan_Card;
