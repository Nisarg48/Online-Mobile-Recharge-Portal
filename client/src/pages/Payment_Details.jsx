import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Utils/api";
import { toast } from "../Utils/toast";

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
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const platformCharge = transactionType === "recharge" ? 10 : 0;
    const totalAmount = transactionType === "recharge" ? plan.price + platformCharge : plan;
    const payableAmount = appliedCoupon ? appliedCoupon.finalAmount : totalAmount;

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setApplyingCoupon(true);
        setCouponError("");
        try {
            const { data } = await API.post("/coupon/validate", {
                code: couponCode.trim(),
                plan_id: plan._id,
            });
            setAppliedCoupon(data);
            toast.success(`Coupon applied — you saved ₹${data.discount}`);
        } catch (err) {
            setAppliedCoupon(null);
            setCouponError(err.response?.data?.message || "Could not apply this coupon.");
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

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
                amount_to_pay: payableAmount,
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                cvv: cvv,
                cardholderName: cardholderName,
                transactionType: transactionType,
                coupon_code: appliedCoupon?.code || null,
            };
    
            const response = await API.post("/verify_card_details", transaction_details);
    
            if (response.data.success) {
                navigate("/otp-verification", {
                    state: { 
                        transaction_id: response.data.transaction_id, 
                        card_details: {
                            cardNumber: cardNumber,
                            expiryDate: expiryDate,
                            cvv: cvv,
                            cardholderName: cardholderName,
                        },
                        transactionType: transactionType,
                    },
                    replace: true,
                });
            } else {
                throw new Error("Payment failed");
            }
        } catch (error) {
            console.error("Payment error:", error.response?.data || error.message);
            setError(
                `⚠ ${error.response?.data?.message || "Payment failed. Please check your details."}`
            );
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
                {transactionType === "recharge" && (
                    <div className="mb-4 rounded-lg border border-gray-600 bg-gray-800 p-3">
                        <label className="mb-2 block text-sm text-gray-400">
                            Have a coupon?
                        </label>
                        {appliedCoupon ? (
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-green-400">
                                        {appliedCoupon.code}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {appliedCoupon.description || "Coupon applied"} — you saved ₹
                                        {appliedCoupon.discount}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeCoupon}
                                    className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. WELCOME10"
                                    className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={applyCoupon}
                                    disabled={applyingCoupon || !couponCode.trim()}
                                    className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                                >
                                    {applyingCoupon ? "..." : "Apply"}
                                </button>
                            </div>
                        )}
                        {couponError && (
                            <p className="mt-2 text-xs text-red-400">{couponError}</p>
                        )}
                    </div>
                )}
                <div className="mb-4">
                    <p className="text-gray-300">Amount: <span className="text-green-400">₹{transactionType === "recharge" ? plan.price : plan}</span></p>
                    {transactionType === "recharge" && (
                        <>
                            <p className="text-gray-300">Platform Charge: <span className="text-green-400">₹{platformCharge}</span></p>
                            {appliedCoupon && (
                                <p className="text-gray-300">
                                    Discount ({appliedCoupon.code}):{" "}
                                    <span className="text-green-400">−₹{appliedCoupon.discount}</span>
                                </p>
                            )}
                            <p className="text-gray-300 font-bold">Total: <span className="text-green-400">₹{payableAmount}</span></p>
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