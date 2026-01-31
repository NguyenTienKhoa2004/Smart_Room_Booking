import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3";
import dotenv from 'dotenv';

dotenv.config();

export class S3Service {
    static async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read' as const,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }
}
