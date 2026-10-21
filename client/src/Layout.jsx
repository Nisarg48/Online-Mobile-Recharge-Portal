import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";

const Layout = () => {
    return (
        <>
            <Navbar />
            {/* Extra bottom padding on mobile so the fixed bottom nav doesn't cover content */}
            <div className="pb-16 md:pb-0">
                <Outlet />
            </div>
            <MobileNav />
        </>
    );
};

export default Layout;
