export class ValidationUtils {
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password: string): { valid: boolean; message?: string } {
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }
        if (password.length > 100) {
            return { valid: false, message: 'Password is too long' };
        }
        return { valid: true };
    }

    static isValidName(name: string): boolean {
        return name.trim().length >= 2 && name.trim().length <= 100;
    }

    static sanitize(input: string): string {
        return input.trim();
    }

    static validateBookingId(id: unknown): asserts id is string {
        if (typeof id !== 'string' || id.trim() === '') {
            throw new Error('Invalid booking id');
        }
    }


}