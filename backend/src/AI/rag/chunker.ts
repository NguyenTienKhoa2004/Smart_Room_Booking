export interface ChunkerOptions {
    chunkSize: number;
    overlap: number;
}

/**
 * Creates deterministic chunks from text using a sliding window.
 * @param text The input text to chunk.
 * @param options ChunkerOptions including chunkSize and overlap config.
 * @returns Array of chunked strings.
 */
export function chunkTextSlidingWindow(
    text: string,
    options: ChunkerOptions = { chunkSize: 500, overlap: 100 }
): string[] {
    const { chunkSize, overlap } = options;
    if (chunkSize <= 0) throw new Error("chunkSize must be > 0");
    if (overlap >= chunkSize) throw new Error("overlap must be < chunkSize");

    const chunks: string[] = [];
    let i = 0;

    while (i < text.length) {
        const chunk = text.slice(i, i + chunkSize);
        chunks.push(chunk);

        const step = chunkSize - overlap;
        i += step;
    }

    return chunks;
}
