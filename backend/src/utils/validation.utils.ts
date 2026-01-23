export class ValidationUtils {
    // Validate email format
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    static isValidPassword(password: string): { valid: boolean; message?: string } {
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }
        if (password.length > 100) {
            return { valid: false, message: 'Password is too long' };
        }
        return { valid: true };
    }

    // Validate full name
    static isValidName(name: string): boolean {
        return name.trim().length >= 2 && name.trim().length <= 100;
    }

    // Sanitize input
    static sanitize(input: string): string {
        return input.trim();
    }
}