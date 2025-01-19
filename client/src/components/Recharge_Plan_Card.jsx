/* eslint-disable react/prop-types */
import { useState } from 'react';

function Recharge_Plan_Card({ plan, isLoggedIn }) {
    const [showMore, setShowMore] = useState(false);

    const toggleMore = () => {
        setShowMore(!showMore);
    };

    return (
        <div className="bg-white shadow-xl rounded-lg p-6 m-4 w-full hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{plan.platform} {plan.category}</h2>
                {isLoggedIn && <button className="bg-red-500 text-white rounded-md px-4 py-2">Buy</button>}
            </div>
            <p className="text-lg text-gray-800 mt-2"><span className="font-semibold">₹{plan.price}</span> - <span className="italic">Valid for {plan.validity} days</span></p>
            <p className="text-md text-gray-800 mt-1">Data: {plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData} GB`}</p>
            <p className="text-md text-gray-800 mt-1">Calls: <span className="font-medium">{plan.calls}</span></p>
            <p className="text-md text-gray-800 mt-1">SMS: <span className="font-medium">{plan.sms}</span></p>

            {showMore && (
                <div className="mt-4 text-gray-800">
                    <h4 className="text-md font-medium underline">Extra Benefits:</h4>
                    <ul className="list-disc ml-5">
                        {plan.extraBenefits.map((benefit, index) => (
                            <li key={index} className="mt-1">{benefit.description}</li>
                        ))}
                    </ul>
                    <p>{plan.additionalDetails}</p>
                </div>
            )}

            <button
                className="text-blue-500 mt-4 underline text-md"
                onClick={toggleMore}
            >
                {showMore ? "See less" : "See more"}
            </button>
        </div>
    );
}

export default Recharge_Plan_Card;
