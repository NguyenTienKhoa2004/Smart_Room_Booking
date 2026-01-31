import { Router } from 'express';
import { UploadController } from '../../controllers/upload.controller';
import multer from 'multer';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', upload.single('image'), UploadController.uploadImage);

router.post('/url', UploadController.uploadImageFromUrl);


export default router;
