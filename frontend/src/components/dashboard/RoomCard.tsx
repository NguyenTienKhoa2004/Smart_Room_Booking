import React from 'react';
import type { Room } from '../../types/room';

interface RoomCardProps {
    room: Room;
    onBook: (room: Room) => void;
}

const RoomCard = React.memo(({ room, onBook }: RoomCardProps) => {
    const getStatusColor = (status: Room['status']) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'in_use': return 'bg-red-100 text-red-800';
            case 'reserved': return 'bg-yellow-100 text-yellow-800';
            case 'maintenance': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const images = [
        '/benjamin-child-0sT9YhNgSEs-unsplash.jpg',
        '/benjamin-child-GWe0dlVD9e0-unsplash.jpg',
        '/danielle-cerullo-bIZJRVBLfOM-unsplash.jpg',
        '/s-o-c-i-a-l-c-u-t-1RT4txDDAbM-unsplash.jpg',
        '/vizito-visitor-management-L__MBAI3ucc-unsplash.jpg'
    ];
    const getRoomImage = (id: number) => images[id % images.length];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-row h-full">
            <div className="w-2/5 shrink-0 relative">
                <img src={getRoomImage(room.id)} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
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
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-slate-800 text-slate-800 shadow-sm">
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => onBook(room)}
                    disabled={room.status === 'in_use' || room.status === 'maintenance'}
                    className={`self-start py-2.5 px-6 border border-transparent rounded-full shadow-md hover:shadow-lg text-sm font-medium text-white mt-auto transition-all duration-300
                        ${room.status === 'available' ? 'bg-linear-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900' : 'bg-gray-300 cursor-not-allowed'}
                    `}
                >
                    {room.status === 'available' ? 'Book Now' : 'Unavailable'}
                </button>
            </div>
        </div>
    );
});

export default RoomCard;
