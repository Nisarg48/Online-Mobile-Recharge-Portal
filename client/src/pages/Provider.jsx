/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PageLayout from "./PageLayout";
import Recharge_Plan_Card from "../components/Recharge_Plan_Card";
import API from "../Utils/API";
import Swal from "sweetalert2";

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

                // Fetch suggested plans (based on history and popular plans)
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
                    // For non-logged-in users, fetch only popular plans
                    const popularPlansResponse = await API.get(
                        `/transactions/getSuggestedPlans?provider=${provider}`
                    );
                    setSuggestedPlans({
                        suggestedFromHistory: [],
                        popularPlans: popularPlansResponse.data.popularPlans || [],
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

    const getFilteredPlans = () => {
        if (selectedCategory === "Suggested") {
            // For the "Suggested" category, return both types of plans separately
            return {
                suggestedFromHistory: suggestedPlans.suggestedFromHistory,
                popularPlans: suggestedPlans.popularPlans,
            };
        } else {
            // For other categories, filter the recharge plans
            return rechargePlan.filter((plan) => {
                const isCategoryMatch =
                    selectedCategory === "All" || plan.category === selectedCategory;
                const isAmountMatch = amount
                    ? parseInt(plan.price) === Number(amount)
                    : true;
                return isCategoryMatch && isAmountMatch;
            });
        }
    };

    const filteredPlans = getFilteredPlans();

    return (
        <PageLayout title={`Recharge for ${provider}`} isModalOpen={isModalOpen}>
            <div className="flex flex-col justify-center items-center space-y-4 bg-[#121212] border border-pink-500 rounded-lg shadow-lg py-2 px-2 md:px-6 relative z-10">
                {/* Input Fields */}
                <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-lg border border-blue-500 p-4 m-2 shadow-md backdrop-blur-sm bg-opacity-30">
                    <form className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                        {/* Mobile Number Input */}
                        <div className="relative flex items-center w-full md:w-1/2">
                            <span className="absolute left-3 text-[#ffffff] text-lg">
                                <i className="fas fa-mobile-alt"></i>
                            </span>
                            <input
                                type="number"
                                placeholder="Enter Mobile Number"
                                aria-label="Mobile Number"
                                {...register("rechargeNumber", {
                                    required: false,
                                    pattern: /^\d{10}$/,
                                    onChange: (e) => setMobileNumber(e.target.value),
                                })}
                                className="w-full p-3 pl-12 text-xl border border-[#333333] bg-[#1e1e1e] text-[#ffffff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#50c878] shadow-sm"
                            />
                        </div>

                        {/* Recharge Amount Input */}
                        <div className="relative flex items-center w-full md:w-1/2">
                            <span className="absolute left-3 text-[#ffffff] text-lg">₹</span>
                            <input
                                type="number"
                                placeholder="Enter Recharge Amount"
                                aria-label="Recharge Amount"
                                className="w-full p-3 pl-12 text-xl border border-[#333333] bg-[#1e1e1e] text-[#ffffff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#50c878] shadow-sm"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </form>
                </div>

                {/* Category Selection & Available Plans */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0 md:space-x-4">
                    <div className="w-full md:w-1/4 bg-[#1e1e1e] shadow-lg backdrop-blur-sm bg-opacity-30">
                        {/* Category Selection */}
                        <div className="rounded-lg p-4 border border-white">
                            <h3 className="text-lg font-semibold mb-4 text-[#ffffff]">
                                Select Category:
                            </h3>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => setSelectedCategory("Suggested")}
                                    className={`px-4 py-2 rounded-md ${
                                        selectedCategory === "Suggested"
                                            ? "bg-[#50c878] text-white"
                                            : "bg-[#333333] text-[#ffffff] hover:bg-[#444444]"
                                    } transition duration-200 ease-in-out`}
                                >
                                    Suggested
                                </button>
                                <button
                                    onClick={() => setSelectedCategory("All")}
                                    className={`px-4 py-2 rounded-md ${
                                        selectedCategory === "All"
                                            ? "bg-[#50c878] text-white"
                                            : "bg-[#333333] text-[#ffffff] hover:bg-[#444444]"
                                    } transition duration-200 ease-in-out`}
                                >
                                    All
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-md ${
                                            selectedCategory === category
                                                ? "bg-[#50c878] text-white"
                                                : "bg-[#333333] text-[#ffffff] hover:bg-[#444444]"
                                        } transition duration-200 ease-in-out`}
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
                                    className="w-full bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white hover:border border-white transition duration-200 ease-in-out"
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
                    <div className="w-full md:w-3/4 bg-[#1e1e1e] shadow-lg rounded-lg p-4 border border-white max-h-[600px] overflow-y-auto backdrop-blur-sm bg-opacity-30">
                        <h3 className="text-lg font-semibold mb-4 text-[#ffffff]">
                            {selectedCategory === "Suggested"
                                ? "Recommended Plans For You:"
                                : "Available Plans:"}
                        </h3>

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
                            <div className="flex justify-center items-center py-10">
                                <div className="spinner-border animate-spin border-t-4 border-[#50c878] rounded-full w-16 h-16"></div>
                            </div>
                        ) : selectedCategory === "Suggested" ? (
                            <>
                                {/* Show "Based on Your History" section if applicable */}
                                {filteredPlans.suggestedFromHistory.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-xl font-bold text-white mb-4">
                                            Based on Your History
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
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
                                        <div className="grid grid-cols-1 gap-4">
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
                            <div className="grid grid-cols-1 gap-4">
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
                            <div className="text-center py-6">
                                <p className="text-[#ffffff] mb-2">
                                    No plans available for this selection.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

export default Provider;