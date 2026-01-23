import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types/user.types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
const REFRESH_TOKEN_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export class AuthUtils {
    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    static generateAccessToken(payload: JWTPayload): string {
        return jwt.sign({ ...payload }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
    }

    static generateRefreshToken(payload: JWTPayload): string {
        return jwt.sign({ ...payload }, REFRESH_TOKEN_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });
    }

    static verifyToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    static verifyRefreshToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    static extractToken(authHeader: string | undefined): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }
}