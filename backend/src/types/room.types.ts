export interface Room {
    id: number;
    name: string;
    floor: number;
    capacity: number;
    equipment: string[];
    image_url?: string;
    status: 'available' | 'in_use' | 'reserved' | 'maintenance';
}

export interface RoomFilter {
    capacity?: number;
    equipment?: string[];
    start_time?: string;
    end_time?: string;
    floor?: number;
}
