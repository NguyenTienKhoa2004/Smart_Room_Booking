import api from './api';

export interface DashboardStats {
    bookings: {
        totalBookings: number;
        upcomingBookings: number;
        completedBookings: number;
        activeBookings: number;
        cancelledBookings: number;
    };
    users: {
        totalUsers: number;
        activeUsers: number;
        bannedUsers: number;
        adminUsers: number;
    };
    rooms: {
        totalRooms: number;
        averageCapacity: number;
        mostBookedRooms: Array<{
            roomId: number;
            roomName: string;
            bookingCount: number;
        }>;
    };
}

export const adminService = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await api.get('/admin/statistics/overview');
        return response.data.data;
    },

    getAllUsers: async (page: number = 1, limit: number = 10): Promise<UserResponse> => {
        const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
        return response.data.data;
    },

    banUser: async (userId: number): Promise<AdminUser> => {
        const response = await api.put(`/admin/users/${userId}/ban`);
        return response.data.data;
    },

    unbanUser: async (userId: number): Promise<AdminUser> => {
        const response = await api.put(`/admin/users/${userId}/unban`);
        return response.data.data;
    },

    uploadImageFromUrl: async (imageUrl: string): Promise<string> => {
        const response = await api.post('/admin/upload/url', { imageUrl });
        return response.data.data.imageUrl;
    },

    getAllRooms: async (): Promise<Room[]> => {
        const response = await api.get('/rooms');
        return response.data.data;
    },

    createRoom: async (roomData: Partial<Room>): Promise<Room> => {
        const response = await api.post('/rooms', roomData);
        return response.data.data;
    },

    deleteRoom: async (roomId: number): Promise<void> => {
        await api.delete(`/rooms/${roomId}`);
    }
};

export interface Room {
    id: number;
    name: string;
    capacity: number;
    floor: number;
    equipment: string[];
    image_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AdminUser {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_banned: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserResponse {
    users: AdminUser[];
    total: number;
    page: number;
    totalPages: number;
}
