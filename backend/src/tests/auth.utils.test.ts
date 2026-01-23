import { AuthUtils } from '../utils/auth.utils';
import jwt from 'jsonwebtoken';

describe('AuthUtils', () => {
    describe('hashPassword and comparePassword', () => {
        it('should hash a password and correctly compare it', async () => {
            const password = 'mySecretPassword';
            const hash = await AuthUtils.hashPassword(password);

            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(20);

            const isMatch = await AuthUtils.comparePassword(password, hash);
            expect(isMatch).toBe(true);

            const isNotMatch = await AuthUtils.comparePassword('wrongPassword', hash);
            expect(isNotMatch).toBe(false);
        });
    });

    describe('Tokens', () => {
        const payload = { userId: 1, email: 'test@example.com', role: 'user' };

        it('should generate and verify an access token', () => {
            const token = AuthUtils.generateAccessToken(payload);
            expect(token).toBeDefined();

            const decoded = AuthUtils.verifyToken(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });

        it('should generate and verify a refresh token', () => {
            const token = AuthUtils.generateRefreshToken(payload);
            expect(token).toBeDefined();

            const decoded = AuthUtils.verifyRefreshToken(token);
            expect(decoded.userId).toBe(payload.userId);
        });

        it('should throw error for invalid token', () => {
            expect(() => AuthUtils.verifyToken('invalid-token')).toThrow('Invalid or expired token');
        });

        it('should throw error for invalid refresh token', () => {
            expect(() => AuthUtils.verifyRefreshToken('invalid-token')).toThrow('Invalid or expired refresh token');
        });
    });

    describe('extractToken', () => {
        it('should extract token from Bearer string', () => {
            const authHeader = 'Bearer myToken123';
            const token = AuthUtils.extractToken(authHeader);
            expect(token).toBe('myToken123');
        });

        it('should return null for invalid Bearer string', () => {
            expect(AuthUtils.extractToken('NotBearer token')).toBeNull();
            expect(AuthUtils.extractToken(undefined)).toBeNull();
            expect(AuthUtils.extractToken('')).toBeNull();
        });
    });
});
