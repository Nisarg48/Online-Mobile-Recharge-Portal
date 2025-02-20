import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaNetworkWired,
    FaExchangeAlt,
    FaQuestionCircle,
    FaSignOutAlt,
    FaSignInAlt,
    FaUserCircle,
    FaUserPlus,
    FaChevronDown,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const accessToken = localStorage.getItem("accessToken");

    const Logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate('/NetworkProvider', { replace: true });
    };

    return (
        <div className="bg-[#1e1e1e] fixed top-0 left-0 w-full shadow-lg z-50">
            <div className="container mx-auto flex justify-between items-center p-4">
                {/* Logo */}
                <div className="flex items-center">
                    <img src="/Logo.png" alt="Logo" className="w-8 h-8" />
                    <span className="ml-2 text-[#50c878] font-bold text-lg">M.R. Pay</span>
                </div>

                {/* Links (Center) */}
                <div className="flex space-x-6">
                    <Link
                        to="/NetworkProvider"
                        className="text-[#ffffff] hover:text-[#50c878] transition duration-300 rounded p-2 flex items-center"
                        title="Network Provider"
                    >
                        <FaNetworkWired size={20} />
                        <span className="ml-2">Network Provider</span>
                    </Link>
                    {accessToken &&
                        <Link
                            to="/transaction"
                            className="text-[#ffffff] hover:text-[#50c878] transition duration-300 rounded p-2 flex items-center"
                            title="Transactions"
                        >
                            <FaExchangeAlt size={20} />
                            <span className="ml-2">Transactions</span>
                        </Link>
                    }
                    <Link
                        to="/help"
                        className="text-[#ffffff] hover:text-[#50c878] transition duration-300 rounded p-2 flex items-center"
                        title="Help"
                    >
                        <FaQuestionCircle size={20} />
                        <span className="ml-2">Help</span>
                    </Link>
                </div>

                {/* Login/Logout/Profile (Right) */}
                <div className="flex space-x-6 relative">
                    {accessToken ? (
                        <>
                            <button
                                className="text-[#ffffff] hover:text-[#50c878] transition duration-300 rounded p-2 flex items-center"
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            >
                                <FaUserCircle size={20} />
                                <span className="ml-2">Profile</span>
                                <FaChevronDown size={15} className="ml-2" />
                            </button>
                            <AnimatePresence>
                                {showProfileDropdown && (
                                    <motion.div
                                        className="absolute top-12 right-0 bg-[#1e1e1e] rounded-lg shadow-lg w-48 overflow-hidden border border-[#333333]"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >

                                        <button
                                            className="w-full text-left px-4 py-2 text-[#ffffff] hover:bg-[#333333] transition duration-300"
                                            onClick={ () => navigate('/Profile') }
                                        >
                                            <CgProfile className="inline mr-2" />
                                            View Profile
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 text-[#ffffff] hover:bg-[#333333] transition duration-300"
                                            onClick={() => Logout()}
                                        >
                                            <FaSignOutAlt className="inline mr-2" />
                                            Logout
                                        </button>


                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <>
                            <Link
                                className="text-[#ffffff] hover:text-[#50c878] transition duration-300 rounded p-2 flex items-center"
                                to='/login'
                            >
                                <FaSignInAlt size={20} />
                                <span className="ml-2">Login</span>
                            </Link>
                            <Link
                                to="/signup"
                                className="text-[#ffffff] hover:text-[#50c878] transition duration-300 rounded p-2 flex items-center"
                            >
                                <FaUserPlus size={20} />
                                <span className="ml-2">Sign Up</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Navbar;