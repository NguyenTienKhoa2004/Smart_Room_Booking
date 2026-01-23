import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthTokens, setAuthCallbacks } from '../services/api';

interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (accessToken: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
    isAuthenticating: boolean;
    refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const logout = useCallback(async () => {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setAuthTokens(null);
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Failed to clear refresh token cookie on logout:', error);
        }
    }, []);

    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
        setIsAuthenticating(true);
        try {
            const response = await api.post('/auth/refresh-token');
            const newAccessToken = response.data.data.accessToken;
            if (newAccessToken) {
                setAccessToken(newAccessToken);
                localStorage.setItem('accessToken', newAccessToken);
                setAuthTokens(newAccessToken);
                return newAccessToken;
            }
            return null;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            logout();
            return null;
        } finally {
            setIsAuthenticating(false);
        }
    }, [logout, setAccessToken]);

    useEffect(() => {
        setAuthCallbacks(refreshAccessToken, logout);
    }, [refreshAccessToken, logout]);


    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (storedAccessToken && storedUser) {
                setAccessToken(storedAccessToken);
                setAuthTokens(storedAccessToken);
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    setAuthTokens(null);
                }

                const refreshedToken = await refreshAccessToken();
                if (!refreshedToken) {
                    logout();
                }
            } else {
                setAuthTokens(null);
            }

            setIsLoading(false);
        };

        initAuth();
    }, [refreshAccessToken, logout]);

    const login = (newAccessToken: string, newUser: User) => {
        setAccessToken(newAccessToken);
        setUser(newUser);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setAuthTokens(newAccessToken);
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading, isAuthenticating, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
