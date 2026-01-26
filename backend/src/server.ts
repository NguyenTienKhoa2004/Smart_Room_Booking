import app from './app';
import dotenv from 'dotenv';
import { ReminderJob } from './scripts/reminder.job';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);

    // Initialize scheduled tasks
    ReminderJob.init();
});
