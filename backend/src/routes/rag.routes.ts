import express from 'express';
import { askRAG } from '../controllers/rag.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public endpoint if we don't need auth, but let's say RAG is allowed for logged in users
router.post('/ask', authenticate, askRAG);

export default router;
