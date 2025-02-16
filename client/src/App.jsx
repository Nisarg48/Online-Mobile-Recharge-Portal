import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"

function App() {
  const location = useLocation();

  const hideNavbarRoutes = ["/login", "/signup", "/forgot-password"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Outlet />
    </>
  )
}

export default App