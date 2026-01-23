export interface User {
    id: number;
    email: string;
    password: string;
    full_name: string;
    role: 'user' | 'admin';
    created_at: Date;
    updated_at: Date;
}

export interface UserResponse {
    id: number;
    email: string;
    full_name: string;
    role: string;
    created_at: Date;
}

export interface RegisterDTO {
    email: string;
    password: string;
    full_name: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface JWTPayload {
    userId: number;
    email: string;
    role: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: UserResponse;
        accessToken: string;
        refreshToken: string;
    };
    message: string;
}