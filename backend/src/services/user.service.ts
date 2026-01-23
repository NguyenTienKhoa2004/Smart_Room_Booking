import db from '../config/database';
import { AuthUtils } from '../utils/auth.utils';
import { ValidationUtils } from '../utils/validation.utils';
import { User, UserResponse, RegisterDTO, LoginDTO, AuthResponse } from '../types/user.types';

export class UserService {
    static async register(data: RegisterDTO): Promise<AuthResponse> {
        const { email, password, full_name } = data;

        if (!ValidationUtils.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        const passwordCheck = ValidationUtils.isValidPassword(password);
        if (!passwordCheck.valid) {
            throw new Error(passwordCheck.message);
        }

        if (!ValidationUtils.isValidName(full_name)) {
            throw new Error('Full name must be between 2 and 100 characters');
        }

        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await AuthUtils.hashPassword(password);

        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, full_name, role, created_at`,
            [email.toLowerCase(), hashedPassword, full_name.trim(), 'user']
        );

        const user = result.rows[0];

        const accessToken = AuthUtils.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = AuthUtils.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    created_at: user.created_at,
                },
                accessToken,
                refreshToken,
            },
            message: 'User registered successfully',
        };
    }

    static async login(data: LoginDTO): Promise<AuthResponse> {
        const { email, password } = data;

        if (!ValidationUtils.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (!password) {
            throw new Error('Password is required');
        }

        const result = await db.query(
            'SELECT id, email, password_hash, full_name, role, created_at FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            throw new Error('Invalid email or password');
        }

        const user = result.rows[0];

        const isPasswordValid = await AuthUtils.comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const accessToken = AuthUtils.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = AuthUtils.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    created_at: user.created_at,
                },
                accessToken,
                refreshToken,
            },
            message: 'Login successful',
        };
    }

    static async getUserById(userId: number): Promise<UserResponse> {
        const result = await db.query(
            'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        return result.rows[0];
    }

    static async getProfile(userId: number): Promise<UserResponse> {
        return this.getUserById(userId);
    }
}