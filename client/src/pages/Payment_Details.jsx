import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Utils/API";

function Payment_Details() {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, mobileNumber } = location.state || {};

    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const platformCharge = 10; 
    const totalAmount = plan.price + platformCharge;

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
                mobile_number: mobileNumber,
                plan_id: plan._id,
                platformCharge: platformCharge,
                amount_to_pay: totalAmount,
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                cvv: cvv,
                cardholderName: cardholderName,
            }

            const response = await API.post("/verify_card_details", transaction_details);

            if (response.data.success) {
                navigate("/otp-verification", {
                    state: { transaction_id: response.data.transaction_id },
                    replace: true
                });
                console.log(response.data);
            } else {
                throw new Error("Payment failed");
            }
        } catch (error) {
            setError("⚠ Payment failed. Please check your details.");
            setLoading(false);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-white w-full max-w-lg border border-gray-700">
                <h2 className="text-2xl mb-6 text-green-400 font-bold text-center">Payment</h2>
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
                    <p className="text-gray-300">Amount: <span className="text-green-400">₹{plan.price}</span></p>
                    <p className="text-gray-300">Platform Charge: <span className="text-green-400">₹{platformCharge}</span></p>
                    <p className="text-gray-300 font-bold">Total: <span className="text-green-400">₹{totalAmount}</span></p>
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