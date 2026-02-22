import cron from 'node-cron';
import db from '../config/database';
import { EmailService } from './email.service';
import { SSEService } from './sse.service';
import { logger } from '../config/logger';


export class ReminderService {
    static init() {
        logger.info('⏰ Initializing Reminder Job (every minute)...');
        cron.schedule('* * * * *', async () => {
            await this.processReminders();
        });
    }

    private static async processReminders() {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Find bookings starting in the next 30 minutes that haven't been reminded
            // We use NOW() + 30 minutes and only check for bookings that haven't had a reminder sent.
            const query = `
                SELECT b.id, b.title, b.start_time, b.user_id, u.email, r.name as room_name
                FROM bookings b
                JOIN users u ON b.user_id = u.id
                JOIN rooms r ON b.room_id = r.id
                WHERE b.start_time <= NOW() + INTERVAL '30 minutes'
                AND b.start_time > NOW()
                AND b.reminder_sent = FALSE
                FOR UPDATE OF b SKIP LOCKED
            `;

            const result = await client.query(query);

            for (const row of result.rows) {
                const { id, title, room_name, start_time, email, user_id } = row;

                logger.info(`Sending reminder for booking ${id}: ${title}`);

                // Send email reminder
                EmailService.sendBookingReminder(email, {
                    roomName: room_name,
                    startTime: start_time,
                    title
                }).catch(err => logger.error(`Failed to send email reminder for ${id}:`, err));

                // Send SSE notification
                SSEService.sendToUser(user_id, 'booking_reminder', {
                    message: `Reminder: Your booking "${title}" starts at ${new Date(start_time).toLocaleTimeString()}`,
                    bookingId: id
                });

                // Mark as reminded
                await client.query('UPDATE bookings SET reminder_sent = TRUE WHERE id = $1', [id]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error in ReminderService:', error);
        } finally {
            client.release();
        }
    }
}
