// Reads the role from the (unsigned) JWT payload for client-side UI gating.
// Server-side authorization is always enforced independently.
export const getRoleFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split(".")[1])).role || "user";
    } catch {
        return null;
    }
};

export const isAuthenticated = () => Boolean(localStorage.getItem("accessToken"));

export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
};
