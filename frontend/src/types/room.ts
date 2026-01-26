export interface Room {
    id: number;
    name: string;
    floor: number;
    capacity: number;
    equipment: string[];
    image_url?: string;
    status: 'available' | 'in_use' | 'reserved' | 'maintenance';
}

export interface Booking {
    id: number;
    room_id: number;
    title: string;
    start_time: string;
    end_time: string;
    user_id: number;
    created_at: string;
}

export interface RoomFilterState {
    capacity?: number;
    equipment: string[];
    start_time?: Date;
    end_time?: Date;
    floor?: number;
}
