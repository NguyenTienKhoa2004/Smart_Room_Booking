CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx ON rag_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS room_embeddings_embedding_idx ON room_embeddings USING hnsw (embedding vector_cosine_ops);
