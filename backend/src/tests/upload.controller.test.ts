import { Request, Response } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { S3Service } from '../services/s3.service';

jest.mock('../services/s3.service');

describe('UploadController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockResponse = {
            status: statusMock,
            json: jsonMock
        };
        jest.clearAllMocks();
    });

    describe('uploadImage', () => {
        it('should return 200 and image URL on successful upload', async () => {
            const mockFile = { originalname: 'test.jpg' } as Express.Multer.File;
            mockRequest = { file: mockFile };
            const mockUrl = 'https://s3.amazonaws.com/test.jpg';

            (S3Service.uploadFile as jest.Mock).mockResolvedValue(mockUrl);

            await UploadController.uploadImage(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: 'Image uploaded successfully',
                data: { imageUrl: mockUrl }
            });
        });

        it('should return 400 if no file is provided', async () => {
            mockRequest = { file: undefined };

            await UploadController.uploadImage(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'No file uploaded'
            });
        });

        it('should return 500 if S3Service throws an error', async () => {
            const mockFile = { originalname: 'test.jpg' } as Express.Multer.File;
            mockRequest = { file: mockFile };

            (S3Service.uploadFile as jest.Mock).mockRejectedValue(new Error('Upload failed'));

            await UploadController.uploadImage(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Image upload failed'
            });
        });
    });
});
