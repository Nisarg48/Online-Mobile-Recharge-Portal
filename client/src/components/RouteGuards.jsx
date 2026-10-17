/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import { getRoleFromToken, isAuthenticated } from "../Utils/auth";

export function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export function AdminRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    if (getRoleFromToken() !== "admin") {
        return <Navigate to="/NetworkProvider" replace />;
    }
    return children;
}
