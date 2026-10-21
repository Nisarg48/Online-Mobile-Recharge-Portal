import { Link, useLocation } from "react-router-dom";
import {
    FaHome,
    FaExchangeAlt,
    FaWallet,
    FaSignInAlt,
    FaQuestionCircle,
} from "react-icons/fa";

function MobileNav() {
    const location = useLocation();
    const accessToken = localStorage.getItem("accessToken");

    const items = [
        { to: "/NetworkProvider", icon: <FaHome size={18} />, label: "Home", show: true },
        { to: "/Transaction", icon: <FaExchangeAlt size={18} />, label: "History", show: !!accessToken },
        { to: "/Profile", icon: <FaWallet size={18} />, label: "Wallet", show: !!accessToken },
        { to: "/login", icon: <FaSignInAlt size={18} />, label: "Login", show: !accessToken },
        { to: "/Help", icon: <FaQuestionCircle size={18} />, label: "Help", show: true },
    ];

    return (
        <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-[#333333] bg-[#1e1e1e] shadow-[0_-2px_10px_rgba(0,0,0,0.3)] md:hidden">
            <div className="flex">
                {items
                    .filter((item) => item.show)
                    .map((item) => {
                        const active =
                            location.pathname === item.to ||
                            location.pathname.startsWith(`${item.to}/`);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition ${
                                    active
                                        ? "text-[#50c878]"
                                        : "text-[#cfcfcf] hover:text-[#50c878]"
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
            </div>
        </nav>
    );
}

export default MobileNav;
