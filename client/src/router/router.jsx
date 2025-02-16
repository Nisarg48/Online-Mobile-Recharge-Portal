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
import Forgot_Password from "../pages/Forgot_Password";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Login />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/forgot-password",
                element: <Forgot_Password />,
            },
            {
                path: "/signup",
                element: <SignUp />,
                
            },
            {
                path: "/NetworkProvider",
                element: <NetworkProvider />,
            },
            {
                path: "/NetworkProvider/:provider",
                element: <Provider/>,
            },
            {
                path: "/NetworkProvider/:provider/buy",
                element: <Buy_Plan />,
            },
            {
                path: "/transaction",
                element: <Transaction />,
            },
            {
                path: "/Profile",
                element: <Profile />,
            },
            {
                path: "/help",
                element: <Help />,
            },
            {
                path: "/terms",
                element: <Terms />,
            }
        ],
    },
]);

export default router;
