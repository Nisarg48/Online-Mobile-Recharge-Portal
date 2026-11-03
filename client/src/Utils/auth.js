import API from "./api";

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
    const accessToken = localStorage.getItem("accessToken");

    // Clear local state first so the UI logs out immediately.
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");

    // Also invalidate the server-side refresh token so it can't be reused.
    // Best effort: pass the captured token explicitly since storage is now empty.
    if (accessToken) {
        API.post("/auth/logout", null, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => {});
    }
};
