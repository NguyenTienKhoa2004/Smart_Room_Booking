import pool from '../config/database';
import { MockEmbeddingProvider } from '../AI/providers/mock.embedding';
import { logger } from '../config/logger';


const documents = [
    {
        title: "Hướng dẫn nhận phòng họp",
        content: "Khi đến phòng họp, hãy đến lễ tân tầng 1 để nhận thẻ từ. Đặt thẻ từ lên máy quét để mở cửa. Đừng quên mang máy chiếu cá nhân nếu phòng không có sẵn. Liên hệ IT nội bộ qua số 101 nếu cần hỗ trợ.",
    },
    {
        title: "Quy định Hủy đặt phòng",
        content: "Nhân viên có thể hủy phòng trên hệ thống nhưng cần báo trước 1 giờ so với thời gian bắt đầu họp. Lần 1 không đến mà không báo: Nhắc nhở. Lần 2: Phạt 50,000 VND và tạm khóa chức năng đặt phòng 1 tuần.",
    },
    {
        title: "Hướng dẫn cài đặt thiết bị họp trực tuyến",
        content: "Tất cả các phòng họp lớn (Sức chứa > 10 người) đều trang bị camera 360 và mic đa hướng. Để sử dụng, dùng dây HDMI cắm vào máy tính, mở Zoom/Teams và chọn thiết bị 'Conference Cam 360'.",
    }
];

function chunkText(text: string, chunkSize: number = 100): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += chunkSize;
    }
    return chunks;
}

export async function runIndexing() {
    logger.info("🚀 Starting RAG Data Indexing...");
    const embeddingProvider = new MockEmbeddingProvider();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const doc of documents) {
            const insertDocQuery = `
                INSERT INTO rag_docs (title, content, created_by)
                VALUES ($1, $2, NULL)
                RETURNING id;
            `;
            const docResult = await client.query(insertDocQuery, [doc.title, doc.content]);
            const docId = docResult.rows[0].id;
            logger.info(`Indexed Document: "${doc.title}" (ID: ${docId})`);

            const chunks = chunkText(doc.content);

            for (let i = 0; i < chunks.length; i++) {
                const chunkTextStr = chunks[i];
                const vector = await embeddingProvider.embed(chunkTextStr);

                const pgVectorString = `[${vector.join(',')}]`;

                const insertChunkQuery = `
                    INSERT INTO rag_chunks (doc_id, chunk_index, chunk_text, embedding)
                    VALUES ($1, $2, $3, $4::vector)
                `;
                await client.query(insertChunkQuery, [docId, i, chunkTextStr, pgVectorString]);
                logger.info(`Saved chunk ${i} for "${doc.title}"`);
            }
        }

        await client.query('COMMIT');
        logger.info("Indexing completed successfully.");
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error("Error during indexing:", error);
    } finally {
        client.release();
    }
}

if (require.main === module) {
    runIndexing().then(() => {
        pool.end();
        process.exit(0);
    });
}
