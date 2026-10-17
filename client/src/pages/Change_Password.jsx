import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../Utils/api";

function Change_Password() {
    const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await API.put("/user/changePassword", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            alert(response.data.message);
            reset();
            navigate("/Profile", { replace: true });
        } catch (error) {
            alert(error.response?.data?.message || "Could not change password.");
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
                <h2 className="text-3xl font-bold mb-6 text-center text-[#ffffff]">Change Password</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-lg font-medium text-[#ffffff]">Current Password</label>
                        <input
                            type="password"
                            {...register("currentPassword", { required: "Current password is required" })}
                            className={inputClass}
                            placeholder="Enter current password"
                        />
                        {errors.currentPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 text-lg font-medium text-[#ffffff]">New Password</label>
                        <input
                            type="password"
                            {...register("newPassword", {
                                required: "New password is required",
                                minLength: { value: 8, message: "Password must be at least 8 characters" },
                            })}
                            className={inputClass}
                            placeholder="Enter new password"
                        />
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 text-lg font-medium text-[#ffffff]">Confirm New Password</label>
                        <input
                            type="password"
                            {...register("confirmPassword", {
                                required: "Please confirm your new password",
                                validate: (value) =>
                                    value === getValues("newPassword") || "Passwords do not match",
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
                        {loading ? "Updating..." : "Update Password"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

export default Change_Password;
