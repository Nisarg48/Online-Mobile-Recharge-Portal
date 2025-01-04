import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Icon from "../pakages/Icon";

function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <div className="min-h-screen 
                        bg-gradient-to-br
                        from-bg-bg1
                        via-bg-bg2 
                        via-bg-bg3
                        via-bg-bg4
                        via-bg-bg5
                        to-bg-bg6
                        flex 
                        items-center
                        justify-center
                        px-4
                        relative
                        z-0">

            <div className="absolute inset-0 z-0">
                <Icon />
            </div>

            <div className="bg-white text-black rounded-lg shadow-lg max-w-md w-full p-8 border-4 z-10">
                <h2 className="text-3xl font-semibold mb-6 text-center">Login</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Email Field */}
                    <div>
                        <label className="block mb-2 text-md font-medium text-gray-900">Email</label>
                        <input
                            type="email"
                            {...register("email", { 
                                required: "Email is required", 
                                pattern: { 
                                    value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, 
                                    message: "Invalid email address" 
                                }
                            })}
                            className="w-full px-4 py-3 text-sm rounded-lg border-2 border-bg-bg8 border-opacity-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-bg-bg7 transition-all"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block mb-2 text-md font-medium text-gray-900">Password</label>
                        <input
                            type="password"
                            {...register("password", { 
                                required: "Password is required", 
                                minLength: { value: 6, message: "Password must be at least 6 characters" }
                            })}
                            className="w-full px-4 py-3 text-sm rounded-lg border-2 border-bg-bg8 border-opacity-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-bg-bg7 transition-all"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-bg-bg8 text-white py-3 rounded-lg font-bold text-md border-2 border-black shadow-md hover:shadow-lg transition-all hover:bg-bg-bg7 hover:text-black"
                    >
                        Login
                    </button>

                    <p className="flex justify-center">Don&apos;t have account? &nbsp;
                        <Link to={"/signup"} className="text-blue-500 hover:underline">Create New Account</Link>
                    </p>

                </form>
            </div>
        </div>
    );
}

export default Login;