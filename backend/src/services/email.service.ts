import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    static async sendBookingConfirmation(to: string, bookingDetails: {
        roomName: string;
        startTime: string | Date;
        endTime: string | Date;
        title: string;
    }) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: `Booking Confirmation: ${bookingDetails.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Booking Confirmed!</h2>
                    <p>Your booking for <strong>${bookingDetails.roomName}</strong> has been successfully created.</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Title</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${bookingDetails.title}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date/Time</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(bookingDetails.startTime).toLocaleString()} - ${new Date(bookingDetails.endTime).toLocaleString()}</td>
                        </tr>
                    </table>
                    <p>Thank you for using Smart Room Booking!</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Confirmation email sent to ${to}`);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
    }

    static async sendBookingReminder(to: string, bookingDetails: {
        roomName: string;
        startTime: string | Date;
        title: string;
    }) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: `Reminder: Your booking "${bookingDetails.title}" starts soon`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Booking Reminder</h2>
                    <p>This is a reminder that your booking for <strong>${bookingDetails.roomName}</strong> is starting within the next 30 minutes.</p>
                    <p><strong>Time:</strong> ${new Date(bookingDetails.startTime).toLocaleString()}</p>
                    <p>See you there!</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Reminder email sent to ${to}`);
        } catch (error) {
            console.error('Error sending reminder email:', error);
        }
    }
}
