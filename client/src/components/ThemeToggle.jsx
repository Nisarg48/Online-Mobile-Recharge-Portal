/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { getTheme, applyTheme } from "../Utils/theme";

function ThemeToggle({ className = "" }) {
    const [theme, setTheme] = useState(getTheme());

    const toggle = () => {
        const next = theme === "dark" ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-[#333333] hover:text-[#50c878] ${className}`}
        >
            {theme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
    );
}

export default ThemeToggle;
