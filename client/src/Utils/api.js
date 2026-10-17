import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:4848/Mobile-Recharge-Portal",
});

// Request interceptor to add the access token
API.interceptors.request.use((req) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) req.headers.Authorization = `Bearer ${accessToken}`;
    return req;
});

// Response interceptor to handle expired access tokens
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Call your refresh token endpoint
                    const { data } = await axios.post(
                        "http://localhost:4848/Mobile-Recharge-Portal/auth/refresh-token",
                        { refreshToken }
                    );
                    // Update tokens in local storage (refresh token is rotated by the server)
                    localStorage.setItem('accessToken', data.accessToken);
                    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
                    originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                    return axios(originalRequest);
                } catch (refreshError) {
                    console.error("Refresh token error:", refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default API;
