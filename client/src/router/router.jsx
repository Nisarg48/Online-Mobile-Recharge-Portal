import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import NetworkProvider from "../pages/NetworkProvider";
import Transaction from "../pages/Transaction";
import Provider from "../pages/Provider";
import Help from "../pages/Help";
import Profile from "../pages/Profile";
import Terms from "../pages/terms_condition";
import Buy_Plan from "../components/Buy_Plan";
import Receipt from "../components/Receipt";

import React from "react";
import { Link } from "react-router-dom";

// 404 Page Component
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gray-900">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-400 mt-2">Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Go Home
      </Link>
    </div>
  );
}

// Router Configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <NetworkProvider /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/NetworkProvider/:provider", element: <Provider /> },
      { path: "/NetworkProvider/:provider/buy", element: <Buy_Plan /> },
      { path: "/transaction", element: <Transaction /> },
      { path: "/profile", element: <Profile /> },
      { path: "/help", element: <Help /> },
      { path: "/terms", element: <Terms /> },
      { path: "/receipt", element: <Receipt /> }, // Added Receipt Page Route
    ],
  },
  { path: "*", element: <NotFound /> }, // Handle 404 pages
]);

export default router;
