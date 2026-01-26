import React, { createContext, useContext, useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    // We can add more functionality here if needed
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, accessToken } = useAuth();
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (user && accessToken) {
            // Initialize SSE connection
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
            const url = `${baseUrl}/notifications/subscribe?token=${accessToken}`;

            console.log('Connecting to SSE...');
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.addEventListener('booking_confirmed', (event) => {
                const data = JSON.parse(event.data);
                toast.success(data.message, {
                    duration: 5000,
                    position: 'top-right',
                });
            });

            eventSource.addEventListener('booking_reminder', (event) => {
                const data = JSON.parse(event.data);
                toast(data.message, {
                    icon: '⏰',
                    duration: 10000,
                    position: 'top-right',
                    style: {
                        border: '1px solid #713200',
                        padding: '16px',
                        color: '#713200',
                    },
                });
            });

            eventSource.onopen = () => {
                console.log('SSE connected');
            };

            eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                // EventSource will automatically retry, but we might want to close if unauthorized
            };

            return () => {
                console.log('Closing SSE connection');
                eventSource.close();
                eventSourceRef.current = null;
            };
        }
    }, [user, accessToken]);

    return (
        <NotificationContext.Provider value={{}}>
            <Toaster />
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
