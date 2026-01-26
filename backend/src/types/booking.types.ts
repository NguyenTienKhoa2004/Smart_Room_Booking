export interface Booking {
    id: number;
    room_id: number;
    user_id: number;
    title: string;
    start_time: Date;
    end_time: Date;
    status: string;
    created_at: Date;
    updated_at: Date;
}

export interface BookingResponse {
    id: number;
    room_id: number;
    user_id: number;
    title: string;
    start_time: Date;
    end_time: Date;
    created_at: Date;
}

export interface CreateBookingDTO {
    room_id: number;
    user_id: number;
    title: string;
    start_time: Date;
    end_time: Date;
}
