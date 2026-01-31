import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Service } from "../services/s3.service";
import { mockClient } from "aws-sdk-client-mock";

const s3Mock = mockClient(S3Client);

describe('S3Service', () => {
    beforeEach(() => {
        s3Mock.reset();
        process.env.AWS_BUCKET_NAME = 'test-bucket';
        process.env.AWS_REGION = 'ap-southeast-1';
    });

    it('should upload a file and return the URL', async () => {
        const mockFile = {
            originalname: 'test image.jpg',
            buffer: Buffer.from('fake data'),
            mimetype: 'image/jpeg'
        } as Express.Multer.File;

        s3Mock.on(PutObjectCommand).resolves({});

        const result = await S3Service.uploadFile(mockFile);

        expect(result).toContain('https://test-bucket.s3.ap-southeast-1.amazonaws.com/');
        expect(result).toContain('test-image.jpg');

        const calls = s3Mock.commandCalls(PutObjectCommand);
        expect(calls.length).toBe(1);
        expect(calls[0].args[0].input).toMatchObject({
            Bucket: 'test-bucket',
            Body: mockFile.buffer,
            ContentType: 'image/jpeg'
        });
    });

    it('should throw an error if S3 upload fails', async () => {
        const mockFile = {
            originalname: 'test.jpg',
            buffer: Buffer.from('data'),
            mimetype: 'image/jpeg'
        } as Express.Multer.File;

        s3Mock.on(PutObjectCommand).rejects(new Error('S3 upload error'));

        await expect(S3Service.uploadFile(mockFile)).rejects.toThrow('S3 upload error');
    });
});
