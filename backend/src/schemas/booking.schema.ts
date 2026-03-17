import { z } from 'zod';

const isoDateString = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Must be a valid ISO date string (e.g. 2025-01-01T09:00:00Z)',
    });

export const createBookingSchema = z
    .object({
        room_id: z
            .number({ error: 'room_id must be a number' })
            .int('room_id must be an integer')
            .positive('room_id must be a positive number'),

        title: z
            .string({ error: 'title is required' })
            .trim()
            .min(1, 'title cannot be empty')
            .max(100, 'title must be at most 100 characters'),

        start_time: isoDateString,

        end_time: isoDateString,
    })
    .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
        message: 'end_time must be after start_time',
        path: ['end_time'],
    })
    .refine((data) => new Date(data.start_time) > new Date(), {
        message: 'start_time cannot be in the past',
        path: ['start_time'],
    });

export const updateBookingSchema = z
    .object({
        room_id: z
            .number({ error: 'room_id must be a number' })
            .int('room_id must be an integer')
            .positive('room_id must be a positive number'),

        title: z
            .string({ error: 'title must be a string' })
            .trim()
            .min(1, 'title cannot be empty')
            .max(100, 'title must be at most 100 characters'),

        start_time: isoDateString,

        end_time: isoDateString,
    })
    .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
        message: 'end_time must be after start_time',
        path: ['end_time'],
    })
    .refine((data) => new Date(data.start_time) > new Date(), {
        message: 'start_time cannot be in the past',
        path: ['start_time'],
    });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
