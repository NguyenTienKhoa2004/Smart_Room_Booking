import { Request, Response } from 'express';
import { z } from 'zod';
import { generateAnswer } from '../AI/rag/generator';
import { logger } from '../config/logger';

const askSchema = z.object({
    question: z.string().min(2, "Question must be at least 2 characters"),
    topK: z.number().int().min(1).max(20).optional()
});

export const askRAG = async (req: Request, res: Response) => {
    try {
        const parsed = askSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.issues });
            return;
        }

        const { question, topK } = parsed.data;

        // Let's attach user ID to logs if needed
        const userId = (req as any).user?.id || 'anonymous';
        logger.info({ event: 'rag_ask_requested', userId, question_length: question.length }, 'User asked RAG a question');

        const result = await generateAnswer(question, topK);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        logger.error('Error generating RAG answer:', error);
        res.status(500).json({ success: false, message: 'Failed to generate answer' });
    }
};
