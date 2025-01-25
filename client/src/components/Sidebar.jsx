/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FaBars,
    FaTimes,
    FaNetworkWired,
    FaExchangeAlt,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt,
    FaSignInAlt,
    FaUserCircle,
    FaUserPlus,
} from "react-icons/fa";

function Sidebar({ isOpen, toggleSidebar }) {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    return (
        <div
            className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#50c878] to-[#3a53c7] z-10 transition-all duration-300 ${
                isOpen ? "w-64" : "w-16"
            }`}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    <img
                        src="/Logo.png"
                        alt="Logo"
                        className={`w-8 h-8 transition-all duration-300 ${isOpen ? "block" : "hidden"}`}
                    />
                    <span
                        className={`ml-2 text-white font-bold text-lg transition-all duration-300 ${
                            isOpen ? "block" : "hidden"
                        }`}
                    >
                        M.R. Pay
                    </span>
                </div>
                <button
                    className="text-white"
                    onClick={toggleSidebar}
                >
                    {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col p-4 space-y-5">
                <Link
                    to="/"
                    className="text-white hover:bg-white hover:text-black transition duration-300 rounded p-1 flex items-center hover:scale-105"
                    title="Dashboard"
                >
                    <FaNetworkWired size={25} />
                    <span className={`ml-2 font-semibold ${isOpen ? "block" : "hidden"}`}>
                        Network Provider
                    </span>
                </Link>

                <Link
                    to="/transaction"
                    className="text-white hover:bg-white hover:text-black transition duration-300 rounded p-1 flex items-center hover:scale-105"
                    title="Transactions"
                >
                    <FaExchangeAlt size={25} />
                    <span className={`ml-2 font-semibold ${isOpen ? "block" : "hidden"}`}>
                        Transactions
                    </span>
                </Link>

                <Link
                    to="/settings"
                    className="text-white hover:bg-white hover:text-black transition duration-300 rounded p-1 flex items-center hover:scale-105"
                    title="Settings"
                >
                    <FaCog size={25} />
                    <span className={`ml-2 font-semibold ${isOpen ? "block" : "hidden"}`}>
                        Settings
                    </span>
                </Link>

                <Link
                    to="/help"
                    className="text-white hover:bg-white hover:text-black transition duration-300 rounded p-1 flex items-center hover:scale-105"
                    title="Help"
                >
                    <FaQuestionCircle size={25} />
                    <span className={`ml-2 font-semibold ${isOpen ? "block" : "hidden"}`}>
                        Help
                    </span>
                </Link>
            </nav>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                {isLoggedIn ? (
                    <div className="flex flex-col space-y-5">
                        <button
                            className="w-full text-white hover:bg-white hover:text-black transition duration-300 rounded p-1 flex items-center hover:scale-105"
                            onClick={() => setIsLoggedIn(false)}
                        >
                            <FaUserCircle size={25} />
                            <span className={`ml-2 font-semibold ${isOpen ? "block" : "hidden"}`}>
                                Profile
                            </span>
                        </button>
                        <button
                            className="w-full text-white hover:bg-white hover:text-black transition duration-300 rounded p-1 flex items-center hover:scale-105"
                            onClick={() => setIsLoggedIn(false)}
                        >
                            <FaSignOutAlt size={25} />
                            <span className={`ml-2 font-semibold ${isOpen ? "block" : "hidden"}`}>
                                Logout
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-5">
                        <button
                            className="w-full text-white hover:bg-white hover:text-black transition duration-300 rounded p-1 flex items-center hover:scale-105"
                            onClick={() => setIsLoggedIn(true)}
                        >
                            <FaSignInAlt size={25} />
                            <span className={`ml-2 font-semibold ${isOpen ? "block" : "hidden"}`}>
                                Login
                            </span>
                        </button>
                        <Link
                            to="/signup"
                            className="w-full text-white hover:bg-white hover:text-black transition duration-300 rounded p-1 flex items-center hover:scale-105"
                        >
                            <FaUserPlus size={25} />
                            <span className={`ml-2 font-semibold ${isOpen ? "block" : "hidden"}`}>
                                Sign Up
                            </span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;

// use case
// sequence diagram
// class diagram
// system architecture