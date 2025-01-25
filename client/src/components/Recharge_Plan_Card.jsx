/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

function Recharge_Plan_Card({ plan, isLoggedIn, mobileNumber }) {
    const [showMore, setShowMore] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);

    const toggleMore = () => {
        setShowMore(!showMore);
    };

    const handleBuyClick = () => {
        setShowBuyModal(true);
    };

    return (
        <div className="bg-white shadow-xl rounded-lg p-6 m-4 w-full hover:shadow-2xl transition-shadow duration-300">

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{plan.platform} {plan.category}</h2>
                {
                    isLoggedIn &&
                    <button
                        className="bg-red-500 text-white rounded-md px-4 py-2 hover:bg-red-600 transition-colors duration-200"
                        onClick={handleBuyClick}
                    >
                        Buy
                    </button>
                }
            </div>

            <p className="text-lg text-gray-800 mt-2"><span className="font-semibold">₹{plan.price}</span> - 
            <span className="italic">Valid for {plan.validity} days</span></p>

            <p className="text-md text-gray-800 mt-1">Data: {plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData} GB`}</p>
            
            <p className="text-md text-gray-800 mt-1">Calls: 
            <span className="font-medium">{plan.calls}</span></p>
            
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

            {/* Buy Plan Modal */}
            {showBuyModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-20 ">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">

                        <button
                            className='flex jus right-0' 
                            onClick={() => setShowBuyModal(false)}>
                            <FaTimes />
                        </button>

                        <h2 className="text-lg font-semibold mb-4">Plan Information : </h2>
                        <p className="mb-4"><b> Plan : </b>{plan.platform} - {plan.category}</p>
                        <p className="mb-4"><b> Price : </b>₹{plan.price}</p>
                        <p className="mb-4"><b> Data : </b>{plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData} GB`}</p>
                        <p className="mb-4"><b> Calls : </b>{plan.calls}</p>
                        <p className="mb-4"><b> SMS : </b>{plan.sms}</p>
                        <p className="mb-4"><b> Validity : </b>{plan.validity} days</p>

                        <h4 className="text-md font-medium underline">Extra Benefits:</h4>
                        <ul className="list-disc ml-5">
                            {plan.extraBenefits.map((benefit, index) => (
                                <li key={index} className="mt-1">{benefit.description}</li>
                            ))}
                        </ul>
                        <p>{plan.additionalDetails}</p>

                        <br/>
                        <p className="mb-4">
                            <b> Mobile Number: </b>
                                <input 
                                    type="text" 
                                    className="border border-gray-300 rounded-md px-2 py-1 w-full" 
                                    value={mobileNumber} />
                        </p>

                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors mr-4"
                            onClick={() => setShowBuyModal(false)}
                        >
                            Close
                        </button>

                        <button
                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md
                        hover:bg-green-600 transition-colors"
                        onClick={() => setShowBuyModal(false)}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Recharge_Plan_Card;
