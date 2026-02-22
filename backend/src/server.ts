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
import { logger } from './config/logger';


httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV}`);

    // Verify Email Connection
    EmailService.verifyConnection();

    // Initialize scheduled tasks
    ReminderService.init();
});
