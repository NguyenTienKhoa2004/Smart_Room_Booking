import { Response } from 'express';

export class SSEService {
    private static clients: Map<number, Response[]> = new Map();

    static addClient(userId: number, res: Response) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, []);
        }
        this.clients.get(userId)?.push(res);

        res.on('close', () => {
            this.removeClient(userId, res);
        });
    }

    private static removeClient(userId: number, res: Response) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            const index = userClients.indexOf(res);
            if (index !== -1) {
                userClients.splice(index, 1);
            }
            if (userClients.length === 0) {
                this.clients.delete(userId);
            }
        }
    }

    static sendToUser(userId: number, event: string, data: any) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            userClients.forEach(client => client.write(message));
        }
    }

    static broadcast(event: string, data: any) {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        this.clients.forEach(userClients => {
            userClients.forEach(client => client.write(message));
        });
    }
}
