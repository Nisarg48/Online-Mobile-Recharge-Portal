import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../Utils/API";

function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const response = await API.post("/auth/login", data);
            console.log("Login Success:", response.data);

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            navigate("/NetworkProvider", { replace: true });
        } catch (error) {
            console.error("Login Error:", error.response?.data);
            alert(error.response?.data.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212]">
            <motion.div
                className="bg-[#1e1e1e] rounded-lg shadow-lg max-w-md w-full p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-4xl font-bold mb-6 text-center text-[#ffffff]">Login</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                    {/* Password Field */}
                    <div>
                        <label className="block mb-2 text-lg font-medium text-[#ffffff]">Password</label>
                        <input
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 6 characters",
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

                    {/* Login Button */}
                    <motion.button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white py-3 rounded-lg font-bold text-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Login
                    </motion.button>

                    {/* Redirect to Signup */}
                    <p className="text-center text-[#ffffff] mt-4">
                        Don&apos;t have an account?&nbsp;
                        <Link to={"/signup"} className="text-[#50c878] hover:underline">
                            Create New Account
                        </Link>
                    </p>

                    {/* Forgot Password */}
                    <div className="text-center">
                        <Link 
                            to={"/forgot-password"} 
                            className="text-[#50c878] hover:underline"
                            aria-label="Reset your password"
                        >
                            Reset Password
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default Login;