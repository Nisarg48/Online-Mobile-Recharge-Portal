import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import NetworkProvider from "../pages/NetworkProvider";
import Transaction from "../pages/Transaction";
import Provider from "../pages/Provider";
import Help from "../pages/Help";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <NetworkProvider />,
            },
            {
                path: "/NetworkProvider/:provider",
                element: <Provider/>,
            },
            {
                path: "/transaction",
                element: <Transaction />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/signup",
                element: <SignUp />,
            },
            {
                path: "/help",
                element: <Help />,
            },

        ],
    },
]);

export default router;
