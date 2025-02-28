import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PageLayout from "./PageLayout";
import Recharge_Plan_Card from "../components/Recharge_Plan_Card";
import API from "../Utils/API";

function Provider() {
    const navigate = useNavigate();
    const { provider } = useParams();
    const [mobileNumber, setMobileNumber] = useState("");
    const [amount, setAmount] = useState("");
    const { register } = useForm();
    const [rechargePlan, setRechargePlan] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setLoading(true);

        const fetchRechargePlans = async () => {
            const response = await API.get("/getRecharge_Plan");
            console.log(response.data[0]);

            // Filter plans by provider
            const providerPlans = response.data.filter(
                (plan) => plan.platform.toLowerCase() === provider.toLowerCase()
            );

            setRechargePlan(providerPlans);

            // Extract unique categories for the selected provider
            const uniqueCategories = Array.from(
                new Set(providerPlans.map((plan) => plan.category))
            );
            setCategories(uniqueCategories);

            setLoading(false);
        };

        fetchRechargePlans();
    }, [provider]); // Add `provider` as a dependency

    const [role, setRole] = useState(null);
    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        const decodeToken = () => {
            if (accessToken) {
                try {
                    setRole(JSON.parse(atob(accessToken.split('.')[1])).role);
                    console.log(role);
                } catch (error) {
                    console.error('Error decoding token:', error);
                    return null;
                }
            }
        };
        decodeToken();
    }, [accessToken, role]);

    const filteredPlans = rechargePlan.filter((plan) => {
        const isProviderMatch = plan.platform.toLowerCase() === provider.toLowerCase();
        const isCategoryMatch = selectedCategory === "All" || plan.category === selectedCategory;
        const isAmountMatch = amount ? parseInt(plan.price) === Number(amount) : true;
        return isProviderMatch && isCategoryMatch && isAmountMatch;
    });

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
                            <h3 className="text-lg font-semibold mb-4 text-[#ffffff]">Select Category:</h3>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className={`px-4 py-2 rounded-md ${selectedCategory === 'All' ? 'bg-[#50c878] text-white' : 'bg-[#333333] text-[#ffffff] hover:bg-[#444444]'} transition duration-200 ease-in-out`}
                                >
                                    All
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-md ${selectedCategory === category ? 'bg-[#50c878] text-white' : 'bg-[#333333] text-[#ffffff] hover:bg-[#444444]'} transition duration-200 ease-in-out`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Add Recharge Plan */}
                        {accessToken && role === 'admin' &&
                            <div className="mt-4">
                                <button 
                                    className="w-full bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white hover:border border-white transition duration-200 ease-in-out"
                                    onClick={() => navigate(`/NetworkProvider/${provider}/add_plan`)}>
                                    Add Recharge Plan
                                </button>
                            </div>
                        }
                    </div>

                    {/* Available Plans */}
                    <div className="w-full md:w-3/4 bg-[#1e1e1e] shadow-lg rounded-lg p-4 border border-white max-h-[500px] overflow-y-auto backdrop-blur-sm bg-opacity-30">
                        <h3 className="text-lg font-semibold mb-4 text-[#ffffff]">Available Plans:</h3>
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <div className="spinner-border animate-spin border-t-4 border-[#50c878] rounded-full w-16 h-16"></div>
                            </div>
                        ) : filteredPlans.length > 0 ? (
                            filteredPlans.map((plan) => (
                                <Recharge_Plan_Card
                                    key={plan._id}
                                    plan={plan}
                                    mobileNumber={mobileNumber.length === 10 ? mobileNumber : null}
                                    role={role}
                                    onModalOpen={setIsModalOpen}
                                />
                            ))
                        ) : (
                            <p className="text-[#ffffff]">No plans available for this provider.</p>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

export default Provider;