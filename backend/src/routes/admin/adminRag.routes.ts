import { Router } from 'express';
import { uploadDocument, listDocuments, deleteDocument } from '../../controllers/adminRag.controller';

const router = Router();

// /api/v1/admin/rag/docs
router.post('/docs', uploadDocument);
router.get('/docs', listDocuments);
router.delete('/docs/:id', deleteDocument);

export default router;
