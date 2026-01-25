import React from 'react';
import type { Room } from '../../types/room';

interface RoomCardProps {
    room: Room;
    onBook: (room: Room) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onBook }) => {
    const getStatusColor = (status: Room['status']) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'in_use': return 'bg-red-100 text-red-800';
            case 'reserved': return 'bg-yellow-100 text-yellow-800';
            case 'maintenance': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-500">Floor {room.floor}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)} capitalize`}>
                        {room.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {room.capacity} People
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                        {room.equipment.map((amenity, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Mini Availability Timeline - Visual Mockup */}
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Today's Availability</p>
                    <div className="h-2 bg-gray-100 rounded-full flex overflow-hidden">
                        {/* Simulating slots: 08:00 - 18:00 */}
                        <div className="w-1/4 bg-green-400" title="08:00 - 10:30 (Free)"></div>
                        <div className="w-1/6 bg-red-400" title="10:30 - 12:00 (Booked)"></div>
                        <div className="w-1/4 bg-green-400" title="12:00 - 14:30 (Free)"></div>
                        <div className="w-1/3 bg-gray-200" title="14:30 - 18:00 (Unknown)"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>8AM</span>
                        <span>12PM</span>
                        <span>6PM</span>
                    </div>
                </div>

                <button
                    onClick={() => onBook(room)}
                    disabled={room.status === 'in_use' || room.status === 'maintenance'}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${room.status === 'available' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-400 cursor-not-allowed'}
                    `}
                >
                    {room.status === 'available' ? 'Book Now' : 'Unavailable'}
                </button>
            </div>
        </div>
    );
};

export default RoomCard;
