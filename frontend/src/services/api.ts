import axios from 'axios';
import type { Room, RoomFilterState, Booking } from '../types/room';

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

export const getRooms = async (filters: RoomFilterState) => {
    const params: any = {};
    if (filters.capacity) params.capacity = filters.capacity;
    if (filters.floor) params.floor = filters.floor;
    if (filters.equipment.length > 0) params.equipment = filters.equipment.join(',');
    if (filters.start_time) params.start_time = filters.start_time.toISOString();
    if (filters.end_time) params.end_time = filters.end_time.toISOString();

    const response = await api.get<{ data: Room[] }>('/rooms', { params });
    return response.data.data;
};

export const getAmenities = async () => {
    const response = await api.get<{ data: string[] }>('/rooms/equipment');
    return response.data.data;
};

export const getUserBookings = async () => {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
};

export const cancelBooking = async (id: number) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
};

export const createBooking = async (data: { room_id: number, start_time: string, end_time: string }) => {
    const response = await api.post('/bookings', data);
    return response.data;
};

export default api;