import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../Utils/API";

function OTP_Verification() {
    const navigate = useNavigate();
    const location = useLocation();
    const { transaction_id, card_details, transactionType } = location.state;

    console.log(transaction_id);
    
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [timer, setTimer] = useState(300);
    const [error, setError] = useState("");

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    handleFailTransaction();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const handleBeforeUnload = () => {
            handleFailTransaction();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            clearInterval(countdown);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    });

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.includes("")) {
            setError("⚠ Please enter a complete OTP!");
            return;
        }
    
        try {
            const response = await API.post("/verify_otp", {
                transaction_id: transaction_id,
                otp: otp.join(""),
                card_details: card_details,
                transactionType: transactionType,
            });

            if (response.data.success) {
                navigate("/receipt", {   
                    state: { transaction_id: transaction_id },
                    replace: true
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || "OTP verification failed!");
        }
    };

    const handleFailTransaction = async () => {
        await API.post("/cancel_transaction", {
            transaction_id: transaction_id,
        });
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700 text-center">
                <h2 className="text-2xl mb-4 text-green-400 font-bold">OTP Verification</h2>
                <p className="text-gray-300 mb-2">OTP Sent To The Mobile Number Linked With Card Details</p>
                <p className="text-red-500 text-sm mb-2">⚠ Do not refresh this page!</p>
                <div className="flex justify-center space-x-2 mt-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            maxLength="1"
                            className="w-12 h-12 text-center text-lg border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                    ))}
                </div>
                <p className="text-gray-400 mt-4">
                    Time remaining: {Math.floor(timer / 60)}:
                    {(timer % 60).toString().padStart(2, "0")}
                </p>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button
                    onClick={handleVerifyOTP}
                    disabled={timer === 0}
                    className={`w-full mt-4 py-3 rounded-lg transition duration-200 ${timer === 0 ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"}`}
                >
                    {timer === 0 ? "OTP Expired" : "Verify OTP"}
                </button>
            </div>
        </div>
    );
}

export default OTP_Verification;