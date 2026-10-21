import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";

const Layout = () => {
    return (
        <>
            <Navbar />
            {/* pt clears the fixed top navbar; pb clears the mobile bottom nav */}
            <div className="pt-20 pb-24 md:pb-0">
                <Outlet />
            </div>
            <MobileNav />
        </>
    );
};

export default Layout;
