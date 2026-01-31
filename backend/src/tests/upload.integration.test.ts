import request from 'supertest';
import app from '../app';
import { S3Service } from '../services/s3.service';
import { AuthUtils } from '../utils/auth.utils';

jest.mock('../services/s3.service');
jest.mock('../middleware/auth.middleware', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = { id: 1, role: 'admin' };
        next();
    },
    authorizeAdmin: (req: any, res: any, next: any) => next(),
    apiLimiter: (req: any, res: any, next: any) => next()
}));

describe('Upload Routes Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /api/v1/admin/upload should upload a file and return 200', async () => {
        const mockUrl = 'https://s3.amazonaws.com/test.jpg';
        (S3Service.uploadFile as jest.Mock).mockResolvedValue(mockUrl);

        const response = await request(app)
            .post('/api/v1/admin/upload')
            .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.imageUrl).toBe(mockUrl);
    });

    it('POST /api/v1/admin/upload should fail if no file is attached', async () => {
        const response = await request(app)
            .post('/api/v1/admin/upload');

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
