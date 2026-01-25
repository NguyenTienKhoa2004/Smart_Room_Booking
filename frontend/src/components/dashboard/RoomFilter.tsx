import React, { useEffect, useState } from 'react';
import { getAmenities } from '../../services/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import type { RoomFilterState } from '../../types/room';

interface RoomFilterProps {
    filters: RoomFilterState;
    onFilterChange: (newFilters: RoomFilterState) => void;
}

const RoomFilter: React.FC<RoomFilterProps> = ({ filters, onFilterChange }) => {
    const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const data = await getAmenities();
                setAvailableEquipment(data || []);
            } catch (error) {
                console.error('Failed to fetch equipment', error);
                // Fallback equipment if API fails locally without DB data
                setAvailableEquipment(['TV', 'Projector', 'Whiteboard', 'Conference Phone', 'Video Conferencing', 'Coffee Machine']);
            }
        };
        fetchEquipment();
    }, []);

    const handleAmenityChange = (amenity: string) => {
        const current = filters.equipment;
        const updated = current.includes(amenity)
            ? current.filter(a => a !== amenity)
            : [...current, amenity];
        onFilterChange({ ...filters, equipment: updated });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Rooms</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Time Picker */}
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date & Time</label>
                    <div className="flex space-x-2">
                        <DatePicker
                            selected={filters.start_time}
                            onChange={(date: Date | null) => onFilterChange({ ...filters, start_time: date || undefined })}
                            showTimeSelect
                            dateFormat="MM/dd/yyyy h:mm aa"
                            placeholderText="Start Time"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <span className="self-center text-gray-400">-</span>
                        <DatePicker
                            selected={filters.end_time}
                            onChange={(date: Date | null) => onFilterChange({ ...filters, end_time: date || undefined })}
                            showTimeSelect
                            dateFormat="MM/dd/yyyy h:mm aa"
                            placeholderText="End Time"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            minDate={filters.start_time}
                        />
                    </div>
                </div>

                {/* Capacity */}
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Min Capacity</label>
                    <input
                        type="number"
                        min="1"
                        value={filters.capacity || ''}
                        onChange={(e) => onFilterChange({ ...filters, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="e.g. 5"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>

                {/* Floor */}
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Floor</label>
                    <input
                        type="number"
                        value={filters.floor || ''}
                        onChange={(e) => onFilterChange({ ...filters, floor: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="e.g. 2"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Equipment */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-700 block mb-2">Equipment</label>
                <div className="flex flex-wrap gap-2">
                    {availableEquipment.map(item => (
                        <button
                            key={item}
                            onClick={() => handleAmenityChange(item)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.equipment.includes(item)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomFilter;
