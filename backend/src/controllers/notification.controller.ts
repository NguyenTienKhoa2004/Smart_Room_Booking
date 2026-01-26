import { Request, Response } from 'express';
import { SSEService } from '../services/sse.service';

export class NotificationController {
    static subscribe(req: Request, res: Response) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const user = req.user;
        if (!user) {
            res.status(401).end();
            return;
        }

        const userId = user.userId;

        SSEService.addClient(userId, res);

        res.write(': heartbeat\n\n');

        console.log(`User ${userId} subscribed to notifications`);
    }
}
