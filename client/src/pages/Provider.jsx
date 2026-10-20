/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PageLayout from "./PageLayout";
import Recharge_Plan_Card from "../components/Recharge_Plan_Card";
import API from "../Utils/api";
import Swal from "sweetalert2";
import { FaMobileAlt, FaSearchDollar, FaTimes } from "react-icons/fa";

function Provider() {
    const navigate = useNavigate();
    const { provider } = useParams();
    const [mobileNumber, setMobileNumber] = useState("");
    const [amount, setAmount] = useState("");
    const { register } = useForm();
    const [rechargePlan, setRechargePlan] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Suggested");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suggestedPlans, setSuggestedPlans] = useState({
        suggestedFromHistory: [],
        popularPlans: [],
        hasTransactionHistory: false,
    });

    const [role, setRole] = useState(null);
    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        if (accessToken) {
            try {
                setRole(JSON.parse(atob(accessToken.split(".")[1])).role);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, [accessToken]);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const planResponse = await API.get("/getRecharge_Plan");
                const providerPlans = planResponse.data.filter(
                    (plan) => plan.platform.toLowerCase() === provider.toLowerCase()
                );
                setRechargePlan(providerPlans);

                // Extract unique categories from the plans
                const uniqueCategories = Array.from(
                    new Set(providerPlans.map((plan) => plan.category))
                );
                setCategories(uniqueCategories);

                // Suggested/popular plans come from an authenticated endpoint, so
                // only fetch them when signed in. Guests just see the "All" plans.
                if (accessToken) {
                    const suggestedResponse = await API.get(
                        `/transactions/getSuggestedPlans?provider=${provider}`
                    );

                    setSuggestedPlans({
                        suggestedFromHistory: suggestedResponse.data.suggestedFromHistory || [],
                        popularPlans: suggestedResponse.data.popularPlans || [],
                        hasTransactionHistory: suggestedResponse.data.hasTransactionHistory || false,
                    });
                } else {
                    setSuggestedPlans({
                        suggestedFromHistory: [],
                        popularPlans: [],
                        hasTransactionHistory: false,
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Failed to load recharge plans. Please try again.",
                });
                setLoading(false);
            }
        };
        fetchData();
    }, [provider, accessToken]);

    // Match plans whose price *starts with* what's typed (2 -> 2xx, 23 -> 23x),
    // instead of requiring an exact price.
    const amountQuery = amount.trim();
    const matchesAmount = (plan) =>
        !amountQuery || String(plan.price).startsWith(amountQuery);

    const getFilteredPlans = () => {
        if (selectedCategory === "Suggested") {
            // For the "Suggested" category, return both types of plans separately
            return {
                suggestedFromHistory: suggestedPlans.suggestedFromHistory.filter(matchesAmount),
                popularPlans: suggestedPlans.popularPlans.filter(matchesAmount),
            };
        } else {
            // For other categories, filter the recharge plans
            return rechargePlan.filter((plan) => {
                const isCategoryMatch =
                    selectedCategory === "All" || plan.category === selectedCategory;
                return isCategoryMatch && matchesAmount(plan);
            });
        }
    };

    const filteredPlans = getFilteredPlans();
    const visiblePlanCount =
        selectedCategory === "Suggested"
            ? filteredPlans.suggestedFromHistory.length + filteredPlans.popularPlans.length
            : filteredPlans.length;

    return (
        <PageLayout title={`Recharge for ${provider}`} isModalOpen={isModalOpen}>
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4 rounded-xl bg-[#121212] py-2 px-2 shadow-lg md:px-6">
                {/* Input Fields */}
                <div className="m-2 w-full max-w-2xl rounded-xl border border-[#333333] bg-[#1e1e1e] p-4 shadow-md">
                    <form className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                        {/* Mobile Number Input */}
                        <div className="relative flex w-full items-center md:w-1/2">
                            <FaMobileAlt className="pointer-events-none absolute left-4 text-[#50c878]" />
                            <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="Enter mobile number"
                                aria-label="Mobile Number"
                                {...register("rechargeNumber", {
                                    required: false,
                                    pattern: /^\d{10}$/,
                                    onChange: (e) => setMobileNumber(e.target.value),
                                })}
                                className="w-full rounded-lg border border-[#333333] bg-[#121212] p-3 pl-11 text-lg text-white placeholder:text-gray-500 focus:border-[#50c878] focus:outline-none focus:ring-2 focus:ring-[#50c878]/40"
                            />
                        </div>

                        {/* Recharge Amount / plan search Input */}
                        <div className="relative flex w-full items-center md:w-1/2">
                            <FaSearchDollar className="pointer-events-none absolute left-4 text-[#50c878]" />
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Search plan by amount"
                                aria-label="Search plan by amount"
                                className="w-full rounded-lg border border-[#333333] bg-[#121212] p-3 pl-11 pr-10 text-lg text-white placeholder:text-gray-500 focus:border-[#50c878] focus:outline-none focus:ring-2 focus:ring-[#50c878]/40"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                            />
                            {amount && (
                                <button
                                    type="button"
                                    aria-label="Clear amount"
                                    onClick={() => setAmount("")}
                                    className="absolute right-3 text-gray-400 transition hover:text-white"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Category Selection & Available Plans */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0 md:space-x-4">
                    <div className="w-full md:sticky md:top-24 md:w-1/4 md:self-start">
                        {/* Category Selection */}
                        <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-4 shadow-lg">
                            <h3 className="text-lg font-semibold mb-4 text-[#ffffff]">
                                Select Category:
                            </h3>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => setSelectedCategory("Suggested")}
                                    className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition duration-200 ${
                                        selectedCategory === "Suggested"
                                        ? "bg-[#50c878] text-black shadow"
                                        : "bg-[#262626] text-gray-200 hover:bg-[#333333]"
                                }`}
                                >
                                    Suggested
                                </button>
                                <button
                                    onClick={() => setSelectedCategory("All")}
                                    className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition duration-200 ${
                                        selectedCategory === "All"
                                        ? "bg-[#50c878] text-black shadow"
                                        : "bg-[#262626] text-gray-200 hover:bg-[#333333]"
                                }`}
                                >
                                    All
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition duration-200 ${
                                            selectedCategory === category
                                                ? "bg-[#50c878] text-black shadow"
                                                : "bg-[#262626] text-gray-200 hover:bg-[#333333]"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add Recharge Plan for Admin */}
                        {accessToken && role === "admin" && (
                            <div className="mt-4">
                                <button
                                    className="w-full rounded-lg border border-[#50c878] px-4 py-2 text-sm font-medium text-[#50c878] transition hover:bg-[#50c878] hover:text-black"
                                    onClick={() =>
                                        navigate(`/NetworkProvider/${provider}/add_plan`)
                                    }
                                >
                                    Add Recharge Plan
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Available Plans */}
                    <div className="max-h-[600px] w-full overflow-y-auto rounded-xl border border-[#333333] bg-[#1e1e1e] p-4 shadow-lg md:w-3/4">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#333333] pb-3">
                            <h3 className="text-lg font-semibold text-white">
                                {selectedCategory === "Suggested"
                                    ? "Recommended Plans For You"
                                    : "Available Plans"}
                            </h3>
                            {!loading && (
                                <span className="rounded-full bg-[#50c878]/10 px-3 py-1 text-xs font-medium text-[#50c878]">
                                    {amountQuery
                                        ? `${visiblePlanCount} match${visiblePlanCount === 1 ? "" : "es"} for "${amountQuery}"`
                                        : `${visiblePlanCount} plan${visiblePlanCount === 1 ? "" : "s"}`}
                                </span>
                            )}
                        </div>

                        {/* Suggestion explanation when showing suggested plans */}
                        {selectedCategory === "Suggested" && (
                            <div className="mb-4 p-3 bg-[#2a2a2a] rounded-lg border border-[#50c878]">
                                <p className="text-white text-sm">
                                    {accessToken && suggestedPlans.hasTransactionHistory
                                        ? "Based on your previous recharges, we've suggested plans similar to what you've used before, as well as some popular plans chosen by other users."
                                        : accessToken
                                            ? "We'll show personalized suggestions once you complete your first recharge. For now, here are some popular plans."
                                            : "Here are the most popular plans chosen by our users. Sign in to get personalized recommendations."}
                                </p>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-pulse rounded-2xl border border-[#333333] bg-[#1e1e1e] p-5"
                                    >
                                        <div className="h-3 w-16 rounded bg-[#333333]"></div>
                                        <div className="mt-3 h-5 w-3/4 rounded bg-[#333333]"></div>
                                        <div className="mt-4 h-8 w-24 rounded bg-[#333333]"></div>
                                        <div className="mt-4 space-y-2">
                                            <div className="h-3 w-full rounded bg-[#2a2a2a]"></div>
                                            <div className="h-3 w-5/6 rounded bg-[#2a2a2a]"></div>
                                            <div className="h-3 w-2/3 rounded bg-[#2a2a2a]"></div>
                                        </div>
                                        <div className="mt-6 h-10 w-full rounded-lg bg-[#2a2a2a]"></div>
                                    </div>
                                ))}
                            </div>
                        ) : selectedCategory === "Suggested" ? (
                            <>
                                {/* Show "Based on Your History" section if applicable */}
                                {filteredPlans.suggestedFromHistory.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-xl font-bold text-white mb-4">
                                            Based on Your History
                                        </h4>
                                        <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                            {filteredPlans.suggestedFromHistory.map((plan) => (
                                                <Recharge_Plan_Card
                                                    key={plan._id}
                                                    plan={{
                                                        ...plan,
                                                        extraBenefits: plan.extraBenefits || [],
                                                    }}
                                                    mobileNumber={
                                                        mobileNumber.length === 10 ? mobileNumber : ""
                                                    }
                                                    role={role}
                                                    suggestionType="Based on Your History"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Show "Most Popular Plans" section */}
                                {filteredPlans.popularPlans.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-xl font-bold text-white mb-4">
                                            Most Popular Plans
                                        </h4>
                                        <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                            {filteredPlans.popularPlans.map((plan) => (
                                                <Recharge_Plan_Card
                                                    key={plan._id}
                                                    plan={{
                                                        ...plan,
                                                        extraBenefits: plan.extraBenefits || [],
                                                    }}
                                                    mobileNumber={
                                                        mobileNumber.length === 10 ? mobileNumber : ""
                                                    }
                                                    role={role}
                                                    suggestionType="Most Popular"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fallback if no suggestions are available */}
                                {filteredPlans.suggestedFromHistory.length === 0 &&
                                    filteredPlans.popularPlans.length === 0 && (
                                        <div className="text-center py-6">
                                            <p className="text-[#ffffff] mb-2">
                                                No suggestions available.
                                            </p>
                                            {accessToken && (
                                                <p className="text-[#ffffff] text-sm">
                                                    Try recharging once to get personalized suggestions
                                                    based on your usage pattern.
                                                </p>
                                            )}
                                        </div>
                                    )}
                            </>
                        ) : filteredPlans.length > 0 ? (
                            <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredPlans.map((plan) => (
                                    <Recharge_Plan_Card
                                        key={plan._id}
                                        plan={{
                                            ...plan,
                                            extraBenefits: plan.extraBenefits || [],
                                        }}
                                        mobileNumber={
                                            mobileNumber.length === 10 ? mobileNumber : ""
                                        }
                                        role={role}
                                        suggestionType={plan.suggestionType}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <FaSearchDollar className="text-3xl text-gray-600" />
                                <p className="text-lg font-medium text-gray-200">
                                    {amountQuery
                                        ? `No plans match "${amountQuery}"`
                                        : "No plans available for this selection."}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {amountQuery
                                        ? "Try a different amount or clear the search."
                                        : "Try another category."}
                                </p>
                                {amountQuery && (
                                    <button
                                        onClick={() => setAmount("")}
                                        className="mt-1 rounded-lg border border-[#50c878] px-4 py-1.5 text-sm font-medium text-[#50c878] transition hover:bg-[#50c878] hover:text-black"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

export default Provider;