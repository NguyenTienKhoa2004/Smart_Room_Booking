import axios from 'axios';

let storeAccessToken: string | null = null;
let storeRefreshTokenFunction: (() => Promise<string | null>) | null = null;
let storeLogoutFunction: (() => void) | null = null;

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthTokens = (accessToken: string | null) => {
    storeAccessToken = accessToken;
};

export const setAuthCallbacks = (
    refreshTokenFunction: () => Promise<string | null>,
    logoutFunction: () => void
) => {
    storeRefreshTokenFunction = refreshTokenFunction;
    storeLogoutFunction = logoutFunction;
};

api.interceptors.request.use(
    (config) => {
        if (storeAccessToken) {
            config.headers.Authorization = `Bearer ${storeAccessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token'];
        const isAuthRequest = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

        if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            if (storeRefreshTokenFunction && storeLogoutFunction) {
                try {
                    const newAccessToken = await storeRefreshTokenFunction();
                    if (newAccessToken) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Refresh token failed, logging out:', refreshError);
                    storeLogoutFunction();
                }
            } else {
                console.warn('Auth callbacks not set for API interceptor.');
                if (storeLogoutFunction) {
                    storeLogoutFunction();
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;