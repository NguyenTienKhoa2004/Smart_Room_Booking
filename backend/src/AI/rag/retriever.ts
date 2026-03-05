import crypto from 'crypto';
import pool from '../../config/database';
import redis from '../../config/redis';
import { logger } from '../../config/logger';
import { MockEmbeddingProvider } from '../providers/mock.embedding';

const embeddingProvider = new MockEmbeddingProvider();

export interface RetrieveOptions {
    topK?: number;
    threshold?: number;
}

export interface RetrievedChunk {
    doc_title: string;
    chunk_text: string;
    similarity: number;
}

export interface RetrievalResult {
    chunks: RetrievedChunk[];
}

/**
 * Generates a SHA-256 hash for cache keys.
 */
function hashString(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Retrieves the most relevant chunks from the database using vector similarity search.
 * Includes Redis caching for both embedding vectors and retrieval results to optimize performance.
 * 
 * @param question The user's query string
 * @param options RetrieveOptions containing topK and threshold
 * @returns Array of RetrievedChunk objects
 */
export async function retrieveChunks(
    question: string,
    options: RetrieveOptions = {}
): Promise<RetrievalResult> {
    const topK = options.topK || 5;
    const questionHash = hashString(question);
    const retrievalCacheKey = `rag:ret:${questionHash}:k:${topK}`;

    try {
        const cachedResult = await redis.get(retrievalCacheKey);
        if (cachedResult) {
            logger.info({
                event: 'rag_retrieval_cache_hit',
                topK,
                retrieval_count: JSON.parse(cachedResult).length,
                cache_hit: true
            }, 'RAG retrieval cache hit');

            return {
                chunks: JSON.parse(cachedResult)
            };
        }
    } catch (error) {
        logger.warn('Redis cache read error during retrieval:', error);
    }

    const embCacheKey = `emb:q:${questionHash}`;
    let queryVector: number[] | null = null;
    let embCacheHit = false;

    try {
        const cachedEmb = await redis.get(embCacheKey);
        if (cachedEmb) {
            queryVector = JSON.parse(cachedEmb);
            embCacheHit = true;
        }
    } catch (error) {
        logger.warn('Redis cache read error for embeddings:', error);
    }

    if (!queryVector) {
        queryVector = await embeddingProvider.embed(question);
        try {
            await redis.setex(embCacheKey, 300, JSON.stringify(queryVector));
        } catch (error) {
            logger.warn('Redis cache write error for embeddings:', error);
        }
    }

    const vectorStr = `[${queryVector.join(',')}]`;

    const startTime = Date.now();
    const client = await pool.connect();
    let retrievedChunks: RetrievedChunk[] = [];

    try {
        const query = `
            SELECT d.title as doc_title,
                   c.chunk_text,
                   1 - (c.embedding <=> $1::vector) as similarity
            FROM rag_chunks c
            JOIN rag_docs d ON d.id = c.doc_id
            ORDER BY c.embedding <=> $1::vector
            LIMIT $2;
        `;

        const result = await client.query(query, [vectorStr, topK]);
        retrievedChunks = result.rows;
    } catch (error) {
        logger.error('Database query error during RAG retrieval (pgvector/tables might be missing):', error);
        retrievedChunks = []; // Fallback to empty chunks instead of throwing
    } finally {
        client.release();
    }

    const latency_ms = Date.now() - startTime;

    try {
        await redis.setex(retrievalCacheKey, 120, JSON.stringify(retrievedChunks));
    } catch (error) {
        logger.warn('Redis cache write error for retrieval result:', error);
    }

    logger.info({
        event: 'rag_retrieval_executed',
        topK,
        retrieval_count: retrievedChunks.length,
        cache_hit: false,
        emb_cache_hit: embCacheHit,
        latency_ms
    }, 'RAG retrieval query executed in DB');

    return {
        chunks: retrievedChunks
    };
}
