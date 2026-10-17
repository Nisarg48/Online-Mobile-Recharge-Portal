import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../Utils/api";

function Forgot_Password() {
    const { register, handleSubmit, formState: { errors }, getValues } = useForm();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const requestCode = async (data) => {
        setLoading(true);
        try {
            const response = await API.post("/auth/forgot-password", { email: data.email });
            setEmail(data.email);
            setStep(2);
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (data) => {
        setLoading(true);
        try {
            const response = await API.post("/auth/reset-password", {
                email,
                token: data.token,
                newPassword: data.password,
            });
            alert(response.data.message);
            navigate("/login", { replace: true });
        } catch (error) {
            alert(error.response?.data?.message || "Invalid or expired reset code.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 text-sm rounded-lg border border-[#333333] bg-[#1e1e1e] text-[#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#50c878] transition-all";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212]">
            <motion.div
                className="bg-[#1e1e1e] rounded-lg shadow-lg max-w-md w-full p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-4xl font-bold mb-6 text-center text-[#ffffff]">
                    {step === 1 ? "Reset Password" : "Enter Reset Code"}
                </h2>

                {step === 1 ? (
                    <form onSubmit={handleSubmit(requestCode)} className="space-y-6">
                        <div>
                            <label className="block mb-2 text-lg font-medium text-[#ffffff]">Email</label>
                            <input
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                                        message: "Invalid email address",
                                    },
                                })}
                                className={inputClass}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white py-3 rounded-lg font-bold text-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {loading ? "Sending..." : "Send Reset Code"}
                        </motion.button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit(resetPassword)} className="space-y-6">
                        <p className="text-sm text-gray-400 text-center">
                            Enter the code sent to <span className="text-[#50c878]">{email}</span> and your new password.
                        </p>
                        <div>
                            <label className="block mb-2 text-lg font-medium text-[#ffffff]">Reset Code</label>
                            <input
                                type="text"
                                {...register("token", { required: "Reset code is required" })}
                                className={inputClass}
                                placeholder="Paste the code from your email"
                            />
                            {errors.token && (
                                <p className="text-red-500 text-sm mt-1">{errors.token.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-lg font-medium text-[#ffffff]">New Password</label>
                            <input
                                type="password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                                })}
                                className={inputClass}
                                placeholder="Enter new password"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-lg font-medium text-[#ffffff]">Confirm Password</label>
                            <input
                                type="password"
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === getValues("password") || "Passwords do not match",
                                })}
                                className={inputClass}
                                placeholder="Re-enter new password"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white py-3 rounded-lg font-bold text-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </motion.button>
                    </form>
                )}

                <button
                    type="button"
                    className="w-full text-[#50c878] hover:underline mt-4"
                    onClick={() => navigate("/login", { replace: true })}
                >
                    Back to Login
                </button>
            </motion.div>
        </div>
    );
}

export default Forgot_Password;
