import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
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

    static async sendBanNotification(to: string, fullName: string) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: 'Account Suspended - Smart Room Booking',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #d32f2f;">Account Suspended</h2>
                    <p>Dear ${fullName},</p>
                    <p>Your account has been suspended by an administrator. You will no longer be able to access the Smart Room Booking system.</p>
                    <p>If you believe this is a mistake, please contact our support team.</p>
                    <p style="margin-top: 30px; color: #666;">
                        Best regards,<br/>
                        Smart Room Booking Team
                    </p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Ban notification email sent to ${to}`);
        } catch (error) {
            console.error('Error sending ban notification email:', error);
        }
    }

    static async sendUnbanNotification(to: string, fullName: string) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: 'Account Restored - Smart Room Booking',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #388e3c;">Account Restored</h2>
                    <p>Dear ${fullName},</p>
                    <p>Good news! Your account has been restored by an administrator. You can now access the Smart Room Booking system again.</p>
                    <p>Welcome back!</p>
                    <p style="margin-top: 30px; color: #666;">
                        Best regards,<br/>
                        Smart Room Booking Team
                    </p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Unban notification email sent to ${to}`);
        } catch (error) {
            console.error('Error sending unban notification email:', error);
        }
    }
}
