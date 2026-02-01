import app from './app';
import dotenv from 'dotenv';
import { ReminderService } from './services/reminder.service';
import { createServer } from 'http';
import { initSocket } from './socket';

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);

    // Initialize scheduled tasks
    ReminderService.init();
});
