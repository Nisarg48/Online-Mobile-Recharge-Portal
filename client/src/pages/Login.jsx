import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Icon from "../pakages/Icon";

function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-teal-500 via-green-300 to-blue-400 overflow-hidden">

            <div className="absolute inset-0 z-0">
                <Icon />
            </div>

            {/* Dynamic Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-16 left-24 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-16 right-24 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                <Icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] opacity-20 blur-md" />
            </div>

            {/* Form Container */}
            <div className="backdrop-blur-md bg-white/60 text-black rounded-lg shadow-lg max-w-md w-full p-8 border border-white/30 z-10">
                <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label className="block mb-2 text-lg font-medium text-gray-800">Email</label>
                        <input
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                                    message: "Invalid email address",
                                },
                            })}
                            className="w-full px-4 py-3 text-sm rounded-lg border-[1px] border-white/50 bg-white/20 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
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
                        <label className="block mb-2 text-lg font-medium text-gray-800">Password</label>
                        <input
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters",
                                },
                            })}
                            className="w-full px-4 py-3 text-sm rounded-lg border-[1px] border-white/50 bg-white/20 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-400 to-blue-400 text-white py-3 rounded-lg font-bold text-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                    >
                        Login
                    </button>

                    {/* Redirect to Signup */}
                    <p className="text-center text-gray-700 mt-4">
                        Don&apos;t have an account?&nbsp;
                        <Link to={"/signup"} className="text-teal-300 hover:underline">
                            Create New Account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;

