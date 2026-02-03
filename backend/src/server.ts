import app from './app';
import dotenv from 'dotenv';
import { ReminderService } from './services/reminder.service';
import { createServer } from 'http';
import { initSocket } from './socket';

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initSocket(httpServer);

import { EmailService } from './services/email.service';

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);

    // Verify Email Connection
    EmailService.verifyConnection();

    // Initialize scheduled tasks
    ReminderService.init();
});
