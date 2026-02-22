import { Request, Response } from 'express';
import { S3Service } from '../services/s3.service';
import axios from 'axios';
import { logger } from '../config/logger';


export class UploadController {
    static async uploadImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }

            const url = await S3Service.uploadFile(req.file);

            res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                data: { imageUrl: url }
            });
        } catch (error) {
            logger.error('Upload Error:', error);
            res.status(500).json({ success: false, message: 'Image upload failed' });
        }
    }

    static async uploadImageFromUrl(req: Request, res: Response) {
        try {
            const { imageUrl } = req.body;

            if (!imageUrl) {
                res.status(400).json({ success: false, message: 'Image URL is required' });
                return;
            }

            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            const contentType = response.headers['content-type'] || 'image/jpeg';

            const urlPath = new URL(imageUrl).pathname;
            const originalName = urlPath.split('/').pop() || 'image.jpg';

            const mockFile = {
                originalname: originalName,
                buffer: buffer,
                mimetype: contentType
            } as Express.Multer.File;

            const s3Url = await S3Service.uploadFile(mockFile);

            res.status(200).json({
                success: true,
                message: 'Image uploaded successfully via URL',
                data: { imageUrl: s3Url }
            });

        } catch (error) {
            logger.error('URL Upload Error:', error);
            res.status(500).json({ success: false, message: 'Failed to upload image from URL' });
        }
    }
}
