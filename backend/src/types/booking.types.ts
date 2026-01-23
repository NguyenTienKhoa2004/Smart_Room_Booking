export interface Booking {
    id: number;
    room_id: number;
    start_time: Date;
    end_time: Date;
    user_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface BookingResponse {
    id: number;
    room_id: number;
    start_time: Date;
    end_time: Date;
    user_id: number;
    created_at: Date;
}

export interface CreateBookingDTO {
    room_id: number;
    start_time: Date;
    end_time: Date;
    user_id: number;
}
