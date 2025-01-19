/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import PageLayout from "./PageLayout";
import Recharge_Plan_Card from "../components/Recharge_Plan_Card";

function Provider() {
    const { provider } = useParams();
    const [mobileNumber, setMobileNumber] = useState("");
    const [amount, setAmount] = useState("");
    const { register } = useForm();
    const [rechargePlan, setRechargePlan] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch("/Recharge_Plan.json")
            .then((res) => res.json())
            .then((data) => {
                setRechargePlan(data);
                const uniqueCategories = Array.from(new Set(data.map(plan => plan.category)));
                setCategories(uniqueCategories);
            })
            .catch((error) => console.error("Error fetching recharge plans:", error));
    }, []);

    const filteredPlans = rechargePlan.filter((plan) => {
        const isProviderMatch = plan.platform.toLowerCase() === provider.toLowerCase();
        const isCategoryMatch = selectedCategory === "All" || plan.category === selectedCategory;
        const isAmountMatch = amount ? parseInt(plan.price) === Number(amount) : true;
        return isProviderMatch && isCategoryMatch && isAmountMatch;
    });

    return (
        <PageLayout title={`Recharge for ${provider}`}>
            <div className="flex flex-col justify-center items-center">
                <div className="w-full max-w-2xl bg-gray-200 rounded-lg border border-gray-300 flex justify-center items-center mb-2 sticky">
                    <form className="flex flex-row space-x-4 m-2">
                        <div className="relative flex items-center w-full bg-gray-200 rounded-lg border">
                            <span className="absolute left-3 text-gray-500 text-lg">
                                <i className="fas fa-mobile-alt"></i>
                            </span>
                            <input
                                type="number"
                                placeholder="Enter Mobile Number"
                                aria-label="Mobile Number"
                                {...register("rechargeNumber")}
                                className="w-full p-4 pl-12 text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                onChange={(e) => setMobileNumber(e.target.value)}
                            />
                        </div>
                    </form>
                    <form className="flex flex-row space-x-4 m-2">
                        <div className="relative flex items-center w-full bg-gray-200 rounded-lg border">
                            <span className="absolute left-3 text-gray-500 text-lg">₹</span>
                            <input
                                type="number"
                                placeholder="Enter Recharge Amount"
                                aria-label="Recharge Amount"
                                className="w-full p-4 pl-12 text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </form>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-start w-full max-h-screen space-y-6 md:space-y-0 border border-gray-300 bg-gray-200 p-4 rounded-lg space-x-4">
                    <div className="w-full md:w-1/4 bg-white shadow-lg rounded-lg border border-gray-300 p-4">
                        <h3 className="text-lg font-semibold mb-4">Select Category:</h3>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className={`px-4 py-2 rounded-md ${selectedCategory === 'All' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                            >
                                All
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-md ${selectedCategory === category ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-3/4 bg-white shadow-lg rounded-lg p-6 border border-gray-300 max-h-[500px] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Available Plans:</h3>
                        <div className="space-y-4">
                            {filteredPlans.length > 0 ? (
                                filteredPlans.map((plan) => (
                                    <Recharge_Plan_Card key={plan.planId} plan={plan} isLoggedIn={true /* Pass the actual isLoggedIn state */} />
                                ))
                            ) : (
                                <p>No plans available for this provider.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

export default Provider;
