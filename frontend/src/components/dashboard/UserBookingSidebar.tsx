import React from 'react';
import type { Booking } from '../../types/room';

interface UserBookingSidebarProps {
    bookings: Booking[];
    onCancel: (bookingId: number) => void;
    isLoading: boolean;
}

const UserBookingSidebar = React.memo(({ bookings, onCancel, isLoading }: UserBookingSidebarProps) => {

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white h-full border-l border-gray-200 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Bookings</h2>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <div className="spinner-border animate-spin h-6 w-6 border-b-2 border-indigo-600 rounded-full"></div>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No upcoming bookings</p>
                </div>
            ) : (
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{booking.title || `Room ${booking.room_id}`}</h4>
                                    <p className="text-xs text-indigo-600 font-medium mb-1">Room {booking.room_id}</p>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(booking.start_time)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        to {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <button className="px-3 py-1 text-xs rounded-full text-white bg-linear-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 font-medium shadow-sm transition-all">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onCancel(booking.id)}
                                        className="px-3 py-1 text-xs rounded-full text-white bg-linear-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 font-medium shadow-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default UserBookingSidebar;
