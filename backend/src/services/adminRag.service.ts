import pool from '../config/database';
import { chunkTextSlidingWindow } from '../AI/rag/chunker';
import { MockEmbeddingProvider } from '../AI/providers/mock.embedding';

const embeddingProvider = new MockEmbeddingProvider();

export class AdminRagService {
    static async uploadDocument(title: string, content: string, createdBy: number | null = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const docResult = await client.query(
                'INSERT INTO rag_docs (title, content, created_by) VALUES ($1, $2, $3) RETURNING id',
                [title, content, createdBy]
            );
            const docId = docResult.rows[0].id;

            const chunks = chunkTextSlidingWindow(content);

            for (let i = 0; i < chunks.length; i++) {
                const text = chunks[i];
                const vector = await embeddingProvider.embed(text);
                const vectorStr = `[${vector.join(',')}]`;

                await client.query(
                    'INSERT INTO rag_chunks (doc_id, chunk_index, chunk_text, embedding) VALUES ($1, $2, $3, $4::vector)',
                    [docId, i, text, vectorStr]
                );
            }

            await client.query('COMMIT');
            return { id: docId, title, chunkCount: chunks.length };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async listDocuments() {
        const result = await pool.query(
            'SELECT id, title, created_by, created_at FROM rag_docs ORDER BY created_at DESC'
        );
        return result.rows;
    }

    static async deleteDocument(docId: number) {
        const result = await pool.query('DELETE FROM rag_docs WHERE id = $1 RETURNING id', [docId]);
        if (result.rowCount === 0) {
            throw new Error(`Document with ID ${docId} not found`);
        }
        return true;
    }

    static async retrieveDebug(question: string, topK: number) {
        // Import must be added to the top of the file as well
        const { retrieveChunks } = await import('../AI/rag/retriever');
        return retrieveChunks(question, { topK });
    }
}
