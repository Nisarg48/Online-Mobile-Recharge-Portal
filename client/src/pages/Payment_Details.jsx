import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Utils/API";

function Payment_Details() {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, transactionType, mobileNumber } = location.state || {};

    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const platformCharge = transactionType === "recharge" ? 10 : 0;
    const totalAmount = transactionType === "recharge" ? plan.price + platformCharge : plan;

    const handlePayment = async () => {
        setError("");
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
            setError("⚠ All fields are required!");
            return;
        }
        if (!/^\d{16}$/.test(cardNumber)) {
            setError("⚠ Card number must be 16 digits!");
            return;
        }
        if (!/^\d{3}$/.test(cvv)) {
            setError("⚠ CVV must be 3 digits!");
            return;
        }

        setLoading(true);
        try {
            const transaction_details = {
                mobile_number: transactionType === "recharge" ? mobileNumber : null,
                plan_id: transactionType === "recharge" ? plan._id : null,
                platformCharge: transactionType === "recharge" ? platformCharge : 0,
                amount_to_pay: totalAmount,
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                cvv: cvv,
                cardholderName: cardholderName,
                transactionType: transactionType,
            };
    
            // console.log("Sending transaction details:", transaction_details);
    
            const card_details = {
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                cvv: cvv,
                cardholderName: cardholderName,
            };
    
            const response = await API.post("/verify_card_details", transaction_details);
    
            if (response.data.success) {
                navigate("/otp-verification", {
                    state: { 
                        transaction_id: response.data.transaction_id, 
                        card_details: card_details,
                        transactionType: transactionType,
                    },
                    replace: true,
                });
                console.log(response.data);
            } else {
                throw new Error("Payment failed");
            }
        } catch (error) {
            console.error("Payment error:", error.response?.data || error.message);
            setError("⚠ Payment failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center bg-black">
            <div className="bg-black-800 p-8 rounded-lg shadow-lg text-white w-full max-w-lg border border-green-700">
                <h2 className="text-2xl mb-6 text-green-400 font-bold text-center">
                    {transactionType === "wallet" ? "Add Money to Wallet" : "Payment"}
                </h2>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2">Cardholder Name</label>
                    <input
                        type="text"
                        placeholder="Enter Name"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2">Card Number</label>
                    <input
                        type="text"
                        placeholder="XXXX XXXX XXXX XXXX"
                        maxLength="16"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="flex space-x-4 mb-4">
                    <div className="w-1/2">
                        <label className="block text-gray-400 text-sm mb-2">Expiry Date</label>
                        <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-gray-400 text-sm mb-2">CVV</label>
                        <input
                            type="text"
                            placeholder="XXX"
                            maxLength="3"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <p className="text-gray-300">Amount: <span className="text-green-400">₹{transactionType === "recharge" ? plan.price : plan}</span></p>
                    {transactionType === "recharge" && (
                        <>
                            <p className="text-gray-300">Platform Charge: <span className="text-green-400">₹{platformCharge}</span></p>
                            <p className="text-gray-300 font-bold">Total: <span className="text-green-400">₹{totalAmount}</span></p>
                        </>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200"
                >
                    {loading ? "Processing..." : "Pay Now"}
                </button>
            </div>
        </div>
    );
}

export default Payment_Details;