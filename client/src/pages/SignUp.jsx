
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

function SignUp() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = async (data) => {
        try {
            const response = await axios.post("http://localhost:5000/api/auth/signup", data);
            console.log("Signup Success:", response.data);
            alert("Account created successfully!");
            navigate("/login"); // Redirect to login page
        } catch (error) {
            console.error("Signup Error:", error.response.data);
            alert(error.response.data.message || "Signup failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212]">
            {/* Form Container */}
            <motion.div
                className="bg-[#1e1e1e] rounded-lg shadow-lg max-w-md w-full p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-4xl font-bold mb-6 text-center text-[#ffffff]">Sign Up</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Field */}
                    <div>
                        <label className="block mb-2 text-lg font-medium text-[#ffffff]">Name</label>
                        <input
                            type="text"
                            {...register("name", { required: "Name is required" })}
                            className="w-full px-4 py-3 text-sm rounded-lg border border-[#333333] bg-[#1e1e1e] text-[#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#50c878] transition-all"
                            placeholder="Enter your name"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
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
                            className="w-full px-4 py-3 text-sm rounded-lg border border-[#333333] bg-[#1e1e1e] text-[#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#50c878] transition-all"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Mobile Number Field */}
                    <div>
                        <label className="block mb-2 text-lg font-medium text-[#ffffff]">Mobile Number</label>
                        <input
                            type="text"
                            {...register("mobile_no", {
                                required: "Mobile number is required",
                                pattern: {
                                    value: /^[6-9]\d{9}$/,
                                    message: "Invalid mobile number",
                                },
                            })}
                            className="w-full px-4 py-3 text-sm rounded-lg border border-[#333333] bg-[#1e1e1e] text-[#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#50c878] transition-all"
                            placeholder="Enter your mobile number"
                        />
                        {errors.mobile_no && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.mobile_no.message}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block mb-2 text-lg font-medium text-[#ffffff]">Password</label>
                        <input
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters",
                                },
                            })}
                            className="w-full px-4 py-3 text-sm rounded-lg border border-[#333333] bg-[#1e1e1e] text-[#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#50c878] transition-all"
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Sign Up Button */}
                    <motion.button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white py-3 rounded-lg font-bold text-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Sign Up
                    </motion.button>

                    {/* Redirect to Login */}
                    <p className="text-center text-[#ffffff] mt-4">
                        Already have an account?&nbsp;
                        <Link to={"/login"} className="text-[#50c878] hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}

export default SignUp;