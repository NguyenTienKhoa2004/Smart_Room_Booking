import { Request, Response } from 'express';
import { z } from 'zod';
import { AdminRagService } from '../services/adminRag.service';
import { logger } from '../config/logger';


// D) Add zod validation for upload input
const uploadSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters")
});

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const parsed = uploadSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.issues });
            return;
        }

        const { title, content } = parsed.data;
        // req.user might be defined by authenticate middleware
        const userId = (req as any).user?.id || null;

        const result = await AdminRagService.uploadDocument(title, content, userId);
        res.status(201).json({ success: true, data: result });
    } catch (error: any) {
        logger.error('Error uploading RAG document:', error);
        res.status(500).json({ success: false, message: 'Failed to upload document' });
    }
};

export const listDocuments = async (req: Request, res: Response) => {
    try {
        const docs = await AdminRagService.listDocuments();
        res.status(200).json({ success: true, data: docs });
    } catch (error: any) {
        logger.error('Error listing RAG documents:', error);
        res.status(500).json({ success: false, message: 'Failed to list documents' });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: 'Invalid ID' });
            return;
        }
        await AdminRagService.deleteDocument(id);
        res.status(200).json({ success: true, message: 'Document deleted completely' });
    } catch (error: any) {
        logger.error('Error deleting RAG document:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to delete document' });
    }
};
